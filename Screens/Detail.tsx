import { Image, Keyboard, StyleSheet, View } from 'react-native'
import React, { useState } from 'react';
import { Button, Input, Layout, Text } from '@ui-kitten/components';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import DateSelector from '../Components/DateSelector';
import { apiConfig, firebase, ROUTES } from '../config';
import * as ImagePicker from 'expo-image-picker';
import { Item, ItemWithId } from '../types/item';
import { useNavigation } from '@react-navigation/native';

let timeOut = null;

const initialClueState = {
  question: '',
  answer: '',
};

const CONSTANT_ITEM = {
  email: "darthzaq@gmail.com",
  private: false,
}

const Detail = ({ route }) => {
  const dataItem: ItemWithId = route.params.data;
  const isEditMode = !!dataItem;

  let date: Date = new Date();

  const dataRef = firebase.firestore().collection('bitacora');
  const [description, setDescription] = useState(dataItem?.description || '');
  const [count, setCount] = useState(dataItem?.count || 1);
  const [tag, setTag] = useState(dataItem ? `${dataItem?.tag}` :'');
  const [value, setValue] = useState(dataItem?.value || 0);
  const [clues, setClues] = useState(dataItem?.clues || [initialClueState]);
  const [title, setTitle] = useState(dataItem?.title || '');
  const [images, setImages] = useState<string[]>([]);
  const [imagesSelected, setImagesSelected] = useState<string[]>(dataItem?.images || []);

  const navigation = useNavigation();

  const addItem = (dataPressed?: Item) => {
    const data: Item = dataPressed || {
      createdAt: dataItem?.createdAt || date,
      count,
      description,
      ...CONSTANT_ITEM,
      tag: tag.split(','),
      title,
    };
    if (isEditMode) {
      data.updatedAt = date;
    }

    if (imagesSelected && imagesSelected.length) data.images = imagesSelected;
    if (!data.title || !data.title.length) delete data.title;
    if (!data.clues && clues) data.clues = clues;
    if (!data.description || !data.description.length) delete data.description;
    if (isEditMode) {
      dataRef.doc(dataItem?.id).update(data);
    } else {
      dataRef
        .add(data)
        .then(() => {
          // release keyboard
          Keyboard.dismiss();
        })
        .catch((error) => {
          // show an alert in case of error
          alert(error);
        });
    }
    navigation.navigate(ROUTES.list)
  }

  const handleGetImages = async () => {
    if (title.length) {
      const response = await fetch(`${apiConfig.baseUrl}?q=${title}&tbm=${apiConfig.tbm}&ijn=${apiConfig.ijn}&api_key=${apiConfig.api_key}`);
      const data = await response.json();
      const nextImages = data.images_results.map((image) => image.original).slice(0,10);
      setImages(nextImages)
    }
  }

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

    setImagesSelected(imagesSelected.concat([result.uri]));
  }

  const selectImage = (nextImage: string) => {
    const imageIndexAlreadySelected = imagesSelected.findIndex(image => nextImage === image);
    const nextSelectedImages = JSON.parse(JSON.stringify(imagesSelected));

    if (imageIndexAlreadySelected >= 0) {
      nextSelectedImages.splice(imageIndexAlreadySelected, 1);
    } else {
      nextSelectedImages.push(nextImage);
    }

    setImagesSelected(nextSelectedImages);
  }

  const imagesToShow = (images && images.length) && images.filter(image => !imagesSelected.find(img => image === img));

  return (
    <ScrollView style={styles.formLayout}>
      <Layout style={styles.titleSection}>
        <Text category='h5'>FORM</Text>
      </Layout>
      <Layout style={{ flex: 1, padding: 10 }}>
        <View style={styles.countRow}>
          <Text style={styles.marginRight10}>Count: {count}</Text>
          <Button
            onPress={() => setCount(count + 1)}
            status="success"
            style={styles.marginRight10}
          >
            +
          </Button>
          <Button
            disabled={count < 2}
            onPress={() => {
              setCount(count - 1)
            }}
            status="danger"
          >
            -
          </Button>
        </View>
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
        <Input
          label='Value (number)'
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => {
            const number = Number(text);
            if(!isNaN(number)) setValue(number)
          }}
          value={value ? String(value) : ''}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <DateSelector onChange={onDateChange} />
        <Layout style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
          <Text category='h6'>Images selected</Text>
          <View style={styles.imagesContainer}>
          {(imagesSelected && imagesSelected.length) ? imagesSelected.map((image: string) => (
                <TouchableHighlight onPress={() => {
                  selectImage(image);
                }}>
                  <Image
                    source={{ uri: image }}
                    style={{ height: 100, width: 100  }}
                  />
                </TouchableHighlight>
          )): (<Text>0 images selected</Text>)}
          </View>
          <Text category='h6'>Images Availables</Text>
          <View style={styles.imagesContainer}>
            {imagesToShow ? imagesToShow.map((image: string) => (
              <TouchableHighlight onPress={() => {
                selectImage(image);
              }}>
                <Image
                  source={{ uri: image }}
                  style={{ height: 100, width: 100  }}
                />
              </TouchableHighlight>
            )): (<Text>0 images uploaded</Text>)}
          </View>
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
          onPress={() => {
            navigation.navigate(ROUTES.list);
          }}
          status="basic"
          style={styles.button}
        >
          Back
        </Button>
        <Button
          disabled={!tag}
          onPress={() => { addItem(); }} style={!tag ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          status="success"
        >
          { isEditMode ? 'Update' : 'Add'}
        </Button>
      </Layout>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  marginRight10: {
    marginRight: 10,
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
  countRow: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  imagesContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  trashIcon:{
    marginTop:5,
    fontSize:20,
    marginLeft:14,
  }
});

export default Detail
