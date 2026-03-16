'use client'

import { motion } from 'framer-motion'

export default function TextilLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        Sector Textil
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black border border-amber-200">DEMO VERTCAL</span>
                    </h1>
                    <p className="text-muted-foreground">Módulo de Producción — Industria Moda & Confección</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-purple/5 border border-brand-purple/10 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-brand-purple animate-pulse" />
                    <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">Integrado con PROMPTIVE</span>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {children}
            </motion.div>
        </div>
    )
}
