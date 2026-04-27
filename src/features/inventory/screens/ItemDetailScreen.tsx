import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import {
  Package,
  Layers,
  DollarSign,
  BarChart2,
  History,
  RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { spacingSemantic } from '../../../theme/spacing';
import Button from '../../../components/common/Button';
import GlassCard from '../../../components/common/GlassCard';
import StatusBadge from '../../../components/common/StatusBadge';
import { InventoryItem } from '../types/inventory.types';

type RootStackParamList = {
  ItemDetail: { item: InventoryItem };
  AddEditItem: { item: InventoryItem };
};

const ItemDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'ItemDetail'>>();
  const { item } = route.params;

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            // Simulate delete
            setTimeout(() => {
              Alert.alert('Success', 'Item deleted successfully');
              navigation.goBack();
            }, 1000);
          },
        },
      ]
    );
  };

  const handleAIReorder = () => {
    Alert.alert(
      'AI Reorder Triggered',
      'The AI system is calculating the optimal reorder quantity based on current demand patterns and lead times.',
      [{ text: 'Great!' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={[styles.category, { color: theme.colors.primary }]}>{item.category}</Text>
            <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.sku, { color: theme.colors.textSecondary }]}>SKU: {item.sku}</Text>
          </View>
          <StatusBadge status={item.status} />
        </Animated.View>

        <View style={styles.statsRow}>
          <Animated.View entering={FadeInRight.delay(100)} layout={Layout.springify()}>
            <GlassCard style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                <Package size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{item.quantity}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>In Stock</Text>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(200)} layout={Layout.springify()}>
            <GlassCard style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                <DollarSign size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>${item.price.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Price</Text>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(300)} layout={Layout.springify()}>
            <GlassCard style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                <Layers size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{item.minQuantity}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Min Alert</Text>
            </GlassCard>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>AI Insights</Text>
          <GlassCard style={styles.aiInsightsCard}>
            <View style={styles.aiInsightRow}>
              <BarChart2 size={20} color={theme.colors.primary} />
              <View style={styles.aiInsightText}>
                <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Demand Outlook</Text>
                <Text style={[styles.insightDesc, { color: theme.colors.textSecondary }]}>
                  Stable demand predicted for the next 14 days. Current stock is optimal.
                </Text>
              </View>
            </View>
            <Button
              title="Predict Reorder"
              variant="outline"
              onPress={handleAIReorder}
              style={styles.reorderButton}
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <History size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.activityText, { color: theme.colors.text }]}>
                Inventory updated 2 days ago
              </Text>
            </View>
            <View style={styles.activityItem}>
              <RefreshCw size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.activityText, { color: theme.colors.text }]}>
                Stock check completed yesterday
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomActions, { borderTopColor: theme.colors.borderLight }]}>
        <Button
          title="Delete"
          variant="error"
          onPress={handleDelete}
          loading={isDeleting}
          style={styles.actionButton}
        />
        <Button
          title="Edit Item"
          onPress={() => navigation.navigate('AddEditItem', { item })}
          style={StyleSheet.flatten([styles.actionButton, { flex: 2 }])}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingSemantic.screen,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingSemantic.xl,
  },
  titleSection: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacingSemantic.xs,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacingSemantic.xs,
  },
  sku: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacingSemantic.xl,
  },
  statCard: {
    width: 105,
    padding: spacingSemantic.md,
    alignItems: 'center',
    borderRadius: spacingSemantic.borderRadius.xl,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: spacingSemantic.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacingSemantic.md,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: spacingSemantic.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacingSemantic.md,
  },
  aiInsightsCard: {
    padding: spacingSemantic.xl,
    borderRadius: 24,
  },
  aiInsightRow: {
    flexDirection: 'row',
    gap: spacingSemantic.md,
    marginBottom: spacingSemantic.xl,
  },
  aiInsightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacingSemantic.xs,
  },
  insightDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  reorderButton: {
    marginTop: spacingSemantic.sm,
  },
  activityList: {
    gap: spacingSemantic.sm * 1.5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingSemantic.sm * 1.5,
  },
  activityText: {
    fontSize: 14,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacingSemantic.screen,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacingSemantic.screen,
    gap: spacingSemantic.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
});

export default ItemDetailScreen;
