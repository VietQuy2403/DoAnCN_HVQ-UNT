import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Kế hoạch ăn uống AI',
        description: 'Tạo thực đơn cá nhân hóa với trí tuệ nhân tạo, phù hợp với mục tiêu của bạn',
        icon: '🤖',
        gradient: [COLORS.primary, COLORS.accent],
    },
    {
        id: '2',
        title: 'Theo dõi dinh dưỡng',
        description: 'Ghi lại calories, protein, carbs và chất béo một cách dễ dàng',
        icon: '📊',
        gradient: [COLORS.accent, COLORS.secondary],
    },
    {
        id: '3',
        title: 'Đạt mục tiêu của bạn',
        description: 'Giảm cân, tăng cơ hoặc duy trì sức khỏe - chúng tôi hỗ trợ bạn!',
        icon: '🎯',
        gradient: [COLORS.secondary, COLORS.primary],
    },
];

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
            });
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        await AsyncStorage.setItem('@onboarding_complete', 'true');
        navigation.replace('Login');
    };

    const renderItem = ({ item }) => (
        <LinearGradient
            colors={item.gradient}
            style={styles.slide}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.slideContent}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                        event.nativeEvent.contentOffset.x / width
                    );
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex ? styles.dotActive : null,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttons}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Bỏ qua</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                        <Text style={styles.nextText}>
                            {currentIndex === slides.length - 1 ? 'Bắt đầu' : 'Tiếp theo'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideContent: {
        alignItems: 'center',
        paddingHorizontal: SIZES.padding * 3,
    },
    icon: {
        fontSize: 120,
        marginBottom: 40,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: SIZES.body,
        color: COLORS.white,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SIZES.padding * 2,
        backgroundColor: 'transparent',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.white,
        opacity: 0.3,
        marginHorizontal: 4,
    },
    dotActive: {
        width: 24,
        opacity: 1,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skipButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    skipText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: COLORS.white,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: SIZES.borderRadius,
    },
    nextText: {
        color: COLORS.primary,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
});
