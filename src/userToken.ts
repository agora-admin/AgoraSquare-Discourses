import { create } from "zustand";
import { persist } from 'zustand/middleware';

interface PersistedTokenState {
    token: string;
    setToken: (v: string) => void;
}

export const usePersistedTokenStore = create(persist<PersistedTokenState>((set) => ({
    token: '',
    setToken: (v: string) => set(() => ({ token: v })),
}),
    {
        name: 'agoraJWT',
    }
))