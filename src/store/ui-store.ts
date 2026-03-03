import { create } from 'zustand'

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    created_at: string
}

interface UIStore {
    sidebarCollapsed: boolean
    toggleSidebar: () => void
    mobileSidebarOpen: boolean
    setMobileSidebarOpen: (open: boolean) => void
    theme: 'light' | 'dark'
    toggleTheme: () => void
    commandPaletteOpen: boolean
    setCommandPaletteOpen: (open: boolean) => void
    notificationPanelOpen: boolean
    setNotificationPanelOpen: (open: boolean) => void
    notifications: Notification[]
    setNotifications: (notifications: Notification[]) => void
    addNotification: (notification: Notification) => void
    markAsRead: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    mobileSidebarOpen: false,
    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    theme: 'light',
    toggleTheme: () =>
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light'
            if (typeof window !== 'undefined') {
                document.documentElement.classList.toggle('dark', newTheme === 'dark')
            }
            return { theme: newTheme }
        }),
    commandPaletteOpen: false,
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    notificationPanelOpen: false,
    setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),
}))
