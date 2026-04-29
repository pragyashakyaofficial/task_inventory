import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>App is working!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
});

export default AppTest;
