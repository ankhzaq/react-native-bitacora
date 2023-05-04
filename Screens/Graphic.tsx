import { Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react';
import { firebase } from '../config';
import { CHART_CONFIG } from '../constants';
import { LineChart } from 'react-native-chart-kit';
import TagSelector from '../Components/TagSelector';

const Graphic = ({ route }) => {
  const { tags: tagsParams } = route.params;
  console.log("tagsParams: ", tagsParams);
  const dataRef = firebase.firestore().collection('bitacora');
  const [tagsSelected, setTagsSelected] = useState(tagsParams || []);
  const [data, setData] = useState([]);
  const [tags, setTags] = useState( []);
  const [dataGraphic, setDataGraphic] = useState(null);

  useEffect(() => {
    if (data.length) {
      const graphicData = data.filter((item) => {
        const validTags = !tagsSelected.length || tagsSelected.some((tagSelected) => item.tags.includes(tagSelected));
        return (item.value !== undefined) && validTags;
      });

      const isDataGraphicValid = !!graphicData.length;

      const dataGraphic = {
        labels: graphicData.map((item) => item.createdAt.split('T')[0]),
        datasets: [
          {
            data: graphicData.map((item) => item.value),
          }
        ],
        legend: ["GRAPHIC"] // optional
      };
      setDataGraphic(isDataGraphicValid ? dataGraphic : null);
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

  console.log("dataGraphic: ", dataGraphic);
  console.log("datasets: ", dataGraphic?.datasets && dataGraphic?.datasets[0]);

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
