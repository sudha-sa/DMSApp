import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UploadScreen from '../screens/UploadScreen';
import SearchScreen from '../screens/SearchScreen';
import { Button } from 'react-native';
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
            screenOptions={{
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