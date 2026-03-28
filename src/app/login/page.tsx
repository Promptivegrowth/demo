'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signIn, createUserAccount } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, ArrowRight, Shield, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { error: authError } = await signIn(email, password)
            if (authError) {
                // AUTO-PROVISIONING ROBUSTO PARA DEMO DIRECTIVA
                if (email.startsWith('test') && email.endsWith('@sergensaf.com')) {
                    try {
                        const num = email.replace('test', '').split('@')[0]
                        // Intentar creación administrativa (vía adminInsert en profiles si fuera necesario, 
                        // pero aquí usamos signUp que es estándar)
                        await createUserAccount(email, password, `Directivo ${num}`, 'admin')

                        // Re-intentar login tras posible creación exitosa
                        const { data: retryData, error: retryError } = await signIn(email, password)
                        if (!retryError) {
                            toast.success(`Demo Activada: ¡Bienvenido Directivo ${num}!`)
                            router.push('/')
                            return
                        }
                    } catch (createErr: any) {
                        // Si ya existe pero el login falló, tal vez la contraseña es distinta (poco probable en demo)
                        console.error('Demo Provisioning retry failed:', createErr)
                    }
                }

                setError(authError.message === 'Invalid login credentials'
                    ? 'Credenciales incorrectas o usuario no registrado.'
                    : authError.message)
            } else {
                toast.success('¡Sesión Iniciada con Éxito!')
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message || 'Error de conexión. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    function fillDemo(type: 'admin' | 'operativo') {
        setEmail(type === 'admin' ? 'admin@promptive.pe' : 'operativo@promptive.pe')
        setPassword(type === 'admin' ? 'Admin1234!' : 'Operativo1234!')
        setError('')
    }

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] via-[#12061a] to-[#0a0a12]" />

                {/* Brand gradient orbs */}
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-purple/20 blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-brand-cyan/20 blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, 15, 0], y: [0, 15, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-brand-pink/15 blur-[80px]"
                />
                <motion.div
                    animate={{ x: [0, -10, 0], y: [0, -10, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-brand-amber/15 blur-[80px]"
                />

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />

                {/* Center content */}
                <div className="relative z-10 text-center px-12 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Image src="/logo.png" alt="PROMPTIVE" width={80} height={80} className="mx-auto mb-8 drop-shadow-2xl" />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-4xl font-bold mb-4 promptive-gradient-text"
                    >
                        PROMPTIVE
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="text-lg text-white/60 leading-relaxed"
                    >
                        Plataforma de gestión empresarial inteligente. Todo tu negocio en un solo lugar.
                    </motion.p>

                    {/* Feature pills */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-wrap gap-2 justify-center mt-8"
                    >
                        {['CRM', 'Inventario', 'Finanzas', 'RR.HH.', 'Analítica', 'Docs'].map((f) => (
                            <span key={f} className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-white/50 bg-white/5">
                                {f}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Image src="/logo.png" alt="PROMPTIVE" width={48} height={48} className="mx-auto mb-3" />
                        <h1 className="text-xl font-bold promptive-gradient-text">PROMPTIVE</h1>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">Iniciar Sesión</h2>
                    <p className="text-muted-foreground text-sm mt-1 mb-8">Ingresa tus credenciales para continuar</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.pe" className="h-11" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full h-11 promptive-btn text-white font-semibold text-sm">
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <>Iniciar Sesión <ArrowRight className="h-4 w-4 ml-2" /></>
                            )}
                        </Button>
                    </form>

                    {/* Demo access */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium font-rajdhani">Accesos Rápidos Demo</p>
                            <span className="text-[10px] bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full font-bold border border-brand-purple/20">V4.0</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => fillDemo('admin')}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-purple/20 bg-brand-purple/5 hover:bg-brand-purple/10 text-sm font-medium text-brand-purple transition-all hover:border-brand-purple/40 group"
                            >
                                <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                Admin Principal
                            </button>
                            <button
                                onClick={() => fillDemo('operativo')}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 hover:bg-brand-cyan/10 text-sm font-medium text-brand-cyan transition-all hover:border-brand-cyan/40 group"
                            >
                                <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                Operativo Gral.
                            </button>
                        </div>

                        {/* MODO INVITADOS / DIRECTIVOS */}
                        <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-[0.2em] mb-3 text-center">Panel de Directivos (Sesiones Indep.)</p>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            setEmail(`test${num}@sergensaf.com`)
                                            setPassword('Test1234!')
                                            setError('')
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-black/10 bg-black/5 hover:bg-brand-purple/10 hover:border-brand-purple/30 transition-all group shadow-sm"
                                    >
                                        <Shield className="h-3 w-3 text-brand-purple/80 group-hover:text-brand-purple" />
                                        <span className="text-[10px] font-black text-black/80 group-hover:text-black uppercase tracking-tighter">Test {num}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        © 2026 PROMPTIVE · Todos los derechos reservados
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
