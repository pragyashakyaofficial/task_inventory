import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/constants';

export type StatusType = 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  customColor?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'medium',
  style,
  customColor,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'in-stock':
        return {
          backgroundColor: customColor || colors.success + '20',
          borderColor: customColor || colors.success,
          textColor: customColor ? colors.white : colors.successDark,
          dotColor: customColor || colors.success,
          defaultText: 'In Stock',
        };
      case 'low-stock':
        return {
          backgroundColor: customColor || colors.warning + '20',
          borderColor: customColor || colors.warning,
          textColor: customColor ? colors.white : colors.warningDark,
          dotColor: customColor || colors.warning,
          defaultText: 'Low Stock',
        };
      case 'out-of-stock':
        return {
          backgroundColor: customColor || colors.error + '20',
          borderColor: customColor || colors.error,
          textColor: customColor ? colors.white : colors.errorDark,
          dotColor: customColor || colors.error,
          defaultText: 'Out of Stock',
        };
      case 'discontinued':
        return {
          backgroundColor: customColor || colors.backgroundSecondary,
          borderColor: customColor || colors.gray,
          textColor: customColor ? colors.white : colors.textSecondary,
          dotColor: customColor || colors.gray,
          defaultText: 'Discontinued',
        };
      case 'pending':
        return {
          backgroundColor: customColor || colors.info + '20',
          borderColor: customColor || colors.info,
          textColor: customColor ? colors.white : colors.primaryDark,
          dotColor: customColor || colors.info,
          defaultText: 'Pending',
        };
      default:
        return {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.gray,
          textColor: colors.textSecondary,
          dotColor: colors.gray,
          defaultText: 'Unknown',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 10,
          dotSize: 6,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          fontSize: 16,
          dotSize: 10,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          fontSize: 12,
          dotSize: 8,
        };
    }
  };

  const config = getStatusConfig();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: sizeStyles.borderRadius,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.dotContainer}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: config.dotColor,
                width: sizeStyles.dotSize,
                height: sizeStyles.dotSize,
                borderRadius: sizeStyles.dotSize / 2,
              },
            ]}
          />
        </View>
        
        <Text
          style={[
            styles.text,
            {
              color: config.textColor,
              fontSize: sizeStyles.fontSize,
              marginLeft: sizeStyles.dotSize / 2 + 4,
            },
          ]}
        >
          {text || config.defaultText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    // Styles set dynamically
  },
  text: {
    fontWeight: '500',
  },
});

export default StatusBadge;
