import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

// src/components 폴더에 저장될 화면들을 불러옵니다.
import LoginScreen from './src/components/LoginScreen';
import SignupScreen from './src/components/SignupScreen';
import ChatScreen from './src/components/ChatScreen';

// 실제 백엔드 서버 주소를 입력하세요.
const BASE_URL = 'https://histolog.app';

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login', 'signup', 'chat'
  const [token, setToken] = useState(''); // 로그인 후 받은 access_token 저장

  // 로그인 성공 시 호출
  const handleLoginSuccess = (accessToken) => {
    setToken(accessToken);
    setScreen('chat');
  };

  // 화면 전환 제어
  if (screen === 'signup') {
    return (
      <SignupScreen
        baseUrl={BASE_URL}
        onSignupSuccess={() => setScreen('login')}
        onBackToLogin={() => setScreen('login')}
      />
    );
  }

  if (screen === 'chat') {
    return (
      <ChatScreen
        baseUrl={BASE_URL}
        token={token}
      />
    );
  }

  return (
    <LoginScreen
      baseUrl={BASE_URL}
      onLoginSuccess={handleLoginSuccess}
      onGoToSignup={() => setScreen('signup')}
    />
  );
}