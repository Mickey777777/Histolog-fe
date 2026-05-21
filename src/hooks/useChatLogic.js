import { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';

export const useChatLogic = (baseUrl, session) => {
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [sessionId, setSessionId] = useState('');
    const [currentKing, setCurrentKing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    // 1. 대화 목록 가져오기
    const fetchSessions = async () => {
        try {
            const res = await authFetch(`${baseUrl}/api/chats`);
            const data = await res.json();
            if (res.ok) setSessions(data.chats || []);
        } catch (err) {
            setError("세션 목록을 불러오지 못했습니다.");
        }
    };

    // 2. 새 대화 시작 (king 필수)
    const startNewChat = async (king) => {
        if (!king) {
            setError("대화할 인물을 선택해주세요.");
            return;
        }
        // 이전 채팅 상태 즉시 초기화 (이전 메시지/타이핑 인디케이터 잔상 방지)
        setMessages([]);
        setSessionId('');
        setCurrentKing(king);
        setLoading(true);
        try {
            const res = await authFetch(`${baseUrl}/api/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ king }),
            });
            const data = await res.json();
            if (res.ok) {
                setSessionId(data.chat_id);
                fetchSessions();
            } else {
                setCurrentKing(null);
                setError("새 대화를 시작하지 못했습니다.");
            }
        } catch (err) {
            setCurrentKing(null);
            setError("새 대화를 시작하지 못했습니다.");
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
            const res = await authFetch(`${baseUrl}/api/chats/${sessionId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', message: data.message }]);
            } else if (data?.code === 'T001') {
                setError("세션 한도에 도달했습니다.");
            } else {
                setError("서버에 연결할 수 없습니다.");
            }
        } catch (err) {
            setError("서버에 연결할 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트가 처음 뜰 때 실행: 대화 목록만 로드
    // (새 대화 생성은 사용자가 왕을 선택해야 시작됨)
    useEffect(() => {
        if (session) fetchSessions();
    }, [session]);

    // 4. 특정 채팅 내역 불러오기
    const loadChat = async (chatId, king) => {
        // 이전 채팅 상태 즉시 초기화 (이전 메시지/타이핑 인디케이터 잔상 방지)
        setMessages([]);
        setSessionId('');
        setCurrentKing(king ?? null);
        setLoading(true);
        try {
            const res = await authFetch(`${baseUrl}/api/chats/${chatId}/messages`);
            const data = await res.json();
            if (res.ok) {
                setSessionId(chatId);
                setMessages(data.map(m => ({
                    role: m.type.toLowerCase(),
                    message: m.message,
                })));
            }
        } catch (err) {
            setError("대화 내역을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 5. "새 대화" — 인물 선택 화면으로 되돌림
    const resetChat = () => {
        setMessages([]);
        setSessionId('');
        setCurrentKing(null);
        setError(null);
    };

    // 마지막에 이 함수들을 모두 내보내야 ChatScreen에서 쓸 수 있습니다.
    return { messages, sessions, sessionId, currentKing, loading, error, clearError, startNewChat, sendMessage, fetchSessions, loadChat, resetChat };
};