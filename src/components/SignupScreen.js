import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const SignupScreen = ({ onSignupSuccess, onBackToLogin, baseUrl }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert("알림", "모든 항목을 입력해야 합니다.");
            return;
        }

        try {
            // API 명세서에 따른 회원가입 요청
            const res = await fetch(`${baseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                Alert.alert("환영합니다!", "회원가입이 완료되었습니다. 로그인해주세요.");
                onSignupSuccess();
            } else {
                Alert.alert("가입 실패", data.message || "이미 사용 중인 정보이거나 형식이 잘못되었습니다.");
            }
        } catch (err) {
            Alert.alert("에러", "서버 연결에 실패했습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>히스톨로그의 새로운 가족이 되어주세요</Text>

            <TextInput style={styles.input} placeholder="사용자 이름" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="이메일 주소" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>가입 완료</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBackToLogin}>
                <Text style={styles.linkText}>이미 계정이 있나요? 로그인으로 돌아가기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f4f1ea' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#5D4037', textAlign: 'center', marginBottom: 5 },
    subtitle: { fontSize: 14, textAlign: 'center', color: '#8D6E63', marginBottom: 40 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#DDD' },
    button: { backgroundColor: '#5D4037', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    linkText: { color: '#5D4037', textAlign: 'center', marginTop: 25 }
});

export default SignupScreen;