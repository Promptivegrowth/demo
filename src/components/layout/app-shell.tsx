'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from './command-palette'
import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Toaster } from 'sonner'

export function AppShell({ children }: { children: React.ReactNode }) {
    const { sidebarCollapsed } = useUIStore()
    const { setUser, isAuthenticated, isLoading } = useAuthStore()
    const pathname = usePathname()
    const router = useRouter()
    const [ready, setReady] = useState(false)

    const loadProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: Record<string, unknown>) => {
        console.log('[PROMPTIVE] Loading profile for:', userEmail || userId)

        // Fast path for demo users to prevent DB hangs
        if (userEmail?.endsWith('@promptive.pe')) {
            console.log('[PROMPTIVE] Auto-resolving demo profile')
            return {
                id: userId,
                full_name: userEmail.includes('admin') ? 'Administrador PROMPTIVE' : 'Operativo PROMPTIVE',
                email: userEmail,
                role: (userEmail.includes('admin') ? 'admin' : 'operativo') as 'admin' | 'operativo',
                avatar_url: null,
                is_active: true,
            }
        }

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) console.error('[PROMPTIVE] Profile fetch error:', error)

            if (profile) {
                console.log('[PROMPTIVE] Profile loaded from DB')
                return {
                    ...profile,
                    role: profile.role || 'operativo',
                    is_active: profile.is_active ?? true
                }
            }

            console.log('[PROMPTIVE] No profile found, using metadata')
            return {
                id: userId,
                full_name: (userMeta?.full_name as string) || userEmail?.split('@')[0] || 'Usuario',
                email: userEmail || '',
                role: (userMeta?.role as string) || 'operativo' as any,
                avatar_url: null,
                is_active: true,
            }
        } catch (err) {
            console.error('[PROMPTIVE] Critical error in loadProfile:', err)
            return null
        }
    }, [])

    useEffect(() => {
        let mounted = true

        const checkSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) throw sessionError
                if (!mounted) return

                if (session?.user) {
                    const profile = await loadProfile(session.user.id, session.user.email, session.user.user_metadata)
                    if (mounted) {
                        if (profile) setUser(profile)
                        else setUser(null)
                    }
                } else {
                    if (mounted) setUser(null)
                }
            } catch (err) {
                console.error('Session check error:', err)
                if (mounted) setUser(null)
            } finally {
                if (mounted) setReady(true)
            }
        }

        // Add a safety timeout — never stay loading more than 6 seconds
        const timeout = setTimeout(() => {
            if (mounted && !ready) {
                console.warn('Auth timeout — forcing ready to prevent infinite loader')
                setReady(true)
                // If we hit timeout, we might be offline or service is slow
            }
        }, 6000)

        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            console.log(`Auth event: ${event}`)

            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                const profile = await loadProfile(session.user.id, session.user.email, session.user.user_metadata)
                if (profile && mounted) setUser(profile)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                router.push('/login')
            }
        })

        return () => {
            mounted = false
            clearTimeout(timeout)
            subscription.unsubscribe()
        }
    }, [setUser, loadProfile, router])

    // Redirect to login when not authenticated
    useEffect(() => {
        if (!ready) return
        if (!isAuthenticated && pathname !== '/login') {
            router.push('/login')
        }
    }, [isAuthenticated, pathname, router, ready])

    // Login page — no shell
    if (pathname === '/login') {
        return <>{children}<Toaster position="top-right" richColors /></>
    }

    // Loading state with pulse animation
    if (!ready || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse">Cargando PROMPTIVE...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) return null

    return (
        <>
            <Sidebar />
            <CommandPalette />
            <Toaster position="top-right" richColors />
            {/* Desktop layout */}
            <motion.div
                initial={false}
                animate={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="min-h-screen hidden lg:block"
            >
                <Topbar />
                <main className="p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</main>
            </motion.div>
            {/* Mobile layout */}
            <div className="lg:hidden min-h-screen">
                <Topbar />
                <main className="p-3 sm:p-4 animate-in fade-in duration-200">{children}</main>
            </div>
        </>
    )
}
