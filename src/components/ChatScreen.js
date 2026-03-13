import React, { useState, useRef } from 'react';
import {
    View, Text, FlatList, StyleSheet, SafeAreaView, Animated,
    Dimensions, PanResponder, KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';

// 같은 폴더에 있는 UI 부품들
import Sidebar from './Sidebar';
import ChatInput from './ChatInput';
import { MessageItem } from './MessageItem';

// 상위 hooks 폴더에 있는 로직 엔진
import { useChatLogic } from '../hooks/useChatLogic';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

export default function ChatScreen({ baseUrl, token }) {
    // API 명세서를 기반으로 한 데이터 통신 훅
    const { messages, sessions, loading, startNewChat, sendMessage } = useChatLogic(baseUrl, token);

    const [inputText, setInputText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

    // 좌측 드래그 제스처 핸들러
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (_, gesture) => !isSidebarOpen && gesture.x0 < 40,
            onPanResponderMove: (_, gesture) => {
                let val = isSidebarOpen ? gesture.dx : -SIDEBAR_WIDTH + gesture.dx;
                if (val <= 0 && val >= -SIDEBAR_WIDTH) slideAnim.setValue(val);
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > 50) openSidebar();
                else closeSidebar();
            }
        })
    ).current;

    const openSidebar = () => {
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 250, useNativeDriver: true }).start();
        setIsSidebarOpen(false);
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    };

    return (
        <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
            {/* 사이드바 영역 */}
            <Animated.View style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}>
                <Sidebar
                    sessions={sessions}
                    onNewChat={() => { startNewChat(); closeSidebar(); }}
                    onSessionPress={(id) => { closeSidebar(); }}
                />
            </Animated.View>

            {/* 메인 채팅 영역 */}
            <View style={styles.main}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Histolog</Text>
                    <View style={{ width: 40 }} />
                </View>

                <FlatList
                    data={messages}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item }) => <MessageItem role={item.role} content={item.content} />}
                    contentContainerStyle={styles.chatList}
                />

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
                    <ChatInput
                        value={inputText}
                        onChangeText={setInputText}
                        onSend={handleSend}
                        disabled={loading}
                    />
                </KeyboardAvoidingView>
            </View>

            {isSidebarOpen && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={closeSidebar}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    sidebarContainer: { position: 'absolute', left: 0, width: SIDEBAR_WIDTH, height: '100%', zIndex: 10 },
    main: { flex: 1 },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#F0F0F0' },
    menuButton: { paddingLeft: 15, paddingRight: 10 },
    menuIcon: { fontSize: 24, color: '#333' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
    chatList: { padding: 20 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 5 }
});