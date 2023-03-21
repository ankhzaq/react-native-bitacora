import { Image, Keyboard, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Autocomplete, AutocompleteItem, Button, Input, Layout, Tab, TabBar, Text } from '@ui-kitten/components';
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

interface AddItemProps {
  duplicate?: boolean
}

const Detail2 = ({ route }) => {

  const dataRef = firebase.firestore().collection('bitacora');

  const dataItem: ItemWithId = route.params?.data;
  const isEditMode = !!dataItem;

  let date: Date = new Date();

  const [description, setDescription] = useState(dataItem?.description || '');
  const [count, setCount] = useState(dataItem?.count || 1);

  const [tags, setTags] = useState([]);
  const [tagsSelected, setTagsSelected] = useState([]);
  const [tagAutocompleted, setTagAutocompleted] = useState('');
  const [tabIndexSelected, setTabIndexSelected] = useState(0);

  const [tag, setTag] = useState(dataItem ? `${dataItem?.tags}` :'');
  const [value, setValue] = useState(dataItem?.value || 0);
  const [clues, setClues] = useState(dataItem?.clues || [initialClueState]);
  const [title, setTitle] = useState(dataItem?.title || '');
  const [images, setImages] = useState<string[]>([]);
  const [imagesSelected, setImagesSelected] = useState<string[]>(dataItem?.images || []);

  const navigation = useNavigation();

  useEffect(() => {
    dataRef
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          const tagsCreated = [];
          querySnapshot.forEach((doc) => {
            const item = doc.data();
            item.tags?.forEach((tagItem: string) => {
              if (!tagsCreated.includes(tagItem)) tagsCreated.push(tagItem);
            })
          });
          setTags(tagsCreated);
        });
  }, []);

  const addItem = ({ duplicate }: AddItemProps) => {
    const data: Item = {
      createdAt: dataItem?.createdAt || date,
      count,
      description,
      ...CONSTANT_ITEM,
      tags: tag.split(','),
      title,
    };
    if (duplicate) {
      data.createdAt = date
    }
    if (isEditMode && !duplicate) {
      data.updatedAt = date;
    }

    if (imagesSelected && imagesSelected.length) data.images = imagesSelected;
    if (!data.title || !data.title.length) delete data.title;
    if (!data.clues && clues) data.clues = clues;
    if (!data.description || !data.description.length) delete data.description;
    if (isEditMode && !duplicate) {
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

  const tagsForAutoCompleted = useCallback((): string[] => (
    tags.filter((tagText) => !tagsSelected.includes(tagText) && tagText.toLowerCase().includes(tagAutocompleted.toLowerCase()))
  ), [tags, tagAutocompleted]);

  const addUpdateBtnDisabled = useMemo(() => !tagsSelected.length, [tagsSelected]);

  return (
    <ScrollView style={styles.formLayout}>
      <Layout style={styles.titleSection}>
        <Text category='h5'>FORM</Text>
      </Layout>
      <Autocomplete
        placeholder='Add tags...'
        value={tagAutocompleted}
        onSelect={(index) => {
          setTagsSelected(tagsSelected.concat([tagsForAutoCompleted()[index]]));
        }}
        onChangeText={(text) => setTagAutocompleted(text)}>
        { tagsForAutoCompleted().map((tagItem) => (
          <AutocompleteItem
            key={tagItem}
            title={tagItem}
          />
        ))}
      </Autocomplete>
      <Button
        disabled={!tagAutocompleted.length}
        onPress={() => {
          const nextTagsSelected = tagsSelected.concat([tagAutocompleted]);
          const nextTags = tags.concat([tagAutocompleted]);
          setTagsSelected(nextTagsSelected);
          setTags(nextTags);
          setTagAutocompleted('');
        }}
        status="success"
        style={styles.marginRight10}
      >
        New Tag
      </Button>
      {tagsSelected.map((tagSelectedItem) => (
        <Button
          onPress={() => {
            const nextTagsSelected = tagsSelected.filter((selectedTag) => selectedTag !== tagSelectedItem);
            setTagsSelected(nextTagsSelected);
          }}
          status="basic"
          style={styles.marginRight10}
        >
          {tagSelectedItem}
        </Button>
      ))}
      <TabBar
        selectedIndex={tabIndexSelected}
        onSelect={index => setTabIndexSelected(index)}>
        <Tab title='QUICK CARD'/>
        <Tab title='COMPLETE CARD'/>
      </TabBar>
      <Layout style={{ flex: 1, padding: 10 }}>
        {
          tabIndexSelected === 0 && (
            <>
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
            </>
          )
        }
        {
          tabIndexSelected === 1 && (
            <>
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
            </>
          )
        }
        <DateSelector onChange={onDateChange} />
        <Button
          onPress={() => {
            addItem({ duplicate: true });
          }}
          status="basic"
          style={styles.button}
        >
          Duplicate
        </Button>
        <Button
          disabled={addUpdateBtnDisabled}
          onPress={() => { addItem({}); }} style={addUpdateBtnDisabled ? {...styles.button, ...styles.buttonDisabled} : styles.button}
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

export default Detail2;
