import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MessageItem = ({ role, content }) => (
    <View style={styles.messageRow}>
        <View style={styles.avatarContainer}>
            {/* 사용자(User)와 히스톨로그(Histolog)의 첫 글자를 아바타로 사용합니다. */}
            <Text style={styles.avatarText}>{role === 'user' ? 'U' : 'H'}</Text>
        </View>
        <View style={styles.contentContainer}>
            <Text style={styles.roleLabel}>{role === 'user' ? '나' : 'Histolog'}</Text>
            <Text style={styles.messageText}>{content}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    messageRow: { flexDirection: 'row', marginBottom: 28 },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2
    },
    avatarText: { fontSize: 14, fontWeight: 'bold', color: '#5D4037' },
    contentContainer: { flex: 1 },
    roleLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
    messageText: { fontSize: 16, lineHeight: 24, color: '#333333' },
});