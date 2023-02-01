import { DatePickerIOS, StyleSheet } from 'react-native'
import { Button, Input, Layout } from '@ui-kitten/components';
import React, { useState } from 'react';

interface Props {
  defaultDate?: Date;
  editDateInitialValue?: boolean,
  showDateWithoutEdit?: boolean,
  onChange?: (value: Date) => void;
  onEditDate?: (value: boolean) => void;
}

const DateSelector = ({
 defaultDate = new Date(),
 editDateInitialValue = false,
 onChange,
 onEditDate,
}: Props) => {
  const [date, setDate] = useState(defaultDate);
  const [editDate, setEditDate] = useState(editDateInitialValue);

  const onEditDateChanged = (value: boolean) => {
    if (onEditDate) onEditDate(value);
  }

  return (
    editDate ? (
      <Layout
        style={{ flex: 1, display: 'flex', flexDirection: 'row' }}
      >
        <DatePickerIOS
          date={date}
          onDateChange={(nextDate) => setDate(nextDate)}
          style={{ flex: 1 }}
        />
        <Layout style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 20 }}>
          <Button
            onPress={() => {
              setDate(defaultDate);
              onChange(defaultDate);
              onEditDateChanged(false);
              setEditDate(false)
            }}
            status='danger'
          >
            Cancel (hoy)
          </Button>
          <Button
            onPress={() => {
              if (onChange) onChange(date);
              onEditDateChanged(false);
              setEditDate(false)
            }}
            status='success'
          >
            Confirm
          </Button>
        </Layout>
      </Layout>
    ) : (
      <Layout style={{  display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Input
          disabled
          label="Date"
          value={date.toISOString().split('T')[0]}
        />
        <Button
          onPress={() => {
            onEditDateChanged(true);
            setEditDate(true)
          }}
          style={{ marginLeft: 15, marginTop: 15 }}
        >
          Change date
        </Button>
      </Layout>
    )
  )
}

const styles = StyleSheet.create({

});

export default DateSelector
