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
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { generateMealPlan } from '../services/api';
import { COLORS, SIZES, GOALS, DIETARY_RESTRICTIONS } from '../constants';

export default function MealPlanGeneratorScreen({ navigation }) {
    const { user } = useAuth();
    const saveMealPlan = useMutation(api.mealPlans.saveMealPlan);

    const [selectedGoal, setSelectedGoal] = useState('weight_loss');
    const [selectedBudget, setSelectedBudget] = useState('medium');
    const [selectedDays, setSelectedDays] = useState(7);
    const [userNotes, setUserNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);

    // Auto-calculate calories based on goal
    const getCaloriesForGoal = (goal) => {
        const caloriesMap = {
            weight_loss: 1500,
            muscle_gain: 2500,
            maintenance: 2000
        };
        return caloriesMap[goal] || 2000;
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateMealPlan({
                goal: selectedGoal,
                budget: selectedBudget,
                userNotes: userNotes.trim(),
                days: selectedDays,
            });

            setGeneratedPlan(result.mealPlan);
            Alert.alert('Thành công!', 'Kế hoạch ăn uống đã được tạo');
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể tạo kế hoạch. Vui lòng kiểm tra backend server.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedPlan) return;

        try {
            const goalLabel = GOALS[selectedGoal].label;
            const calories = getCaloriesForGoal(selectedGoal);
            const budgetLabels = {
                low: 'Tiết kiệm',
                medium: 'Trung bình',
                high: 'Cao cấp'
            };
            const title = `${goalLabel} - ${budgetLabels[selectedBudget]}`;

            await saveMealPlan({
                userId: user.userId,
                title,
                goal: selectedGoal,
                targetCalories: calories,
                plan: generatedPlan,
            });

            Alert.alert(
                'Đã lưu!',
                'Kế hoạch đã được lưu vào danh sách của bạn',
                [
                    { text: 'Xem kế hoạch đã lưu', onPress: () => navigation.navigate('SavedMealPlans') },
                    { text: 'OK' }
                ]
            );
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu kế hoạch');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mục tiêu của bạn</Text>
                <View style={styles.goalsContainer}>
                    {Object.values(GOALS).map((goal) => (
                        <TouchableOpacity
                            key={goal.value}
                            style={[
                                styles.goalButton,
                                selectedGoal === goal.value ? {
                                    backgroundColor: goal.color,
                                    borderColor: goal.color
                                } : null,
                            ]}
                            onPress={() => setSelectedGoal(goal.value)}
                        >
                            <Text style={styles.goalIcon}>{goal.icon}</Text>
                            <Text
                                style={[
                                    styles.goalText,
                                    selectedGoal === goal.value ? styles.goalTextSelected : null,
                                ]}
                            >
                                {goal.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Số ngày</Text>
                <View style={styles.daysContainer}>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayButton,
                                selectedDays === day && styles.dayButtonSelected,
                            ]}
                            onPress={() => setSelectedDays(day)}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    selectedDays === day && styles.dayTextSelected,
                                ]}
                            >
                                {day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.hint}>Chọn số ngày bạn muốn lập kế hoạch</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ngân sách mỗi ngày</Text>
                <Text style={styles.hint}>Calories sẽ tự động tính: {getCaloriesForGoal(selectedGoal)} kcal/ngày</Text>
                <View style={styles.budgetContainer}>
                    <TouchableOpacity
                        style={[
                            styles.budgetButton,
                            selectedBudget === 'low' && styles.budgetButtonSelected
                        ]}
                        onPress={() => setSelectedBudget('low')}
                    >
                        <Text style={styles.budgetIcon}>💰</Text>
                        <Text style={[
                            styles.budgetLabel,
                            selectedBudget === 'low' && styles.budgetLabelSelected
                        ]}>Tiết kiệm</Text>
                        <Text style={[
                            styles.budgetPrice,
                            selectedBudget === 'low' && styles.budgetPriceSelected
                        ]}>{'<'}100k/ngày</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.budgetButton,
                            selectedBudget === 'medium' && styles.budgetButtonSelected
                        ]}
                        onPress={() => setSelectedBudget('medium')}
                    >
                        <Text style={styles.budgetIcon}>💵</Text>
                        <Text style={[
                            styles.budgetLabel,
                            selectedBudget === 'medium' && styles.budgetLabelSelected
                        ]}>Trung bình</Text>
                        <Text style={[
                            styles.budgetPrice,
                            selectedBudget === 'medium' && styles.budgetPriceSelected
                        ]}>100-200k/ngày</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.budgetButton,
                            selectedBudget === 'high' && styles.budgetButtonSelected
                        ]}
                        onPress={() => setSelectedBudget('high')}
                    >
                        <Text style={styles.budgetIcon}>💎</Text>
                        <Text style={[
                            styles.budgetLabel,
                            selectedBudget === 'high' && styles.budgetLabelSelected
                        ]}>Cao cấp</Text>
                        <Text style={[
                            styles.budgetPrice,
                            selectedBudget === 'high' && styles.budgetPriceSelected
                        ]}>{'>'}200k/ngày</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ghi chú (tùy chọn)</Text>
                <TextInput
                    style={styles.notesInput}
                    value={userNotes}
                    onChangeText={setUserNotes}
                    placeholder="VD: Không ăn hải sản, ăn chay, dị ứng đậu phộng..."
                    placeholderTextColor={COLORS.textLight}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
                <Text style={styles.hint}>Nhập các món bạn muốn tránh hoặc sở thích ăn uống</Text>
            </View>

            <TouchableOpacity
                style={[styles.generateButton, loading ? styles.buttonDisabled : null]}
                onPress={handleGenerate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <Text style={styles.generateButtonText}>✨ Tạo kế hoạch với AI</Text>
                )}
            </TouchableOpacity>

            {generatedPlan && (
                <View style={styles.resultSection}>
                    <Text style={styles.resultTitle}>Kế hoạch của bạn đã sẵn sàng! 🎉</Text>
                    <Text style={styles.resultSubtitle}>
                        {selectedDays} ngày • {getCaloriesForGoal(selectedGoal)} kcal/ngày
                    </Text>

                    <View style={styles.previewContainer}>
                        <Text style={styles.previewTitle}>Xem trước ngày 1:</Text>
                        {generatedPlan.days?.[0]?.meals?.map((meal, index) => (
                            <View key={index} style={styles.mealPreview}>
                                <Text style={styles.mealType}>{meal.type}</Text>
                                <Text style={styles.mealCalories}>{meal.totalCalories} kcal</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>💾 Lưu kế hoạch</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    section: {
        padding: SIZES.padding,
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.margin,
    },
    goalsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    goalButton: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
        margin: SIZES.margin / 2,
    },
    goalIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    goalText: {
        fontSize: SIZES.body,
        color: COLORS.text,
        fontWeight: '600',
    },
    goalTextSelected: {
        color: COLORS.white,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        fontSize: SIZES.h4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    hint: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginTop: 8,
    },
    restrictionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    restrictionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        margin: 4,
    },
    restrictionChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    restrictionIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    restrictionText: {
        fontSize: SIZES.small,
        color: COLORS.text,
    },
    restrictionTextSelected: {
        color: COLORS.white,
    },
    generateButton: {
        margin: SIZES.margin,
        backgroundColor: COLORS.primary,
        padding: SIZES.padding * 1.2,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    generateButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
    resultSection: {
        margin: SIZES.margin,
        padding: SIZES.padding * 1.5,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        borderWidth: 2,
        borderColor: COLORS.success,
    },
    resultTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    resultSubtitle: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: SIZES.margin,
    },
    previewContainer: {
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        marginBottom: SIZES.margin,
    },
    previewTitle: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.margin / 2,
    },
    mealPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    mealType: {
        fontSize: SIZES.body,
        color: COLORS.text,
    },
    mealCalories: {
        fontSize: SIZES.body,
        color: COLORS.primary,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: COLORS.success,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
    budgetContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    budgetButton: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    budgetButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    budgetIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    budgetLabel: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    budgetLabelSelected: {
        color: COLORS.white,
    },
    budgetPrice: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    budgetPriceSelected: {
        color: COLORS.white,
        opacity: 0.9,
    },
    notesInput: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        fontSize: SIZES.body,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 100,
    },
    daysContainer: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-between',
    },
    dayButton: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    dayButtonSelected: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    dayText: {
        fontSize: SIZES.h4,
        fontWeight: '600',
        color: COLORS.text,
    },
    dayTextSelected: {
        color: COLORS.white,
    },
});
