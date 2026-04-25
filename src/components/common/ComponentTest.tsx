import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GlassCard,
  Button,
  Input,
  LoadingSkeletonSimple,
  ErrorAlert,
  StatusBadge,
  Toast,
  ToastManager,
} from './index';

const ComponentTest: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(true);
  const [loading, setLoading] = useState(false);

  const showToast = () => {
    ToastManager.getInstance().success('This is a success message!', {
      actionLabel: 'Undo',
      onAction: () => console.log('Undo action'),
    });
  };

  const showErrorToast = () => {
    ToastManager.getInstance().error('This is an error message');
  };

  const showWarningToast = () => {
    ToastManager.getInstance().warning('This is a warning message');
  };

  const showInfoToast = () => {
    ToastManager.getInstance().info('This is an info message');
  };

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Common Components Test</Text>

        {/* Glass Cards */}
        <Text style={styles.sectionTitle}>Glass Cards</Text>
        <View style={styles.row}>
          <GlassCard style={styles.card}>
            <Text style={styles.cardText}>Simple Glass Card</Text>
          </GlassCard>
          <GlassCard 
            style={styles.card}
            onPress={() => console.log('Pressed glass card')}
          >
            <Text style={styles.cardText}>Pressable Glass Card</Text>
          </GlassCard>
        </View>

        {/* Buttons */}
        <Text style={styles.sectionTitle}>Buttons</Text>
        <View style={styles.row}>
          <Button
            title="Primary"
            onPress={() => console.log('Primary pressed')}
            style={styles.button}
          />
          <Button
            title="Secondary"
            onPress={() => console.log('Secondary pressed')}
            variant="secondary"
            style={styles.button}
          />
        </View>
        <View style={styles.row}>
          <Button
            title="Error"
            onPress={() => console.log('Error pressed')}
            variant="error"
            style={styles.button}
          />
          <Button
            title="Outline"
            onPress={() => console.log('Outline pressed')}
            variant="outline"
            style={styles.button}
          />
        </View>
        <View style={styles.row}>
          <Button
            title={loading ? 'Loading...' : 'Loading Test'}
            onPress={handleLoading}
            loading={loading}
            style={styles.button}
          />
          <Button
            title="Disabled"
            onPress={() => {}}
            disabled
            style={styles.button}
          />
        </View>

        {/* Input Fields */}
        <Text style={styles.sectionTitle}>Input Fields</Text>
        <Input
          label="Name"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter your name"
          required
        />
        <Input
          label="Email"
          placeholder="Enter your email"
          error="This field is required"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          helperText="Password must be at least 8 characters"
        />

        {/* Status Badges */}
        <Text style={styles.sectionTitle}>Status Badges</Text>
        <View style={styles.row}>
          <StatusBadge status="in-stock" />
          <StatusBadge status="low-stock" showPulse />
          <StatusBadge status="out-of-stock" showPulse />
        </View>
        <View style={styles.row}>
          <StatusBadge status="discontinued" />
          <StatusBadge status="pending" />
          <StatusBadge status="in-stock" text="Custom Text" />
        </View>

        {/* Error Alert */}
        <Text style={styles.sectionTitle}>Error Alert</Text>
        <ErrorAlert
          error="Something went wrong while processing your request. Please try again."
          onRetry={() => console.log('Retry pressed')}
          onDismiss={() => setShowError(false)}
        />

        {/* Loading Skeleton */}
        <Text style={styles.sectionTitle}>Loading Skeleton (Simple)</Text>
        <LoadingSkeletonSimple width="100%" height={20} style={{ marginBottom: 8 }} />
        <LoadingSkeletonSimple width="80%" height={20} style={{ marginBottom: 8 }} />
        <LoadingSkeletonSimple variant="circular" height={40} style={{ marginBottom: 8 }} />
        <LoadingSkeletonSimple variant="text" lines={3} />

        {/* Toast Triggers */}
        <Text style={styles.sectionTitle}>Toast Messages</Text>
        <View style={styles.row}>
          <Button
            title="Success"
            onPress={showToast}
            variant="primary"
            size="small"
            style={styles.toastButton}
          />
          <Button
            title="Error"
            onPress={showErrorToast}
            variant="error"
            size="small"
            style={styles.toastButton}
          />
          <Button
            title="Warning"
            onPress={showWarningToast}
            variant="secondary"
            size="small"
            style={styles.toastButton}
          />
          <Button
            title="Info"
            onPress={showInfoToast}
            variant="outline"
            size="small"
            style={styles.toastButton}
          />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    flex: 1,
    minWidth: 120,
  },
  toastButton: {
    flex: 1,
    minWidth: 80,
  },
  spacer: {
    height: 50,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
});

export default ComponentTest;
