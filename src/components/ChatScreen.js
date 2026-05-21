import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, Animated,
    Dimensions, PanResponder, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, Keyboard, ActivityIndicator
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
    avatar: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0EBE3', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: '#5D4037' },
    bubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0EBE3', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5D4037' },
});

import Sidebar from './Sidebar';
import ChatInput from './ChatInput';
import { MessageItem } from './MessageItem';
import { useChatLogic } from '../hooks/useChatLogic';
import { KINGS, getKingByKey } from '../constants/kings';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

const IntroView = ({ kingKey, sessionId, loading, onSelectKing }) => {
    const activeKing = getKingByKey(kingKey);

    // 인물을 골라 새 대화가 만들어진 상태 — 첫 질문을 유도
    if (sessionId && activeKing) {
        return (
            <View style={styles.introContainer}>
                <View style={[styles.readyAvatar, { backgroundColor: activeKing.color }]}>
                    <Text style={styles.readyAvatarText}>{activeKing.name.charAt(0)}</Text>
                </View>
                <Text style={styles.introTitle}>{activeKing.name} 임금과 대화를 시작하세요</Text>
                <Text style={styles.introDescription}>
                    {activeKing.title} · {activeKing.description}
                </Text>

                <View style={styles.tipContainer}>
                    <Text style={styles.tipTitle}>💡 이렇게 질문해보세요</Text>
                    {activeKing.examples.map((ex, i) => (
                        <Text key={i} style={styles.tipText}>"{ex}"</Text>
                    ))}
                </View>
            </View>
        );
    }

    // 인물 선택 화면
    return (
        <View style={styles.introContainer}>
            <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>H</Text>
            </View>
            <Text style={styles.introTitle}>대화할 인물을 선택하세요</Text>
            <Text style={styles.introDescription}>
                조선왕조실록 기록을 바탕으로{"\n"}
                그 시대를 살아간 인물과 직접 대화합니다.
            </Text>

            <View style={styles.kingList}>
                {KINGS.map((king) => {
                    const isPending = loading && kingKey === king.key;
                    return (
                        <TouchableOpacity
                            key={king.key}
                            style={[styles.kingCard, loading && !isPending && styles.kingCardDimmed]}
                            onPress={() => onSelectKing(king.key)}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <View style={[styles.kingAvatar, { backgroundColor: king.color }]}>
                                <Text style={styles.kingAvatarText}>{king.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.kingCardContent}>
                                <Text style={styles.kingCardName}>{king.name}</Text>
                                <Text style={styles.kingCardTitle}>{king.title}</Text>
                                <Text style={styles.kingCardDesc}>{king.description}</Text>
                            </View>
                            {isPending
                                ? <ActivityIndicator color="#8D6E63" style={{ marginLeft: 8 }} />
                                : <Text style={styles.kingCardChevron}>›</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default function ChatScreen({ baseUrl, token, onLogout }) {
    const { messages, sessions, sessionId, currentKing, loading, error, clearError, startNewChat, sendMessage, loadChat, resetChat } = useChatLogic(baseUrl, token);
    const [inputText, setInputText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isSidebarOpenRef = useRef(false);
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

    const activeKing = getKingByKey(currentKing);

    const openSidebar = () => {
        Keyboard.dismiss();
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
        isSidebarOpenRef.current = true;
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 250, useNativeDriver: true }).start();
        isSidebarOpenRef.current = false;
        setIsSidebarOpen(false);
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                !isSidebarOpenRef.current &&
                gesture.x0 < 40 &&
                gesture.dx > 0 &&
                Math.abs(gesture.dx) > Math.abs(gesture.dy),
            onPanResponderMove: (_, gesture) => {
                const val = -SIDEBAR_WIDTH + gesture.dx;
                if (val <= 0 && val >= -SIDEBAR_WIDTH) slideAnim.setValue(val);
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > 50) openSidebar();
                else closeSidebar();
            }
        })
    ).current;

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']} {...panResponder.panHandlers}>
            <Animated.View
                style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}
                pointerEvents={isSidebarOpen ? 'auto' : 'none'}
            >
                <Sidebar
                    sessions={sessions}
                    onNewChat={() => { closeSidebar(); resetChat(); }}
                    onSessionPress={(id, king) => { loadChat(id, king); closeSidebar(); }}
                    onLogout={onLogout}
                    isOpen={isSidebarOpen}
                />
            </Animated.View>

            <KeyboardAvoidingView
                style={styles.main}
                behavior="padding"
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    {activeKing ? (
                        <View style={styles.headerKing}>
                            <View style={[styles.headerKingAvatar, { backgroundColor: activeKing.color }]}>
                                <Text style={styles.headerKingAvatarText}>{activeKing.name.charAt(0)}</Text>
                            </View>
                            <Text style={styles.headerTitle}>{activeKing.name}</Text>
                        </View>
                    ) : (
                        <Text style={styles.headerTitle}>Histolog</Text>
                    )}
                    <View style={{ width: 40 }} />
                </View>

                {messages.length > 0 ? (
                    <FlatList
                        key={sessionId}
                        data={messages}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({ item }) => <MessageItem role={item.role} content={item.message} />}
                        contentContainerStyle={styles.chatList}
                        ListFooterComponent={
                            loading && messages[messages.length - 1]?.role === 'user'
                                ? <TypingIndicator />
                                : null
                        }
                        keyboardShouldPersistTaps="handled"
                    />
                ) : (
                    <IntroView
                        kingKey={currentKing}
                        sessionId={sessionId}
                        loading={loading}
                        onSelectKing={startNewChat}
                    />
                )}

                <ChatInput
                    value={inputText}
                    onChangeText={setInputText}
                    onSend={handleSend}
                    disabled={loading || !sessionId}
                />
            </KeyboardAvoidingView>

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
    container: { flex: 1, backgroundColor: '#FAFAF8' },
    sidebarContainer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, zIndex: 10 },
    main: { flex: 1 },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#EDE0D4' },
    menuButton: { paddingLeft: 15, paddingRight: 10 },
    menuIcon: { fontSize: 24, color: '#5D4037' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#3E2723' },
    chatList: { padding: 20 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 5 },

    introContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        overflow: 'hidden',
    },
    logoBadge: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#F0EBE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoBadgeText: { fontSize: 30, fontWeight: 'bold', color: '#5D4037' },
    introTitle: { fontSize: 20, fontWeight: 'bold', color: '#3E2723', marginBottom: 12, textAlign: 'center' },
    introDescription: { fontSize: 15, color: '#8D6E63', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
    tipContainer: {
        width: '100%',
        backgroundColor: '#F0EBE3',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8DDD5',
    },
    tipTitle: { fontSize: 14, fontWeight: '700', color: '#5D4037', marginBottom: 10 },
    tipText: { fontSize: 13, color: '#8D6E63', marginBottom: 8, lineHeight: 18 },

    kingList: { width: '100%', marginTop: 4 },
    kingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0EBE3',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8DDD5',
        marginBottom: 12,
    },
    kingCardDimmed: { opacity: 0.4 },
    kingAvatar: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    kingAvatarText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
    kingCardContent: { flex: 1 },
    kingCardName: { fontSize: 17, fontWeight: '700', color: '#3E2723', marginBottom: 2 },
    kingCardTitle: { fontSize: 12, color: '#8D6E63', marginBottom: 4 },
    kingCardDesc: { fontSize: 13, color: '#5D4037', lineHeight: 18 },
    kingCardChevron: { fontSize: 28, color: '#A1887F', marginLeft: 8 },
    readyAvatar: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    readyAvatarText: { fontSize: 30, fontWeight: 'bold', color: '#FFF' },
    headerKing: { flexDirection: 'row', alignItems: 'center' },
    headerKingAvatar: {
        width: 26,
        height: 26,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerKingAvatarText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: '80%', backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center' },
    modalTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
    modalMessage: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
    modalButton: { backgroundColor: '#5D4037', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 32 },
    modalButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
