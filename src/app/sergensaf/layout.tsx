import { Inter, Rajdhani } from 'next/font/google'
import { Metadata } from 'next'

// Definición de las fuentes requeridas para SERGENSAF
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const rajdhani = Rajdhani({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-rajdhani'
})

export const metadata: Metadata = {
    title: 'SERGENSAF | Agregados',
    description: 'Sistema ERP para Proceso y Venta de Agregados',
}

export default function SergensafLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={`${inter.variable} ${rajdhani.variable} min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans selection:bg-[#f0a500] selection:text-[#0d1117]`}>
            {children}
        </div>
    )
}
