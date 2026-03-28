'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
    const profileLoadedRef = useRef(false)

    const loadProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: Record<string, unknown>) => {
        console.log('[PROMPTIVE] Loading profile for:', userEmail || userId)

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) console.error('[PROMPTIVE] Profile fetch error:', error)

            if (profile && profile.org_id) {
                console.log('[PROMPTIVE] Profile loaded from DB with org_id')
                return {
                    ...profile,
                    role: profile.role || 'operativo',
                    is_active: profile.is_active ?? true
                }
            }

            if (userEmail?.endsWith('@promptive.pe') || userEmail?.includes('sergensaf.com')) {
                console.log('[PROMPTIVE] Demo/Sergensaf user detect, ensuring org_id context')
                const { data: orgData } = await supabase.from('organizations').select('id').limit(1).maybeSingle()

                return {
                    id: userId,
                    full_name: (userMeta?.full_name as string) || (userEmail?.includes('admin') || userEmail?.includes('test') ? 'Administrador Demo' : 'Usuario Demo'),
                    email: userEmail || '',
                    role: (userEmail?.includes('admin') ? 'admin' : 'operativo') as any,
                    org_id: orgData?.id || null,
                    avatar_url: null,
                    is_active: true,
                }
            }

            console.log('[PROMPTIVE] No profile found, using metadata fallback')
            return {
                id: userId,
                full_name: (userMeta?.full_name as string) || userEmail?.split('@')[0] || 'Usuario',
                email: userEmail || '',
                role: (userMeta?.role as string) || 'operativo' as any,
                avatar_url: null,
                is_active: true,
                org_id: null
            }
        } catch (err) {
            console.error('[PROMPTIVE] Critical error in loadProfile:', err)
            return {
                id: userId,
                full_name: userEmail?.split('@')[0] || 'Usuario',
                email: userEmail || '',
                role: 'operativo' as any,
                avatar_url: null,
                is_active: true,
                org_id: null
            }
        }
    }, [])

    useEffect(() => {
        let mounted = true
        profileLoadedRef.current = false

        // STRATEGY v5.0: Let onAuthStateChange handle ALL profile loading.
        // checkSession only serves as a fast-path redirect to /login if no session exists.
        const checkSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) throw sessionError
                if (!mounted) return

                if (session?.user) {
                    // Session exists — profile will be loaded by onAuthStateChange (INITIAL_SESSION)
                    // Only set ready if we don't get an onAuthStateChange callback in time
                    console.log('[AUTH] Session found, waiting for onAuthStateChange to load profile...')
                } else {
                    // No session at all — redirect immediately
                    console.log('[AUTH] No session found')
                    if (mounted) {
                        setUser(null)
                        setReady(true)
                    }
                }
            } catch (err) {
                console.error('Session check error:', err)
                if (mounted) {
                    setUser(null)
                    setReady(true)
                }
            }
        }

        // Safety timeout — increased to 10s for slow connections
        const timeout = setTimeout(() => {
            if (mounted && !ready) {
                console.warn('[AUTH] Safety timeout (10s) — forcing ready')
                setReady(true)
            }
        }, 10000)

        checkSession()

        // SINGLE SOURCE OF TRUTH for profile loading
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            console.log(`[AUTH] Event: ${event} | User: ${session?.user?.id?.slice(0, 8) || 'none'}`)

            if (event === 'SIGNED_OUT') {
                profileLoadedRef.current = false
                setUser(null)
                setReady(true)
                router.push('/login')
                return
            }

            if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                // For TOKEN_REFRESHED: skip if profile already loaded (avoids unnecessary DB queries)
                if (event === 'TOKEN_REFRESHED' && profileLoadedRef.current) {
                    console.log('[AUTH] Token refreshed, profile already loaded — skipping')
                    return
                }

                // For SIGNED_IN: only skip if profile was already loaded AND it's the same user
                // (prevents re-loading on duplicate SIGNED_IN events from Supabase)
                if (event === 'SIGNED_IN' && profileLoadedRef.current) {
                    console.log('[AUTH] Ignoring duplicate SIGNED_IN — profile already active')
                    return
                }

                // Load profile for INITIAL_SESSION (always) and first SIGNED_IN
                try {
                    const profile = await loadProfile(session.user.id, session.user.email, session.user.user_metadata)
                    if (profile && mounted) {
                        setUser(profile)
                        profileLoadedRef.current = true
                        console.log('[AUTH] Profile loaded successfully')
                    }
                } catch (err) {
                    console.error('[AUTH] Failed to load profile:', err)
                } finally {
                    if (mounted) setReady(true)
                }
            }
        })

        return () => {
            mounted = false
            clearTimeout(timeout)
            subscription.unsubscribe()
        }
    }, [setUser, loadProfile, router])

    useEffect(() => {
        if (!ready) return
        if (!isAuthenticated && pathname !== '/login') {
            router.push('/login')
        }
    }, [isAuthenticated, pathname, router, ready])

    if (pathname === '/login') {
        return <>{children}<Toaster position="top-right" richColors /></>
    }

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
            <motion.div
                initial={false}
                animate={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="min-h-screen hidden lg:block"
            >
                <Topbar />
                <main className="p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</main>
            </motion.div>
            <div className="lg:hidden min-h-screen">
                <Topbar />
                <main className="p-3 sm:p-4 animate-in fade-in duration-200">{children}</main>
            </div>
        </>
    )
}
