import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();

    // Fetch real data from Convex
    const profile = useQuery(api.userProfiles.getProfile, user ? { userId: user.userId } : "skip");
    const mealPlans = useQuery(api.mealPlans.getMealPlans, user ? { userId: user.userId } : "skip");
    const todayTracking = useQuery(api.dailyTracking.getTodayTracking, user ? { userId: user.userId } : "skip");
    const activeMealPlanId = useQuery(api.userSettings.getActiveMealPlanId, user ? { userId: user.userId } : "skip");

    const initializeTracking = useMutation(api.dailyTracking.initializeTodayTracking);
    const toggleMeal = useMutation(api.dailyTracking.toggleMealConsumed);

    // State for recipe modal
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showRecipeModal, setShowRecipeModal] = useState(false);

    // Get today's meals from meal plan
    const getTodayMeals = () => {
        if (!mealPlans || mealPlans.length === 0) return [];

        // Use active meal plan if set, otherwise use latest plan
        let activePlan = null;
        if (activeMealPlanId) {
            activePlan = mealPlans.find(plan => plan._id === activeMealPlanId);
            console.log('Active meal plan ID:', activeMealPlanId);
            console.log('Found active plan:', activePlan?.title);
        } else {
            console.log('No active meal plan set, using latest');
        }
        const planToUse = activePlan || mealPlans[0];
        console.log('Using plan:', planToUse?.title);

        if (!planToUse || !planToUse.plan || !planToUse.plan.days) return [];

        // Calculate which day in the plan is today
        const createdDate = new Date(planToUse.createdAt);
        // Set to start of day for creation date
        const startDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

        const today = new Date();
        // Set to start of day for today
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Calculate day difference (0 = same day as creation, 1 = next day, etc.)
        const dayDiff = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));

        // If plan was created today or in the future, show day 1
        // Otherwise show the appropriate day
        const planDayIndex = dayDiff < 0 ? 0 : Math.min(dayDiff, planToUse.plan.days.length - 1);

        const dayPlan = planToUse.plan.days[planDayIndex];
        if (!dayPlan || !dayPlan.meals) return [];

        return dayPlan.meals.map(meal => {
            // Calculate totals from foods array if available
            let totalProtein = 0;
            let totalCarbs = 0;
            let totalFat = 0;

            if (meal.foods && Array.isArray(meal.foods)) {
                meal.foods.forEach(food => {
                    totalProtein += food.protein || 0;
                    totalCarbs += food.carbs || 0;
                    totalFat += food.fat || 0;
                });
            }

            return {
                mealType: meal.type,
                foodName: meal.foods ? meal.foods.map(f => f.name).join(', ') : '',
                calories: meal.totalCalories || 0,
                protein: totalProtein,
                carbs: totalCarbs,
                fat: totalFat,
            };
        });
    };

    // Initialize tracking when component mounts
    useEffect(() => {
        if (user && !todayTracking && mealPlans && mealPlans.length > 0) {
            const meals = getTodayMeals();
            if (meals.length > 0) {
                initializeTracking({ userId: user.userId, meals });
            }
        }
    }, [user, todayTracking, mealPlans]);

    const handleToggleMeal = async (mealIndex) => {
        if (user) {
            await toggleMeal({ userId: user.userId, mealIndex });
        }
    };

    // Get recipe details for a meal
    const getMealRecipe = (mealIndex) => {
        if (!mealPlans || mealPlans.length === 0) return null;

        // Use active meal plan if set, otherwise use latest plan
        let activePlan = null;
        if (activeMealPlanId) {
            activePlan = mealPlans.find(plan => plan._id === activeMealPlanId);
        }
        const planToUse = activePlan || mealPlans[0];

        if (!planToUse || !planToUse.plan || !planToUse.plan.days) return null;

        // Calculate which day in the plan is today (same logic as getTodayMeals)
        const createdDate = new Date(planToUse.createdAt);
        const startDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dayDiff = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));

        const planDayIndex = dayDiff < 0 ? 0 : Math.min(dayDiff, planToUse.plan.days.length - 1);

        const dayPlan = planToUse.plan.days[planDayIndex];
        if (!dayPlan || !dayPlan.meals || !dayPlan.meals[mealIndex]) return null;

        return dayPlan.meals[mealIndex];
    };

    const handleMealPress = (mealIndex) => {
        const mealData = getMealRecipe(mealIndex);
        if (mealData && mealData.foods && mealData.foods.length > 0) {
            setSelectedRecipe(mealData);
            setShowRecipeModal(true);
        }
    };

    // Calculate stats
    const currentWeight = profile?.weight || 0;
    const targetWeightValue = profile?.targetWeight || 0;
    const userGoal = profile?.goal;

    // Calculate progress based on goal
    const calculateProgress = () => {
        if (!currentWeight || !targetWeightValue || !userGoal) {
            return null;
        }

        // Get initial weight from weight tracking or use current weight as baseline
        const initialWeight = currentWeight; // TODO: Get from first weight tracking entry

        switch (userGoal) {
            case 'weight_loss':
                // Progress = (initial - current) / (initial - target) * 100
                if (initialWeight <= targetWeightValue) return 100; // Already at or below target
                const lossProgress = ((initialWeight - currentWeight) / (initialWeight - targetWeightValue)) * 100;
                return Math.min(Math.max(lossProgress, 0), 100); // Clamp between 0-100

            case 'muscle_gain':
                // Progress = (current - initial) / (target - initial) * 100
                if (initialWeight >= targetWeightValue) return 100; // Already at or above target
                const gainProgress = ((currentWeight - initialWeight) / (targetWeightValue - initialWeight)) * 100;
                return Math.min(Math.max(gainProgress, 0), 100); // Clamp between 0-100

            case 'maintenance':
                // For maintenance, show how close to target (inverse of difference %)
                const diff = Math.abs(currentWeight - targetWeightValue);
                const tolerance = targetWeightValue * 0.02; // 2% tolerance
                if (diff <= tolerance) return 100;
                return Math.max(100 - (diff / targetWeightValue * 100), 0);

            default:
                return null;
        }
    };

    const goalProgress = calculateProgress();
    const targetCalories = mealPlans && mealPlans.length > 0 ? mealPlans[0].targetCalories : 2000;
    const consumedCalories = todayTracking?.totalCalories || 0;

    // Get goal display info
    const getGoalDisplay = () => {
        const userGoal = profile?.goal;
        if (!userGoal) {
            return { icon: '🎯', label: 'Chưa đặt', value: '--' };
        }

        switch (userGoal) {
            case 'weight_loss':
                return { icon: '🔥', label: 'Giảm cân', value: 'Giảm cân' };
            case 'muscle_gain':
                return { icon: '💪', label: 'Tăng cơ', value: 'Tăng cơ' };
            case 'maintenance':
                return { icon: '⚖️', label: 'Duy trì', value: 'Duy trì' };
            default:
                return { icon: '🎯', label: 'Chưa đặt', value: '--' };
        }
    };

    const goalDisplay = getGoalDisplay();

    const quickStats = [
        {
            label: 'Calories hôm nay',
            value: consumedCalories.toString(),
            unit: 'kcal',
            icon: '🔥'
        },
        {
            label: 'Cân nặng',
            value: currentWeight ? currentWeight.toFixed(1) : '--',
            unit: 'kg',
            icon: '⚖️'
        },
        {
            label: 'Mục tiêu',
            value: targetWeightValue ? targetWeightValue.toFixed(1) : '--',
            unit: 'kg',
            icon: '🎯'
        }
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, '#003d52']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.greeting}>Xin chào! 👋</Text>
                <Text style={styles.userName}>{profile?.name || user?.name}</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    {quickStats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={[styles.statValue, !stat.unit && styles.statValueSmall]}>{stat.value}</Text>
                            {stat.unit ? <Text style={styles.statUnit}>{stat.unit}</Text> : null}
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
                {/* Create New Plan Button - ABOVE meals */}
                <View style={styles.newPlanContainer}>
                    <TouchableOpacity
                        style={styles.newPlanButton}
                        onPress={() => navigation.navigate('MealPlanGenerator')}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#003d52']}
                            style={styles.newPlanGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.newPlanIcon}>✨</Text>
                            <Text style={styles.newPlanText}>Tạo kế hoạch mới</Text>
                            <Text style={styles.newPlanSubtext}>AI tạo thực đơn cho bạn</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Today's Meals Section */}
                <View style={styles.mealsSection}>
                    <Text style={styles.sectionTitle}>Bữa ăn hôm nay</Text>

                    {!mealPlans || mealPlans.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📝</Text>
                            <Text style={styles.emptyText}>
                                Hãy tạo kế hoạch ăn uống ngay để có cơ thể như mong muốn
                            </Text>
                            <TouchableOpacity
                                style={styles.createPlanButton}
                                onPress={() => navigation.navigate('MealPlanGenerator')}
                            >
                                <Text style={styles.createPlanButtonText}>+ Tạo kế hoạch</Text>
                            </TouchableOpacity>
                        </View>
                    ) : todayTracking && todayTracking.mealsConsumed && todayTracking.mealsConsumed.length > 0 ? (
                        todayTracking.mealsConsumed.map((meal, index) => (
                            <View key={index} style={styles.mealCard}>
                                <TouchableOpacity
                                    style={styles.checkbox}
                                    onPress={() => handleToggleMeal(index)}
                                >
                                    {meal.isConsumed && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                                <View style={styles.mealInfo}>
                                    <Text style={styles.mealType}>{meal.mealType}</Text>
                                    <Text style={styles.mealName} numberOfLines={2}>{meal.foodName}</Text>
                                </View>
                                <View style={styles.mealRight}>
                                    <Text style={[styles.mealCalories, meal.isConsumed && styles.mealCaloriesConsumed]}>
                                        {meal.calories} kcal
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.recipeButton}
                                        onPress={() => handleMealPress(index)}
                                    >
                                        <Text style={styles.recipeButtonText}>📖 Công thức</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>⏳</Text>
                            <Text style={styles.emptyText}>Đang tải bữa ăn...</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Recipe Modal */}
            <Modal
                visible={showRecipeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowRecipeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedRecipe && (
                                <>
                                    {/* Modal Header */}
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>{selectedRecipe.type}</Text>
                                        <TouchableOpacity
                                            style={styles.closeButton}
                                            onPress={() => setShowRecipeModal(false)}
                                        >
                                            <Text style={styles.closeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Meal Info */}
                                    <View style={styles.modalMealInfo}>
                                        <Text style={styles.modalMealName}>
                                            {selectedRecipe.foods.map(f => f.name).join(', ')}
                                        </Text>
                                        <Text style={styles.modalCalories}>
                                            🔥 {selectedRecipe.totalCalories} kcal
                                        </Text>
                                    </View>

                                    {/* Foods with Recipes */}
                                    {selectedRecipe.foods.map((food, foodIndex) => (
                                        <View key={foodIndex} style={styles.foodSection}>
                                            <Text style={styles.foodTitle}>
                                                {food.name} ({food.portion})
                                            </Text>

                                            {/* Nutrition Info */}
                                            <View style={styles.nutritionRow}>
                                                <View style={styles.nutritionItem}>
                                                    <Text style={styles.nutritionLabel}>Protein</Text>
                                                    <Text style={styles.nutritionValue}>{food.protein}g</Text>
                                                </View>
                                                <View style={styles.nutritionItem}>
                                                    <Text style={styles.nutritionLabel}>Carbs</Text>
                                                    <Text style={styles.nutritionValue}>{food.carbs}g</Text>
                                                </View>
                                                <View style={styles.nutritionItem}>
                                                    <Text style={styles.nutritionLabel}>Fat</Text>
                                                    <Text style={styles.nutritionValue}>{food.fat}g</Text>
                                                </View>
                                                <View style={styles.nutritionItem}>
                                                    <Text style={styles.nutritionLabel}>Calo</Text>
                                                    <Text style={styles.nutritionValue}>{food.calories}</Text>
                                                </View>
                                            </View>

                                            {/* Recipe */}
                                            {food.recipe && (
                                                <>
                                                    {/* Ingredients */}
                                                    <View style={styles.recipeSection}>
                                                        <Text style={styles.recipeSectionTitle}>
                                                            🛒 Nguyên liệu
                                                        </Text>
                                                        {food.recipe.ingredients.map((ingredient, idx) => (
                                                            <View key={idx} style={styles.ingredientItem}>
                                                                <Text style={styles.bullet}>•</Text>
                                                                <Text style={styles.ingredientText}>{ingredient}</Text>
                                                            </View>
                                                        ))}
                                                    </View>

                                                    {/* Instructions */}
                                                    <View style={styles.recipeSection}>
                                                        <Text style={styles.recipeSectionTitle}>
                                                            👨‍🍳 Cách làm
                                                        </Text>
                                                        {food.recipe.instructions.map((instruction, idx) => (
                                                            <View key={idx} style={styles.instructionItem}>
                                                                <Text style={styles.stepNumber}>{idx + 1}</Text>
                                                                <Text style={styles.instructionText}>{instruction}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </>
                                            )}

                                            {!food.recipe && (
                                                <Text style={styles.noRecipeText}>
                                                    Không có công thức chi tiết
                                                </Text>
                                            )}
                                        </View>
                                    ))}

                                    {/* Notes */}
                                    {selectedRecipe.notes && (
                                        <View style={styles.notesSection}>
                                            <Text style={styles.notesTitle}>💡 Ghi chú</Text>
                                            <Text style={styles.notesText}>{selectedRecipe.notes}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: SIZES.padding * 2,
    },
    greeting: {
        fontSize: SIZES.body,
        color: COLORS.white,
        opacity: 0.9,
    },
    userName: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: SIZES.padding,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius * 2,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    statValue: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statValueSmall: {
        fontSize: SIZES.body,
    },
    statUnit: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginTop: 2,
    },
    statLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginTop: 4,
        textAlign: 'center',
    },
    newPlanContainer: {
        padding: SIZES.padding,
        paddingTop: 0,
    },
    newPlanButton: {
        borderRadius: SIZES.borderRadius * 2,
        overflow: 'hidden',
    },
    newPlanGradient: {
        padding: SIZES.padding * 1.5,
        alignItems: 'center',
    },
    newPlanIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    newPlanText: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    newPlanSubtext: {
        fontSize: SIZES.small,
        color: COLORS.white,
        opacity: 0.9,
    },
    mealsSection: {
        padding: SIZES.padding,
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.margin,
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SIZES.padding * 1.5,
        borderRadius: SIZES.borderRadius * 2,
        marginBottom: SIZES.margin,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        fontSize: 18,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    mealInfo: {
        flex: 1,
    },
    mealType: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    mealName: {
        fontSize: SIZES.body,
        color: COLORS.text,
    },
    mealCalories: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    mealCaloriesConsumed: {
        color: COLORS.success,
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
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    createPlanButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: SIZES.borderRadius,
    },
    createPlanButtonText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
    progressContainer: {
        padding: SIZES.padding,
        paddingTop: 0,
    },
    progressCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius * 2,
        padding: SIZES.padding * 1.5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.margin,
    },
    progressIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    progressTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    progressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressCircleContainer: {
        position: 'relative',
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    progressRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        borderColor: COLORS.primary,
        zIndex: 1,
    },
    progressPercentage: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    progressLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginTop: 4,
    },
    progressInfo: {
        flex: 1,
        marginLeft: SIZES.margin * 2,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.margin / 2,
    },
    progressInfoLabel: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
    },
    progressInfoValue: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    progressRemaining: {
        color: COLORS.accent,
    },
    mealRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    recipeButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: SIZES.borderRadius,
    },
    recipeButtonText: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.borderRadius * 3,
        borderTopRightRadius: SIZES.borderRadius * 3,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding * 1.5,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 20,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    modalMealInfo: {
        padding: SIZES.padding * 1.5,
        backgroundColor: '#f8f9fa',
    },
    modalMealName: {
        fontSize: SIZES.h3,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    modalCalories: {
        fontSize: SIZES.body,
        color: COLORS.accent,
        fontWeight: '600',
    },
    foodSection: {
        padding: SIZES.padding * 1.5,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    foodTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: SIZES.borderRadius,
        marginBottom: 16,
    },
    nutritionItem: {
        alignItems: 'center',
    },
    nutritionLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    nutritionValue: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    recipeSection: {
        marginTop: 16,
    },
    recipeSectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    ingredientItem: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingLeft: 8,
    },
    bullet: {
        fontSize: SIZES.body,
        color: COLORS.primary,
        marginRight: 8,
        fontWeight: 'bold',
    },
    ingredientText: {
        fontSize: SIZES.body,
        color: COLORS.text,
        flex: 1,
        lineHeight: 22,
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingLeft: 8,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        color: COLORS.white,
        fontSize: SIZES.small,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
        marginRight: 12,
    },
    instructionText: {
        fontSize: SIZES.body,
        color: COLORS.text,
        flex: 1,
        lineHeight: 22,
    },
    noRecipeText: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 16,
    },
    notesSection: {
        padding: SIZES.padding * 1.5,
        backgroundColor: '#fff9e6',
        margin: SIZES.padding * 1.5,
        borderRadius: SIZES.borderRadius,
    },
    notesTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    notesText: {
        fontSize: SIZES.body,
        color: COLORS.text,
        lineHeight: 22,
    },
});
