import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ChatInput = ({ value, onChangeText, onSend, disabled }) => {
    return (
        <View style={styles.inputWrapper}>
            <View style={styles.inputCard}>
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="역사학자에게 질문을 던져보세요..."
                    placeholderTextColor="#999"
                    multiline // 여러 줄 입력 가능
                    maxLength={1000}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!value || disabled) && styles.disabledBtn]}
                    onPress={onSend}
                    disabled={!value || disabled}
                >
                    {/* 클로드 특유의 위쪽 화살표 아이콘 느낌 */}
                    <Text style={styles.sendIcon}>↑</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: { padding: 16, backgroundColor: '#FFFFFF' },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
        paddingTop: 10,
        paddingBottom: 10,
        maxHeight: 150 // 최대 높이 제한
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#5D4037',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 4
    },
    disabledBtn: { backgroundColor: '#E5E5E5' },
    sendIcon: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default ChatInput;