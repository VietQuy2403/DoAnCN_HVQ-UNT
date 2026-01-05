import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES } from '../constants';

export default function SignUpScreen({ navigation }) {
    const { signUp, signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateEmail = (email) => {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return gmailRegex.test(email);
    };

    const validatePassword = (password) => {
        // Ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSignUp = async () => {
        if (!email || !password || !name) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Lỗi', 'Email phải là địa chỉ Gmail hợp lệ (ví dụ: user@gmail.com)');
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert(
                'Lỗi mật khẩu',
                'Mật khẩu phải đáp ứng các yêu cầu sau:\n' +
                '- Ít nhất 8 ký tự\n' +
                '- Có ít nhất 1 chữ cái viết hoa\n' +
                '- Có ít nhất 1 chữ số\n' +
                '- Có ít nhất 1 ký tự đặc biệt'
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, name);

            // Hiện thông báo thành công và chuyển về Login
            Alert.alert(
                'Đăng ký thành công!',
                'Vui lòng đăng nhập để tiếp tục',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Login')
                    }
                ]
            );
        } catch (error) {
            // Làm sạch thông báo lỗi: chỉ lấy dòng đầu tiên và bỏ các tiền tố debug
            let errorMessage = error.message || 'Đã xảy ra lỗi';

            // Nếu là ConvexError, lấy phần nội dung chính
            if (errorMessage.includes('ConvexError:')) {
                errorMessage = errorMessage.split('ConvexError:')[1];
            }

            // Chỉ lấy dòng đầu tiên (loại bỏ "at handler...", "Called by client"...)
            errorMessage = errorMessage.split('\n')[0].trim();

            Alert.alert('Thông báo', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.logo}>🥗</Text>
                <Text style={styles.title}>Tạo tài khoản mới</Text>
                <Text style={styles.subtitle}>
                    Bắt đầu hành trình dinh dưỡng của bạn
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Tên của bạn"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Mật khẩu (8+ ký tự, Hoa, Số, Đặc biệt)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading ? styles.buttonDisabled : null]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.buttonText}>Đăng ký</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={styles.switchText}>
                        Đã có tài khoản? Đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: SIZES.padding * 2,
    },
    logo: {
        fontSize: 80,
        textAlign: 'center',
        marginBottom: SIZES.margin,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.primary,
        marginBottom: SIZES.margin / 2,
    },
    subtitle: {
        fontSize: SIZES.body,
        textAlign: 'center',
        color: COLORS.textLight,
        marginBottom: SIZES.margin * 2,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        marginBottom: SIZES.margin,
        fontSize: SIZES.body,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        marginBottom: SIZES.margin,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    passwordInput: {
        flex: 1,
        padding: SIZES.padding,
        fontSize: SIZES.body,
    },
    eyeButton: {
        padding: SIZES.padding,
    },
    eyeIcon: {
        fontSize: 20,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        alignItems: 'center',
        marginTop: SIZES.margin,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: SIZES.h4,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: SIZES.margin * 2,
        alignItems: 'center',
    },
    switchText: {
        color: COLORS.primary,
        fontSize: SIZES.body,
    },
});
