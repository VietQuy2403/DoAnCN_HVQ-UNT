import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { hashPassword } from '../services/auth';
import { COLORS, SIZES } from '../constants';

export default function AccountSettingsScreen({ navigation }) {
    const { user, signOut } = useAuth();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [showChangeName, setShowChangeName] = useState(false);

    // Loading states
    const [loadingName, setLoadingName] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);

    // States for change password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // States for change email
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [showEmailPassword, setShowEmailPassword] = useState(false);

    // States for change name
    const [newName, setNewName] = useState('');

    // Convex mutations
    const updateUserName = useMutation(api.accountSettings.updateUserName);
    const updateUserPassword = useMutation(api.accountSettings.updateUserPassword);
    const updateUserEmail = useMutation(api.accountSettings.updateUserEmail);

    const validateEmail = (email) => {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return gmailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        return passwordRegex.test(password);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
            return;
        }

        if (!validatePassword(newPassword)) {
            Alert.alert(
                'Lỗi mật khẩu',
                'Mật khẩu mới phải đáp ứng:\n' +
                '- Ít nhất 8 ký tự\n' +
                '- Có ít nhất 1 chữ cái viết hoa\n' +
                '- Có ít nhất 1 chữ số\n' +
                '- Có ít nhất 1 ký tự đặc biệt'
            );
            return;
        }

        setLoadingPassword(true);
        try {
            await updateUserPassword({
                userId: user.userId,
                currentPasswordHash: hashPassword(currentPassword),
                newPasswordHash: hashPassword(newPassword),
            });
            Alert.alert('Thành công', 'Đổi mật khẩu thành công');
            setShowChangePassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail || !emailPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (!validateEmail(newEmail)) {
            Alert.alert('Lỗi', 'Email phải là địa chỉ Gmail hợp lệ (ví dụ: user@gmail.com)');
            return;
        }

        setLoadingEmail(true);
        try {
            await updateUserEmail({
                userId: user.userId,
                newEmail: newEmail.trim(),
                passwordHash: hashPassword(emailPassword),
            });
            Alert.alert('Thành công', 'Đổi email thành công');
            setShowChangeEmail(false);
            setNewEmail('');
            setEmailPassword('');
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể đổi email');
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleChangeName = async () => {
        if (!newName) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên mới');
            return;
        }

        setLoadingName(true);
        try {
            await updateUserName({
                userId: user.userId,
                newName: newName.trim(),
            });
            Alert.alert('Thành công', 'Đổi tên thành công');
            setShowChangeName(false);
            setNewName('');
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể đổi tên');
        } finally {
            setLoadingName(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            // Navigation sẽ tự động chuyển về Login do AuthContext
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể đăng xuất');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Xóa tài khoản',
            'CẢNH BÁO: Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa tài khoản',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // TODO: Gọi API xóa tài khoản từ Convex
                            // await deleteUserAccount({ userId: user.userId });

                            // Sau khi xóa thành công, đăng xuất
                            await signOut();
                            Alert.alert('Thành công', 'Tài khoản đã được xóa');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa tài khoản');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={[COLORS.primary, '#003d52']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerIcon}>⚙️</Text>
                    <Text style={styles.headerTitle}>Cài đặt tài khoản</Text>
                    <Text style={styles.headerSubtitle}>Quản lý thông tin cá nhân của bạn</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

                    {/* Change Name Card */}
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.cardHeader}
                            onPress={() => setShowChangeName(!showChangeName)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardHeaderLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                    <Text style={styles.cardIcon}>✏️</Text>
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>Sửa tên hiển thị</Text>
                                    <Text style={styles.cardSubtitle}>Thay đổi tên của bạn</Text>
                                </View>
                            </View>
                            <Text style={styles.expandIcon}>{showChangeName ? '▼' : '›'}</Text>
                        </TouchableOpacity>

                        {showChangeName && (
                            <View style={styles.expandedContent}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên mới"
                                    placeholderTextColor={COLORS.textLight}
                                    value={newName}
                                    onChangeText={setNewName}
                                />
                                <TouchableOpacity
                                    style={[styles.submitButton, loadingName && styles.submitButtonDisabled]}
                                    onPress={handleChangeName}
                                    disabled={loadingName}
                                >
                                    {loadingName ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Change Password Card */}
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.cardHeader}
                            onPress={() => setShowChangePassword(!showChangePassword)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardHeaderLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                                    <Text style={styles.cardIcon}>🔒</Text>
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>Đổi mật khẩu</Text>
                                    <Text style={styles.cardSubtitle}>Cập nhật mật khẩu bảo mật</Text>
                                </View>
                            </View>
                            <Text style={styles.expandIcon}>{showChangePassword ? '▼' : '›'}</Text>
                        </TouchableOpacity>

                        {showChangePassword && (
                            <View style={styles.expandedContent}>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Mật khẩu hiện tại"
                                        placeholderTextColor={COLORS.textLight}
                                        secureTextEntry={!showCurrentPassword}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        <Text style={styles.eyeIcon}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Mật khẩu mới (8+ ký tự, Hoa, Số, @)"
                                        placeholderTextColor={COLORS.textLight}
                                        secureTextEntry={!showNewPassword}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Xác nhận mật khẩu mới"
                                        placeholderTextColor={COLORS.textLight}
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={[styles.submitButton, loadingPassword && styles.submitButtonDisabled]}
                                    onPress={handleChangePassword}
                                    disabled={loadingPassword}
                                >
                                    {loadingPassword ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Change Email Card */}
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.cardHeader}
                            onPress={() => setShowChangeEmail(!showChangeEmail)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardHeaderLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                                    <Text style={styles.cardIcon}>📧</Text>
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>Đổi email</Text>
                                    <Text style={styles.cardSubtitle}>Thay đổi địa chỉ email</Text>
                                </View>
                            </View>
                            <Text style={styles.expandIcon}>{showChangeEmail ? '▼' : '›'}</Text>
                        </TouchableOpacity>

                        {showChangeEmail && (
                            <View style={styles.expandedContent}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email mới"
                                    placeholderTextColor={COLORS.textLight}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={newEmail}
                                    onChangeText={setNewEmail}
                                />
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Mật khẩu xác nhận"
                                        placeholderTextColor={COLORS.textLight}
                                        secureTextEntry={!showEmailPassword}
                                        value={emailPassword}
                                        onChangeText={setEmailPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowEmailPassword(!showEmailPassword)}
                                    >
                                        <Text style={styles.eyeIcon}>{showEmailPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={[styles.submitButton, loadingEmail && styles.submitButtonDisabled]}
                                    onPress={handleChangeEmail}
                                    disabled={loadingEmail}
                                >
                                    {loadingEmail ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Đổi email</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.sectionContainer}>
                    {/* Sign Out Button */}
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={handleSignOut}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FF6B6B', '#EE5A6F']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonIcon}>🚪</Text>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.buttonTitle}>Đăng xuất</Text>
                                <Text style={styles.buttonSubtitle}>Thoát khỏi tài khoản của bạn</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Delete Account Button */}
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.8}
                    >
                        <View style={styles.deleteButtonContent}>
                            <Text style={styles.deleteIcon}>🗑️</Text>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.deleteTitle}>Xóa tài khoản</Text>
                                <Text style={styles.deleteSubtitle}>Xóa vĩnh viễn tất cả dữ liệu</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: SIZES.padding * 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    headerContent: {
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: SIZES.body,
        color: COLORS.white,
        opacity: 0.9,
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    sectionContainer: {
        marginBottom: 24,
        paddingHorizontal: SIZES.padding,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        marginLeft: 4,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius * 2,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SIZES.padding * 1.5,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardIcon: {
        fontSize: 24,
    },
    cardTitle: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    expandIcon: {
        fontSize: 20,
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    expandedContent: {
        paddingHorizontal: SIZES.padding * 1.5,
        paddingBottom: SIZES.padding * 1.5,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        fontSize: SIZES.body,
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    passwordInput: {
        flex: 1,
        padding: SIZES.padding,
        fontSize: SIZES.body,
        color: COLORS.text,
    },
    eyeButton: {
        padding: SIZES.padding,
    },
    eyeIcon: {
        fontSize: 20,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    signOutButton: {
        borderRadius: SIZES.borderRadius * 2,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding * 1.5,
    },
    buttonIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    buttonTextContainer: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    buttonSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.white,
        opacity: 0.9,
    },
    deleteButton: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius * 2,
        borderWidth: 2,
        borderColor: '#FFE0E0',
        overflow: 'hidden',
    },
    deleteButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding * 1.5,
    },
    deleteIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    deleteTitle: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.error,
        marginBottom: 4,
    },
    deleteSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
});
