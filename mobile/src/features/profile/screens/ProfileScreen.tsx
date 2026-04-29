import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, RefreshControl, Modal, Pressable } from 'react-native';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight,
  Mail,
  UserCircle,
  X
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../auth/store/authSlice';
import { RootState } from '../../../store';
import { colors, spacingSemantic } from '../../../theme/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../../components/common/GlassCard';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh/auth check
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(logout());
  };

  const ProfileOption = ({ icon, title, subtitle, value, onValueChange, type = 'link' }: any) => (
      <TouchableOpacity 
        style={[styles.option, { borderBottomColor: colors.border }]}
        disabled={type === 'switch'}
      >
        <View style={[styles.optionIcon, { backgroundColor: colors.backgroundSecondary }]}>
          {icon}
        </View>
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
        {type === 'link' && <ChevronRight size={20} color={colors.textTertiary} />}
        {type === 'switch' && (
          <Switch 
            value={value} 
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: colors.primary }}
          />
        )}
      </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.backgroundSecondary}
        />
      }
    >
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <UserCircle size={80} color={colors.primary} />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account Settings</Text>
        <GlassCard style={styles.card}>
          <ProfileOption 
            icon={<User size={20} color={colors.primary} />} 
            title="Edit Profile" 
            subtitle="Change your personal details"
          />
          <ProfileOption 
            icon={<Mail size={20} color={colors.primary} />} 
            title="Email Notifications" 
            subtitle="Manage your alerts"
            type="switch"
            value={true}
          />
          <ProfileOption 
            icon={<Shield size={20} color={colors.primary} />} 
            title="Security" 
            subtitle="Password and biometric"
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
        <GlassCard style={styles.card}>
          <ProfileOption 
            icon={<Settings size={20} color={colors.primary} />} 
            title="Dark Mode" 
            type="switch"
            value={true}
            onValueChange={() => {}}
          />
          <ProfileOption 
            icon={<Bell size={20} color={colors.primary} />} 
            title="Push Notifications" 
            type="switch"
            value={true}
          />
        </GlassCard>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]}
        onPress={handleLogout}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: colors.textTertiary }]}>
        Version 1.0.0
      </Text>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setLogoutModalVisible(false)}
        >
          <View style={styles.modalCenteredView}>
            <GlassCard style={styles.modalView}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconContainer, { backgroundColor: colors.error + '20' }]}>
                  <LogOut size={24} color={colors.error} />
                </View>
                <TouchableOpacity 
                  onPress={() => setLogoutModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Logout</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Are you sure you want to log out of your account?
                </Text>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => setLogoutModalVisible(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.error }]}
                  onPress={confirmLogout}
                >
                  <Text style={styles.confirmButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCenteredView: {
    width: '85%',
    maxWidth: 340,
  },
  modalView: {
    padding: spacingSemantic.lg,
    borderRadius: spacingSemantic.borderRadius.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingSemantic.md,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    marginBottom: spacingSemantic.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacingSemantic.md,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: spacingSemantic.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
