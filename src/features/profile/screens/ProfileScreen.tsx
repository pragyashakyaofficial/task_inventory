import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight,
  Mail,
  UserCircle
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../../components/common/GlassCard';

const ProfileScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    // Placeholder for logout logic
    console.log('Logging out...');
  };

  const ProfileOption = ({ icon, title, subtitle, value, onValueChange, type = 'link' }: any) => (
    <TouchableOpacity 
      style={[styles.option, { borderBottomColor: theme.colors.border }]}
      disabled={type === 'switch'}
    >
      <View style={[styles.optionIcon, { backgroundColor: theme.colors.backgroundSecondary }]}>
        {icon}
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {type === 'link' && <ChevronRight size={20} color={theme.colors.textTertiary} />}
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: theme.colors.primary }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <UserCircle size={80} color={theme.colors.primary} />
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>John Doe</Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>john.doe@example.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Account Settings</Text>
        <GlassCard style={styles.card}>
          <ProfileOption 
            icon={<User size={20} color={theme.colors.primary} />} 
            title="Edit Profile" 
            subtitle="Change your personal details"
          />
          <ProfileOption 
            icon={<Mail size={20} color={theme.colors.primary} />} 
            title="Email Notifications" 
            subtitle="Manage your alerts"
            type="switch"
            value={true}
          />
          <ProfileOption 
            icon={<Shield size={20} color={theme.colors.primary} />} 
            title="Security" 
            subtitle="Password and biometric"
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Preferences</Text>
        <GlassCard style={styles.card}>
          <ProfileOption 
            icon={<Settings size={20} color={theme.colors.primary} />} 
            title="Dark Mode" 
            type="switch"
            value={theme.isDark}
            onValueChange={toggleTheme}
          />
          <ProfileOption 
            icon={<Bell size={20} color={theme.colors.primary} />} 
            title="Push Notifications" 
            type="switch"
            value={true}
          />
        </GlassCard>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#EF4444' + '15' }]}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
        Version 1.0.0
      </Text>
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
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
});

export default ProfileScreen;
