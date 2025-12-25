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

    const handleSignUp = async () => {
        if (!email || !password || !name) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, name);
            
            // Hiển thị thông báo thành công và chuyển về Login
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
            Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
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

                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                />

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
