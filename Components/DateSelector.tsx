import { DatePickerIOS, StyleSheet } from 'react-native'
import { Button, Input, Layout } from '@ui-kitten/components';
import React, { useState } from 'react'
import { firebase } from '../config';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { Item, ItemToShow } from '../types/item';

interface Props {
  defaultDate?: Date;
  editDateInitialValue?: boolean,
  showDateWithoutEdit?: boolean,
  onChange?: (value: Date) => void;
}

const DateSelector = ({
 defaultDate = new Date(),
 editDateInitialValue = false,
 onChange,
}: Props) => {

  const [date, setDate] = useState(defaultDate);
  const [editDate, setEditDate] = useState(editDateInitialValue);


  return (
    editDate ? (
      <Layout
        style={{ flex: 1, display: 'flex', flexDirection: 'row' }}
      >
        <DatePickerIOS
          date={date}
          onDateChange={(nextDate) => setDate(nextDate)}
        />
        <Button
          onPress={() => setEditDate(false)}
        >
          Confirm
        </Button>
      </Layout>
    ) : (
      <Layout style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
        <Input
          disabled
          label="Date"
          value={date.toISOString().split('T')[0]}
        />
        <Button
          onPress={() => setEditDate(true)}
        >
          Change
        </Button>
      </Layout>
    )
  )
}

const styles = StyleSheet.create({

});

export default DateSelector
