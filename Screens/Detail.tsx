import { Image, Keyboard, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Layout, Tab, TabBar, Text } from '@ui-kitten/components';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import DateSelector from '../Components/DateSelector';
import { apiConfig, firebase, ROUTES } from '../config';
import * as ImagePicker from 'expo-image-picker';
import { Item, ItemWithId } from '../types/item';
import { useNavigation } from '@react-navigation/native';
import TagSelector from '../Components/TagSelector';

let timeOut = null;

const initialClueState = {
  question: '',
  answer: '',
};

const CONSTANT_ITEM = {
  email: "darthzaq@gmail.com",
}

interface AddItemProps {
  duplicate?: boolean
}

const Detail = ({ route }) => {

  const dataRef = firebase.firestore().collection('bitacora');

  const dataItem: ItemWithId = route.params?.data;

  const isEditMode = !!dataItem;

  const [date, setDate] = useState(dataItem?.createdAt ? new Date(dataItem?.createdAt) : new Date());

  const [description, setDescription] = useState(dataItem?.description || '');

  const [tags, setTags] = useState([]);
  const [tagsSelected, setTagsSelected] = useState(dataItem?.tags || []);

  const [tabIndexSelected, setTabIndexSelected] = useState(!dataItem?.isQuickCard ? 1 : 0);

  const [value, setValue] = useState(dataItem?.value || 1);
  const [loading, setLoading] = useState(false);
  const [showAllClues, setShowAllClues] = useState(false);
  const [answersToShow, setAnswersToShow] = useState<number[]>([]);
  const [numCluesToShow, setNumCluesCluesToShow] = useState(0);
  const [clues, setClues] = useState(dataItem?.clues || [initialClueState]);
  const [searchImages, setSearchImages] = useState('');
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

  const isQuickCard = tabIndexSelected === 0;

  const addItem = ({ duplicate }: AddItemProps) => {
    const data: Item = {
      createdAt: date.toISOString() || dataItem?.createdAt || new Date().toISOString(),
      ...CONSTANT_ITEM,
      isQuickCard: tabIndexSelected === 0,
      tags: tagsSelected,
    };
    if (isQuickCard) {
      data.value = value;
      if (description.length) data.description = description;
    } else {
      if (imagesSelected && imagesSelected.length) data.images = imagesSelected;
      if (!data.clues && clues) data.clues = clues;
    }
    if (duplicate) {
      data.createdAt = (date || new Date()).toISOString();
    }
    if (isEditMode && !duplicate) {
      data.updatedAt = new Date().toISOString();
    }

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
    navigation.navigate(ROUTES.list);
  }

  const handleGetImages = async () => {
    if (searchImages.length) {
      setLoading(true);
      const response = await fetch(`${apiConfig.baseUrl}?q=${searchImages}&tbm=${apiConfig.tbm}&ijn=${apiConfig.ijn}&api_key=${apiConfig.api_key}`);
      const data = await response.json();
      const nextImages = data.images_results.map((image) => image.original).slice(0,10);
      setImages(nextImages)
      setLoading(false);
    }
  }

  const onDateChange = (newDate: Date) => {
    setDate(newDate);
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

  const addUpdateBtnDisabled = useMemo(() => !tagsSelected.length, [tagsSelected]);

  const handlerShowAllClues = () => {
    const nextShowAllClues = !showAllClues;
    setShowAllClues(nextShowAllClues)
    if (nextShowAllClues) setNumCluesCluesToShow(clues.length);
    else {
      setNumCluesCluesToShow(0);
      setAnswersToShow([]);
    }
  };

  useEffect(() => {
    if (numCluesToShow === clues.length) setShowAllClues(true)
    else if (numCluesToShow === 0) setShowAllClues(false)

  }, [numCluesToShow, showAllClues]);


  const handlerOneMoreClueToShow = () => {
    setNumCluesCluesToShow(numCluesToShow + 1);
  };

  const handlerOneLessClueToShow = () => {
    setNumCluesCluesToShow(numCluesToShow - 1);
    const indexAnswer = numCluesToShow - 1;
    if (answersToShow.includes(indexAnswer)) {
      setAnswersToShow(answersToShow.filter((answer) => answer !== indexAnswer));
    }
  };

  const handlerAnswersToShow = (answerIndex: number) => {
    if (answersToShow.includes(answerIndex)) setAnswersToShow(answersToShow.filter(answer => answer !== answerIndex))
    else setAnswersToShow(answersToShow.concat([answerIndex]));
  };

  const cluesToShow = useMemo(() => (clues || []).slice(0, numCluesToShow),[numCluesToShow]);


  return (
    <ScrollView style={styles.formLayout}>
      <Layout style={styles.titleSection}>
        <Text category='h5'>FORM</Text>
      </Layout>
      <TagSelector enableAddTags handleTags={(nextTags) => setTagsSelected(nextTags)} tagsDefault={tags} tagsSelectedDefault={tagsSelected} />
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
                  if(!isNaN(number) && number !== 0) setValue(number)
                }}
                value={value ? String(value) : ''}
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
            </>
          )
        }
        {
          tabIndexSelected === 1 && (
            <>
              <View style={styles.cluesContainer}>
                <Text style={styles.cluesText}>
                  Clues
                </Text>
                <Button size='tiny' status='basic' onPress={handlerShowAllClues}>{`${showAllClues ? 'Hide' : 'Show'} all clues`}</Button>
                <Button size='tiny' style={styles.cluesBtns} status='basic' disabled={numCluesToShow === clues.length} onPress={handlerOneMoreClueToShow}>+1</Button>
                <Button size='tiny' status='basic' disabled={numCluesToShow === 0} onPress={handlerOneLessClueToShow}>-1</Button>
              </View>
              {
                cluesToShow.map((clue, index) => (
                  <View>
                    <Layout style={styles.cluesWrapper}>
                      <Input
                        size='small'
                        label={`Question - ${index + 1}`}
                        onChangeText={(text) => {
                          const nextClues = JSON.parse(JSON.stringify(clues));
                          nextClues[index].question = text;
                          setClues(nextClues)
                        }}
                        value={clue.question || ''}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                      />
                      <Input
                        accessoryRight={(props) => renderIconClueIcon(props, index)}
                        label={`Answer - ${index + 1}`}
                        onChangeText={(text) => {
                          const nextClues = JSON.parse(JSON.stringify(clues));
                          nextClues[index].answer = text;
                          setClues(nextClues)
                        }}
                        onFocus={() => handlerAnswersToShow(index)}
                        size='small'
                        value={answersToShow.includes(index) ? (clue.answer || '') : ''}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                      />
                    </Layout>
                  </View>
                ))
              }
              <Layout style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                <Input
                  accessoryLeft={loading && <MaterialIcons name="youtube-searched-for" size={24} color="black" />}
                  disabled={loading}
                  label='Search images'
                  placeholderTextColor="#aaaaaa"
                  onChangeText={(text) => {
                    setSearchImages(text);
                    if (!isQuickCard) {
                      clearTimeout(timeOut);
                      timeOut = setTimeout(handleGetImages, 1500)
                    }
                  }}
                  value={searchImages}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                />
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
                <ScrollView horizontal style={styles.imagesContainer}>
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
                </ScrollView>
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
        <DateSelector defaultDate={date} onChange={onDateChange} />
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
  cluesContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cluesBtns: {
    marginHorizontal: 5,
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

export default Detail;
