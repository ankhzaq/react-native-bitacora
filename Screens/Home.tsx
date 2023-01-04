import { View, DatePickerIOS, FlatList, StyleSheet, Pressable, TouchableOpacity, Keyboard } from 'react-native'
import { Icon, Layout, Input, Text, Button } from '@ui-kitten/components';
import React, { useState, useEffect, useMemo } from 'react'
import { firebase } from '../config';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { Item, ItemToShow } from '../types/item';
import DateSelector from '../Components/DateSelector';
import * as ImagePickerOld from 'expo-image-picker';
// import { ImagePicker } from 'expo-image-multiple-picker'

async function takeAndUploadPhotoAsync() {
  console.log('takeAndUploadPhotoAsync');
  // Display the camera to the user and wait for them to take a photo or to cancel
  // the action
  let result = await ImagePickerOld.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (result.cancelled) {
    return;
  }

  // ImagePicker saves the taken photo to disk and returns a local URI to it
  let localUri = result.uri;
  let filename = localUri.split('/').pop();

  // Infer the type of the image
  let match = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : `image`;

  // Upload the image using the fetch and FormData APIs
  let formData = new FormData();
  // Assume "photo" is the name of the form field the server expects
  // @ts-ignore
  formData.append('photo', { uri: localUri, name: filename, type });
  console.log('localUri: ', localUri);
  console.log('filename: ', filename);
  console.log('type: ', type);
}


const Home = () => {
  const [data, setData] = useState([]);
  const dataRef = firebase.firestore().collection('bitacora');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const navigation = useNavigation();

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
            initialData.push(item)
          })
          setData(initialData)
          //console.log(users)
        })
  }, []);

  // delete an item from firestore db
  const deleteItem = (item) => {
    dataRef
      .doc(item.id)
      .delete()
      .then(() => {
        alert("Deleted successfully");
      })
      .catch(error => {
        alert(error);
      })
  }

  // add a todo
  const addItem = () => {
    // check if we have a todo.
    if (tag.length) {
      // get the timestamp
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const data = {
        createdAt: timestamp,
        description,
        email: "darthzaq@gmail.com",
        private: false,
        tag,
        title,
      };
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
        })
    }
  }

  const dataToShow = useMemo(() => {
    const result: ItemToShow[] = [];
    data.forEach((item: Item) => {
      const indexItemResult = result.findIndex((itemResult: ItemToShow) => itemResult.tag === item.tag);
      if (indexItemResult >= 0) result[indexItemResult].count += 1;
      else {
        result.push({ ...item, count: 1 });
      }
    });
    return result;
  }, [data]);


  return (
    <Layout style={{ flex: 1, paddingHorizontal: 10, justifyContent:'space-between' }}>
      <Layout style={{ flex: 1, maxHeight: 350 }}>
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
        <DateSelector onChange={onDateChange}/>
      </Layout>
      <Button onPress={takeAndUploadPhotoAsync}>
        Upload
      </Button>
      {/*<ImagePicker
        onSave={(assets) => console.log(assets)}
        onCancel={() => console.log('no permissions or user go back')}
      />*/}
      <Layout style={{ flex: 1 }}>
        <TouchableOpacity style={styles.button} onPress={addItem}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
        <FlatList
          style={{}}
          data={dataToShow}
          numColumns={1}
          renderItem={({ item }: { item: ItemToShow }) => (
            <View>
              <Pressable
                style={styles.container}
                // @ts-ignore
                onPress={() => navigation.navigate('Detail', {item})}
              >
                <FontAwesome name="trash-o"
                             color="red"
                  // @ts-ignore
                             onPress={() => deleteItem(item)}
                             style={styles.todoIcon} />
                <View style={styles.innerContainer}>
                  <Text style={styles.itemHeading}>
                    ({item.count}) {item.tag}{item.title && ` - ${item.title}`}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
        />
      </Layout>
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e5e5',
    padding: 15,
    borderRadius: 15,
    margin:5,
    marginHorizontal: 10,
    flexDirection:'row',
    alignItems:'center'
  },
  innerContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    marginLeft:45,
  },
  itemHeading: {
    fontWeight: 'bold',
    fontSize:18,
    marginRight:22
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
  buttonText: {
    color: 'white',
    fontSize: 20
  },

  todoIcon:{
    marginTop:5,
    fontSize:20,
    marginLeft:14,
  },
});

export default Home
