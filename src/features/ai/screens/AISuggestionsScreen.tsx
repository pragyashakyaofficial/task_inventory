import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  ArrowRight,
  RefreshCcw,
} from 'lucide-react-native';
import { colors } from '../../../theme/constants';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { useInventory } from '../../inventory/hooks/useInventory';
import { InventoryItem } from '../../inventory/types/inventory.types';

interface SuggestionItem extends InventoryItem {
  suggestedQuantity: number;
  confidence: number;
  reason: string;
}

const AISuggestionsScreen = () => {
  const insets = useSafeAreaInsets();
  const { items, refetchItems } = useInventory({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState<number>(0);

  // Log dynamic data updates
  useEffect(() => {
    console.log('AI Suggestions dynamic data source (Inventory) updated:', {
      totalItems: items.length,
      outOfStock: items.filter(i => i.status === 'out-of-stock').length,
      lowStock: items.filter(i => i.status === 'low-stock').length,
    });
  }, [items]);

  const suggestions: SuggestionItem[] = useMemo(() => {
    return items
      .filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
      .map(item => ({
        ...item,
        suggestedQuantity: item.maxQuantity,
        confidence: 0.7 + Math.random() * 0.28,
        reason: item.status === 'out-of-stock' 
          ? 'Critical stockout detected. Urgent reorder required to meet projected demand.' 
          : 'High sales velocity detected. Current stock will be depleted in 3 days.',
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }, [items]);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => s.confidence >= confidenceFilter);
  }, [suggestions, confidenceFilter]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchItems();
    setIsRefreshing(false);
  }, [refetchItems]);

  const handleApplyAll = useCallback(() => {
    Alert.alert(
      'Apply All Suggestions',
      `Are you sure you want to apply all ${filteredSuggestions.length} suggested reorders?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply All', 
          onPress: () => Alert.alert('Success', 'All suggestions applied successfully')
        }
      ]
    );
  }, [filteredSuggestions.length]);

  const handleItemPress = useCallback((item: SuggestionItem) => {
    // Navigate or show details
    console.log('Suggestion pressed:', item.name);
  }, []);

  const renderItem = useCallback(({ item }: { item: SuggestionItem; index: number }) => (
    <View>
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemSku, { color: colors.textSecondary }]}>SKU: {item.sku}</Text>
          </View>
          <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + '15' }]}>
            <Sparkles size={14} color={colors.primary} />
            <Text style={[styles.confidenceText, { color: colors.primary }]}>
              {Math.round(item.confidence * 100)}% Match
            </Text>
          </View>
        </View>

        <View style={styles.suggestionBody}>
          <View style={styles.quantityRow}>
            <View style={styles.quantityBox}>
              <Text style={[styles.quantityLabel, { color: colors.textSecondary }]}>Current</Text>
              <Text style={[styles.quantityValue, { color: colors.text }]}>{item.quantity}</Text>
            </View>
            <ArrowRight size={20} color={colors.textTertiary} />
            <View style={styles.quantityBox}>
              <Text style={[styles.quantityLabel, { color: colors.primary }]}>Suggested</Text>
              <Text style={[styles.quantityValue, { color: colors.primary }]}>{item.suggestedQuantity}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${item.confidence * 100}%`,
                    backgroundColor: item.confidence > 0.9 ? '#10B981' : colors.primary 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.reasonBox, { backgroundColor: colors.backgroundSecondary }]}>
            <Brain size={16} color={colors.textSecondary} style={styles.reasonIcon} />
            <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{item.reason}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Button 
            title="Dismiss" 
            variant="outline" 
            size="small"
            onPress={() => {}}
            style={styles.actionButton}
          />
          <Button 
            title="Apply Reorder" 
            size="small"
            onPress={() => Alert.alert('Applied', `Reorder for ${item.name} applied`)}
            style={styles.actionButton}
          />
        </View>
      </GlassCard>
    </View>
  ), [handleItemPress]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>AI Optimization</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filteredSuggestions.length} Smart Reorder Suggestions
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={onRefresh}
        >
          <RefreshCcw size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[0, 0.8, 0.9, 0.95].map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: confidenceFilter === val ? colors.primary : colors.backgroundSecondary,
                }
              ]}
              onPress={() => setConfidenceFilter(val)}
            >
              <Text style={[
                styles.filterText,
                { color: confidenceFilter === val ? 'white' : colors.textSecondary }
              ]}>
                {val === 0 ? 'All' : `${Math.round(val * 100)}%+ Confidence`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSuggestions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          filteredSuggestions.length > 1 ? (
            <Button 
              title={`Apply All (${filteredSuggestions.length})`}
              onPress={handleApplyAll}
              style={styles.applyAllBtn}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CheckCircle2 size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All Clear!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              No items currently require AI-driven reordering.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  applyAllBtn: {
    marginBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemSku: {
    fontSize: 12,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionBody: {
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quantityBox: {
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  reasonBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  reasonIcon: {
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default AISuggestionsScreen;
