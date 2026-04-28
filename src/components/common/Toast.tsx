import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onHide?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  position?: 'top' | 'bottom';
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onHide,
  actionLabel,
  onAction,
  position = 'top',
}) => {
  const translateY = useSharedValue(position === 'top' ? -100 : 100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Entrance animation
    translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });

    // Auto hide after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const hideToast = () => {
    translateY.value = withSpring(
      position === 'top' ? -100 : 100,
      { damping: 15, stiffness: 400 }
    );
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withSpring(0.8, { damping: 15, stiffness: 400 });
    
    setTimeout(() => {
      onHide?.();
    }, 200);
  };

  const handleAction = () => {
    onAction?.();
    hideToast();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          textColor: colors.white,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          textColor: colors.white,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          textColor: colors.white,
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          textColor: colors.white,
        };
      default:
        return {
          backgroundColor: colors.gray,
          textColor: colors.white,
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          [position]: 50,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>
          {type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </Text>
        
        <Text style={[styles.message, { color: config.textColor }]}>
          {message}
        </Text>
        
        {actionLabel && onAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAction}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionText, { color: config.textColor }]}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
          activeOpacity={0.8}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
   
    zIndex: 1000,
    maxWidth: Dimensions.get('window').width - 32,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Toast manager for handling multiple toasts
interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  position?: 'top' | 'bottom';
}

export class ToastManager {
  private static instance: ToastManager;
  private toasts: ToastItem[] = [];
  private listeners: ((toasts: ToastItem[]) => void)[] = [];

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  addToast(toast: Omit<ToastItem, 'id'>): string {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    this.toasts = [...this.toasts, newToast];
    this.notifyListeners();
    return id;
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: ToastItem[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  // Convenience methods
  success(message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>): string {
    return this.addToast({ type: 'success', message, ...options });
  }

  error(message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>): string {
    return this.addToast({ type: 'error', message, ...options });
  }

  warning(message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>): string {
    return this.addToast({ type: 'warning', message, ...options });
  }

  info(message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>): string {
    return this.addToast({ type: 'info', message, ...options });
  }
}

export default Toast;
