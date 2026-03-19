'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, Users, Package, DollarSign, ClipboardList, UserCog,
    MapPin, BarChart3, Settings, ChevronLeft, ChevronRight, FileText,
    CalendarDays, ScrollText, Shield, X, Menu, Shirt, Factory,
    DraftingCompass, ClipboardCheck, BarChartHorizontal, Layers, Activity, Home,
    ShieldCheck, Undo2, BadgeDollarSign, Receipt, Building2, Wrench, Boxes,
    FileBarChart, Smartphone, Truck, Calculator, Server
} from 'lucide-react'

const textilNavItems = [
    { label: 'Hub Textil', icon: Home, href: '/textil', operativeAccess: true },
    { label: 'Órdenes de Producción', icon: Factory, href: '/textil/ordenes', operativeAccess: true },
    { label: 'Ficha Técnica', icon: DraftingCompass, href: '/textil/fichas', operativeAccess: true },
    { label: 'Planeación de Planta', icon: CalendarDays, href: '/textil/planeacion', operativeAccess: true },
    { label: 'Control de Calidad', icon: ClipboardCheck, href: '/textil/calidad', operativeAccess: true },
    { label: 'Costos de Producción', icon: DollarSign, href: '/textil/costos', operativeAccess: true },
    { label: 'Trazabilidad de Lotes', icon: Layers, href: '/textil/trazabilidad', operativeAccess: true },
    { label: 'Analítica Textil', icon: BarChartHorizontal, href: '/textil/analitica', operativeAccess: true },
]

const automotrizNavItems = [
    { label: 'Hub Automotriz', icon: Home, href: '/automotriz', operativeAccess: true },
    { label: 'POS — Punto de Venta', icon: LayoutDashboard, href: '/automotriz/pos', operativeAccess: true },
    { label: 'Inventario Automotriz', icon: Package, href: '/automotriz/inventario', operativeAccess: true },
    { label: 'Catálogo de Repuestos', icon: Settings, href: '/automotriz/catalogo', operativeAccess: true },
    { label: 'Clientes & Historial', icon: Users, href: '/automotriz/clientes', operativeAccess: true },
    { label: 'Cotizaciones', icon: Receipt, href: '/automotriz/cotizaciones', operativeAccess: true },
    { label: 'Separados / Apartados', icon: BadgeDollarSign, href: '/automotriz/apartados', operativeAccess: true },
    { label: 'Caja & Turnos', icon: DollarSign, href: '/automotriz/caja', operativeAccess: true },
    { label: 'Compras & Proveedores', icon: ClipboardList, href: '/automotriz/compras', operativeAccess: true },
    { label: 'Garantías', icon: ShieldCheck, href: '/automotriz/garantias', operativeAccess: true },
    { label: 'Devoluciones', icon: Undo2, href: '/automotriz/devoluciones', operativeAccess: true },
    { label: 'Reportes de Ventas', icon: BarChart3, href: '/automotriz/reportes', operativeAccess: true },
]

const manufacturaNavItems = [
    { label: 'Hub Empresarial', icon: Home, href: '/manufactura', operativeAccess: true },
    { label: 'Producción & Manufactura', icon: Factory, href: '/manufactura/produccion', operativeAccess: true },
    { label: 'Inventario & Almacenes', icon: Boxes, href: '/manufactura/inventario', operativeAccess: true },
    { label: 'Ventas & Facturación', icon: FileBarChart, href: '/manufactura/ventas', operativeAccess: true },
    { label: 'CRM de Campo', icon: Smartphone, href: '/manufactura/crm', operativeAccess: true },
    { label: 'Logística & Distribución', icon: Truck, href: '/manufactura/logistica', operativeAccess: true },
    { label: 'Contabilidad', icon: Calculator, href: '/manufactura/contabilidad', operativeAccess: true },
    { label: 'Administración Servidor', icon: Server, href: '/manufactura/servidor', adminOnly: true },
]

const sergensafNavItems = [
    { label: 'ERP Agregados (Sergensaf)', icon: Building2, href: '/sergensaf', operativeAccess: true },
]

const ecogestionNavItems = [
    { label: '♻ EcoGestión', icon: Wrench, href: '/ecogestion', operativeAccess: true },
]

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/', operativeAccess: true },
    { label: 'CRM & Ventas', icon: Users, href: '/crm', operativeAccess: true },
    { label: 'Inventario', icon: Package, href: '/inventory', operativeAccess: true },
    { label: 'Finanzas', icon: DollarSign, href: '/finance', adminOnly: true },
    { label: 'Operaciones', icon: ClipboardList, href: '/operations', adminOnly: true },
    { label: 'RR.HH.', icon: UserCog, href: '/hr', adminOnly: true },
    { label: 'Seguimiento', icon: MapPin, href: '/tracking', operativeAccess: true },
    { label: 'Documentos', icon: FileText, href: '/documents', operativeAccess: true },
    { label: 'Calendario', icon: CalendarDays, href: '/calendar', operativeAccess: true },
    { label: 'Analítica', icon: BarChart3, href: '/analytics', adminOnly: true },
    { label: 'Auditoría', icon: ScrollText, href: '/audit', adminOnly: true },
    { label: 'Administración', icon: Shield, href: '/admin', adminOnly: true },
    { label: 'Configuración', icon: Settings, href: '/settings', operativeAccess: true },
]

export function Sidebar() {
    const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
    const { user, isAdmin } = useAuthStore()
    const pathname = usePathname()

    const filteredNav = navItems.filter(item => {
        if (isAdmin()) return true
        if (item.adminOnly) return false
        return item.operativeAccess
    })

    const navContent = (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
                <div className="bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                    <Image src="/logo.png" alt="PROMPTIVE" width={28} height={28} />
                </div>
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-lg font-bold tracking-tight promptive-gradient-text"
                    >
                        PROMPTIVE
                    </motion.span>
                )}
                {/* Mobile close button */}
                <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {filteredNav.map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                            <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                ? 'bg-gradient-to-r from-brand-purple/15 to-brand-cyan/10 text-brand-purple'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}>
                                <div className={`relative flex items-center justify-center shrink-0 ${active ? 'text-brand-purple' : 'text-muted-foreground group-hover:text-foreground'
                                    }`}>
                                    {active && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 -m-1 rounded-lg bg-brand-purple/10"
                                            transition={{ type: 'spring', duration: 0.4 }}
                                        />
                                    )}
                                    <item.icon className="h-[18px] w-[18px] relative z-10" />
                                </div>
                                {(!sidebarCollapsed || mobileSidebarOpen) && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="truncate"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    )
                })}

                {/* Sector Textil Divider & Header */}
                <div className="pt-4 pb-2 px-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/60" />
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sector Textil</span>
                    )}
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black border border-amber-200">DEMO</span>
                    )}
                    <div className="h-px flex-1 bg-border/60" />
                </div>

                {/* Textil Navigation */}
                {textilNavItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/textil' && pathname.startsWith(item.href))
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                            <div className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}>
                                <div className={`relative flex items-center justify-center shrink-0 ${active ? 'text-amber-600' : 'text-muted-foreground group-hover:text-foreground'
                                    }`}>
                                    {active && (
                                        <motion.div
                                            layoutId="sidebar-textil-active"
                                            className="absolute inset-0 -m-1 rounded-lg bg-amber-500/10"
                                            transition={{ type: 'spring', duration: 0.4 }}
                                        />
                                    )}
                                    <item.icon className="h-[18px] w-[18px] relative z-10" />
                                </div>
                                {(!sidebarCollapsed || mobileSidebarOpen) && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="truncate"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    )
                })}
                {/* Sector Automotriz Divider & Header */}
                <div className="pt-4 pb-2 px-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/60" />
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sector Automotriz</span>
                    )}
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] bg-blue-100 text-[#3841F2] px-1.5 py-0.5 rounded font-black border border-blue-200">DEMO</span>
                    )}
                    <div className="h-px flex-1 bg-border/60" />
                </div>

                {/* Automotriz Navigation */}
                {automotrizNavItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/automotriz' && pathname.startsWith(item.href))
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                            <div className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                ? 'bg-[#3841F2]/10 text-[#3841F2]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}>
                                <div className={`relative flex items-center justify-center shrink-0 ${active ? 'text-[#3841F2]' : 'text-muted-foreground group-hover:text-foreground'
                                    }`}>
                                    {active && (
                                        <motion.div
                                            layoutId="sidebar-automotriz-active"
                                            className="absolute inset-0 -m-1 rounded-lg bg-[#3841F2]/10"
                                            transition={{ type: 'spring', duration: 0.4 }}
                                        />
                                    )}
                                    <item.icon className="h-[18px] w-[18px] relative z-10" />
                                </div>
                                {(!sidebarCollapsed || mobileSidebarOpen) && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="truncate"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    )
                })}

                {/* Sector Manufactura Divider & Header */}
                <div className="pt-4 pb-2 px-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/60" />
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sector Manufactura</span>
                    )}
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] bg-slate-100 text-[#0f4c81] px-1.5 py-0.5 rounded font-black border border-slate-200">DEMO</span>
                    )}
                    <div className="h-px flex-1 bg-border/60" />
                </div>

                {/* Manufactura Navigation */}
                {manufacturaNavItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/manufactura' && pathname.startsWith(item.href))
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                            <div className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                ? 'bg-[#0f4c81]/10 text-[#0f4c81]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}>
                                <div className={`relative flex items-center justify-center shrink-0 ${active ? 'text-[#0f4c81]' : 'text-muted-foreground group-hover:text-foreground'
                                    }`}>
                                    {active && (
                                        <motion.div
                                            layoutId="sidebar-manufactura-active"
                                            className="absolute inset-0 -m-1 rounded-lg bg-[#0f4c81]/10"
                                            transition={{ type: 'spring', duration: 0.4 }}
                                        />
                                    )}
                                    <item.icon className="h-[18px] w-[18px] relative z-10" />
                                </div>
                                {(!sidebarCollapsed || mobileSidebarOpen) && (
                                    <motion.span
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 1 }}
                                        className="truncate"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    )
                })}

                {/* Sector Sergensaf Divider & Header */}
                <div className="pt-4 pb-2 px-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/60" />
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sector Minero / Agregados</span>
                    )}
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-[10px] bg-[#f0a500]/20 text-[#f0a500] px-1.5 py-0.5 rounded font-black border border-[#f0a500]/30">NUEVO</span>
                    )}
                    <div className="h-px flex-1 bg-border/60" />
                </div>

                {/* Sergensaf Navigation */}
                {sergensafNavItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href)
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                            <div className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                ? 'bg-[#f0a500]/10 text-[#f0a500]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}>
                                <div className={`relative flex items-center justify-center shrink-0 ${active ? 'text-[#f0a500]' : 'text-muted-foreground group-hover:text-foreground'
                                    }`}>
                                    {active && (
                                        <motion.div
                                            layoutId="sidebar-sergensaf-active"
                                            className="absolute inset-0 -m-1 rounded-lg bg-[#f0a500]/10"
                                            transition={{ type: 'spring', duration: 0.4 }}
                                        />
                                    )}
                                    <item.icon className="h-[18px] w-[18px] relative z-10" />
                                </div>
                                {(!sidebarCollapsed || mobileSidebarOpen) && (
                                    <motion.span
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 1 }}
                                        className="truncate"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Collapse Toggle - Desktop only */}
            <button
                onClick={toggleSidebar}
                className="mx-2 mb-2 hidden lg:flex items-center justify-center h-8 rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors"
            >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* User Footer */}
            <div className="border-t border-border p-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full promptive-gradient text-white text-xs font-bold">
                        {user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                    </div>
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="overflow-hidden"
                        >
                            <p className="text-sm font-semibold leading-tight truncate">{user?.full_name || 'Usuario'}</p>
                            <p className="text-[11px] text-muted-foreground capitalize">{user?.role || 'operativo'}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 72 : 256 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col border-r border-border bg-sidebar-background"
            >
                {navContent}
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r border-border bg-sidebar-background lg:hidden"
                        >
                            {navContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export function MobileMenuButton() {
    const { setMobileSidebarOpen } = useUIStore()
    return (
        <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground">
            <Menu className="h-5 w-5" />
        </button>
    )
}
