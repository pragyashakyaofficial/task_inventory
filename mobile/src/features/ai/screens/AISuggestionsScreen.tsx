import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';
import {
  XCircle,
  RefreshCcw,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from '../../../theme/constants';
import GlassCard from '../../../components/common/GlassCard';
import { useLazyGetReorderPlanQuery, useGetItemsQuery } from '../../../api/slices/inventoryApi';

type Props = NativeStackScreenProps<MainStackParamList, 'Suggestions'>;

const AISuggestionsScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const [getReorderPlan, { data: reorderData, isLoading: isFetching, error, isError }] = useLazyGetReorderPlanQuery();
  const { data: itemsData } = useGetItemsQuery({});
  const [hasFetched, setHasFetched] = useState(false);

  // Only auto-fetch if navigated with autoFetch param (from dashboard button)
  useEffect(() => {
    if (route.params?.autoFetch && !hasFetched) {
      handleFetchPlan();
    }
  }, [route.params?.autoFetch]);

  const handleFetchPlan = useCallback(() => {
    setHasFetched(true);
    getReorderPlan();
  }, [getReorderPlan]);

  const suggestions = reorderData?.suggestions || [];

  // Fallback: filter inventory items that are low/out of stock
  const fallbackItems = (itemsData?.items || [])
    .filter((item: any) => item.status === 'low-stock' || item.status === 'out-of-stock')
    .map((item: any) => ({
      itemId: item.id,
      name: item.name,
      category: item.category || '',
      currentQuantity: item.quantity,
      minThreshold: item.minQuantity,
      maxStock: item.maxQuantity,
      unit: item.unit || 'units',
      status: item.status,
      shouldReorder: true,
      suggestedQuantity: Math.max(0, (item.maxQuantity || 100) - (item.quantity || 0)),
      reason: `Below minimum threshold (${item.minQuantity} ${item.unit})`,
    }));

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isOut = item.status === 'OUT' || item.status === 'out-of-stock';
    const urgencyColor = isOut ? '#EF4444' : '#F59E0B';

    return (
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusDot, { backgroundColor: urgencyColor }]} />
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
              {item.category}
            </Text>
          </View>
        </View>

        <View style={styles.suggestionDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Current:</Text>
            <Text style={[styles.detailValue, { color: urgencyColor }]}>{item.currentQuantity} {item.unit}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Suggest:</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>{item.suggestedQuantity} {item.unit}</Text>
          </View>
        </View>

        <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
          {item.reason}
        </Text>
      </GlassCard>
    );
  }, []);

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Fetching plan...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerContainer}>
      <XCircle size={48} color="#EF4444" />
      <Text style={[styles.errorTitle, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.errorText, { color: colors.textSecondary }]}>
        {error?.toString() || 'Failed to fetch reorder plan'}
      </Text>
      <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleFetchPlan}>
        <RefreshCcw size={16} color="#fff" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <CheckCircle2 size={48} color="#10B981" />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>All stocked up!</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No items need reordering right now.
      </Text>
    </View>
  );

  const renderInitial = () => (
    <View style={styles.centerContainer}>
      <TouchableOpacity style={[styles.fetchButton, { backgroundColor: colors.primary }]} onPress={handleFetchPlan}>
        <RefreshCcw size={20} color="#fff" />
        <Text style={styles.fetchButtonText}>Get Reorder Plan</Text>
      </TouchableOpacity>
      <Text style={[styles.fetchHint, { color: colors.textSecondary }]}>
        Tap to analyze which items need reordering
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Reorder Plan</Text>
      </View>

      <View style={styles.content}>
        {!hasFetched && !isFetching ? (
          renderInitial()
        ) : isFetching ? (
          renderLoading()
        ) : isError ? (
          fallbackItems.length > 0 ? (
            <>
              <View style={styles.fallbackBanner}>
                <Text style={[styles.fallbackBannerText, { color: colors.textSecondary }]}>
                  AI suggestions unavailable. Showing items that need attention.
                </Text>
              </View>
              <FlatList
                data={fallbackItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.itemId}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : renderError()
        ) : suggestions.length > 0 ? (
          <FlatList
            data={suggestions}
            renderItem={renderItem}
            keyExtractor={(item) => item.itemId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmpty()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemCategory: {
    fontSize: 13,
    fontWeight: '500',
  },
  suggestionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  fallbackBanner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F59E0B15',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 10,
  },
  fallbackBannerText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  fetchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  fetchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  fetchHint: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AISuggestionsScreen;
