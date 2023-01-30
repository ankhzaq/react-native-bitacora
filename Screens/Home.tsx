import { View, FlatList, StyleSheet, Pressable, Keyboard, Image } from 'react-native'
import { Button, Input, Layout, Modal, Text } from '@ui-kitten/components';
import React, { useState, useEffect, useMemo } from 'react'
import { firebase } from '../config';
import { FontAwesome } from "@expo/vector-icons";
import { Item, ItemToShow, ItemWithId } from '../types/item';
import DateSelector from '../Components/DateSelector';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
// import { ImagePicker } from 'expo-image-multiple-picker'

const CONSTANT_ITEM = {
  email: "darthzaq@gmail.com",
  private: false,
}


const Home = () => {
  const [data, setData] = useState([]);
  const dataRef = firebase.firestore().collection('bitacora');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [dateEditionEnabled, setDateEditionEnabled] = useState(false);
  // const navigation = useNavigation();

  const takeAndUploadPhotoAsync = async () => {
    // Display the camera to the user and wait for them to take a photo or to cancel
    // the action
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.cancelled) {
      return;
    }
    setImages(images.concat([result.uri]));
  }

  let date: Date = new Date();

  const onDateChange = (newDate: Date) => {
    date = newDate;
  }

  // fetch or read the data from firestore
  useEffect(() => {
    dataRef
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          const initialData = []
          querySnapshot.forEach((doc) => {
            const item = doc.data()
            initialData.push({ id: doc.id, ...item})
          })
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

  // add a todo
  const addItem = (dataPressed?: Item) => {
    const data: Item = dataPressed || {
      createdAt: date,
      description,
      ...CONSTANT_ITEM,
      tag,
      title,
    };
    if (images.length) data.images = images;
    if (!data.title || !data.title.length) delete data.title;
    if (!data.description || !data.description.length) delete data.description;
    dataRef
      .add(data)
      .then(() => {
        // release todo state
        setTitle('');
        setDescription('');
        // release keyboard
        Keyboard.dismiss();
      })
      .catch((error) => {
        // show an alert in case of error
        alert(error);
      });
  }

  const dataToShow = useMemo(() => {
    const result: ItemToShow[] = [];
    data.forEach((item: ItemWithId) => {
      const indexItemResult = result.findIndex((itemResult: ItemToShow) => itemResult.tag === item.tag);
      if (indexItemResult >= 0) result[indexItemResult].count += 1;
      else {
        result.push({ ...item, count: 1 });
      }
    });
    return result;
  }, [data]);

  const addBtnDisabled = !tag;

  return (
    <Layout style={{ flex: 1, paddingHorizontal: 10, justifyContent:'space-between' }}>
      {!showForm && (
        <Button onPress={() => {setShowForm(!showForm)}} style={{ marginLeft: 15 }}>
          { showForm ? 'Hide Form' : 'Show Form' }
        </Button>
      )}
      {showForm && (
        <Modal
          style={styles.modal}
          backdropStyle={styles.backdrop}
          visible={showForm}
          onBackdropPress={() => setShowForm(false)}>
          <ScrollView style={styles.formLayout}>
            <Layout style={styles.titleSection}>
              <Text category='h5'>FORM</Text>
            </Layout>
            <Layout style={{ flex: 1 }}>
              <Input
                label='Tag'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => setTag(text)}
                value={tag}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
              />
              <Input
                label='Title'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => setTitle(text)}
                value={title}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
              />
              <Input
                label='Description'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => setDescription(text)}
                value={description}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
              />
              <DateSelector onChange={onDateChange} onEditDate={setDateEditionEnabled} />
              <Layout style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                <Text>
                  {(images && images.length) ? images.map((image: string) => (
                    <Image
                      source={{ uri: image }}
                      style={{ height: 100, width: 100  }}
                    />
                  )): (<Text>0 images uploaded</Text>)}
                </Text>
                <Layout style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                  <Button onPress={takeAndUploadPhotoAsync}>
                    Upload
                  </Button>
                  <Button onPress={() => {setImages([])}} style={{ marginLeft: 15 }} status="danger" disabled={!images.length}>
                    Remove Images
                  </Button>
                </Layout>
              </Layout>
              <Button
                disabled={addBtnDisabled}
                onPress={() => { addItem(); }} style={addBtnDisabled ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
                Add
              </Button>
            </Layout>
          </ScrollView>
        </Modal>
      )}
      <Layout style={{ flex: dateEditionEnabled ? 1 : 2 }}>
        <Layout style={styles.titleSection}>
          <Text category='h5'>LIST</Text>
        </Layout>
        <FlatList
          style={{}}
          data={dataToShow}
          numColumns={1}
          renderItem={({ item }: { item: ItemToShow }) => {
            return (
              <View>
                <Pressable
                  disabled={!!item.title || !!item.description || !item.tag}
                  style={styles.container}
                  // @ts-ignore
                  onPress={() => {
                    addItem({ createdAt: new Date(), tag: item.tag, ...CONSTANT_ITEM });
                    // navigation.navigate('Detail', {item});
                  }}
                >
                  <FontAwesome name="trash-o"
                               color="red"
                               onPress={() => deleteItem(item)}
                               style={styles.todoIcon} />
                  <View style={styles.innerContainer}>
                    <Text style={styles.itemHeading}>
                      ({item.count})
                    </Text>

                    <Text style={styles.itemHeading}>
                      {item.images && item.images.length && item.images.map((image) => (
                        <Image
                          source={{ uri: image }}
                          style={{ height: 32, width: 32  }}
                        />
                      ))}
                      {item.tag}{item.title && ` - ${item.title}`}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )
          }}
        />
      </Layout>
    </Layout>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#e5e5e5',
    padding: 15,
    borderRadius: 15,
    margin:5,
    marginHorizontal: 10,
    flexDirection:'row',
    alignItems:'center'
  },
  formLayout: {
    height: '100%'
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
  modal: {
    minHeight: '100%',
    width: '90%',
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
  titleSection: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoIcon:{
    marginTop:5,
    fontSize:20,
    marginLeft:14,
  }
});

export default Home

