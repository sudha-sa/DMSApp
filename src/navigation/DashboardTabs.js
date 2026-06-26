/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UploadScreen from '../screens/UploadScreen';
import SearchScreen from '../screens/SearchScreen';
import { Button, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Tab = createBottomTabNavigator();

export default function DashboardTabs() {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerStyle: { backgroundColor: '#007AFF', },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerRight: () => (
                    <Button
                        onPress={handleLogout}
                        title="Logout"
                        color="#ad1212"
                    />
                ),
                tabBarIcon: ({ color, size }) => {
                    let iconSymbol = '';
                    if (route.name === 'UploadDoc') {
                        iconSymbol = '📤';
                    } else if (route.name === 'SearchDoc') {
                        iconSymbol = '🔍';
                    }
                    return <Text style={{ fontSize: size, color: color }}>{iconSymbol}</Text>;
                },
            })}
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