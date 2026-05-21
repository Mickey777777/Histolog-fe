// 백엔드 King enum (com.example.histologbe.domain.chat.King) 과 1:1 매칭
// key 값이 그대로 서버로 전송되므로 백엔드와 일치 필수.

export const KINGS = [
    {
        key: 'JEONGJO',
        name: '정조',
        title: '조선 22대 왕',
        description: '개혁군주 · 규장각과 화성을 세운 학구파 임금',
        color: '#3F5C8C',
        examples: [
            '수원 화성을 세우신 까닭이 무엇입니까?',
            '규장각에서는 어떤 일을 하셨나요?',
        ],
    },
    {
        key: 'DANJONG',
        name: '단종',
        title: '조선 6대 왕',
        description: '12세에 즉위한 비운의 어린 왕',
        color: '#6B7785',
        examples: [
            '열두 살에 왕위에 오르신 심정이 어떠셨나요?',
            '상왕으로 물러나신 뒤의 삶이 궁금합니다.',
        ],
    },
];

export const getKingByKey = (key) => KINGS.find((k) => k.key === key);
