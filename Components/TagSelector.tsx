import { Dimensions, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, AutocompleteItem, Button, Layout } from '@ui-kitten/components';

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

  const tagsForAutoCompleted = useCallback((): string[] => {
    const tagsResult = tags.filter((tagText) => !tagsSelected.includes(tagText) && tagText.toLowerCase().includes(tagAutocompleted.toLowerCase()));
    if (!tagsResult.length) return ['default tag']
  }, [tags, tagAutocompleted]);

  const handleListTags = (nextTags: string[]) => {
    setTagsSelected(nextTags);
    handleTags(nextTags);
  }

  return (
    <>
      <Autocomplete
        placeholder='Add tags... (required)'
        value={tagAutocompleted}
        style={{ minWidth: Dimensions.get('window').width }}
        onSelect={(index) => {
          setTagAutocompleted('');
          handleListTags(tagsSelected.concat([tagsForAutoCompleted()[index]]));
        }}
        onChangeText={(text) => setTagAutocompleted(text)}
      >
        { tagsForAutoCompleted().map((tagItem, index) => (
          <AutocompleteItem
            key={`autocompleteItem-${index}`}
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
        >
          New Tag
        </Button>
      )}
      <Layout
        style={styles.containerTags}
        level='1'
      >
        {tagsSelected.map((tagSelectedItem, index) => (
          <Button
            appearance="outline"
            key={`tagSelected-${index}`}
            onPress={() => {
              const nextTagsSelected = tagsSelected.filter((selectedTag) => selectedTag !== tagSelectedItem);
              handleListTags(nextTagsSelected);
            }}
            size='tiny'
            status="warning"
            style={styles.tag}
          >
            {tagSelectedItem}
          </Button>
        ))}
      </Layout>
    </>
  );
};

const styles = StyleSheet.create({
  containerTags: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:'space-between',
    padding: 10,
  },
  tag: {
    width: 'auto',
    marginBottom: 10,
  }
});

export default ImageItem
