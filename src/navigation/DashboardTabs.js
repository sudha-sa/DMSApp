import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UploadScreen from '../screens/UploadScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

export default function DashboardTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerStyle: { backgroundColor: '#007AFF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Tab.Screen
                name="UploadDoc"
                component={UploadScreen}
                options={{ title: 'Upload Document' }}
            />
            <Tab.Screen
                name="SearchDoc"
                component={SearchScreen}
                options={{ title: 'Search Archive' }}
            />
        </Tab.Navigator>
    );
}