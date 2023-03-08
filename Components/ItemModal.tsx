import { Image, Keyboard, StyleSheet, View } from 'react-native'
import React, { useState } from 'react';
import { Button, Input, Layout, Modal, Text } from '@ui-kitten/components';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import DateSelector from './DateSelector';
import { apiConfig, firebase } from '../config';
import * as ImagePicker from 'expo-image-picker';
import { Item } from '../types/item';

interface Props {
  addItem?: (data: Item) => void;
  onClose?: () => void;
  showForm?: boolean;
}

let timeOut = null;

const initialClueState = {
  question: '',
  answer: '',
};

const CONSTANT_ITEM = {
  email: "darthzaq@gmail.com",
  private: false,
}

const ItemModal = ({ onClose, showForm }: Props) => {
  const dataRef = firebase.firestore().collection('bitacora');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [clues, setClues] = useState([initialClueState]);
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const addItem = (dataPressed?: Item) => {
    const data: Item = dataPressed || {
      createdAt: date,
      description,
      ...CONSTANT_ITEM,
      tag: tag.split(','),
      title,
    };
    if (images && images.length) data.images = images;
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

        setImages([]);
        onClose();
      })
      .catch((error) => {
        // show an alert in case of error
        alert(error);
      });
  }

  const handleGetImages = async () => {
    if (title.length) {
      const response = await fetch(`${apiConfig.baseUrl}?q=${title}&tbm=${apiConfig.tbm}&ijn=${apiConfig.ijn}&api_key=${apiConfig.api_key}`);
      const data = await response.json();
      const nextImages = data.images_results.map((image) => image.original).slice(0,5);
      setImages(nextImages)
    }
  }

  let date: Date = new Date();

  const onDateChange = (newDate: Date) => {
    date = newDate;
  }

  const renderIconClueIcon = (props, index) => {
    const removeClue = () => {
      const nextClues = JSON.parse(JSON.stringify(clues));
      nextClues.splice(index, 1);
      setClues(nextClues);
    }

    const addClue = () => {
      setClues(clues.concat([initialClueState]));
    }

    const disabled = !clues[index].question.length || !clues[index].answer.length;

    return (
      <>
        {!!index && (
          <FontAwesome name="trash" onPress={removeClue} style={{ marginRight: 15 }} />
        )}
        {index === (clues.length - 1) && (
          <FontAwesome disabled={disabled} name="plus-circle" onPress={addClue} style={{ marginRight: 15 }} />
        )}
      </>
    )
  };

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

  return (
    <Modal
      style={styles.modal}
      backdropStyle={styles.backdrop}
      visible={showForm}
      onBackdropPress={onClose}>
      <ScrollView style={styles.formLayout}>
        <Layout style={styles.titleSection}>
          <Text category='h5'>FORM</Text>
        </Layout>
        <Layout style={{ flex: 1, padding: 10 }}>
          <Input
            label='Tag'
            placeholderTextColor="#aaaaaa"
            onChangeText={(text) => {
              return setTag(text);
            }}
            value={tag}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <Input
            label='Title'
            placeholderTextColor="#aaaaaa"
            onChangeText={(text) => {
              setTitle(text);
              clearTimeout(timeOut);
              timeOut = setTimeout(handleGetImages, 1500)
            }}
            value={title}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <Text style={styles.cluesText}>
            Clues
          </Text>
          {
            clues.map((clue, index) => (
              <View>
                <Layout style={styles.cluesWrapper}>
                  <Input
                    size='small'
                    label={`Question - ${index}`}
                    onChangeText={(text) => {
                      const nextClues = JSON.parse(JSON.stringify(clues));
                      nextClues[index].question = text;
                      setClues(nextClues)
                    }}
                    value={clue.question}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                  />
                  <Input
                    accessoryRight={(props) => renderIconClueIcon(props, index)}
                    label={`Answer - ${index}`}
                    onChangeText={(text) => {
                      const nextClues = JSON.parse(JSON.stringify(clues));
                      nextClues[index].answer = text;
                      setClues(nextClues)
                    }}
                    size='small'
                    value={clue.answer}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                  />
                </Layout>
              </View>
            ))
          }
          <Input
            label='Description'
            placeholderTextColor="#aaaaaa"
            onChangeText={(text) => setDescription(text)}
            value={description}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <DateSelector onChange={onDateChange} />
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
            disabled={!tag}
            onPress={() => { addItem(); }} style={!tag ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
            Add
          </Button>
        </Layout>
      </ScrollView>
    </Modal>
  );
};

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
  cluesText: {
    color: '#8f9cb4',
    fontWeight: '800',
    fontSize: 12,
    margin: 2,
  },
  cluesWrapper: {
    marginLeft: 15,
  },
  titleSection: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashIcon:{
    marginTop:5,
    fontSize:20,
    marginLeft:14,
  }
});

export default ItemModal
