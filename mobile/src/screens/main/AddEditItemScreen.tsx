import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'AddEditItem'>;

export const AddEditItemScreen: React.FC<Props> = ({ route }) => {
  const { itemId } = route.params || {};
  const isEditing = !!itemId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add New Item'}</Text>
      {itemId && <Text style={styles.subtitle}>Item ID: {itemId}</Text>}
      <Text style={styles.subtitle}>Add/Edit functionality coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
