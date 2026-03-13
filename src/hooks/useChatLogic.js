import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useChatLogic = (baseUrl, token) => {
    const [messages, setMessages] = useState([]); // 현재 대화 내용
    const [sessions, setSessions] = useState([]); // 대화 목록 (사이드바용)
    const [sessionId, setSessionId] = useState(''); // 현재 활성화된 세션 ID
    const [loading, setLoading] = useState(false);

    // 1. 대화 목록 조회 (GET /api/chat/sessions)
    const fetchSessions = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/chat/sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setSessions(data.sessions || []);
        } catch (err) {
            console.error("목록 로드 실패:", err);
        }
    };

    // 2. 새 대화 시작 (POST /api/chat/sessions)
    const startNewChat = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/chat/sessions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSessionId(data.session);
                setMessages([]); // 화면 초기화
                fetchSessions(); // 목록 갱신
            }
        } catch (err) {
            Alert.alert("에러", "새 세션 생성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 3. 메시지 전송 (POST /api/chat/sessions/{sessionId}/messages)
    const sendMessage = async (content) => {
        if (!content || !sessionId) return;

        setMessages(prev => [...prev, { role: 'user', content }]);
        setLoading(true);

        try {
            const res = await fetch(`${baseUrl}/api/chat/sessions/${sessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            const data = await res.json();

            if (res.ok) {
                // 백엔드 응답 data 필드 사용
                setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
            }
        } catch (err) {
            console.error("전송 에러:", err);
        } finally {
            setLoading(false);
        }
    };

    // 첫 마운트 시 목록 가져오기
    useEffect(() => {
        if (token) fetchSessions();
    }, [token]);

    return { messages, sessions, loading, startNewChat, sendMessage, fetchSessions };
};