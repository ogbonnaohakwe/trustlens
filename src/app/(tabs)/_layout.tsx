import React from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '../../constants/theme';
import { useTrustLens } from '../../context/TrustLensContext';

function FloatingTabBar({ state, navigation }: { state: any; descriptors?: any; navigation: any }) {
  const { isDarkMode } = useTrustLens();
  const { width } = useWindowDimensions();

  // Responsive max width for tablets & web
  const dockWidth = Math.min(width - 32, 420);

  const tabsConfig = [
    { name: 'index', label: 'Home', icon: 'layers' as const, outlineIcon: 'layers-outline' as const },
    { name: 'history', label: 'Recent Scans', icon: 'time' as const, outlineIcon: 'time-outline' as const },
    { name: 'profile', label: 'Profile', icon: 'person' as const, outlineIcon: 'person-outline' as const },
  ];

  const currentDockBg = isDarkMode ? BrandColors.dark.dockBg : BrandColors.light.dockBg;
  const currentDockBorder = isDarkMode ? BrandColors.dark.surfaceBorder : BrandColors.light.surfaceBorder;
  const activeTabBg = isDarkMode ? '#1E293B' : '#111418';
  const activeTabColor = isDarkMode ? '#10B981' : '#FFFFFF';
  const inactiveTabColor = isDarkMode ? '#64748B' : '#94A3B8';
  const fabBg = isDarkMode ? '#10B981' : '#111418';
  const fabIconColor = isDarkMode ? '#0A0E14' : '#FFFFFF';
  const fabBorder = isDarkMode ? '#34D399' : '#111418';

  return (
    <View style={styles.dockOuterContainer} pointerEvents="box-none">
      <View
        style={[
          styles.dockContainer,
          {
            width: dockWidth,
            backgroundColor: currentDockBg,
            borderColor: currentDockBorder,
          },
        ]}
      >
        {/* Left Side: Navigation Pill Items */}
        <View style={styles.navGroup}>
          {tabsConfig.map((item) => {
            const routeIndex = state.routes.findIndex((r: any) => r.name === item.name);
            const isFocused = state.index === routeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[routeIndex]?.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(item.name);
              }
            };

            return (
              <TouchableOpacity
                key={item.name}
                onPress={onPress}
                activeOpacity={0.7}
                style={[
                  styles.tabItem,
                  isFocused && [
                    styles.tabItemActive,
                    { backgroundColor: activeTabBg },
                  ],
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={item.label}
              >
                <Ionicons
                  name={isFocused ? item.icon : item.outlineIcon}
                  size={20}
                  color={isFocused ? activeTabColor : inactiveTabColor}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Side: Scan Floating Action Button (+) */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('scan')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Scan Product"
        >
          <View style={[styles.fabInner, { backgroundColor: fabBg, borderColor: fabBorder }]}>
            <Ionicons name="add" size={24} color={fabIconColor} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dockOuterContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 38,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fabButton: {
    marginLeft: 8,
  },
  fabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
