import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, GOALS } from '../constants';

export default function SavedMealPlansScreen({ navigation }) {
    const { user } = useAuth();
    const mealPlans = useQuery(api.mealPlans.getMealPlans, user ? { userId: user.userId } : "skip");

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

                return (
                    <TouchableOpacity
                        key={plan._id}
                        style={styles.planCard}
                        onPress={() => navigation.navigate('MealPlanDetail', { planId: plan._id })}
                    >
                        <View style={styles.planHeader}>
                            <Text style={styles.planIcon}>{goal.icon}</Text>
                            <View style={styles.planInfo}>
                                <Text style={styles.planTitle}>{plan.title}</Text>
                                <Text style={styles.planDate}>Tạo ngày: {createdDate}</Text>
                            </View>
                            {plan.isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
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
});
