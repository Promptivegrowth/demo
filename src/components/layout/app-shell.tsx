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
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()
            if (profile) return profile

            const orgResult = await supabase.from('organizations').select('id').limit(1).single()
            const newProfile = {
                id: userId,
                full_name: (userMeta?.full_name as string) || userEmail?.split('@')[0] || 'Usuario',
                email: userEmail || '',
                role: (userMeta?.role as string) || 'operativo',
                org_id: orgResult.data?.id,
                is_active: true,
            }
            await supabase.from('profiles').upsert(newProfile)
            return newProfile
        } catch (err) {
            console.error('Error loading profile:', err)
            return null
        }
    }, [])

    useEffect(() => {
        let mounted = true

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
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
            }
            if (mounted) setReady(true)
        }

        // Add a safety timeout — never stay loading more than 5 seconds
        const timeout = setTimeout(() => {
            if (mounted && !ready) {
                console.warn('Auth timeout — forcing ready')
                setReady(true)
                setUser(null)
            }
        }, 5000)

        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return
            if (event === 'SIGNED_IN' && session?.user) {
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
    }, [setUser, loadProfile, router, ready])

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
