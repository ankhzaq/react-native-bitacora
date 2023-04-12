import { StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, AutocompleteItem, Button } from '@ui-kitten/components';

interface Props {
  enableAddTags: boolean;
  handleTags: (newTagsList: string[]) => void;
  tagsDefault: string[];
  tagsSelectedDefault?: string[];
}

const ImageItem = ({ enableAddTags = false, handleTags, tagsSelectedDefault = [], tagsDefault = [] }: Props) => {

  const [tags, setTags] = useState(tagsDefault);
  const [tagsSelected, setTagsSelected] = useState(tagsSelectedDefault);

  const [tagAutocompleted, setTagAutocompleted] = useState('');

  useEffect(() => {
    setTags(tagsDefault)
  }, [tagsDefault]);

  useEffect(() => {
    setTagsSelected(tagsSelectedDefault)
  }, [tagsSelectedDefault]);

  const tagsForAutoCompleted = useCallback((): string[] => (
    tags.filter((tagText) => !tagsSelected.includes(tagText) && tagText.toLowerCase().includes(tagAutocompleted.toLowerCase()))
  ), [tags, tagAutocompleted]);

  const handleListTags = (nextTags: string[]) => {
    setTagsSelected(nextTags);
    handleTags(nextTags);
  }

  return (
    <>
      <Autocomplete
        placeholder='Add tags...'
        value={tagAutocompleted}
        onSelect={(index) => {
          setTagAutocompleted('');
          handleListTags(tagsSelected.concat([tagsForAutoCompleted()[index]]));
        }}
        onChangeText={(text) => setTagAutocompleted(text)}>
        { tagsForAutoCompleted().map((tagItem) => (
          <AutocompleteItem
            key={tagItem}
            title={tagItem}
          />
        ))}
      </Autocomplete>
      {enableAddTags && (
        <Button
          disabled={!tagAutocompleted.length}
          onPress={() => {
            const newTag = tagAutocompleted.toLowerCase();
            const nextTagsSelected = tagsSelected.concat([newTag]);
            const nextTags = tags.concat([newTag]);
            setTags(nextTags);
            setTagAutocompleted('');
            handleListTags(nextTagsSelected);
          }}
          status="success"
          style={styles.marginRight10}
        >
          New Tag
        </Button>
      )}
      {tagsSelected.map((tagSelectedItem, index) => (
        <Button
          key={`tagSelected-${index}`}
          onPress={() => {
            const nextTagsSelected = tagsSelected.filter((selectedTag) => selectedTag !== tagSelectedItem);
            handleListTags(nextTagsSelected);
          }}
          size='tiny'
          status="basic"
          style={{ ...styles.marginRight10, ...styles.tag }}
        >
          {tagSelectedItem}
        </Button>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  marginRight10: {
    marginRight: 10,
  },
  tag: {
    width: 'auto',
  }
});

export default ImageItem
