import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { Button, Layout, Text } from '@ui-kitten/components';
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ScrollView } from 'react-native';
import { firebase, ROUTES } from '../config';
import { FontAwesome } from "@expo/vector-icons";
import { ItemToShow, ItemWithId } from '../types/item';
import ImageItem from '../Components/ImageItem';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const [data, setData] = useState([]);
  const dataRef = firebase.firestore().collection('bitacora');

  const navigation = useNavigation();

  const removeImageItem = (data: ItemWithId, image: string) => {
    const nextData = JSON.parse(JSON.stringify(data));
    nextData.images = data.images.filter((imageItem) => imageItem !== image);
    dataRef.doc(nextData?.id).update(nextData);
  }

  const pressHandler = async () => {
    try {
      LocalAuthentication.authenticateAsync({
        promptMessage: 'Face ID'
      }).then(({ success }) => {
        console.log('success: ', success);
      }).catch(() => {
        console.log('catch');
      });
    } catch(e) {
      console.log('e: ', e);
    }
  }

  // fetch or read the data from firestore
  useEffect(() => {
    dataRef
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          const initialData = [];
          querySnapshot.forEach((doc) => {
            const item = doc.data()
            initialData.push({ id: doc.id, ...item})
          });
          setData(initialData);
        })
  }, []);

  // delete an item from firestore db
  const deleteItem = (item) => {
    dataRef
      .doc(item.id)
      .delete()
      .then(() => {
        // alert("Deleted successfully");
      })
      .catch(error => {
        alert(error);
      })
  }

  const dataToShow = useMemo(() => {
    const result: ItemToShow[] = [];
    data.forEach((item: ItemWithId) => {
      const indexItemResult = result.findIndex((itemResult: ItemToShow) => JSON.stringify(itemResult.tag) === JSON.stringify(item.tag));
      if (indexItemResult >= 0) result[indexItemResult].count += 1;
      else {
        result.push({ ...item });
      }
    });
    return data;
  }, [data]);

  const tagClicked = useCallback((tag) => {
    navigation.navigate(ROUTES.graphic, {
      tags: [tag]
    });
  }, []);

  return (
    <Layout style={{ flex: 1, paddingHorizontal: 10 }}>
      <FontAwesome name="user-o" onPress={pressHandler} style={{ margin: 15 }} />
      <Button
        onPress={() => {
          navigation.navigate(ROUTES.graphic);
        }}
        style={{ marginLeft: 15, marginBottom: 15, }}
      >
        Watch graphic
      </Button>
      <Button
        onPress={() => {
          navigation.navigate(ROUTES.detail);
        }}
        style={{ marginLeft: 15 }}
      >
        Add Item
      </Button>
      {Boolean(dataToShow.length) && (
        <Layout style={styles.titleSection}>
          <Text category='h5'>LIST</Text>
        </Layout>
      )}
      <FlatList
        data={dataToShow}
        numColumns={1}
        renderItem={({ item }: { item: ItemToShow }) => {
          const yearItem = new Date(item.createdAt).getFullYear().toString();
          const dateToShow = `${new Date(item.createdAt).toString().split(yearItem)[0]} ${yearItem}`
          return (
            <View style={styles.container}>
              <Pressable
                onPress={() => {
                  navigation.navigate(ROUTES.detail, { data: item });
                }}
              >
                <Layout style={{ ...styles.header, ...styles.backgroundColorWrapper}}>
                  <Text>{dateToShow}</Text>
                  <Layout style={{ ...styles.dateWrapper, ...styles.backgroundColorWrapper }}>
                    <Layout style={{ ...styles.trashIconWrapper, ...styles.backgroundColorWrapper }}>
                      <Button
                        accessoryLeft={
                          <FontAwesome
                            name="trash"
                            color="red"
                            style={styles.trashIcon}
                          />
                        }
                        appearance='outline'
                        onPress={() => deleteItem(item)}
                        size="small"
                        status='danger'
                      >
                        Delete
                      </Button>
                    </Layout>
                  </Layout>
                </Layout>
                {!!item.images && (
                  <ImageItem
                    images={item.images}
                    onRemove={(image: string) => removeImageItem(item, image)}
                  />
                )}
                {!!item.value && (
                  <Text style={{ ...styles.tag, ...styles.tagValue}}>value: {item.value}</Text>
                )}
                <View style={styles.tagsContainer}>
                  <ScrollView>
                    <View style={styles.tagsContainer}>
                      {item.tags.map((tagItem: string) => (
                        <Text onPress={() => tagClicked(tagItem)} style={styles.tag}>{tagItem}</Text>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </Pressable>
            </View>
          )
        }}
      />
    </Layout>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
  },
  container: {
    backgroundColor: '#e5e5e5',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    padding: 15,
    borderRadius: 15,
    margin:5,
    marginHorizontal: 10,
    alignItems:'center'
  },
  tag: {
    backgroundColor: '#2c3e50',
    borderRadius: 5,
    borderWidth: 1,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    margin: 2,
    padding: 2,
  },
  tagValue: {
    alignSelf: 'flex-start',
    backgroundColor: '#60bc7c',
    borderColor: '#5cbc90',
  },
  tagsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  image: {
    display: 'flex',
    flex: 1,
    maxWidth: 30,
  },
  inputClue: {
    marginBottom: 10,
    height: 30,
  },
  formLayout: {
    height: '100%',
  },
  innerContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    marginLeft:45,
  },
  itemHeading: {
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 5,
  },
  formContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft:10,
    marginRight: 10,
    marginTop:100
  },
  button: {
    height: 47,
    borderRadius: 5,
    backgroundColor: '#788eec',
    marginVertical: 15,
    width: '80%',
    alignSelf: 'center',
    alignItems: "center",
    justifyContent: 'center'
  },
  buttonDisabled: {
    backgroundColor: 'grey',
    opacity: 0.4,
  },
  buttonText: {
    color: 'white',
    fontSize: 20
  },
  cluesText: {
    color: '#8f9cb4',
    fontWeight: '800',
    fontSize: 12,
    margin: 2,
  },
  cluesWrapper: {
    marginLeft: 15,
  },
  date: {
    fontSize: 12,
  },
  dateWrapper: {
    marginLeft: 'auto',
  },
  titleSection: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashIcon:{
    fontSize: 18,
    float: 'right',
  },
  trashIconWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  trashText: {
    marginLeft: 5,
  },
  backgroundColorWrapper: {
    backgroundColor: 'rgba(52, 52, 52, 0)',
  },
});

export default Home

