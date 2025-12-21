import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, GOALS } from '../constants';

export default function MealPlanDetailScreen({ route, navigation }) {
    const { planId } = route.params;
    const { user } = useAuth();
    const mealPlan = useQuery(api.mealPlans.getMealPlan, user ? { id: planId, userId: user.userId } : "skip");
    const deletePlan = useMutation(api.mealPlans.deleteMealPlan);
    const toggleFavorite = useMutation(api.mealPlans.toggleFavorite);

    if (mealPlan === undefined) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={48} color={COLORS.primary} />
            </View>
        );
    }

    if (!mealPlan) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Không tìm thấy kế hoạch</Text>
            </View>
        );
    }

    const goal = GOALS[mealPlan.goal];
    const days = mealPlan.plan?.days || [];

    const handleDelete = () => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc muốn xóa kế hoạch này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePlan({ id: planId, userId: user.userId });
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa kế hoạch');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite({ id: planId, userId: user.userId });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.icon}>{goal.icon}</Text>
                            <View>
                                <Text style={styles.title}>{mealPlan.title}</Text>
                                <Text style={styles.subtitle}>{goal.description}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleToggleFavorite}>
                            <Text style={styles.favoriteButton}>
                                {mealPlan.isFavorite ? '⭐' : '☆'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{mealPlan.targetCalories}</Text>
                            <Text style={styles.statLabel}>kcal/ngày</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{days.length}</Text>
                            <Text style={styles.statLabel}>ngày</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{days.length * 4}</Text>
                            <Text style={styles.statLabel}>bữa ăn</Text>
                        </View>
                    </View>
                </View>

                {days.map((day, dayIndex) => (
                    <View key={dayIndex} style={styles.dayCard}>
                        <Text style={styles.dayTitle}>Ngày {day.day}</Text>
                        <Text style={styles.dayCalories}>
                            Tổng: {day.totalCalories} kcal
                        </Text>

                        {day.meals?.map((meal, mealIndex) => (
                            <View key={mealIndex} style={styles.mealCard}>
                                <View style={styles.mealHeader}>
                                    <Text style={styles.mealType}>{meal.type}</Text>
                                    <Text style={styles.mealTime}>{meal.time}</Text>
                                </View>

                                {meal.foods?.map((food, foodIndex) => (
                                    <View key={foodIndex} style={styles.foodItem}>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>{food.name}</Text>
                                            <Text style={styles.foodPortion}>{food.portion}</Text>
                                        </View>
                                        <View style={styles.foodNutrition}>
                                            <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                                            <Text style={styles.foodMacros}>
                                                P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                                            </Text>
                                        </View>
                                    </View>
                                ))}

                                <View style={styles.mealFooter}>
                                    <Text style={styles.mealTotal}>
                                        Tổng bữa: {meal.totalCalories} kcal
                                    </Text>
                                    {meal.notes && (
                                        <Text style={styles.mealNotes}>💡 {meal.notes}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}

                {mealPlan.plan?.summary?.tips && (
                    <View style={styles.tipsCard}>
                        <Text style={styles.tipsTitle}>💡 Lời khuyên</Text>
                        {mealPlan.plan.summary.tips.map((tip, index) => (
                            <Text key={index} style={styles.tipItem}>
                                • {tip}
                            </Text>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>🗑️ Xóa kế hoạch</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: SIZES.h4,
        color: COLORS.error,
    },
    header: {
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
        marginBottom: SIZES.margin,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.margin,
    },
    titleContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    icon: {
        fontSize: 50,
        marginRight: SIZES.margin,
    },
    title: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginTop: 4,
    },
    favoriteButton: {
        fontSize: 30,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: SIZES.padding,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginTop: 4,
    },
    dayCard: {
        backgroundColor: COLORS.white,
        margin: SIZES.margin,
        marginTop: 0,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
    },
    dayTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    dayCalories: {
        fontSize: SIZES.body,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: SIZES.margin,
    },
    mealCard: {
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        marginBottom: SIZES.margin,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.margin / 2,
    },
    mealType: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    mealTime: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    foodItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    foodInfo: {
        marginBottom: 4,
    },
    foodName: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
    },
    foodPortion: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    foodNutrition: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    foodCalories: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        fontWeight: '600',
    },
    foodMacros: {
        fontSize: SIZES.tiny,
        color: COLORS.textLight,
    },
    mealFooter: {
        marginTop: SIZES.margin / 2,
        paddingTop: SIZES.margin / 2,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    mealTotal: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    mealNotes: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginTop: 4,
    },
    tipsCard: {
        backgroundColor: COLORS.white,
        margin: SIZES.margin,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
    },
    tipsTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.margin,
    },
    tipItem: {
        fontSize: SIZES.body,
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    footer: {
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    deleteButton: {
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    deleteButtonText: {
        color: COLORS.error,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
});
