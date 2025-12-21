import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, ProgressChart, PieChart } from 'react-native-chart-kit';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';

const screenWidth = Dimensions.get('window').width;

export default function ProgressTrackingScreen({ navigation }) {
    const { user } = useAuth();

    // Fetch real data from Convex
    const profile = useQuery(api.userProfiles.getProfile, user ? { userId: user.userId } : "skip");
    const mealPlans = useQuery(api.mealPlans.getMealPlans, user ? { userId: user.userId } : "skip");
    const weightHistory = useQuery(
        api.weightTracking.getWeightHistory,
        user ? { userId: user.userId, limit: 7 } : "skip"
    );
    const trackingHistory = useQuery(
        api.dailyTracking.getTrackingHistory,
        user ? { userId: user.userId, limit: 7 } : "skip"
    );

    // Calculate real stats
    const currentWeight = weightHistory && weightHistory.length > 0
        ? weightHistory[0].weight
        : profile?.weight || 75;
    const targetWeight = 70; // TODO: Add to profile
    // IMPORTANT: Start weight should ALWAYS be from profile (initial setup), not from weight history
    const startWeight = profile?.weight || 75;
    const weightLoss = startWeight - currentWeight;
    const goalProgress = startWeight !== targetWeight
        ? Math.min(Math.max(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100, 0), 100) / 100
        : 0;

    // Prepare weight chart data from real weight history
    const weightData = weightHistory && weightHistory.length > 0
        ? {
            labels: weightHistory.slice().reverse().map((entry, index) => {
                // Parse date as local time (YYYY-MM-DD format)
                const [year, month, day] = entry.date.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                const dayOfWeek = date.getDay();
                // Map: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
                return dayOfWeek === 0 ? 'CN' : `T${dayOfWeek + 1}`;
            }),
            datasets: [{
                data: weightHistory.slice().reverse().map(entry => entry.weight),
            }],
        }
        : {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            datasets: [{
                data: [currentWeight, currentWeight, currentWeight, currentWeight, currentWeight, currentWeight, currentWeight],
            }],
        };

    // Calculate real calories and macros from meal plans
    const calculateNutritionFromPlans = () => {
        if (!mealPlans || mealPlans.length === 0) {
            return {
                avgCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                caloriesHistory: []
            };
        }

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        const caloriesHistory = [];

        mealPlans.forEach(plan => {
            if (plan.plan && plan.plan.days) {
                plan.plan.days.forEach(day => {
                    let dayCalories = 0;
                    let dayProtein = 0;
                    let dayCarbs = 0;
                    let dayFat = 0;

                    if (day.meals) {
                        day.meals.forEach(meal => {
                            if (meal.foods) {
                                meal.foods.forEach(food => {
                                    dayProtein += food.protein || 0;
                                    dayCarbs += food.carbs || 0;
                                    dayFat += food.fat || 0;
                                });
                            }
                            dayCalories += meal.totalCalories || 0;
                        });
                    }

                    totalCalories += dayCalories;
                    totalProtein += dayProtein;
                    totalCarbs += dayCarbs;
                    totalFat += dayFat;
                    caloriesHistory.push(dayCalories);
                });
            }
        });

        const totalDays = caloriesHistory.length || 1;
        return {
            avgCalories: Math.round(totalCalories / totalDays),
            totalProtein: Math.round(totalProtein / totalDays),
            totalCarbs: Math.round(totalCarbs / totalDays),
            totalFat: Math.round(totalFat / totalDays),
            caloriesHistory: caloriesHistory.slice(-5) // Last 5 days
        };
    };

    const nutrition = calculateNutritionFromPlans();

    // Calculate real calories from tracking history
    const calculateRealCalories = () => {
        if (!trackingHistory || trackingHistory.length === 0) {
            return {
                avgCalories: nutrition.avgCalories || 0,
                caloriesHistory: []
            };
        }

        const caloriesHistory = trackingHistory.map(day => day.totalCalories || 0);
        const totalCalories = caloriesHistory.reduce((sum, cal) => sum + cal, 0);
        const avgCalories = Math.round(totalCalories / caloriesHistory.length);

        return {
            avgCalories,
            caloriesHistory
        };
    };

    const realCalories = calculateRealCalories();
    const avgCalories = realCalories.avgCalories || nutrition.avgCalories || 1930;

    // Calories chart with real tracking data
    const caloriesData = realCalories.caloriesHistory.length > 0
        ? {
            labels: trackingHistory.map((entry) => {
                // Parse date as local time (YYYY-MM-DD format)
                const [year, month, day] = entry.date.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                const dayOfWeek = date.getDay();
                // Map: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
                return dayOfWeek === 0 ? 'CN' : `T${dayOfWeek + 1}`;
            }),
            datasets: [{
                data: realCalories.caloriesHistory,
            }],
        }
        : {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
            }],
        };

    // Macro distribution with real data from tracking
    const calculateRealMacros = () => {
        if (!trackingHistory || trackingHistory.length === 0) {
            return {
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0
            };
        }

        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        trackingHistory.forEach(day => {
            if (day.mealsConsumed) {
                day.mealsConsumed.forEach(meal => {
                    if (meal.isConsumed) {
                        totalProtein += meal.protein || 0;
                        totalCarbs += meal.carbs || 0;
                        totalFat += meal.fat || 0;
                    }
                });
            }
        });

        const numDays = trackingHistory.length || 1;
        return {
            totalProtein: Math.round(totalProtein / numDays),
            totalCarbs: Math.round(totalCarbs / numDays),
            totalFat: Math.round(totalFat / numDays)
        };
    };

    const realMacros = calculateRealMacros();
    const totalMacros = realMacros.totalProtein + realMacros.totalCarbs + realMacros.totalFat;

    const macroData = totalMacros > 0
        ? [
            {
                name: 'Protein',
                population: Math.round((realMacros.totalProtein * 4 / (avgCalories || 1)) * 100), // protein = 4 cal/g
                color: COLORS.primary,
                legendFontColor: COLORS.text,
            },
            {
                name: 'Carbs',
                population: Math.round((realMacros.totalCarbs * 4 / (avgCalories || 1)) * 100), // carbs = 4 cal/g
                color: COLORS.accent,
                legendFontColor: COLORS.text,
            },
            {
                name: 'Fat',
                population: Math.round((realMacros.totalFat * 9 / (avgCalories || 1)) * 100), // fat = 9 cal/g
                color: COLORS.secondary,
                legendFontColor: COLORS.text,
            },
        ]
        : [
            {
                name: 'Protein',
                population: 30,
                color: COLORS.primary,
                legendFontColor: COLORS.text,
            },
            {
                name: 'Carbs',
                population: 45,
                color: COLORS.accent,
                legendFontColor: COLORS.text,
            },
            {
                name: 'Fat',
                population: 25,
                color: COLORS.secondary,
                legendFontColor: COLORS.text,
            },
        ];

    const goalProgressData = {
        labels: ['Mục tiêu'],
        data: [goalProgress],
    };

    const chartConfig = {
        backgroundColor: COLORS.white,
        backgroundGradientFrom: COLORS.white,
        backgroundGradientTo: COLORS.white,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(0, 35, 49, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: COLORS.primary,
        },
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, '#003d52']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Theo dõi tiến độ</Text>
                        <Text style={styles.headerSubtitle}>Xem sự thay đổi của bạn</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('WeightLog')}
                    >
                        <Text style={styles.addButtonText}>+ Nhập cân nặng</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Goal Progress */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🎯 Tiến độ mục tiêu</Text>
                <ProgressChart
                    data={goalProgressData}
                    width={screenWidth - 60}
                    height={200}
                    strokeWidth={16}
                    radius={80}
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(81, 207, 102, ${opacity})`,
                    }}
                    hideLegend={false}
                />
                <Text style={styles.progressText}>
                    {Math.round(goalProgress * 100)}% hoàn thành mục tiêu
                </Text>
            </View>

            {/* Weight Chart */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>⚖️ Cân nặng (kg)</Text>
                <LineChart
                    data={weightData}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                />
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Bắt đầu</Text>
                        <Text style={styles.statValue}>{startWeight.toFixed(1)} kg</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Hiện tại</Text>
                        <Text style={styles.statValue}>{currentWeight.toFixed(1)} kg</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Giảm</Text>
                        <Text style={[styles.statValue, { color: weightLoss > 0 ? COLORS.success : COLORS.error }]}>
                            {weightLoss > 0 ? `-${weightLoss.toFixed(1)}` : weightLoss < 0 ? `+${Math.abs(weightLoss).toFixed(1)}` : '0'} kg
                        </Text>
                    </View>
                </View>
            </View>

            {/* Calories Chart */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🔥 Calories tiêu thụ</Text>
                <LineChart
                    data={caloriesData}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                />
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Trung bình</Text>
                        <Text style={styles.statValue}>{avgCalories} kcal</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Kế hoạch</Text>
                        <Text style={styles.statValue}>{mealPlans?.length || 0}</Text>
                    </View>
                </View>
            </View>

            {/* Macro Distribution */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📊 Phân bố dinh dưỡng</Text>
                <PieChart
                    data={macroData}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </View>

            {/* Summary Stats */}
            <View style={styles.summaryCard}>
                <LinearGradient
                    colors={[COLORS.primary, '#003d52']}
                    style={styles.summaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.summaryTitle}>Tóm tắt tuần này</Text>
                    <View style={styles.summaryStats}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>
                                {weightLoss > 0 ? `-${weightLoss.toFixed(1)}` : weightLoss < 0 ? `+${Math.abs(weightLoss).toFixed(1)}` : '0'} kg
                            </Text>
                            <Text style={styles.summaryLabel}>Thay đổi</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{avgCalories}</Text>
                            <Text style={styles.summaryLabel}>Avg calories</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{mealPlans?.length || 0}</Text>
                            <Text style={styles.summaryLabel}>Kế hoạch</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </ScrollView>
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
        marginBottom: SIZES.margin,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: SIZES.borderRadius,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: COLORS.white,
        margin: SIZES.margin,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius * 2,
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
    chart: {
        marginVertical: 8,
        borderRadius: SIZES.borderRadius,
    },
    progressText: {
        textAlign: 'center',
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.success,
        marginTop: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: SIZES.margin,
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
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    summaryCard: {
        margin: SIZES.margin,
        marginBottom: SIZES.margin * 3,
        borderRadius: SIZES.borderRadius * 2,
        overflow: 'hidden',
    },
    summaryGradient: {
        padding: SIZES.padding * 2,
    },
    summaryTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SIZES.margin,
        textAlign: 'center',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: SIZES.small,
        color: COLORS.white,
        opacity: 0.9,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.white,
        opacity: 0.3,
    },
});
