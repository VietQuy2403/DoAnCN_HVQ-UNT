import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, ACTIVITY_LEVELS } from '../constants';

export default function ProfileScreen({ navigation }) {
    const { user } = useAuth();
    const profile = useQuery(api.userProfiles.getProfile, user ? { userId: user.userId } : "skip");
    const upsertProfile = useMutation(api.userProfiles.upsertProfile);

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [targetWeight, setTargetWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('moderate');
    const [goal, setGoal] = useState('maintenance');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setAge(profile.age?.toString() || '');
            setGender(profile.gender || 'male');
            setWeight(profile.weight?.toString() || '');
            setHeight(profile.height?.toString() || '');
            setTargetWeight(profile.targetWeight?.toString() || '');
            setActivityLevel(profile.activityLevel || 'moderate');
            setGoal(profile.goal || 'maintenance');
        }
    }, [profile]);

    // Calculate TDEE
    const calculateTDEE = () => {
        if (!weight || !height || !age) return null;

        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseInt(age);

        // Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = 10 * w + 6.25 * h - 5 * a + 5;
        } else {
            bmr = 10 * w + 6.25 * h - 5 * a - 161;
        }

        // Activity multiplier
        const multipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.55));
        return tdee;
    };

    const tdee = calculateTDEE();

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên');
            return;
        }

        setLoading(true);
        try {
            await upsertProfile({
                userId: user.userId,
                name,
                age: age ? parseInt(age) : undefined,
                gender,
                weight: weight ? parseFloat(weight) : undefined,
                height: height ? parseFloat(height) : undefined,
                targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
                activityLevel,
                goal,
            });
            Alert.alert('Thành công', 'Hồ sơ đã được cập nhật');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Settings Button */}
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('AccountSettings')}
            >
                <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                <Text style={styles.label}>Tên</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="VD: Nguyễn Văn A"
                />

                <Text style={styles.label}>Tuổi</Text>
                <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="VD: 25"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderContainer}>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            gender === 'male' ? styles.genderButtonSelected : null,
                        ]}
                        onPress={() => setGender('male')}
                    >
                        <Text
                            style={[
                                styles.genderText,
                                gender === 'male' ? styles.genderTextSelected : null,
                            ]}
                        >
                            Nam
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            gender === 'female' ? styles.genderButtonSelected : null,
                        ]}
                        onPress={() => setGender('female')}
                    >
                        <Text
                            style={[
                                styles.genderText,
                                gender === 'female' ? styles.genderTextSelected : null,
                            ]}
                        >
                            Nữ
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            gender === 'other' ? styles.genderButtonSelected : null,
                        ]}
                        onPress={() => setGender('other')}
                    >
                        <Text
                            style={[
                                styles.genderText,
                                gender === 'other' ? styles.genderTextSelected : null,
                            ]}
                        >
                            Khác
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chỉ số cơ thể</Text>

                <Text style={styles.label}>Cân nặng (kg)</Text>
                <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="VD: 70"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Chiều cao (cm)</Text>
                <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="VD: 170"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Cân nặng mục tiêu (kg)</Text>
                <TextInput
                    style={styles.input}
                    value={targetWeight}
                    onChangeText={setTargetWeight}
                    placeholder="VD: 65"
                    keyboardType="numeric"
                />
            </View>
            <TouchableOpacity
                style={[styles.saveButton, loading ? styles.buttonDisabled : null]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>
                    {loading ? 'Đang lưu...' : '💾 Lưu hồ sơ'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
    },
    settingsButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: COLORS.white,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    settingsIcon: {
        fontSize: 24,
    },
    section: {
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        marginBottom: SIZES.margin,
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.margin,
    },
    label: {
        fontSize: SIZES.body,
        color: COLORS.text,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        fontSize: SIZES.body,
        marginBottom: SIZES.margin,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    genderContainer: {
        flexDirection: 'row',
    },
    genderButton: {
        flex: 1,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    genderButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    genderText: {
        fontSize: SIZES.body,
        color: COLORS.text,
    },
    genderTextSelected: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    activityButton: {
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SIZES.margin / 2,
    },
    activityButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    activityLabel: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    activityLabelSelected: {
        color: COLORS.white,
    },
    activityDescription: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    activityDescriptionSelected: {
        color: COLORS.white,
        opacity: 0.9,
    },
    tdeeCard: {
        backgroundColor: COLORS.primary,
        margin: SIZES.margin,
        padding: SIZES.padding * 1.5,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
    },
    tdeeTitle: {
        fontSize: SIZES.body,
        color: COLORS.white,
        marginBottom: 8,
    },
    tdeeValue: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    tdeeNote: {
        fontSize: SIZES.small,
        color: COLORS.white,
        opacity: 0.9,
        textAlign: 'center',
    },
    saveButton: {
        margin: SIZES.margin,
        backgroundColor: COLORS.success,
        padding: SIZES.padding * 1.2,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
});
