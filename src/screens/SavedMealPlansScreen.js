import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, GOALS } from '../constants';

export default function SavedMealPlansScreen({ navigation }) {
    const { user } = useAuth();
    const mealPlans = useQuery(api.mealPlans.getMealPlans, user ? { userId: user.userId } : "skip");
    const activeMealPlanId = useQuery(api.userSettings.getActiveMealPlanId, user ? { userId: user.userId } : "skip");
    
    const setActiveMealPlan = useMutation(api.userSettings.setActiveMealPlan);
    const updateTodayTracking = useMutation(api.dailyTracking.updateTodayTracking);

    const handleSetActive = async (planId) => {
        if (!user || !mealPlans) return;

        // Set active meal plan
        await setActiveMealPlan({ 
            userId: user.userId, 
            mealPlanId: planId 
        });

        // Update today's tracking with meals from new active plan
        const selectedPlan = mealPlans.find(p => p._id === planId);
        if (selectedPlan && selectedPlan.plan && selectedPlan.plan.days) {
            // Get today's meals from the selected plan
            const dayPlan = selectedPlan.plan.days[0]; // Use day 1 for simplicity
            if (dayPlan && dayPlan.meals) {
                const meals = dayPlan.meals.map(meal => ({
                    mealType: meal.type,
                    foodName: meal.foods ? meal.foods.map(f => f.name).join(', ') : '',
                    calories: meal.totalCalories || 0,
                    protein: meal.foods ? meal.foods.reduce((sum, f) => sum + (f.protein || 0), 0) : 0,
                    carbs: meal.foods ? meal.foods.reduce((sum, f) => sum + (f.carbs || 0), 0) : 0,
                    fat: meal.foods ? meal.foods.reduce((sum, f) => sum + (f.fat || 0), 0) : 0,
                }));

                await updateTodayTracking({ userId: user.userId, meals });
            }
        }
    };

    if (mealPlans === undefined) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={48} color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    if (mealPlans.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>Chưa có kế hoạch nào</Text>
                <Text style={styles.emptyText}>
                    Tạo kế hoạch ăn uống đầu tiên của bạn!
                </Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('MealPlanGenerator')}
                >
                    <Text style={styles.createButtonText}>Tạo kế hoạch mới</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>
                {mealPlans.length} kế hoạch đã lưu
            </Text>

            {mealPlans.map((plan) => {
                const goal = GOALS[plan.goal];
                const createdDate = new Date(plan.createdAt).toLocaleDateString('vi-VN');
                const isActive = activeMealPlanId === plan._id;

                return (
                    <View key={plan._id} style={styles.planCard}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('MealPlanDetail', { planId: plan._id })}
                        >
                            <View style={styles.planHeader}>
                                <Text style={styles.planIcon}>{goal.icon}</Text>
                                <View style={styles.planInfo}>
                                    <Text style={styles.planTitle}>{plan.title}</Text>
                                    <Text style={styles.planDate}>Tạo ngày: {createdDate}</Text>
                                </View>
                                {isActive && (
                                    <View style={styles.activeBadge}>
                                        <Text style={styles.activeBadgeText}>🎯 Đang sử dụng</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.planStats}>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Mục tiêu</Text>
                                    <Text style={styles.statValue}>{goal.label}</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Calories</Text>
                                    <Text style={styles.statValue}>{plan.targetCalories} kcal</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Số ngày</Text>
                                    <Text style={styles.statValue}>{plan.plan?.days?.length || 7}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {!isActive && (
                            <TouchableOpacity
                                style={styles.activateButton}
                                onPress={() => handleSetActive(plan._id)}
                            >
                                <Text style={styles.activateButtonText}>✓ Sử dụng kế hoạch này</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: SIZES.margin,
        fontSize: SIZES.body,
        color: COLORS.textLight,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding * 2,
        backgroundColor: COLORS.background,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: SIZES.margin,
    },
    emptyTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.margin / 2,
    },
    emptyText: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: SIZES.margin * 2,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.padding * 2,
        borderRadius: SIZES.borderRadius,
    },
    createButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
    header: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        padding: SIZES.padding,
    },
    planCard: {
        backgroundColor: COLORS.white,
        margin: SIZES.margin,
        marginTop: 0,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.margin,
    },
    planIcon: {
        fontSize: 40,
        marginRight: SIZES.margin,
    },
    planInfo: {
        flex: 1,
    },
    planTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    planDate: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    favoriteIcon: {
        fontSize: 24,
    },
    planStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: SIZES.padding,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    statValue: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.primary,
    },
    activeBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: SIZES.borderRadius,
    },
    activeBadgeText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.white,
    },
    activateButton: {
        marginTop: SIZES.margin,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
    },
    activateButtonText: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.white,
    },
});
