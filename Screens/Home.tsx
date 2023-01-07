import { View, DatePickerIOS, FlatList, StyleSheet, Pressable, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { Icon, Layout, Text } from '@ui-kitten/components';
import React, { useState, useEffect, useMemo } from 'react'
import { firebase } from '../config';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { Item, ItemToShow } from '../types/item';

const Home = () => {
  const [data, setData] = useState([]);
  const dataRef = firebase.firestore().collection('bitacora');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const navigation = useNavigation();

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
  }, [])

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

  const getOptionsPicker = () => {
    const optionsSelect = [];
    data.forEach(({ tag }) => {
      if (!optionsSelect.includes(tag)) {
        optionsSelect.push(tag);
      }
    });
    return optionsSelect;
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
    <Layout style={{ flex: 1 }}>
      <Layout style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder='Tag'
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => setTag(text)}
          value={tag}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder='Title'
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => setTitle(text)}
          value={title}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder='Description'
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => setDescription(text)}
          value={description}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <DatePickerIOS
          date={date}
          onDateChange={(nextDate) => setDate(nextDate)}
        />
      </Layout>
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
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    flex: 1,
    height: 52,
    marginHorizontal: 5,
    marginVertical: 5,
    overflow: 'hidden',
    paddingLeft: 16,
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
