import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const SignupScreen = ({ onSignupSuccess, onBackToLogin, baseUrl }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }) // 명세서 요구 필드 
            });
            const data = await res.json();

            if (res.ok) {
                Alert.alert("성공", "회원가입이 완료되었습니다!");
                onSignupSuccess();
            } else {
                Alert.alert("실패", data.message || "가입 정보를 확인해주세요.");
            }
        } catch (err) {
            Alert.alert("에러", "서버와 연결할 수 없습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <TextInput style={styles.input} placeholder="사용자 이름" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>가입하기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBackToLogin}>
                <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f4f1ea' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#5d4037', textAlign: 'center' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
    button: { backgroundColor: '#5d4037', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    linkText: { color: '#5d4037', textAlign: 'center', marginTop: 20 }
});

export default SignupScreen;