import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Brain, Save, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { spacingSemantic } from '../../../theme/spacing';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Toast from 'react-native-toast-message';
import AISuggestionModal from '../components/AISuggestionModal';
import { InventoryItem } from '../types/inventory.types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  minQuantity: z.number().min(0, 'Minimum quantity cannot be negative'),
  maxQuantity: z.number().min(0, 'Maximum quantity cannot be negative'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
});

type FormData = z.infer<typeof schema>;

type RootStackParamList = {
  AddEditItem: { item?: InventoryItem };
};

const AddEditItemScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'AddEditItem'>>();
  const item = route.params?.item;
  const isEdit = !!item;

  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState<{
    value: number;
    confidence: number;
    reasoning: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name || '',
      quantity: item?.quantity || 0,
      minQuantity: item?.minQuantity || 0,
      maxQuantity: item?.maxQuantity || 0,
      price: item?.price || 0,
      category: item?.category || '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    // Logic to save or update item
    Alert.alert('Success', `Item ${isEdit ? 'updated' : 'created'} successfully`);
    
    // Auto-reordering logic: If quantity is low after update, show AI toast
    if (isEdit && data.quantity <= data.minQuantity) {
      const suggestedVal = data.maxQuantity;
      Toast.show({
        type: 'info',
        text1: 'AI Reorder Suggestion',
        text2: `Low stock detected! Tap to reorder ${suggestedVal} units.`,
        onPress: () => {
          applyAISuggestion(suggestedVal);
          Toast.hide();
          Alert.alert('AI Applied', `Suggested reorder of ${suggestedVal} units applied.`);
        },
        visibilityTime: 5000,
      });
    }

    navigation.goBack();
  };

  const handleFetchAISuggestion = () => {
    // Mocking AI suggestion fetch
    setAISuggestion({
      value: Math.floor(Math.random() * 50) + 10,
      confidence: 0.85,
      reasoning: 'Based on your recent sales velocity and seasonal trends, this quantity will prevent stockouts while minimizing holding costs.',
    });
    setIsAIModalVisible(true);
  };

  const applyAISuggestion = (value: number) => {
    setValue('quantity', value, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.borderLight }]}>
        <Button
          variant="outline"
          onPress={() => navigation.goBack()}
          title="Back"
          style={styles.backButton}
        />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {isEdit ? 'Edit Item' : 'New Item'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Item Name"
                placeholder="Enter item name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Quantity"
                    placeholder="0"
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(val) => onChange(Number(val))}
                    value={value.toString()}
                    error={errors.quantity?.message}
                  />
                )}
              />
            </View>
            {isEdit && (
              <Button
                variant="outline"
                onPress={handleFetchAISuggestion}
                title="AI"
                style={styles.aiButton}
              />
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="minQuantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Min Stock"
                    placeholder="0"
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(val) => onChange(Number(val))}
                    value={value.toString()}
                    error={errors.minQuantity?.message}
                  />
                )}
              />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="maxQuantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Max Stock"
                    placeholder="0"
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(val) => onChange(Number(val))}
                    value={value.toString()}
                    error={errors.maxQuantity?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Price"
                placeholder="0.00"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={(val) => onChange(Number(val))}
                value={value.toString()}
                error={errors.price?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Category"
                placeholder="e.g. Electronics"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.category?.message}
              />
            )}
          />
        </View>

        <View style={styles.footer}>
          <Button
            title={isEdit ? 'Update Item' : 'Create Item'}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty}
            fullWidth
          />
        </View>
      </ScrollView>

      <AISuggestionModal
        isVisible={isAIModalVisible}
        onClose={() => setIsAIModalVisible(false)}
        onApply={applyAISuggestion}
        suggestion={aiSuggestion}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacingSemantic.screen,
    paddingVertical: spacingSemantic.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacingSemantic.sm,
    minWidth: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 44,
  },
  scrollContent: {
    padding: spacingSemantic.screen,
    paddingBottom: spacingSemantic.xl,
  },
  formSection: {
    gap: spacingSemantic.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacingSemantic.md,
  },
  flex1: {
    flex: 1,
  },
  aiButton: {
    height: 52,
    width: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacingSemantic.sm,
  },
  footer: {
    marginTop: spacingSemantic.xl,
  },
});

export default AddEditItemScreen;
