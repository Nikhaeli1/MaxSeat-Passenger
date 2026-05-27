import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen      from '../screens/HomeScreen';
import MapScreen       from '../screens/MapScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import ProfileScreen   from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor:   '#2563eb',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
      }}
    >
      <Tab.Screen
        name="PUVs"
        component={HomeScreen}
        options={{
          tabBarLabel: 'PUVs',
          tabBarIcon: ({ focused }) => <TabIcon icon="🚌" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          tabBarLabel: 'Live Map',
          tabBarIcon: ({ focused }) => <TabIcon icon="🗺" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={MyReportsScreen}
        options={{
          tabBarLabel: 'My Reports',
          tabBarIcon: ({ focused }) => <TabIcon icon="📢" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}