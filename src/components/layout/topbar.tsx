'use client'

import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { signOut } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Search, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { MobileMenuButton } from './sidebar'

export function Topbar() {
    const { setCommandPaletteOpen } = useUIStore()
    const { user, isAdmin } = useAuthStore()
    const router = useRouter()
    const [showAlerts, setShowAlerts] = useState(false)

    const alerts = [
        { id: '1', type: 'warning', title: 'Stock bajo en 3 productos', desc: 'Laptop Pro, Monitor 4K y Teclado Mecánico están por debajo del mínimo', href: '/inventory', color: 'text-brand-amber' },
        { id: '2', type: 'info', title: '2 facturas próximas a vencer', desc: 'FAC-001 y FAC-003 vencen en los próximos 3 días', href: '/finance', color: 'text-brand-cyan' },
        { id: '3', type: 'success', title: 'Proyecto completado', desc: 'Portal E-commerce alcanzó el 100% de progreso', href: '/tracking', color: 'text-emerald-500' },
        { id: '4', type: 'alert', title: 'Nuevo usuario registrado', desc: 'Elena Rivas se unió como operativo', href: '/admin', color: 'text-brand-purple' },
    ]

    async function handleLogout() {
        const { error } = await signOut()
        if (error) toast.error('Error al cerrar sesión')
        else { toast.success('Sesión cerrada'); router.push('/login') }
    }

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <MobileMenuButton />
                {/* Search */}
                <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors w-48 sm:w-64"
                >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Buscar...</span>
                    <span className="sm:hidden">Buscar</span>
                    <kbd className="ml-auto text-[10px] font-mono bg-background/80 px-1.5 py-0.5 rounded border border-border hidden sm:inline">⌘K</kbd>
                </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                {/* Theme Toggle */}
                <ThemeToggle />
                <div className="relative">
                    <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0" onClick={() => setShowAlerts(!showAlerts)}>
                        <Bell className="h-[18px] w-[18px]" />
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-pink text-[10px] font-bold text-white flex items-center justify-center">
                            {alerts.length}
                        </span>
                    </Button>

                    {showAlerts && (
                        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <h4 className="text-sm font-semibold">Notificaciones</h4>
                                <Badge variant="secondary" className="text-[10px]">{alerts.length} nuevas</Badge>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {alerts.map(alert => (
                                    <Link
                                        key={alert.id}
                                        href={alert.href}
                                        onClick={() => setShowAlerts(false)}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                                    >
                                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${alert.type === 'warning' ? 'bg-brand-amber' :
                                            alert.type === 'info' ? 'bg-brand-cyan' :
                                                alert.type === 'success' ? 'bg-emerald-500' : 'bg-brand-purple'
                                            }`} />
                                        <div>
                                            <p className={`text-sm font-medium ${alert.color}`}>{alert.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 rounded-xl">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full promptive-gradient text-white text-[11px] font-bold">
                                {user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-semibold leading-tight">{user?.full_name || 'Usuario'}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{user?.role || 'operativo'}</p>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold">{user?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                                    {isAdmin() ? '🔑 Administrador' : '👤 Operativo'}
                                </Badge>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                            <Settings className="h-4 w-4 mr-2" />Configuración
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-brand-pink focus:text-brand-pink">
                            <LogOut className="h-4 w-4 mr-2" />Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
