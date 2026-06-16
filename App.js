import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store } from './src/store/store';

import LoginScreen from './src/screens/LoginScreen';
import DashboardTabs from './src/navigation/DashboardTabs';

const Stack = createNativeStackNavigator();

function RootNavigator() {
    const { isLoggedIn } = useSelector((state) => state.auth);


    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isLoggedIn ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <Stack.Screen name="Dashboard" component={DashboardTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );

}

export default function App() {
    return (
        <Provider store={store}>
            <RootNavigator />
        </Provider>
    );
}

