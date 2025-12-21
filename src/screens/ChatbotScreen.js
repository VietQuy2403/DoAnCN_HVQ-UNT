import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, API_URL } from '../constants';

export default function ChatbotScreen() {
    const { user } = useAuth();
    const profile = useQuery(api.userProfiles.getProfile, user ? { userId: user.userId } : "skip");
    const chatHistory = useQuery(api.chatHistory.getChatHistory, user ? { userId: user.userId } : "skip");
    const saveChat = useMutation(api.chatHistory.saveChat);
    const clearHistory = useMutation(api.chatHistory.clearHistory);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef();

    const calculateTDEE = () => {
        if (!profile?.weight || !profile?.height || !profile?.age) return null;
        const bmr = profile.gender === 'male'
            ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        return Math.round(bmr * (multipliers[profile.activityLevel] || 1.55));
    };

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    userContext: {
                        weight: profile?.weight,
                        height: profile?.height,
                        targetWeight: profile?.targetWeight,
                        goal: profile?.goal,
                        tdee: calculateTDEE()
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                await saveChat({
                    userId: user.userId,
                    message: userMessage,
                    response: data.response
                });
            } else {
                Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = () => {
        Alert.alert(
            'Xóa lịch sử',
            'Bạn có chắc muốn xóa toàn bộ lịch sử chat?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => clearHistory({ userId: user.userId }) }
            ]
        );
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [chatHistory]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>🤖 Trợ Lý AI</Text>
                    <Text style={styles.headerSubtitle}>Hỏi tôi về dinh dưỡng!</Text>
                </View>
                {chatHistory?.length > 0 && (
                    <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>🗑️</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
            >
                {!chatHistory || chatHistory.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyText}>Chào bạn! Tôi là trợ lý dinh dưỡng AI.</Text>
                        <Text style={styles.emptyHint}>Hãy hỏi tôi bất cứ điều gì về:</Text>
                        <Text style={styles.emptyHint}>• Món ăn và calories</Text>
                        <Text style={styles.emptyHint}>• Kế hoạch ăn uống</Text>
                        <Text style={styles.emptyHint}>• Lời khuyên dinh dưỡng</Text>
                    </View>
                ) : (
                    chatHistory.map((chat, index) => (
                        <View key={index}>
                            <View style={styles.userBubble}>
                                <Text style={styles.userText}>{chat.message}</Text>
                            </View>
                            <View style={styles.botBubble}>
                                <Text style={styles.botText}>{chat.response}</Text>
                            </View>
                        </View>
                    ))
                )}

                {loading && (
                    <View style={styles.botBubble}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Đang suy nghĩ...</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Nhập câu hỏi..."
                    placeholderTextColor={COLORS.textLight}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!message.trim() || loading) && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!message.trim() || loading}
                >
                    <Text style={styles.sendIcon}>📤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: SIZES.padding,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.white,
        opacity: 0.9,
        marginTop: 4,
    },
    clearButton: {
        padding: 8,
    },
    clearButtonText: {
        fontSize: 24,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: SIZES.padding,
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
    },
    emptyHint: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 16,
        borderBottomRightRadius: 4,
        marginBottom: 8,
        maxWidth: '80%',
    },
    userText: {
        color: COLORS.white,
        fontSize: SIZES.body,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        marginBottom: 16,
        maxWidth: '80%',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    botText: {
        color: COLORS.text,
        fontSize: SIZES.body,
        lineHeight: 22,
    },
    loadingText: {
        color: COLORS.textLight,
        fontSize: SIZES.small,
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: SIZES.body,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendIcon: {
        fontSize: 20,
    },
});
