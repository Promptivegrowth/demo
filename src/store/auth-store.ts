import { create } from 'zustand'

export interface UserProfile {
    id: string
    full_name: string
    email: string
    role: 'admin' | 'operativo'
    avatar_url: string | null
    is_active: boolean
}

interface AuthState {
    user: UserProfile | null
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: UserProfile | null) => void
    setLoading: (loading: boolean) => void
    logout: () => void
    isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null, isAuthenticated: false }),
    isAdmin: () => get().user?.role === 'admin',
}))
