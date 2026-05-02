import React, { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokens, setLogoutCallback } from './src/utils/authFetch';

// src/components 폴더에 저장될 화면들을 불러옵니다.
import LoginScreen from './src/components/LoginScreen';
import SignupScreen from './src/components/SignupScreen';
import ChatScreen from './src/components/ChatScreen';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login', 'signup', 'chat', 'googleLogin'
  const [token, setToken] = useState(''); // 로그인 후 받은 access_token 저장
  const url = Linking.useURL();

  // 앱 시작 시 저장된 토큰 복원
  useEffect(() => {
    const restore = async () => {
      const savedToken = await AsyncStorage.getItem('session');
      const savedRefreshToken = await AsyncStorage.getItem('refreshToken');
      if (savedToken) {
        setTokens(savedToken, savedRefreshToken);
        setToken(savedToken);
        setScreen('chat');
      }
    };
    restore();
  }, []);

  // 로그인 성공 시 호출
  const handleLoginSuccess = async (accessToken, refreshToken) => {
    await AsyncStorage.setItem('session', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
    setTokens(accessToken, refreshToken);
    setToken(accessToken);
    setScreen('chat');
  };

  // 로그아웃 시 호출
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['session', 'refreshToken']);
    setTokens(null, null);
    setToken('');
    setScreen('login');
  };

  setLogoutCallback(handleLogout);

  useEffect(() => {
    if (!url) {
      return;
    }

    const { queryParams } = Linking.parse(url);
    const accessToken = queryParams?.token;
    const refreshToken = queryParams?.refresh_token;

    if (!accessToken || typeof accessToken !== 'string') {
      return;
    }

    handleLoginSuccess(
      decodeURIComponent(accessToken),
      refreshToken ? decodeURIComponent(refreshToken) : null
    );

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/');
    }
  }, [url]);

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
        onLogout={handleLogout}
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
