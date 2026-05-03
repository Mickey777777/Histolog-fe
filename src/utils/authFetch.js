import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

let _accessToken = null;
let _refreshToken = null;
let _onLogout = null;
let _refreshPromise = null; // refresh 중 동시 호출 방지용 lock

export function setTokens(accessToken, refreshToken) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
}

export function setLogoutCallback(cb) {
    _onLogout = cb;
}

// refresh 중이면 기존 Promise 공유, 아니면 새 refresh 시작
async function doRefresh() {
    if (_refreshPromise) return _refreshPromise;

    _refreshPromise = (async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: _refreshToken }),
            });

            if (res.ok) {
                const data = await res.json();
                _accessToken = data.access_token;
                _refreshToken = data.refresh_token;
                await AsyncStorage.setItem('session', _accessToken);
                await AsyncStorage.setItem('refreshToken', _refreshToken);
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            _refreshPromise = null;
        }
    })();

    return _refreshPromise;
}

export async function authFetch(url, options = {}) {
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${_accessToken}`,
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && _refreshToken) {
        const refreshed = await doRefresh();

        if (refreshed) {
            return fetch(url, {
                ...options,
                headers: { ...options.headers, 'Authorization': `Bearer ${_accessToken}` },
            });
        }

        if (_onLogout) _onLogout();
    }

    return res;
}
