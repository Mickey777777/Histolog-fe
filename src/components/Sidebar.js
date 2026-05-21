import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authFetch } from '../utils/authFetch';
import { getKingByKey } from '../constants/kings';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const MAX_TOKEN = 10000;

const getBarColor = (ratio) => {
    if (ratio < 0.5) return '#4CAF50';
    if (ratio < 0.85) return '#FFC107';
    return '#D32F2F';
};

const Sidebar = ({ sessions, onNewChat, onSessionPress, onLogout, isOpen }) => {
    const insets = useSafeAreaInsets();
    const [tokenUsage, setTokenUsage] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        authFetch(`${BASE_URL}/api/user/usage`)
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setTokenUsage(data.token_usage); })
            .catch(() => {});
    }, [isOpen]);
    return (
        <View style={[styles.sidebarInner, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Histolog</Text>
                <TouchableOpacity style={styles.newBtn} onPress={onNewChat}>
                    <Text style={styles.newBtnText}>+ 새 대화 시작</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.sessionList}
                indicatorStyle="black"
                data={sessions}
                keyExtractor={(item) => item.chat_id ? item.chat_id.toString() : Math.random().toString()}
                renderItem={({ item }) => {
                    const king = getKingByKey(item.king);
                    return (
                        <TouchableOpacity
                            style={styles.sessionItem}
                            onPress={() => onSessionPress(item.chat_id, item.king)}
                        >
                            <Text style={styles.sessionTitle} numberOfLines={1}>
                                {item.title || '지난 대화'}
                            </Text>
                            <View style={styles.sessionMeta}>
                                {king && (
                                    <Text style={[styles.sessionKing, { color: king.color }]}>
                                        {king.name}
                                    </Text>
                                )}
                                <Text style={styles.sessionDate}>{item.created_at}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={<Text style={styles.emptyText}>진행 중인 대화가 없습니다.</Text>}
            />

            <View style={styles.usageContainer}>
                <View style={styles.usageHeader}>
                    <Text style={styles.usageLabel}>토큰 사용량</Text>
                    <Text style={styles.usageValue}>
                        {tokenUsage !== null ? `${tokenUsage.toLocaleString()} / ${MAX_TOKEN.toLocaleString()}` : '-'}
                    </Text>
                </View>
                <View style={styles.barTrack}>
                    {tokenUsage !== null && (() => {
                        const ratio = Math.min(tokenUsage / MAX_TOKEN, 1);
                        return (
                            <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: getBarColor(ratio) }]} />
                        );
                    })()}
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebarInner: { flex: 1, paddingTop: 20, paddingHorizontal: 20, backgroundColor: '#F9F9F9' },
    sessionList: { flex: 1 },
    sidebarHeader: { marginBottom: 30, marginTop: 20 },
    sidebarTitle: { fontSize: 22, fontWeight: 'bold', color: '#5D4037', marginBottom: 20 },
    newBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#5D4037', alignItems: 'center' },
    newBtnText: { color: '#5D4037', fontWeight: '600' },
    sessionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    sessionTitle: { fontSize: 14, color: '#444', fontWeight: '500' },
    sessionMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    sessionKing: { fontSize: 10, fontWeight: '700', marginRight: 6 },
    sessionDate: { fontSize: 10, color: '#999' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 13 },
    usageContainer: { marginTop: 16, marginBottom: 12 },
    usageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    usageLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
    usageValue: { fontSize: 12, color: '#666' },
    barTrack: { height: 8, borderRadius: 4, backgroundColor: '#E0E0E0', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 4 },
    logoutBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D32F2F', alignItems: 'center' },
    logoutText: { color: '#D32F2F', fontWeight: '600' },
});

export default Sidebar;