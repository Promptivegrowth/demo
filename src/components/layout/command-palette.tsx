'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/ui-store'
import { supabase } from '@/lib/supabase'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import {
    Users,
    Package,
    FileText,
    HardHat,
    DollarSign,
    BarChart3,
    ClipboardList,
    UserCog,
    MapPin,
    Settings,
    CalendarDays,
    ScrollText,
    Shield,
} from 'lucide-react'

interface SearchItem {
    id: string
    name: string
    subtitle: string
    category: string
    href: string
}

export function CommandPalette() {
    const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
    const [results, setResults] = useState<SearchItem[]>([])
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setCommandPaletteOpen(!commandPaletteOpen)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [commandPaletteOpen, setCommandPaletteOpen])

    useEffect(() => {
        if (!commandPaletteOpen) return
        async function loadResults() {
            const [clients, projects, inventory] = await Promise.all([
                supabase.from('clients').select('id, full_name, company, status').limit(6),
                supabase.from('projects').select('id, name, status, progress').limit(6),
                supabase.from('inventory').select('id, name, sku, stock').limit(6),
            ])
            const items: SearchItem[] = [
                ...(clients.data || []).map((c) => ({
                    id: c.id, name: c.full_name, subtitle: c.company || '', category: 'Clientes', href: '/crm',
                })),
                ...(projects.data || []).map((p) => ({
                    id: p.id, name: p.name, subtitle: `${p.progress}% completado`, category: 'Proyectos', href: '/tracking',
                })),
                ...(inventory.data || []).map((i) => ({
                    id: i.id, name: i.name, subtitle: `SKU: ${i.sku} | Stock: ${i.stock}`, category: 'Inventario', href: '/inventory',
                })),
            ]
            setResults(items)
        }
        loadResults()
    }, [commandPaletteOpen])

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Clientes': return Users
            case 'Proyectos': return HardHat
            case 'Inventario': return Package
            default: return FileText
        }
    }

    const pages = [
        { name: 'Dashboard', icon: BarChart3, href: '/' },
        { name: 'CRM & Ventas', icon: Users, href: '/crm' },
        { name: 'Inventario', icon: Package, href: '/inventory' },
        { name: 'Finanzas', icon: DollarSign, href: '/finance' },
        { name: 'Operaciones', icon: ClipboardList, href: '/operations' },
        { name: 'RR.HH.', icon: UserCog, href: '/hr' },
        { name: 'Seguimiento', icon: MapPin, href: '/tracking' },
        { name: 'Documentos', icon: FileText, href: '/documents' },
        { name: 'Calendario', icon: CalendarDays, href: '/calendar' },
        { name: 'Analítica', icon: BarChart3, href: '/analytics' },
        { name: 'Auditoría', icon: ScrollText, href: '/audit' },
        { name: 'Administración', icon: Shield, href: '/admin' },
        { name: 'Configuración', icon: Settings, href: '/settings' },
    ]

    const groupedResults = results.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, SearchItem[]>)

    return (
        <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
            <CommandInput placeholder="Buscar clientes, proyectos, facturas..." />
            <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup heading="Páginas">
                    {pages.map((page) => (
                        <CommandItem
                            key={page.href}
                            onSelect={() => {
                                router.push(page.href)
                                setCommandPaletteOpen(false)
                            }}
                        >
                            <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {page.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                {Object.entries(groupedResults).map(([category, items]) => {
                    const Icon = getCategoryIcon(category)
                    return (
                        <CommandGroup key={category} heading={category}>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    onSelect={() => {
                                        router.push(item.href)
                                        setCommandPaletteOpen(false)
                                    }}
                                >
                                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p>{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )
                })}
            </CommandList>
        </CommandDialog>
    )
}
