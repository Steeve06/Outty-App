import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './App/screens/LoginScreen';
import SignupScreen from './App/screens/SignupScreen';
import DiscoverScreen from './App/screens/DiscoverScreen';
import MatchesScreen from './App/screens/MatchesScreen';
import ProfileScreen from './App/screens/ProfileScreen';
import MessagingScreen from './App/screens/MessagingScreen';

import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

const GREEN = '#2D9B6F';

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={function({ route }) {
                return {
                    headerShown: false,
                    tabBarActiveTintColor: GREEN,
                    tabBarInactiveTintColor: '#888',
                    tabBarIcon: function({ color, size }) {
                        let iconName: keyof typeof Ionicons.glyphMap = 'compass-outline';
                        if (route.name === 'Discover')     iconName = 'compass-outline';
                        else if (route.name === 'Matches') iconName = 'chatbubbles-outline';
                        else if (route.name === 'Profile') iconName = 'person-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                };
            }}
        >
            <Tab.Screen name="Discover" component={DiscoverScreen} />
            <Tab.Screen name="Matches"  component={MatchesScreen} />
            <Tab.Screen name="Profile"  component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
                    <Stack.Screen name="Login"            component={LoginScreen} />
                    <Stack.Screen name="Signup"           component={SignupScreen} />
                    <Stack.Screen name="MainTabs"         component={TabNavigator} />
                    <Stack.Screen name="MessagingScreen"  component={MessagingScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}