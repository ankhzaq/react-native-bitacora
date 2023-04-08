import { Dimensions, Image, Keyboard, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Autocomplete, AutocompleteItem, Button, Input, Layout, Tab, TabBar, Text } from '@ui-kitten/components';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import DateSelector from '../Components/DateSelector';
import { apiConfig, firebase, ROUTES } from '../config';
import * as ImagePicker from 'expo-image-picker';
import { Item, ItemWithId } from '../types/item';
import { useNavigation } from '@react-navigation/native';
import { CHART_CONFIG } from '../constants';
import { LineChart } from 'react-native-chart-kit';
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

const Graphic = () => {
  const dataRef = firebase.firestore().collection('bitacora');
  const [tagsSelected, setTagsSelected] = useState([]);
  const [data, setData] = useState([]);
  const [tags, setTags] = useState([]);
  const [dataGraphic, setDataGraphic] = useState(null);

  useEffect(() => {
    if (data.length) {
      const graphicData = data.filter((item) => {
        const validTags = !tagsSelected.length || tagsSelected.some((tagSelected) => item.tags.includes(tagSelected));
        return (item.value !== undefined) && validTags;
      });

      const dataGraphic = {
        labels: graphicData.map((item) => item.createdAt.split('T')[0]),
        datasets: [
          {
            data: graphicData.map((item) => item.value),
          }
        ],
        legend: ["GRAPHIC"] // optional
      };
      setDataGraphic(dataGraphic);
    }
  }, [data, tagsSelected]);

  useEffect(() => {
    dataRef
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          const initialData = [];
          const tagsCreated = [];
          querySnapshot.forEach((doc) => {
            const item = doc.data()
            initialData.push({ id: doc.id, ...item})
            item.tags?.forEach((tagItem: string) => {
              if (!tagsCreated.includes(tagItem)) tagsCreated.push(tagItem);
            });
          });
          setData(initialData);
          setTags(tagsCreated);
        })
  }, []);

  return (
    <>
      <TagSelector enableAddTags handleTags={(nextTags) => setTagsSelected(nextTags)} tagsDefault={tags} tagsSelectedDefault={tagsSelected} />
      {
        dataGraphic && (
          <LineChart
            data={dataGraphic}
            width={Dimensions.get('window').width}
            height={220}
            chartConfig={CHART_CONFIG}
          />
        )
      }
    </>
  );
};

export default Graphic;
