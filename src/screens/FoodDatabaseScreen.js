import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { COLORS, SIZES } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@food_search_history';
const MAX_HISTORY_ITEMS = 5;

export default function FoodDatabaseScreen() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFood, setSelectedFood] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const allFoods = useQuery(api.foodDatabase.getAllFoods);
    const seedDatabase = useMutation(api.foodDatabase.seedFoodDatabase);

    const categories = [
        { id: 'all', label: 'Tất cả', icon: '🍽️' },
        { id: 'main', label: 'Món chính', icon: '🍜' },
        { id: 'side', label: 'Món phụ', icon: '🥗' },
        { id: 'snack', label: 'Snack', icon: '🍪' },
        { id: 'fruit', label: 'Trái cây', icon: '🍎' },
        { id: 'drink', label: 'Đồ uống', icon: '🥤' },
    ];

    // Load search history on mount
    useEffect(() => {
        loadSearchHistory();
    }, []);

    // Seed database if empty
    useEffect(() => {
        if (allFoods && allFoods.length === 0) {
            seedDatabase();
        }
    }, [allFoods]);

    const loadSearchHistory = async () => {
        try {
            const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
            if (history) {
                setSearchHistory(JSON.parse(history));
            }
        } catch (error) {
            console.error('Error loading search history:', error);
        }
    };

    const saveSearchHistory = async (term) => {
        if (!term.trim()) return;

        try {
            let newHistory = [term, ...searchHistory.filter(item => item !== term)];
            newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);

            await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
            setSearchHistory(newHistory);
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    };

    const clearSearchHistory = async () => {
        try {
            await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
            setSearchHistory([]);
        } catch (error) {
            console.error('Error clearing search history:', error);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        // Save to history only if term is not empty and user stops typing
        if (term.trim() && filteredFoods.length > 0) {
            // Debounce save - will be called after user stops typing
            const timeoutId = setTimeout(() => {
                saveSearchHistory(term.trim());
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    };

    const handleSearchSubmit = () => {
        if (searchTerm.trim()) {
            saveSearchHistory(searchTerm.trim());
        }
        setShowHistory(false);
    };

    const selectHistoryItem = (term) => {
        setSearchTerm(term);
        setShowHistory(false);
    };

    // Filter foods
    const filteredFoods = allFoods?.filter(food => {
        const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    }) || [];

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat?.icon || '🍽️';
    };

    const handleFoodPress = (food) => {
        setSelectedFood(food);
        setShowDetail(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, '#003d52']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.headerTitle}>Tra cứu món ăn</Text>
                <Text style={styles.headerSubtitle}>
                    {allFoods?.length || 0} món ăn
                </Text>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm món ăn..."
                        value={searchTerm}
                        onChangeText={(text) => {
                            setSearchTerm(text);
                            // Save to history after 2 seconds of no typing
                            if (text.trim()) {
                                setTimeout(() => {
                                    if (text === searchTerm && text.trim()) {
                                        saveSearchHistory(text.trim());
                                    }
                                }, 2000);
                            }
                        }}
                        onFocus={() => setShowHistory(true)}
                        onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                        onSubmitEditing={handleSearchSubmit}
                        placeholderTextColor={COLORS.textLight}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchTerm('')}
                            style={styles.clearButton}
                        >
                            <Text style={styles.clearButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                    <View style={styles.historyDropdown}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.historyTitle}>Tìm kiếm gần đây</Text>
                            <TouchableOpacity onPress={clearSearchHistory}>
                                <Text style={styles.clearHistoryText}>Xóa tất cả</Text>
                            </TouchableOpacity>
                        </View>
                        {searchHistory.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.historyItem}
                                onPress={() => selectHistoryItem(item)}
                            >
                                <Text style={styles.historyIcon}>🕐</Text>
                                <Text style={styles.historyText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Category Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat.id && styles.categoryChipActive
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={[
                            styles.categoryLabel,
                            selectedCategory === cat.id && styles.categoryLabelActive
                        ]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Food List */}
            <ScrollView style={styles.foodList}>
                {filteredFoods.map(food => (
                    <TouchableOpacity
                        key={food._id}
                        style={styles.foodCard}
                        onPress={() => handleFoodPress(food)}
                    >
                        <View style={styles.foodCardLeft}>
                            <Text style={styles.foodIcon}>{getCategoryIcon(food.category)}</Text>
                            <View style={styles.foodInfo}>
                                <Text style={styles.foodName}>{food.name}</Text>
                                <Text style={styles.foodPortion}>{food.portion}</Text>
                            </View>
                        </View>
                        <View style={styles.foodCardRight}>
                            <Text style={styles.foodCalories}>{food.calories}</Text>
                            <Text style={styles.foodCaloriesLabel}>kcal</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {filteredFoods.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>Không tìm thấy món ăn</Text>
                    </View>
                )}
            </ScrollView>

            {/* Detail Modal */}
            <Modal
                visible={showDetail}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDetail(false)}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView
                        style={styles.modalContent}
                        contentContainerStyle={{ paddingBottom: 60 }}
                    >
                        {selectedFood && (
                            <>
                                <Text style={styles.modalIcon}>
                                    {getCategoryIcon(selectedFood.category)}
                                </Text>
                                <Text style={styles.modalTitle}>{selectedFood.name}</Text>
                                <Text style={styles.modalPortion}>{selectedFood.portion}</Text>

                                {selectedFood.description && (
                                    <Text style={styles.modalDescription}>
                                        {selectedFood.description}
                                    </Text>
                                )}

                                {/* Nutrition Info */}
                                <View style={styles.nutritionGrid}>
                                    <View style={styles.nutritionCard}>
                                        <Text style={styles.nutritionValue}>
                                            {selectedFood.calories}
                                        </Text>
                                        <Text style={styles.nutritionLabel}>Calories</Text>
                                    </View>
                                    <View style={styles.nutritionCard}>
                                        <Text style={styles.nutritionValue}>
                                            {selectedFood.protein}g
                                        </Text>
                                        <Text style={styles.nutritionLabel}>Protein</Text>
                                    </View>
                                    <View style={styles.nutritionCard}>
                                        <Text style={styles.nutritionValue}>
                                            {selectedFood.carbs}g
                                        </Text>
                                        <Text style={styles.nutritionLabel}>Carbs</Text>
                                    </View>
                                    <View style={styles.nutritionCard}>
                                        <Text style={styles.nutritionValue}>
                                            {selectedFood.fat}g
                                        </Text>
                                        <Text style={styles.nutritionLabel}>Fat</Text>
                                    </View>
                                </View>

                                {/* Ingredients */}
                                {selectedFood.ingredients && selectedFood.ingredients.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>🛒 Nguyên liệu</Text>
                                        {selectedFood.ingredients.map((ingredient, index) => (
                                            <Text key={index} style={styles.listItem}>
                                                • {ingredient}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                {/* Recipe */}
                                {selectedFood.recipe && selectedFood.recipe.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>👨‍🍳 Cách nấu</Text>
                                        {selectedFood.recipe.map((step, index) => (
                                            <Text key={index} style={styles.recipeStep}>
                                                {index + 1}. {step}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowDetail(false)}
                                >
                                    <Text style={styles.closeButtonText}>Đóng</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
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
    searchWrapper: {
        position: 'relative',
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        margin: SIZES.padding,
        paddingHorizontal: SIZES.padding,
        borderRadius: SIZES.borderRadius * 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: SIZES.body,
        color: COLORS.text,
    },
    clearButton: {
        padding: 4,
    },
    clearButtonText: {
        fontSize: 18,
        color: COLORS.textLight,
    },
    historyDropdown: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginTop: -8,
        borderRadius: SIZES.borderRadius * 2,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        paddingVertical: 8,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    historyTitle: {
        fontSize: SIZES.small,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    clearHistoryText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
    },
    historyIcon: {
        fontSize: 16,
        marginRight: 12,
    },
    historyText: {
        fontSize: SIZES.body,
        color: COLORS.text,
    },
    categoriesContainer: {
        maxHeight: 60,
    },
    categoriesContent: {
        paddingHorizontal: SIZES.padding,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius * 2,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
    },
    categoryIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    categoryLabel: {
        fontSize: SIZES.small,
        color: COLORS.text,
        fontWeight: '600',
    },
    categoryLabelActive: {
        color: COLORS.white,
    },
    foodList: {
        flex: 1,
        padding: SIZES.padding,
    },
    foodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    foodCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    foodIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    foodPortion: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    foodCardRight: {
        alignItems: 'flex-end',
    },
    foodCalories: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    foodCaloriesLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
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
        padding: SIZES.padding * 2,
        paddingTop: SIZES.padding * 3,
        maxHeight: '80%',
        minHeight: '50%',
    },
    modalIcon: {
        fontSize: 60,
        textAlign: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    modalPortion: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 16,
    },
    modalDescription: {
        fontSize: SIZES.body,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    nutritionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius * 2,
        alignItems: 'center',
    },
    nutritionValue: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    nutritionLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    closeButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding * 1.5,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        marginTop: 16,
    },
    closeButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    listItem: {
        fontSize: SIZES.body,
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    recipeStep: {
        fontSize: SIZES.body,
        color: COLORS.text,
        marginBottom: 12,
        lineHeight: 24,
    },
});
