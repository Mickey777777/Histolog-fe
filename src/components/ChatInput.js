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
                    placeholderTextColor="#A89080"
                    multiline
                    maxLength={1000}
                    blurOnSubmit={true}
                    onSubmitEditing={onSend}
                    returnKeyType="send"
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!value || disabled) && styles.disabledBtn]}
                    onPress={onSend}
                    disabled={!value || disabled}
                >
                    <Text style={styles.sendIcon}>↑</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: { padding: 16, backgroundColor: '#FAFAF8' },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8DDD5',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#3E2723',
        paddingTop: 10,
        paddingBottom: 10,
        maxHeight: 150,
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#5D4037',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 4,
    },
    disabledBtn: { backgroundColor: '#D7CCC8' },
    sendIcon: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default ChatInput;
