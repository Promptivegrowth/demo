import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'EcoGestión | Gestión de Residuos',
    description: 'Sistema de Gestión Integral de Residuos Sólidos',
}

export default function EcoGestionLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen" style={{ background: '#0a0f0d', color: '#e8f5ee', fontFamily: "'DM Sans', sans-serif" }}>
            {children}
        </div>
    )
}
