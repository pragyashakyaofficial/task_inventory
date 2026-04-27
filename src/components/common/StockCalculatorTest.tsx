import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import {
  getStockStatus,
  getStockColor,
  getStockBackgroundColor,
  formatQuantity,
  formatCurrency,
  calculateStockPercentage,
  shouldRestock,
  calculateOptimalStock,
  calculateInventoryValue,
  getStockTrend,
  getDaysOfSupply,
  getStockoutRisk,
  generateStockAlert,
} from '../../features/common/utils/stockCalculator';
import { StatusBadge } from './index';

const StockCalculatorTest: React.FC = () => {
  const { theme } = useTheme();

  // Test data
  const testItems = [
    { name: 'Widget A', qty: 150, min: 20, max: 200, dailyUse: 5, cost: 10, price: 25 },
    { name: 'Gadget B', qty: 8, min: 15, max: 100, dailyUse: 3, cost: 5, price: 15 },
    { name: 'Tool C', qty: 0, min: 5, max: 50, dailyUse: 1, cost: 20, price: 45 },
    { name: 'Part D', qty: 250, min: 30, max: 300, dailyUse: 10, cost: 2, price: 8 },
  ];

  // Console tests
  useEffect(() => {
    console.log('=== STOCK CALCULATOR TESTS ===');
    
    // Test getStockStatus
    console.log('\n1. getStockStatus():');
    console.log('  Widget A (150/20):', getStockStatus(150, 20, 200));
    console.log('  Gadget B (8/15):', getStockStatus(8, 15, 100));
    console.log('  Tool C (0/5):', getStockStatus(0, 5, 50));
    console.log('  Part D (250/30):', getStockStatus(250, 30, 300));

    // Test getStockColor
    console.log('\n2. getStockColor():');
    console.log('  in-stock:', getStockColor('in-stock'));
    console.log('  low-stock:', getStockColor('low-stock'));
    console.log('  out-of-stock:', getStockColor('out-of-stock'));

    // Test formatQuantity
    console.log('\n3. formatQuantity():');
    console.log('  42:', formatQuantity(42));
    console.log('  1500:', formatQuantity(1500));
    console.log('  2500000:', formatQuantity(2500000));

    // Test calculateStockPercentage
    console.log('\n4. calculateStockPercentage():');
    console.log('  Widget A:', calculateStockPercentage(150, 20, 200) + '%');
    console.log('  Gadget B:', calculateStockPercentage(8, 15, 100) + '%');

    // Test shouldRestock
    console.log('\n5. shouldRestock():');
    console.log('  Widget A:', shouldRestock(150, 20, 7, 5));
    console.log('  Gadget B:', shouldRestock(8, 15, 7, 3));

    // Test calculateOptimalStock
    console.log('\n6. calculateOptimalStock():');
    const optimal = calculateOptimalStock(5, 7, 0.2);
    console.log('  dailyUse=5, leadTime=7:', optimal);

    // Test getDaysOfSupply
    console.log('\n7. getDaysOfSupply():');
    console.log('  Widget A:', getDaysOfSupply(150, 5), 'days');
    console.log('  Gadget B:', getDaysOfSupply(8, 3), 'days');

    // Test getStockoutRisk
    console.log('\n8. getStockoutRisk():');
    console.log('  Widget A:', getStockoutRisk(150, 5, 7));
    console.log('  Gadget B:', getStockoutRisk(8, 3, 7));
    console.log('  Tool C:', getStockoutRisk(0, 1, 7));

    // Test generateStockAlert
    console.log('\n9. generateStockAlert():');
    testItems.forEach(item => {
      const alert = generateStockAlert(item.qty, item.min, item.name, item.dailyUse, 7);
      console.log(`  ${item.name}:`, alert);
    });

    // Test calculateInventoryValue
    console.log('\n10. calculateInventoryValue():');
    const value = calculateInventoryValue(testItems.map(i => ({ quantity: i.qty, cost: i.cost })));
    console.log('  Total:', value);

    // Test getStockTrend
    console.log('\n11. getStockTrend():');
    console.log('  150 -> 120:', getStockTrend(150, 120));
    console.log('  100 -> 105:', getStockTrend(100, 105));
    console.log('  50 -> 50:', getStockTrend(50, 50));

    console.log('\n=== END TESTS ===');
  }, []);

  const runTests = () => {
    // Trigger useEffect again by toggling a state (optional)
    console.log('Tests logged to console. Check Flipper or React Native Debugger.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Stock Calculator Test
      </Text>
      
      <TouchableOpacity 
        style={[styles.consoleButton, { backgroundColor: theme.colors.primary }]}
        onPress={runTests}
      >
        <Text style={[styles.consoleButtonText, { color: theme.colors.white }]}>
          Check Console for Test Output
        </Text>
      </TouchableOpacity>

      {/* Visual Tests */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Visual Tests
      </Text>

      {testItems.map((item) => {
        const status = getStockStatus(item.qty, item.min, item.max);
        const color = getStockColor(status);
        const bgColor = getStockBackgroundColor(status);
        const percentage = calculateStockPercentage(item.qty, item.min, item.max);
        const restock = shouldRestock(item.qty, item.min, 7, item.dailyUse);
        const days = getDaysOfSupply(item.qty, item.dailyUse);
        const risk = getStockoutRisk(item.qty, item.dailyUse, 7);
        const alert = generateStockAlert(item.qty, item.min, item.name, item.dailyUse, 7);
        const trend = getStockTrend(item.qty, item.qty - 10);

        return (
          <View 
            key={item.name} 
            style={[
              styles.card, 
              { 
                backgroundColor: bgColor,
                borderColor: color,
                borderLeftWidth: 4,
                borderLeftColor: color,
              }
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.name, { color }]}>{item.name}</Text>
              <StatusBadge status={status} />
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Quantity:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {formatQuantity(item.qty)} / {formatQuantity(item.max)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Stock %:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {percentage.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Days of Supply:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {days} days
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Restock Needed:
              </Text>
              <Text style={[styles.value, { 
                color: restock ? theme.colors.error : theme.colors.success 
              }]}>
                {restock ? 'YES' : 'NO'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Risk Level:
              </Text>
              <Text style={[styles.value, { 
                color: risk === 'critical' ? theme.colors.error : 
                       risk === 'high' ? theme.colors.warning : theme.colors.success
              }]}>
                {risk.toUpperCase()}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Trend:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {trend === 'increasing' ? '↑' : trend === 'decreasing' ? '↓' : '→'} {trend}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Value:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {formatCurrency(item.qty * item.cost)}
              </Text>
            </View>

            {alert && (
              <View style={[
                styles.alertBox,
                { 
                  backgroundColor: alert.type === 'critical' 
                    ? theme.colors.error + '20' 
                    : alert.type === 'warning' 
                      ? theme.colors.warning + '20'
                      : theme.colors.info + '20'
                }
              ]}>
                <Text style={[
                  styles.alertTitle,
                  { 
                    color: alert.type === 'critical' 
                      ? theme.colors.error 
                      : alert.type === 'warning' 
                        ? theme.colors.warning
                        : theme.colors.info
                  }
                ]}>
                  {alert.type.toUpperCase()}
                </Text>
                <Text style={[styles.alertMessage, { color: theme.colors.text }]}>
                  {alert.message}
                </Text>
                <Text style={[styles.alertAction, { color: theme.colors.textSecondary }]}>
                  Action: {alert.action}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Summary */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Inventory Summary
      </Text>
      
      {(() => {
        const summary = calculateInventoryValue(
          testItems.map(i => ({ quantity: i.qty, cost: i.cost }))
        );
        return (
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Total Items:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {formatQuantity(summary.itemCount)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Total Value:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {formatCurrency(summary.totalCost)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Avg Cost/Item:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {formatCurrency(summary.itemCount > 0 ? summary.totalCost / summary.itemCount : 0)}
              </Text>
            </View>
          </View>
        );
      })()}

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  consoleButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  consoleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    marginBottom: 4,
  },
  alertAction: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  spacer: {
    height: 40,
  },
});

export default StockCalculatorTest;
