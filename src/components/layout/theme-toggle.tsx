'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
    const [dark, setDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('promptive-theme')
        if (saved === 'dark') {
            setDark(true)
            document.documentElement.classList.add('dark')
        } else {
            setDark(false)
            document.documentElement.classList.remove('dark')
        }
    }, [])

    function toggle() {
        const next = !dark
        setDark(next)
        if (next) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('promptive-theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('promptive-theme', 'light')
        }
    }

    if (!mounted) return <div className="h-9 w-9" />

    return (
        <Button variant="ghost" size="sm" onClick={toggle} className="h-9 w-9 p-0 rounded-lg hover:bg-muted" title={dark ? 'Modo claro' : 'Modo oscuro'}>
            {dark ? <Sun className="h-4 w-4 text-brand-amber" /> : <Moon className="h-4 w-4 text-brand-purple" />}
        </Button>
    )
}
