import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';

const SignupScreen = ({ onSignupSuccess, onBackToLogin, baseUrl }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [popup, setPopup] = useState({visible: false, title: '', message: '', onClose: null});

    const showPopup = (title, message, onClose) => {
        setPopup({visible: true, title, message, onClose});
    };
    
    const closePopup = () => {
        const callback = popup.onClose;
        setPopup({visible: false, title: '', message: '', onClose: null});
        if(callback) callback();
    };

    const handleSignup = async () => {
        if (!username || !email || !password) {
            showPopup("에러", "모든 항목을 입력해야 합니다.")
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
                showPopup("환영합니다!", "회원가입이 완료되었습니다. 로그인해주세요.", onSignupSuccess);
            }else{
                showPopup("로그인 실패", data.message || "아이디 또는 비밀번호를 확인하세요.");
            }
        } catch (err) {
            showPopup("에러", "서버와 연결할 수 없습니다. 네트워크 상태를 확인하세요.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>히스톨로그의 새로운 가족이 되어주세요</Text>

            <TextInput style={styles.input} placeholder="사용자 이름" placeholderTextColor="#9E9E9E" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="이메일 주소" placeholderTextColor="#9E9E9E" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="비밀번호" placeholderTextColor="#9E9E9E" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>가입 완료</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBackToLogin}>
                <Text style={styles.linkText}>이미 계정이 있나요? 로그인으로 돌아가기</Text>
            </TouchableOpacity>

            <Modal visible={popup.visible} transparent animationType="fade" onRequestClose={closePopup}>
                <View style={styles.overlay}>
                    <View style={styles.popupBox}>
                        <View style={styles.popupIconCircle}>
                            <Text style={styles.popupIcon}>!</Text>
                        </View>
                        <Text style={styles.popupTitle}>{popup.title}</Text>
                        <Text style={styles.popupMessage}>{popup.message}</Text>
                        <TouchableOpacity style={styles.popupButton} onPress={closePopup}>
                            <Text style={styles.popupButtonText}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    linkText: { color: '#5D4037', textAlign: 'center', marginTop: 25 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    popupBox: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 32, paddingHorizontal: 28, width: '82%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    popupIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#5D4037', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    popupIcon: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    popupTitle: { fontSize: 20, fontWeight: 'bold', color: '#5D4037', marginBottom: 10 },
    popupMessage: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
    popupButton: { backgroundColor: '#5D4037', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 10 },
    popupButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

export default SignupScreen;