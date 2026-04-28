import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useChatLogic = (baseUrl, session) => {
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [sessionId, setSessionId] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. 대화 목록 가져오기
    const fetchSessions = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/chats`, {
                headers: { 'Authorization': `Bearer ${session}` }
            });
            const data = await res.json();
            if (res.ok) setSessions(data.sessions || []);
        } catch (err) {
            console.error("세션 목록 로드 실패:", err);
        }
    };

    // 2. 새 대화 시작 (이 함수가 정의되어 있어야 합니다!)
    const startNewChat = async () => {
        console.log('startNewChat session:', session);
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/chats`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSessionId(data.chat_id);
                setMessages([]);
                fetchSessions();
            }
        } catch (err) {
            console.error("새 대화 시작 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // 3. 메시지 전송
    const sendMessage = async (message) => {
        if (!message) return;
        setMessages(prev => [...prev, { role: 'user', message }]);
        setLoading(true);

        try {
            const res = await fetch(`${baseUrl}/api/chats/${sessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session}`
                },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', message: data.message }]);
            }
        } catch (err) {
            Alert.alert("연결 실패", "서버에 연결할 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트가 처음 뜰 때 실행
    useEffect(() => {
        if(session) startNewChat();
    }, [session]);

    // 마지막에 이 함수들을 모두 내보내야 ChatScreen에서 쓸 수 있습니다.
    return { messages, sessions, loading, startNewChat, sendMessage, fetchSessions };
};