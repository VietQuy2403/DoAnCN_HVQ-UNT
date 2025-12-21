import AsyncStorage from '@react-native-async-storage/async-storage';
import { Md5 } from 'ts-md5';

const SESSION_KEY = '@diet_app_session';

// Simple password hashing (MD5 - only for demo, not production!)
export const hashPassword = (password) => {
    return Md5.hashStr(password);
};

// Save session to AsyncStorage
export const saveSession = async (userId) => {
    try {
        await AsyncStorage.setItem(SESSION_KEY, userId);
    } catch (error) {
        console.error('Error saving session:', error);
    }
};

// Get session from AsyncStorage
export const getSession = async () => {
    try {
        const userId = await AsyncStorage.getItem(SESSION_KEY);
        return userId;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
};

// Clear session
export const clearSession = async () => {
    try {
        await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error('Error clearing session:', error);
    }
};
