'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AutomotrizLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                        <Image
                            src="/sanchez/logo.png"
                            alt="Group Sanchez"
                            width={32}
                            height={32}
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            Sector Automotriz
                            <span className="text-[10px] bg-blue-100 text-[#3841F2] px-2 py-0.5 rounded-full font-black border border-blue-200 uppercase">DEMO VERTICAL</span>
                        </h1>
                        <p className="text-muted-foreground">Gestión de Repuestos & Punto de Venta — Group Sanchez</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#3841F2]/5 border border-[#3841F2]/10 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-[#3841F2] animate-pulse" />
                    <span className="text-xs font-bold text-[#3841F2] uppercase tracking-wider">Conectado con PROMPTIVE</span>
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
