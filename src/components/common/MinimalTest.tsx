import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MinimalTest: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Minimal Test - No Animations</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Static Components Only</Text>
          <View style={styles.box}>
            <Text>Static Box 1</Text>
          </View>
          <View style={styles.box}>
            <Text>Static Box 2</Text>
          </View>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  box: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  spacer: {
    height: 50,
  },
});

export default MinimalTest;
