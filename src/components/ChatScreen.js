import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, Animated,
    Dimensions, PanResponder, KeyboardAvoidingView, Platform, TouchableOpacity, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TypingIndicator = () => {
    const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

    useEffect(() => {
        const animations = dots.map((dot, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 150),
                    Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
                    Animated.delay(450 - i * 150),
                ])
            )
        );
        animations.forEach(a => a.start());
        return () => animations.forEach(a => a.stop());
    }, []);

    return (
        <View style={typingStyles.row}>
            <View style={typingStyles.avatar}><Text style={typingStyles.avatarText}>H</Text></View>
            <View style={typingStyles.bubble}>
                {dots.map((dot, i) => (
                    <Animated.View key={i} style={[typingStyles.dot, { opacity: dot }]} />
                ))}
            </View>
        </View>
    );
};

const typingStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 28 },
    avatar: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: '#5D4037' },
    bubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F3F3', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5D4037' },
});

import Sidebar from './Sidebar';
import ChatInput from './ChatInput';
import { MessageItem } from './MessageItem';
import { useChatLogic } from '../hooks/useChatLogic';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

// 1. 초기 소개 화면 컴포넌트
const IntroView = () => (
    <View style={styles.introContainer}>
        <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>H</Text>
        </View>
        <Text style={styles.introTitle}>Histolog에 오신 것을 환영합니다</Text>
        <Text style={styles.introDescription}>
            조선시대의 인물들과 실시간으로 대화하며{"\n"}
            기록 속에 숨겨진 생생한 역사를 체험해보세요.
        </Text>

        <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 이렇게 질문해보세요</Text>
            <Text style={styles.tipText}>"세종대왕님, 한글을 만드신 진짜 이유가 무엇인가요?"</Text>
            <Text style={styles.tipText}>"이순신 장군님, 명량 해전 당시 심정은 어떠셨나요?"</Text>
        </View>
    </View>
);

export default function ChatScreen({ baseUrl, token, onLogout }) {
    const { messages, sessions, loading, error, clearError, startNewChat, sendMessage, loadChat } = useChatLogic(baseUrl, token);
    const [inputText, setInputText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

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
            <Animated.View style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}>
                <Sidebar
                    sessions={sessions}
                    onNewChat={() => { startNewChat(); closeSidebar(); }}
                    onSessionPress={(id) => { loadChat(id); closeSidebar(); }}
                    onLogout={onLogout}
                />
            </Animated.View>

            <View style={styles.main}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Histolog</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* 2. 조건부 렌더링: 메시지가 있으면 리스트를, 없으면 소개 화면을 보여줍니다. */}
                {messages.length > 0 ? (
                    <FlatList
                        data={messages}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({ item }) => <MessageItem role={item.role} content={item.message} />}
                        contentContainerStyle={styles.chatList}
                        ListFooterComponent={loading ? <TypingIndicator /> : null}
                    />
                ) : (
                    <IntroView />
                )}

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
                    <ChatInput
                        value={inputText}
                        onChangeText={setInputText}
                        onSend={handleSend}
                        disabled={loading}
                    />
                </KeyboardAvoidingView>
            </View>

            {isSidebarOpen && <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeSidebar} />}

            <Modal transparent animationType="fade" visible={!!error} onRequestClose={clearError}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>오류</Text>
                        <Text style={styles.modalMessage}>{error}</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={clearError}>
                            <Text style={styles.modalButtonText}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 5 },

    // --- 소개 화면 스타일 ---
    introContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoBadge: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoBadgeText: { fontSize: 30, fontWeight: 'bold', color: '#5D4037' },
    introTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
    introDescription: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
    tipContainer: {
        width: '100%',
        backgroundColor: '#F9F9F9',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    tipTitle: { fontSize: 14, fontWeight: '700', color: '#5D4037', marginBottom: 10 },
    tipText: { fontSize: 13, color: '#777', marginBottom: 8, lineHeight: 18 },

    // --- 오류 모달 스타일 ---
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: '80%', backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center' },
    modalTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
    modalMessage: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
    modalButton: { backgroundColor: '#5D4037', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 32 },
    modalButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});