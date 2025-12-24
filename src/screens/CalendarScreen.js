import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';

export default function CalendarScreen({ navigation }) {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState('');
    const [markedDates, setMarkedDates] = useState({});
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const [tempSelectedPlanIndex, setTempSelectedPlanIndex] = useState(0); // Temporary selection

    // Fetch meal plans from Convex
    const mealPlans = useQuery(
        api.mealPlans.getMealPlans,
        user ? { userId: user.userId } : "skip"
    );

    // Mutation to set active meal plan
    const setActiveMealPlan = useMutation(api.userSettings.setActiveMealPlan);
    const updateTodayTracking = useMutation(api.dailyTracking.updateTodayTracking);

    const currentPlan = mealPlans && mealPlans.length > 0 ? mealPlans[selectedPlanIndex] : null;

    // Process meal plans to create calendar data
    useEffect(() => {
        if (!currentPlan || !currentPlan.plan || !currentPlan.plan.days) {
            setMarkedDates({});
            return;
        }

        const marked = {};
        const createdDate = new Date(currentPlan.createdAt);
        const startDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

        // Get today's date (start of day)
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        currentPlan.plan.days.forEach((day, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);

            // Format theo local time
            const dateString =
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            marked[dateString] = {
                marked: true,
                dotColor: COLORS.primary,
            };
        });


        setMarkedDates(marked);
    }, [currentPlan]);

    // Get meals for selected date
    const getMealsForDate = () => {
        if (!selectedDate || !currentPlan || !currentPlan.plan || !currentPlan.plan.days) return [];

        const createdDate = new Date(currentPlan.createdAt);
        const startDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
        const selected = new Date(selectedDate);
        const dayDiff = Math.floor((selected - startDate) / (1000 * 60 * 60 * 24));

        if (dayDiff < 0 || dayDiff >= currentPlan.plan.days.length) return [];

        const dayPlan = currentPlan.plan.days[dayDiff];
        if (!dayPlan || !dayPlan.meals) return [];

        return dayPlan.meals.map(meal => ({
            type: meal.type,
            name: meal.foods ? meal.foods.map(f => f.name).join(', ') : '',
            calories: meal.totalCalories || 0,
            time: meal.time || '',
            foods: meal.foods || []
        }));
    };

    const selectedMeals = getMealsForDate();
    const totalCalories = selectedMeals.reduce((sum, meal) => sum + meal.calories, 0);

    const formatPlanDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('vi-VN', {
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
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Lịch ăn kiêng</Text>
                        <Text style={styles.headerSubtitle}>Xem kế hoạch ăn theo ngày</Text>
                    </View>
                    {mealPlans && mealPlans.length > 1 && (
                        <TouchableOpacity
                            style={styles.planSelectorButton}
                            onPress={() => {
                                setTempSelectedPlanIndex(selectedPlanIndex);
                                setShowPlanSelector(true);
                            }}
                        >
                            <Text style={styles.planSelectorButtonText}>📋 Chọn kế hoạch</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {currentPlan && (
                    <View style={styles.currentPlanInfo}>
                        <Text style={styles.currentPlanText}>
                            {currentPlan.title} • {formatPlanDate(currentPlan.createdAt)}
                        </Text>
                    </View>
                )}
            </LinearGradient>

            <Calendar
                style={styles.calendar}
                theme={{
                    backgroundColor: COLORS.white,
                    calendarBackground: COLORS.white,
                    textSectionTitleColor: COLORS.text,
                    selectedDayBackgroundColor: COLORS.primary,
                    selectedDayTextColor: COLORS.white,
                    todayTextColor: COLORS.primary,
                    dayTextColor: COLORS.text,
                    textDisabledColor: COLORS.textLight,
                    dotColor: COLORS.primary,
                    selectedDotColor: COLORS.white,
                    arrowColor: COLORS.primary,
                    monthTextColor: COLORS.text,
                    textDayFontWeight: '500',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                }}
                markedDates={{
                    ...markedDates,
                    [selectedDate]: {
                        selected: true,
                        marked: markedDates[selectedDate]?.marked,
                        selectedColor: COLORS.primary,
                    },
                }}
                onDayPress={async (day) => {
                    setSelectedDate(day.dateString);
                    // Set this plan as active when user selects a date
                    if (user && currentPlan) {
                        try {
                            await setActiveMealPlan({
                                userId: user.userId,
                                mealPlanId: currentPlan._id,
                            });
                        } catch (error) {
                            console.error('Error setting active meal plan:', error);
                        }
                    }
                }}
            />

            <ScrollView style={styles.mealsContainer}>
                {selectedDate ? (
                    <>
                        <Text style={styles.dateTitle}>
                            {new Date(selectedDate).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            })}
                        </Text>

                        {selectedMeals.length > 0 ? (
                            <>
                                {selectedMeals.map((meal, index) => (
                                    <View key={index} style={styles.mealCard}>
                                        <View style={styles.mealHeader}>
                                            <View style={styles.mealHeaderLeft}>
                                                <Text style={styles.mealType}>{meal.type}</Text>
                                                {meal.time && (
                                                    <Text style={styles.mealTime}>🕐 {meal.time}</Text>
                                                )}
                                            </View>
                                            <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                                        </View>

                                        {meal.foods && meal.foods.length > 0 && (
                                            <View style={styles.foodsList}>
                                                {meal.foods.map((food, foodIndex) => (
                                                    <View key={foodIndex} style={styles.foodItem}>
                                                        <Text style={styles.foodName}>• {food.name}</Text>
                                                        <Text style={styles.foodPortion}>{food.portion}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}

                                <View style={styles.summaryCard}>
                                    <LinearGradient
                                        colors={[COLORS.primary, '#003d52']}
                                        style={styles.summaryGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.summaryTitle}>Tổng cộng</Text>
                                        <Text style={styles.summaryCalories}>{totalCalories} kcal</Text>
                                    </LinearGradient>
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>📝</Text>
                                <Text style={styles.emptyText}>Chưa có kế hoạch ăn cho ngày này</Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('MealPlanGenerator')}
                                >
                                    <Text style={styles.addButtonText}>+ Tạo kế hoạch mới</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📅</Text>
                        <Text style={styles.emptyText}>Chọn một ngày để xem kế hoạch ăn</Text>
                        {(!mealPlans || mealPlans.length === 0) && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => navigation.navigate('MealPlanGenerator')}
                            >
                                <Text style={styles.addButtonText}>+ Tạo kế hoạch đầu tiên</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Plan Selector Modal */}
            <Modal
                visible={showPlanSelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPlanSelector(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn kế hoạch ăn</Text>
                        <ScrollView style={styles.planList}>
                            {mealPlans && mealPlans.map((plan, index) => (
                                <TouchableOpacity
                                    key={plan._id}
                                    style={[
                                        styles.planItem,
                                        tempSelectedPlanIndex === index && styles.planItemSelected
                                    ]}
                                    onPress={() => setTempSelectedPlanIndex(index)}
                                >
                                    <View style={styles.planItemContent}>
                                        <Text style={[
                                            styles.planItemTitle,
                                            tempSelectedPlanIndex === index && styles.planItemTitleSelected
                                        ]}>
                                            {plan.title}
                                        </Text>
                                        <Text style={[
                                            styles.planItemDate,
                                            tempSelectedPlanIndex === index && styles.planItemDateSelected
                                        ]}>
                                            {formatPlanDate(plan.createdAt)} • {plan.plan?.days?.length || 0} ngày
                                        </Text>
                                        <Text style={[
                                            styles.planItemCalories,
                                            tempSelectedPlanIndex === index && styles.planItemCaloriesSelected
                                        ]}>
                                            {plan.targetCalories} kcal/ngày
                                        </Text>
                                    </View>
                                    {tempSelectedPlanIndex === index && (
                                        <View style={styles.checkmarkContainer}>
                                            <Text style={styles.planItemCheck}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setTempSelectedPlanIndex(selectedPlanIndex);
                                    setShowPlanSelector(false);
                                }}
                            >
                                <Text style={styles.modalCancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.modalConfirmButton}
                                onPress={async () => {
                                    const plan = mealPlans[tempSelectedPlanIndex];
                                    if (!user || !plan) return;

                                    // Set as active plan
                                    setSelectedPlanIndex(tempSelectedPlanIndex);
                                    setShowPlanSelector(false);
                                    setSelectedDate('');

                                    try {
                                        await setActiveMealPlan({
                                            userId: user.userId,
                                            mealPlanId: plan._id,
                                        });

                                        // Update today's tracking
                                        if (plan.plan && plan.plan.days && plan.plan.days.length > 0) {
                                            const dayPlan = plan.plan.days[0];
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
                                    } catch (error) {
                                        console.error('Error setting active meal plan:', error);
                                    }
                                }}
                            >
                                <Text style={styles.modalConfirmButtonText}>✓ Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
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
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
    planSelectorButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: SIZES.borderRadius,
    },
    planSelectorButtonText: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontWeight: 'bold',
    },
    currentPlanInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    currentPlanText: {
        color: COLORS.white,
        fontSize: SIZES.small,
        opacity: 0.9,
    },
    calendar: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    mealsContainer: {
        flex: 1,
        padding: SIZES.padding,
    },
    dateTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.margin,
    },
    mealCard: {
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
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    mealHeaderLeft: {
        flex: 1,
    },
    mealType: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    mealTime: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    mealCalories: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    foodsList: {
        marginTop: 8,
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    foodName: {
        fontSize: SIZES.body,
        color: COLORS.text,
        flex: 1,
    },
    foodPortion: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginLeft: 8,
    },
    summaryCard: {
        borderRadius: SIZES.borderRadius * 2,
        overflow: 'hidden',
        marginTop: SIZES.margin,
        marginBottom: SIZES.margin * 2,
    },
    summaryGradient: {
        padding: SIZES.padding * 1.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    summaryCalories: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        marginBottom: 20,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: SIZES.borderRadius,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.borderRadius * 3,
        borderTopRightRadius: SIZES.borderRadius * 3,
        paddingTop: SIZES.padding * 2,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SIZES.margin,
    },
    planList: {
        paddingHorizontal: SIZES.padding * 2,
    },
    planItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding * 1.5,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.borderRadius * 2,
        marginBottom: SIZES.margin,
    },
    planItemSelected: {
        backgroundColor: COLORS.primary,
    },
    planItemContent: {
        flex: 1,
    },
    planItemTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    planItemTitleSelected: {
        color: COLORS.white,
    },
    planItemDate: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    planItemDateSelected: {
        color: 'rgba(255,255,255,0.9)',
    },
    planItemCalories: {
        fontSize: SIZES.small,
        color: COLORS.accent,
        fontWeight: '600',
    },
    planItemCaloriesSelected: {
        color: COLORS.white,
    },
    checkmarkContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    planItemCheck: {
        fontSize: 20,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        margin: SIZES.padding * 2,
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: COLORS.border,
        padding: SIZES.padding * 1.5,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
    },
    modalCancelButtonText: {
        color: COLORS.text,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    modalConfirmButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        padding: SIZES.padding * 1.5,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
    },
    modalConfirmButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding * 1.5,
        margin: SIZES.padding * 2,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
});
