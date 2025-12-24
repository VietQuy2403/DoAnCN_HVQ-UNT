import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import UserSetupScreen from '../screens/UserSetupScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import MealPlanGeneratorScreen from '../screens/MealPlanGeneratorScreen';
import SavedMealPlansScreen from '../screens/SavedMealPlansScreen';
import MealPlanDetailScreen from '../screens/MealPlanDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProgressTrackingScreen from '../screens/ProgressTrackingScreen';
import WeightLogScreen from '../screens/WeightLogScreen';
import FoodDatabaseScreen from '../screens/FoodDatabaseScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

import { COLORS } from '../constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app screens
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Lịch ăn',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressTrackingScreen}
        options={{
          tabBarLabel: 'Tiến độ',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="FoodDatabaseTab"
        component={FoodDatabaseScreen}
        options={{
          tabBarLabel: 'Món ăn',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🍽️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>👤</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ChatbotTab"
        component={ChatbotScreen}
        options={{
          tabBarLabel: 'Chatbot',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🤖</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Check if user has completed profile setup
  const profile = useQuery(
    api.userProfiles.getProfile,
    user ? { userId: user.userId } : "skip"
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!user ? (
          // Chưa đăng nhập - hiển thị auth screens
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : !profile ? (
          // Đã đăng nhập nhưng chưa setup profile
          <>
            <Stack.Screen name="UserSetup" component={UserSetupScreen} />
          </>
        ) : (
          // Đã đăng nhập và có profile - hiển thị main app
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="MealPlanGenerator"
              component={MealPlanGeneratorScreen}
              options={{
                headerShown: true,
                headerTitle: 'Tạo kế hoạch mới',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <Stack.Screen
              name="SavedMealPlans"
              component={SavedMealPlansScreen}
              options={{
                headerShown: true,
                headerTitle: 'Kế hoạch đã lưu',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <Stack.Screen
              name="MealPlanDetail"
              component={MealPlanDetailScreen}
              options={{
                headerShown: true,
                headerTitle: 'Chi tiết kế hoạch',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <Stack.Screen
              name="WeightLog"
              component={WeightLogScreen}
              options={{
                headerShown: true,
                headerTitle: 'Nhập cân nặng',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


