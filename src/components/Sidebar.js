import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const Sidebar = ({ sessions, onNewChat, onSessionPress, onLogout }) => {
    return (
        <View style={styles.sidebarInner}>
            <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Histolog</Text>
                <TouchableOpacity style={styles.newBtn} onPress={onNewChat}>
                    <Text style={styles.newBtnText}>+ 새 대화 시작</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={sessions}
                keyExtractor={(item) => item.session_id ? item.session_id.toString() : Math.random().toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.sessionItem}
                        onPress={() => onSessionPress(item.session_id)}
                    >
                        <Text style={styles.sessionTitle} numberOfLines={1}>
                            {item.title || '지난 대화'}
                        </Text>
                        <Text style={styles.sessionDate}>{item.created_at}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>진행 중인 대화가 없습니다.</Text>}
            />

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebarInner: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
    sidebarHeader: { marginBottom: 30, marginTop: 20 },
    sidebarTitle: { fontSize: 22, fontWeight: 'bold', color: '#5D4037', marginBottom: 20 },
    newBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#5D4037', alignItems: 'center' },
    newBtnText: { color: '#5D4037', fontWeight: '600' },
    sessionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    sessionTitle: { fontSize: 14, color: '#444', fontWeight: '500' },
    sessionDate: { fontSize: 10, color: '#999', marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 13 },
    logoutBtn: { marginTop: 20, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D32F2F', alignItems: 'center' },
    logoutText: { color: '#D32F2F', fontWeight: '600' },
});

export default Sidebar;