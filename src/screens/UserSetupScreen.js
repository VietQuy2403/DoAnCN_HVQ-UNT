import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { COLORS, SIZES, GOALS } from '../constants';

export default function UserSetupScreen({ navigation }) {
    const { user } = useAuth();
    const upsertProfile = useMutation(api.userProfiles.upsertProfile);

    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [targetWeight, setTargetWeight] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!age || !gender || !weight || !height) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (!user || !user.userId) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập trước');
            return;
        }

        setLoading(true);
        try {
            await upsertProfile({
                userId: user.userId,
                name: user.name || 'User',
                age: parseInt(age),
                gender,
                weight: parseFloat(weight),
                height: parseFloat(height),
                targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
            });

            // Profile đã được tạo, AppNavigator sẽ tự động chuyển đến Main app
            Alert.alert(
                'Thiết lập thành công!',
                'Chào mừng bạn đến với ứng dụng dinh dưỡng!'
            );
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Lỗi', error.message || 'Không thể lưu thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>🥗</Text>
                    <Text style={styles.headerTitle}>Tell Us About Yourself</Text>
                    <Text style={styles.headerSubtitle}>
                        This helps us create your personalized meal plan.
                    </Text>
                </View>

                <View style={styles.content}>
                    {/* Weight and Height */}
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 70"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                placeholderTextColor={COLORS.textLight}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 175"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="decimal-pad"
                                placeholderTextColor={COLORS.textLight}
                            />
                        </View>
                    </View>

                    {/* Age and Target Weight */}
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 25"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                placeholderTextColor={COLORS.textLight}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Target Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Optional"
                                value={targetWeight}
                                onChangeText={setTargetWeight}
                                keyboardType="decimal-pad"
                                placeholderTextColor={COLORS.textLight}
                            />
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gender</Text>
                        <View style={styles.genderContainer}>
                            {[
                                { value: 'male', icon: '♂️', label: 'Male' },
                                { value: 'female', icon: '♀️', label: 'Female' },
                                { value: 'other', icon: '⚪', label: 'Other' }
                            ].map((g) => (
                                <TouchableOpacity
                                    key={g.value}
                                    style={[
                                        styles.genderButton,
                                        gender === g.value && styles.genderButtonActive,
                                    ]}
                                    onPress={() => setGender(g.value)}
                                >
                                    <Text style={styles.genderIcon}>{g.icon}</Text>
                                    <Text
                                        style={[
                                            styles.genderText,
                                            gender === g.value && styles.genderTextActive,
                                        ]}
                                    >
                                        {g.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>



                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.submitText}>Continue →</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SIZES.padding * 2,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 60,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: SIZES.body,
        color: COLORS.white,
        opacity: 0.9,
        textAlign: 'center',
    },
    content: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius * 2,
        padding: SIZES.padding * 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.margin,
    },
    halfInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        fontSize: SIZES.body,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    section: {
        marginTop: SIZES.margin,
        marginBottom: SIZES.margin,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderButton: {
        flex: 1,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginHorizontal: 5,
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    genderButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    genderIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    genderText: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    genderTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginBottom: SIZES.margin,
        backgroundColor: COLORS.white,
    },
    goalCardActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    goalIcon: {
        fontSize: 32,
        marginRight: SIZES.margin,
    },
    goalInfo: {
        flex: 1,
    },
    goalLabel: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding * 1.2,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        marginTop: SIZES.margin * 2,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
});
