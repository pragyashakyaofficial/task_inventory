import React, { useMemo, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  ChevronRight
} from 'lucide-react-native';
import { colors, spacingSemantic } from '../../../theme/constants';
import GlassCard from '../../../components/common/GlassCard';
import { InventoryItem } from '../../inventory/types/inventory.types';
import { useInventory, useDashboardStats } from '../../inventory/hooks/useInventory';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  return (
    <GlassCard style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
        </View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {value}
        </Text>
      </View>
    </GlassCard>
  );
});

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { items, isLoading: isInventoryLoading, refetchItems } = useInventory({});
  const { stats: dashboardStats, isLoading: isStatsLoading, refetchStats } = useDashboardStats();

  // Log API calls and data
  React.useEffect(() => {
    console.log('Dashboard Data Updated:', {
      inventoryItemsCount: items.length,
      dashboardStats: dashboardStats,
      isLoading: isInventoryLoading || isStatsLoading
    });
  }, [items, dashboardStats, isInventoryLoading, isStatsLoading]);

  const isLoading = isInventoryLoading || isStatsLoading;

  const onRefresh = useCallback(() => {
    refetchItems();
    refetchStats();
  }, [refetchItems, refetchStats]);

  const stats = useMemo(() => ({
    total: dashboardStats?.stats?.total ?? items.length,
    inStock: dashboardStats?.stats?.inStock ?? items.filter((i: InventoryItem) => i.status === 'in-stock').length,
    lowStock: dashboardStats?.stats?.lowStock ?? items.filter((i: InventoryItem) => i.status === 'low-stock').length,
    outOfStock: dashboardStats?.stats?.outOfStock ?? items.filter((i: InventoryItem) => i.status === 'out-of-stock').length,
  }), [items, dashboardStats]);

  const criticalAlerts = useMemo(() => 
    dashboardStats?.criticalStockAlerts ?? items.filter((i: InventoryItem) => i.status !== 'in-stock').slice(0, 5)
  , [items, dashboardStats]);

  const handleViewAll = useCallback(() => navigation.navigate('InventoryList'), [navigation]);
  const handleProfilePress = useCallback(() => navigation.navigate('Profile'), [navigation]);
  const handleItemPress = useCallback((item: any) => {
    navigation.navigate('ItemDetail', { itemId: item.id || item._id });
  }, [navigation]);

  const contentContainerStyle = useMemo(() => ({ 
    paddingTop: insets.top + 20, 
    paddingBottom: 100 
  }), [insets.top]);

  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: colors.background }
  ], []);

  return (
    <ScrollView 
      style={containerStyle}
      contentContainerStyle={contentContainerStyle}
      removeClippedSubviews={true}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.backgroundSecondary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hello, User!</Text>
          <Text style={[styles.title, { color: colors.text }]}>Inventory Overview</Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={handleProfilePress}
        >
          <TrendingUp size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          title="Total Items" 
          value={stats.total} 
          icon={<Package size={24} color={colors.primary} />} 
          color={colors.primary} 
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Critical Stock Alerts</Text>
          <TouchableOpacity 
            onPress={handleViewAll} 
            style={styles.viewAllButton}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            <ChevronRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {criticalAlerts.length > 0 ? (
          criticalAlerts.map((item: any) => (
            <TouchableOpacity 
              key={item.id || item._id}
              style={[styles.alertItem, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => handleItemPress(item)}
            >
              <View style={[styles.alertIcon, { backgroundColor: (item.status === 'Out of Stock' || item.status === 'out-of-stock') ? '#EF444420' : '#F59E0B20' }]}>
                <AlertTriangle size={18} color={(item.status === 'Out of Stock' || item.status === 'out-of-stock') ? '#EF4444' : '#F59E0B'} />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemStock, { color: colors.textSecondary }]}>
                  {item.status}: {item.quantity} units
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))
        ) : (
          <GlassCard style={styles.emptyAlert}>
            <View style={styles.emptyAlertContent}>
              <CheckCircle2 size={24} color="#10B981" />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                All items are sufficiently stocked!
              </Text>
            </View>
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
    paddingHorizontal: spacingSemantic.screen,
    marginBottom: spacingSemantic.lg,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: spacingSemantic.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacingSemantic.sm,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '46%',
    margin: '2%',
    padding: spacingSemantic.md,
    borderRadius: spacingSemantic.borderRadius.xl,
    flexDirection: 'column',
    minHeight: 120,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacingSemantic.sm,
    width: '100%',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: spacingSemantic.borderRadius.sm * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  statValueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  section: {
    marginTop: spacingSemantic.xl,
    paddingHorizontal: spacingSemantic.screen,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingSemantic.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingSemantic.md,
    borderRadius: spacingSemantic.borderRadius.lg,
    marginBottom: spacingSemantic.sm,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: spacingSemantic.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingSemantic.md,
  },
  alertContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemStock: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyAlert: {
    padding: spacingSemantic.lg,
    borderRadius: spacingSemantic.borderRadius.xl,
  },
  emptyAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DashboardScreen;
