import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

let _accessToken = null;
let _refreshToken = null;
let _onLogout = null;

export function setTokens(accessToken, refreshToken) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
}

export function setLogoutCallback(cb) {
    _onLogout = cb;
}

export async function authFetch(url, options = {}) {
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${_accessToken}`,
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && _refreshToken) {
        try {
            const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: _refreshToken }),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                _accessToken = data.access_token;
                _refreshToken = data.refresh_token;
                await AsyncStorage.setItem('session', _accessToken);
                await AsyncStorage.setItem('refreshToken', _refreshToken);

                const retryHeaders = {
                    ...options.headers,
                    'Authorization': `Bearer ${_accessToken}`,
                };
                return fetch(url, { ...options, headers: retryHeaders });
            }
        } catch {
            // refresh 요청 자체가 실패한 경우
        }
        if (_onLogout) _onLogout();
    }

    return res;
}
