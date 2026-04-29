import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { colors, spacingSemantic } from '../../../theme/constants';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Toast from 'react-native-toast-message';
import AISuggestionModal from '../components/AISuggestionModal';
import { InventoryItem } from '../types/inventory.types';
import { useGetCategoriesQuery, useCreateItemMutation, useUpdateItemMutation } from '../../../api/slices/inventoryApi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.number().min(0, 'Current stock cannot be negative'),
  minQuantity: z.number().min(0, 'Minimum stock cannot be negative'),
  maxQuantity: z.number().min(0, 'Maximum stock cannot be negative'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  sku: z.string().min(1, 'SKU is required'),
});

type FormData = z.infer<typeof schema>;

type RootStackParamList = {
  AddEditItem: { item?: InventoryItem; itemId?: string };
};

const AddEditItemScreen = () => {
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Fetch categories from backend
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();

  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name || '',
      quantity: item?.quantity || 0,
      minQuantity: item?.minQuantity || 0,
      maxQuantity: item?.maxQuantity || 100,
      price: item?.price || 0,
      category: item?.category || '',
      unit: item?.unit || 'pcs',
      sku: item?.sku || '',
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: FormData) => {
    try {
      const itemData = {
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        price: data.price,
        sku: data.sku,
        unit: data.unit,
        minimumStock: data.minQuantity,
        maxStock: data.maxQuantity,
        description: '',
      };

      if (isEdit && item?.id) {
        await updateItem({ id: item.id, ...itemData }).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Item Updated',
          text2: `${data.name} has been updated successfully.`,
          position: 'bottom',
        });
      } else {
        await createItem(itemData).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Item Created',
          text2: `${data.name} has been added to inventory.`,
          position: 'bottom',
        });
      }

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.data?.message || `Failed to ${isEdit ? 'update' : 'create'} item.`,
        position: 'bottom',
      });
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    setValue('category', categoryName, { shouldValidate: true, shouldDirty: true });
    setShowCategoryDropdown(false);
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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
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

          <Controller
            control={control}
            name="sku"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="SKU"
                placeholder="Enter SKU code"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.sku?.message}
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
                    label="Current Stock"
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
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Unit"
                    placeholder="pcs, kg, L"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.unit?.message}
                  />
                )}
              />
            </View>
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

          {/* Category Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={[styles.dropdownLabel, { color: colors.textSecondary }]}>
              Category
            </Text>
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: colors.backgroundSecondary, borderColor: errors.category ? '#EF4444' : colors.borderLight }]}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownButtonText, { color: selectedCategory ? colors.text : colors.textTertiary }]}>
                {selectedCategory || 'Select a category'}
              </Text>
              {isCategoriesLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            {errors.category?.message && (
              <Text style={styles.errorText}>{errors.category.message}</Text>
            )}
            
            {/* Dropdown rendered as Modal overlay to avoid ScrollView clipping */}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title={isEdit ? 'Update Item' : 'Create Item'}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || isCreating || isUpdating}
            loading={isCreating || isUpdating}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <Pressable style={styles.dropdownOverlay} onPress={() => setShowCategoryDropdown(false)}>
          <Pressable style={[styles.dropdownModal, { backgroundColor: colors.backgroundSecondary }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.dropdownModalTitle, { color: colors.text }]}>Select Category</Text>
            {isCategoriesLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ paddingVertical: spacingSemantic.xl }} />
            ) : categories.length === 0 ? (
              <Text style={[styles.dropdownItemText, { color: colors.textSecondary, padding: spacingSemantic.md, textAlign: 'center' }]}>
                No categories found
              </Text>
            ) : (
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[styles.dropdownItem, selectedCategory === cat.name && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => handleSelectCategory(cat.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownItemText, { color: selectedCategory === cat.name ? colors.primary : colors.text }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

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
  dropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacingSemantic.sm,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacingSemantic.md,
    paddingVertical: spacingSemantic.md,
    borderRadius: spacingSemantic.borderRadius.lg,
    borderWidth: 1,
    height: 52,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: spacingSemantic.borderRadius.lg,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingHorizontal: spacingSemantic.md,
    paddingVertical: spacingSemantic.sm,
    borderRadius: spacingSemantic.borderRadius.md,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '80%',
    maxWidth: 400,
    borderRadius: spacingSemantic.borderRadius.xl,
    padding: spacingSemantic.lg,
    maxHeight: '60%',
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacingSemantic.md,
    textAlign: 'center',
  },
  dropdownScroll: {
    maxHeight: 300,
  },
});

export default AddEditItemScreen;
