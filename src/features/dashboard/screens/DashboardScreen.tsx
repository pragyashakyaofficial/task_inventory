import React, { useEffect, useMemo, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  withTiming, 
  Easing,
  useDerivedValue
} from 'react-native-reanimated';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  ChevronRight
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import GlassCard from '../../../components/common/GlassCard';
import { InventoryItem } from '../../inventory/types/inventory.types';
import { useInventory } from '../../inventory/hooks/useInventory';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

type DashboardNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: DashboardNavigationProp;
}

const StatCard: React.FC<StatCardProps> = memo(({ title, value, icon, color }) => {
  const { theme } = useTheme();
  const count = useSharedValue(0);

  useEffect(() => {
    count.value = withTiming(value, {
      duration: 1500,
      easing: Easing.out(Easing.exp),
    });
  }, [value]);

  const animatedText = useDerivedValue(() => {
    return Math.floor(count.value).toString();
  });

  return (
    <GlassCard style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <View>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{title}</Text>
        <AnimatedText style={[styles.statValue, { color: theme.colors.text }]}>
          {animatedText.value}
        </AnimatedText>
      </View>
    </GlassCard>
  );
});

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { items, isLoading } = useInventory({});

  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter((i: InventoryItem) => i.status === 'in-stock').length,
    lowStock: items.filter((i: InventoryItem) => i.status === 'low-stock').length,
    outOfStock: items.filter((i: InventoryItem) => i.status === 'out-of-stock').length,
  }), [items]);

  const lowStockItems = useMemo(() => 
    items.filter((i: InventoryItem) => i.status === 'low-stock').slice(0, 5)
  , [items]);

  const handleViewAll = useCallback(() => navigation.navigate('InventoryList'), [navigation]);
  const handleProfilePress = useCallback(() => navigation.navigate('Profile'), [navigation]);
  const handleItemPress = useCallback((item: InventoryItem) => {
    navigation.navigate('ItemDetail', { itemId: item.id });
  }, [navigation]);

  const contentContainerStyle = useMemo(() => ({ 
    paddingTop: insets.top + 20, 
    paddingBottom: 100 
  }), [insets.top]);

  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  return (
    <ScrollView 
      style={containerStyle}
      contentContainerStyle={contentContainerStyle}
      removeClippedSubviews={true}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Hello,</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Inventory Overview</Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: theme.colors.backgroundSecondary }]}
          onPress={handleProfilePress}
        >
          <TrendingUp size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          title="Total Items" 
          value={stats.total} 
          icon={<Package size={24} color={theme.colors.primary} />} 
          color={theme.colors.primary} 
        />
        <StatCard 
          title="In Stock" 
          value={stats.inStock} 
          icon={<CheckCircle2 size={24} color="#10B981" />} 
          color="#10B981" 
        />
        <StatCard 
          title="Low Stock" 
          value={stats.lowStock} 
          icon={<AlertTriangle size={24} color="#F59E0B" />} 
          color="#F59E0B" 
        />
        <StatCard 
          title="Out of Stock" 
          value={stats.outOfStock} 
          icon={<XCircle size={24} color="#EF4444" />} 
          color="#EF4444" 
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Critical Stock Alerts</Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text style={{ color: theme.colors.primary }}>View All</Text>
          </TouchableOpacity>
        </View>

        {lowStockItems.length > 0 ? (
          lowStockItems.map((item: InventoryItem) => (
            <TouchableOpacity 
              key={item.id}
              style={[styles.alertItem, { backgroundColor: theme.colors.backgroundSecondary }]}
              onPress={() => handleItemPress(item)}
            >
              <View style={[styles.alertIcon, { backgroundColor: '#F59E0B20' }]}>
                <AlertTriangle size={18} color="#F59E0B" />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemStock, { color: theme.colors.textSecondary }]}>
                  Only {item.quantity} left in stock
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))
        ) : (
          <GlassCard style={styles.emptyAlert}>
            <CheckCircle2 size={32} color="#10B981" />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              All items are sufficiently stocked!
            </Text>
          </GlassCard>
        )}
      </View>
    </ScrollView>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '46%',
    margin: '2%',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemStock: {
    fontSize: 13,
  },
  emptyAlert: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DashboardScreen;
