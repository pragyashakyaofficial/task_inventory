import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'InventoryList'>;

export const InventoryListScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory List</Text>
      <Text style={styles.subtitle}>Inventory list functionality coming soon...</Text>
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
