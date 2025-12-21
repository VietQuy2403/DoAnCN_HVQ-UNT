import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';

export default function WeightLogScreen({ navigation }) {
    const { user } = useAuth();
    const [weight, setWeight] = useState('');
    const [note, setNote] = useState('');

    const weightHistory = useQuery(
        api.weightTracking.getWeightHistory,
        user ? { userId: user.userId } : "skip"
    );
    const logWeight = useMutation(api.weightTracking.logWeight);

    // Debug: Log weight history
    console.log('Weight history:', weightHistory);

    const handleLogWeight = async () => {
        if (!weight || isNaN(parseFloat(weight))) {
            Alert.alert('Lỗi', 'Vui lòng nhập cân nặng hợp lệ');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            console.log('Saving weight:', {
                userId: user.userId,
                weight: parseFloat(weight),
                date: today,
                note: note || undefined,
            });

            const result = await logWeight({
                userId: user.userId,
                weight: parseFloat(weight),
                date: today,
                note: note || undefined,
            });

            console.log('Weight saved successfully:', result);
            Alert.alert('Thành công', 'Đã lưu cân nặng!');
            setWeight('');
            setNote('');
        } catch (error) {
            console.error('Error saving weight:', error);
            Alert.alert('Lỗi', `Không thể lưu cân nặng: ${error.message}`);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, '#003d52']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Nhập cân nặng</Text>
                <Text style={styles.headerSubtitle}>Theo dõi cân nặng hàng ngày</Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Input Form */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Cân nặng hôm nay</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Cân nặng (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="decimal-pad"
                            placeholder="Ví dụ: 75.5"
                            placeholderTextColor={COLORS.textLight}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Ghi chú về cân nặng hôm nay..."
                            placeholderTextColor={COLORS.textLight}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleLogWeight}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#003d52']}
                            style={styles.saveButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.saveButtonText}>💾 Lưu cân nặng</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Weight History */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Lịch sử cân nặng</Text>

                    {weightHistory && weightHistory.length > 0 ? (
                        weightHistory.map((entry, index) => (
                            <View key={entry._id} style={styles.historyItem}>
                                <View style={styles.historyLeft}>
                                    <Text style={styles.historyDate}>
                                        {formatDate(entry.date)}
                                    </Text>
                                    {entry.note && (
                                        <Text style={styles.historyNote}>{entry.note}</Text>
                                    )}
                                </View>
                                <View style={styles.historyRight}>
                                    <Text style={styles.historyWeight}>
                                        {entry.weight.toFixed(1)} kg
                                    </Text>
                                    {index > 0 && weightHistory[index - 1] && (
                                        <Text
                                            style={[
                                                styles.historyChange,
                                                entry.weight < weightHistory[index - 1].weight
                                                    ? styles.historyChangeDown
                                                    : styles.historyChangeUp,
                                            ]}
                                        >
                                            {entry.weight < weightHistory[index - 1].weight ? '↓' : '↑'}
                                            {Math.abs(
                                                entry.weight - weightHistory[index - 1].weight
                                            ).toFixed(1)}{' '}
                                            kg
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📊</Text>
                            <Text style={styles.emptyText}>
                                Chưa có dữ liệu cân nặng
                            </Text>
                            <Text style={styles.emptySubtext}>
                                Nhập cân nặng hôm nay để bắt đầu theo dõi!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SIZES.padding * 2,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: SIZES.body,
        color: COLORS.white,
        opacity: 0.9,
    },
    content: {
        flex: 1,
        padding: SIZES.padding,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius * 2,
        padding: SIZES.padding * 2,
        marginBottom: SIZES.margin,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.margin,
    },
    inputContainer: {
        marginBottom: SIZES.margin,
    },
    label: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        fontSize: SIZES.body,
        fontWeight: 'normal',
    },
    saveButton: {
        borderRadius: SIZES.borderRadius,
        overflow: 'hidden',
        marginTop: SIZES.margin,
    },
    saveButtonGradient: {
        padding: SIZES.padding,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    historyLeft: {
        flex: 1,
    },
    historyDate: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    historyNote: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    historyRight: {
        alignItems: 'flex-end',
    },
    historyWeight: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    historyChange: {
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    historyChangeDown: {
        color: COLORS.success,
    },
    historyChangeUp: {
        color: COLORS.error,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: SIZES.h4,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});
