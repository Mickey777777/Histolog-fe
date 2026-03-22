import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AntDesign, Ionicons } from '@expo/vector-icons'

const LoginScreen = ({ onLoginSuccess, onGoToSignup, baseUrl }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("알림", "아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            // API 명세서에 따른 로그인 요청
            const res = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                // 성공 시 상위 App.js로 토큰을 전달합니다.
                onLoginSuccess(data.access_token);
            } else {
                Alert.alert("로그인 실패", data.message || "아이디 또는 비밀번호를 확인하세요.");
            }
        } catch (err) {
            Alert.alert("에러", "서버와 연결할 수 없습니다. 네트워크 상태를 확인하세요.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const appRedirect = Linking.createURL('google-auth');
            const authUrl = `${baseUrl}/api/auth/google/initiate?appRedirect=${encodeURIComponent(appRedirect)}`;

            if (Platform.OS === 'web') {
                window.location.assign(authUrl);
                return;
            }

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                appRedirect
            );

            if (result.type === 'success') {
                const tokenMatch = result.url.match(/[?&]token=([^&]+)/);
                if (tokenMatch) {
                    onLoginSuccess(decodeURIComponent(tokenMatch[1]));
                } else {
                    Alert.alert('로그인 실패', '토큰을 받지 못했습니다. 다시 시도해주세요.');
                }
            } else if (result.type !== 'cancel') {
                Alert.alert('로그인 실패', '구글 로그인 창을 열지 못했습니다. 다시 시도해주세요.');
            }
        } catch (err) {
            console.error('Google login error:', err);
            Alert.alert('에러', '구글 로그인 창을 여는 중 문제가 발생했습니다.');
        }
    };

    const handleKakaoLogin = async () => {

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histolog</Text>
            <Text style={styles.subtitle}>역사와의 대화, 그 시작</Text>

            <TextInput
                style={styles.input}
                placeholder="사용자 이름(Username)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호(Password)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>로그인</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialLoginButton} onPress={handleGoogleLogin}>
                <View style={styles.socialLoginRow}>
                    <AntDesign name="google" size={20} color="#5D4037" style={styles.socialLoginIcon} />
                    <Text style={styles.socialLoginButtonText}>Google로 로그인</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialLoginButton} onPress={handleKakaoLogin}>
                <View style={styles.socialLoginRow}>
                    <Ionicons name="chatbubble" size={20} color="#3C1E1E" style={styles.socialLoginIcon} />
                    <Text style={styles.socialLoginButtonText}>Kakao로 로그인</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onGoToSignup}>
                <Text style={styles.linkText}>처음이신가요? 회원가입 하기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f4f1ea' },
    title: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: '#5D4037', marginBottom: 5 },
    subtitle: { fontSize: 14, textAlign: 'center', color: '#8D6E63', marginBottom: 40 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#DDD' },
    button: { backgroundColor: '#5D4037', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#DDD' },
    dividerText: { marginHorizontal: 10, color: '#8D6E63', fontSize: 13 },
    socialLoginButton: { backgroundColor: '#fff', padding: 15, marginBottom: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
    socialLoginRow: { flexDirection: 'row', alignItems: 'center' },
    socialLoginIcon: { marginRight: 8 },
    socialLoginButtonText: { color: '#5D4037', fontWeight: 'bold', fontSize: 16 },
    linkText: { color: '#5D4037', textAlign: 'center', marginTop: 25, fontWeight: '500' }
});

export default LoginScreen;