import React, { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null};
    loading?: boolean;
    onSignup?: (username: string, password: string, password2: string) => Promise<any>;
    onSignin?: (username: string, password: string) => Promise<any>
    onSignout?: () => Promise<any>
}

const TOKEN_KEY = 'auth-token'
export const API_URL = 'https://si-banjir-be.vercel.app/api/';
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
    }>({
        token: null,
        authenticated: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);

            if (token) {
                axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                setAuthState({
                    token: token,
                    authenticated: true
                });

                setLoading(false);
            }
        };
        loadToken();
    }, []);

    const signup = async (username: string, password: string, password2: string) => {
        try {
            return await axios.post(`${API_URL}/user/signup`, { username, password, password2 });
        } catch (e) {
            return { error: true, msg: (e as any).response.data };
        }
    };

    const signin = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/user/login`, { username, password });

            setAuthState({
                token: response.data.token,
                authenticated: true
            });
            axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
            await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);

            return response;
        } catch (e) {
            return { error: true, msg: (e as any).response.data };
        }
    };

    const signout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        axios.defaults.headers.common['Authorization'] = '';
        setAuthState({
            token: null,
            authenticated: false
        });
    };

    const value = {
        onSignup: signup,
        onSignin: signin,
        onSignout: signout,
        authState,
        loading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}