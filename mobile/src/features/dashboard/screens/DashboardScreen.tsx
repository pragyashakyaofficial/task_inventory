import React, { useMemo, memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  LogOut,
  AlertCircle,
} from 'lucide-react-native';
import { colors, spacingSemantic } from '../../../theme/constants';
import GlassCard from '../../../components/common/GlassCard';
import { InventoryItem } from '../../inventory/types/inventory.types';
import { useInventory, useDashboardStats } from '../../inventory/hooks/useInventory';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { logout } from '../../auth/store/authSlice';

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
    <View style={styles.statCardCompact}>
      <View style={[styles.statIconCompact, { backgroundColor: color + '20' }]}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
      </View>
      <Text style={[styles.statValueCompact, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabelCompact, { color: colors.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
});

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { items, isLoading: isInventoryLoading, refetchItems } = useInventory({});
  const { stats: dashboardStats, isLoading: isStatsLoading, refetchStats } = useDashboardStats();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Log API calls and data (dev only)
  React.useEffect(() => {
    if (__DEV__) {
      console.log('Dashboard Data Updated:', {
        inventoryItemsCount: items.length,
        dashboardStats: dashboardStats,
        isLoading: isInventoryLoading || isStatsLoading
      });
    }
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

  const handleReorderPlan = useCallback(() => navigation.navigate('Suggestions', { autoFetch: true }), [navigation]);

  const handleLogoutPress = useCallback(() => {
    setLogoutModalVisible(true);
  }, []);

  const handleConfirmLogout = useCallback(() => {
    setLogoutModalVisible(false);
    dispatch(logout());
  }, [dispatch]);

  const handleCancelLogout = useCallback(() => {
    setLogoutModalVisible(false);
  }, []);


  const getStatusBadge = (status: string) => {
    const isOut = status === 'Out of Stock' || status === 'out-of-stock';
    const badgeColor = isOut ? '#EF4444' : '#F59E0B';
    const badgeBg = isOut ? '#EF444420' : '#F59E0B20';
    const label = isOut ? 'OUT' : 'LOW';
    return (
      <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
        <AlertCircle size={10} color={badgeColor} />
        <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
      {/* Fixed Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hello, </Text>
          <Text style={[styles.title, { color: colors.text }]}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.textSecondary + '20' }]}
          onPress={handleLogoutPress}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.greeting1, { color: colors.textSecondary }]}> Inventory Overview </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard title="Total" value={stats.total} icon={<Package size={16} color={colors.primary} />} color={colors.primary} />
        <StatCard title="In Stock" value={stats.inStock} icon={<CheckCircle2 size={16} color="#10B981" />} color="#10B981" />
        <StatCard title="Low" value={stats.lowStock} icon={<AlertTriangle size={16} color="#F59E0B" />} color="#F59E0B" />
        <StatCard title="Out" value={stats.outOfStock} icon={<XCircle size={16} color="#EF4444" />} color="#EF4444" />
      </View>

      <View style={styles.reorderPlanSection}>
        <TouchableOpacity
          style={[styles.reorderPlanMainButton, { backgroundColor: colors.primary }]}
          onPress={handleReorderPlan}
          activeOpacity={0.8}
        >
          <View style={styles.reorderPlanRow}>
            <Sparkles size={24} color="#fff" />
            <Text style={styles.reorderPlanMainTitle}>Reorder Plan</Text>
          </View>
          <Text style={styles.reorderPlanMainSubtitle}>
            {criticalAlerts.length > 0
              ? `${criticalAlerts.length} items need attention`
              : 'All items are well stocked'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Critical Stock Alerts</Text>
      </View>

      {/* Scrollable Alerts List */}
      <ScrollView
        style={styles.alertsScroll}
        contentContainerStyle={styles.alertsScrollContent}
        showsVerticalScrollIndicator={false}
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
        {criticalAlerts.length > 0 ? (
          criticalAlerts.map((item: any) => (
            <View
              key={item.id || item._id}
              style={[styles.alertItem, { backgroundColor: colors.backgroundSecondary }]}
            >
              {/* Left: Quantity + Units */}
              <View style={styles.quantityContainer}>
                <Text style={[styles.quantityValue, { color: colors.text }]}>
                  {item.quantity ?? item.currentStock ?? 0}
                </Text>
                <Text style={[styles.quantityUnit, { color: colors.textSecondary }]}>
                  {item.unit || 'units'}
                </Text>
              </View>

              {/* Middle: Content */}
              <View style={styles.alertContent}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                {item.category && (
                  <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
                    {item.category}
                  </Text>
                )}
              </View>

              {/* Right: Status Badge */}
              {getStatusBadge(item.status)}
            </View>
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
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
            <LogOut size={40} color={colors.primary} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Logout</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.textSecondary }]}
                onPress={handleCancelLogout}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                onPress={handleConfirmLogout}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonConfirmText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  header: {
    marginTop: spacingSemantic.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingSemantic.screen,
    marginBottom: spacingSemantic.lg,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: spacingSemantic.screen,
    marginBottom: spacingSemantic.sm,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
    greeting1: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacingSemantic.screen,
    gap: 8,
  },
  statCardCompact: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: spacingSemantic.borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  statIconCompact: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValueCompact: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabelCompact: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reorderPlanSection: {
    paddingHorizontal: spacingSemantic.screen,
    marginTop: spacingSemantic.md,
    
  },
  reorderPlanMainButton: {
    borderRadius: spacingSemantic.borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  reorderPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reorderPlanMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  reorderPlanMainSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.85,
  },
  sectionHeader: {
    marginTop: spacingSemantic.md,
    paddingHorizontal: spacingSemantic.screen,
    marginBottom: spacingSemantic.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  alertsScroll: {
    flex: 1,
  },
  alertsScrollContent: {
    paddingHorizontal: spacingSemantic.screen,
    paddingBottom: spacingSemantic.xl,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingSemantic.md,
    borderRadius: spacingSemantic.borderRadius.lg,
    marginBottom: spacingSemantic.sm,
    gap: spacingSemantic.sm,
  },
  quantityContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '30',
    borderRadius: spacingSemantic.borderRadius.md,
    paddingVertical: spacingSemantic.sm,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  quantityUnit: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'lowercase',
    color: '#fff',
  },
  alertContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    color: '#fff',
  },
});

export default DashboardScreen;
