import { Image, StyleSheet } from 'react-native'
import React, { useState } from 'react';
import { Layout } from '@ui-kitten/components';
import { FontAwesome } from '@expo/vector-icons';
import { ITEM_MAX_HEIGHT, ITEM_MAX_WIDTH } from '../constants';

interface Props {
  images?: string[];
  onRemove?: (image: string) => void;
}

const ImageItem = ({ images, onRemove }: Props) => {
  const [index, setIndex] = useState(0);

  return (
    <Layout>
      <Image
        source={{ uri: images[index] }}
        style={{ height: ITEM_MAX_HEIGHT, width: ITEM_MAX_WIDTH }}
      />
      <Layout style={{ ...styles.trashWrapper, ...styles.trashIconWrapper}}>
        <FontAwesome
          name="trash"
          color="red"
          onPress={() => onRemove(images[index])}
          style={styles.trashIcon}
        />
      </Layout>
      <Layout style={{ ...styles.trashWrapper, ...styles.arrowRightIconWrapper}}>
        <FontAwesome
          name="chevron-right"
          color="orange"
          onPress={() => {
            const nextIndex = (index === images.length - 1) ? 0 : (index + 1);
            setIndex(nextIndex);
          }}
          style={styles.trashIcon}
        />
      </Layout>
      <Layout style={{ ...styles.trashWrapper, ...styles.arrowLeftIconWrapper}}>
        <FontAwesome
          name="chevron-left"
          color="orange"
          onPress={() => {
            const nextIndex = (index === 0) ? (images.length -1) : index - 1;
            setIndex(nextIndex);
          }}
          style={styles.trashIcon}
        />
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  trashIcon: {
    fontSize: 18,
  },
  arrowRightIconWrapper: {
    position: 'absolute',
    bottom: '45%',
    right: -10,
  },
  arrowLeftIconWrapper: {
    position: 'absolute',
    bottom: '45%',
    left: -10,
  },
  trashIconWrapper: {
    position: 'absolute',
    left: -7,
    bottom: -7,
  },
  trashWrapper: {
    alignItems: 'center',
    backgroundColor: '#e8e4e4',
    justifyContent: 'center',
    borderRadius: 25,
    width: 24,
    height: 24,
  }
});

export default ImageItem
