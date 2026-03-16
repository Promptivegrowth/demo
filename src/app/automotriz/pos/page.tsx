'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Scan, Trash2, Plus, Minus,
    CreditCard, Wallet, QrCode, Banknote,
    UserPlus, Printer, CheckCircle2, AlertCircle,
    Power, RotateCcw, History, PauseCircle,
    Wifi, RefreshCw, X, ChevronRight, Info
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// --- MOCK DATA ---
const PRODUCTS = [
    { id: 1, name: 'Aceite Motul 10W-40 1L', code: '7891234560001', price: 45.0, stock: 24, category: 'Lubricantes', image: 'https://images.unsplash.com/photo-1635843104285-df360706248b?w=400&q=80' },
    { id: 2, name: 'Pastilla de Freno Trasera Honda CB190', code: '7891234560002', price: 65.0, stock: 12, category: 'Frenos', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80' },
    { id: 3, name: 'Filtro de Aire Universal K&N', code: '7891234560003', price: 120.0, stock: 4, category: 'Filtros', image: 'https://images.unsplash.com/photo-1619642751034-7c98e244d2d4?w=400&q=80' },
    { id: 4, name: 'Kit de Cadena 428 x 120 eslabones', code: '7891234560004', price: 85.0, stock: 18, category: 'Cadenas', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80' },
    { id: 5, name: 'Llanta Pirelli MT 60 90/90-21', code: '7891234560005', price: 380.0, stock: 9, category: 'Llantas', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80' },
    { id: 6, name: 'Bujía NGK CR7HSA', code: '7891234560006', price: 15.0, stock: 45, category: 'Eléctrico', image: 'https://images.unsplash.com/photo-1635773100239-d37fcc97669d?w=400&q=80' },
    { id: 7, name: 'Faro LED Universal 40W', code: '7891234560007', price: 95.0, stock: 7, category: 'Eléctrico', image: 'https://images.unsplash.com/photo-1598558991696-11f3bf8f338d?w=400&q=80' },
    { id: 8, name: 'Amortiguador Trasero YSS', code: '7891234560008', price: 450.0, stock: 3, category: 'Suspensión', image: 'https://images.unsplash.com/photo-1599812189309-8d976a6a7c4a?w=400&q=80' },
    { id: 9, name: 'Guantes de Moto Talla M', code: '7891234560009', price: 75.0, stock: 14, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1621644783311-6be4847e114d?w=400&q=80' },
    { id: 10, name: 'Batería Yuasa 12N5-3B', code: '7891234560010', price: 140.0, stock: 11, category: 'Eléctrico', image: 'https://images.unsplash.com/photo-1621167973534-f81643c94295?w=400&q=80' },
    { id: 11, name: 'Casco Arai RX-7V Negro M', code: '7891234560011', price: 2800.0, stock: 2, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1591147596057-07449a557002?w=400&q=80' },
    { id: 12, name: 'Manubrio Renthal 760mm', code: '7891234560012', price: 320.0, stock: 5, category: 'Repuestos', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80' },
    { id: 13, name: 'Freno de Disco EBC FA181', code: '7891234560013', price: 210.0, stock: 8, category: 'Frenos', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80' },
    { id: 14, name: 'Aceite de Transmisión 80W-90', code: '7891234560014', price: 35.0, stock: 32, category: 'Lubricantes', image: 'https://images.unsplash.com/photo-1635843104285-df360706248b?w=400&q=80' },
    { id: 15, name: 'Cable de Acelerador Universal', code: '7891234560015', price: 25.0, stock: 15, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400&q=80' }
]

const METHODS = [
    { id: 'cash', label: 'Efectivo', icon: Banknote },
    { id: 'card', label: 'Tarjeta', icon: CreditCard },
    { id: 'yape', label: 'Yape/Plin', icon: QrCode },
    { id: 'transfer', label: 'Transferencia', icon: RefreshCw },
    { id: 'credit', label: 'Crédito', icon: History }
]

export default function POSPage() {
    // --- STATE ---
    const [ticket, setTicket] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [cashReceived, setCashReceived] = useState('')
    const [ticketType, setTicketType] = useState('Boleta')
    const [client, setClient] = useState<any>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isCajaOpen, setIsCajaOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const searchInputRef = useRef<HTMLInputElement>(null)

    // --- EFFECTS ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        if (searchInputRef.current) searchInputRef.current.focus()
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (searchQuery.length > 2) {
            const results = PRODUCTS.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.includes(searchQuery)
            )
            setSearchResults(results)

            // Auto-add if exact code match
            const exactMatch = PRODUCTS.find(p => p.code === searchQuery)
            if (exactMatch) {
                addProductToTicket(exactMatch)
                setSearchQuery('')
                setSearchResults([])
            }
        } else {
            setSearchResults([])
        }
    }, [searchQuery])

    // --- LOGIC ---
    const addProductToTicket = (product: any) => {
        const existing = ticket.find(item => item.id === product.id)
        if (existing) {
            if (existing.quantity >= product.stock) {
                toast.error(`Stock insuficiente para ${product.name}`, { position: 'top-center' })
                return
            }
            setTicket(ticket.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        } else {
            if (product.stock <= 0) {
                toast.error(`Sin stock disponible`, { position: 'top-center' })
                return
            }
            setTicket([...ticket, { ...product, quantity: 1 }])
        }
        if (product.stock < 5) {
            toast.warning(`Stock bajo: solo quedan ${product.stock} unidades`, { duration: 2000 })
        }
        setSearchQuery('')
    }

    const updateQuantity = (id: number, delta: number) => {
        setTicket(ticket.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta)
                if (newQty > item.stock) {
                    toast.error('Límite de stock alcanzado')
                    return item
                }
                return { ...item, quantity: newQty }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const subtotal = ticket.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const igv = subtotal * 0.18
    const total = subtotal + igv
    const change = cashReceived ? parseFloat(cashReceived) - total : 0

    const handleCheckout = () => {
        if (ticket.length === 0) {
            toast.error('El ticket está vacío')
            return
        }
        setShowConfirm(true)
    }

    const finalizeSale = () => {
        toast.success(`Venta procesada con éxito: Ticket #TK-${Math.floor(Math.random() * 100000)}`, {
            description: `Se han impreso los comprobantes (${ticketType}).`
        })
        setTicket([])
        setCashReceived('')
        setClient(null)
        setShowConfirm(false)
        if (searchInputRef.current) searchInputRef.current.focus()
    }

    return (
        <div className="flex h-[calc(100vh-140px)] gap-4 overflow-hidden -m-6 p-6 bg-[#f0ede8]">
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">Confirmar Venta</h2>
                                <p className="text-muted-foreground font-medium">Revisa los detalles antes de imprimir el comprobante.</p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-bold uppercase">Productos</span>
                                    <span className="font-black">{ticket.length} ítems</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-bold uppercase">Comprobante</span>
                                    <span className="font-black">{ticketType}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-4">
                                    <span className="text-slate-900 font-bold uppercase text-lg">Total</span>
                                    <span className="font-black text-2xl text-[#3841F2]">S/ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={finalizeSale}
                                    className="flex-2 flex-[2] py-4 px-6 bg-[#3841F2] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#3841F2]/20"
                                >
                                    <Printer className="h-4 w-4" />
                                    Confirmar e Imprimir
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- COLUMNA IZQUIERDA: Sesión (260px) --- */}
            <div className="w-[260px] flex flex-col gap-4">
                <div className="bg-[#020659] rounded-3xl p-6 flex flex-col items-center text-white border border-white/10 shadow-lg">
                    <div className="bg-white p-3 rounded-2xl mb-6 w-full flex items-center justify-center shadow-inner">
                        <Image src="/sanchez/logo.png" alt="Group Sanchez" width={140} height={50} className="h-full w-auto object-contain" />
                    </div>

                    <div className="w-full space-y-6 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-[#3841F2] flex items-center justify-center font-black text-sm text-white">
                                LB
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-black truncate">Cajero: Luigi Bravo</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-tighter">Caja 01 — Activa</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black text-blue-300/60 uppercase tracking-widest italic">
                                <span>Turno Activo</span>
                                <span className="text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '65%' }}
                                    className="h-full bg-[#3841F2]"
                                />
                            </div>
                            <p className="text-[10px] font-bold text-center text-blue-200">Inicio: 08:00 AM (4h 12m)</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-3xl p-2 border border-border shadow-sm flex flex-col gap-1">
                    {[
                        {
                            label: 'Cierre de Turno', icon: RotateCcw, color: 'text-red-500 bg-red-50', onClick: () => {
                                if (ticket.length > 0) {
                                    toast.error('Debes finalizar la venta actual antes de cerrar caja')
                                    return
                                }
                                setIsCajaOpen(false)
                                toast.info('Caja cerrada con éxito')
                            }
                        },
                        { label: 'Mis Ventas Hoy', icon: History, color: 'text-blue-500 bg-blue-50', onClick: () => toast('Resumen del día: S/ 4,250.00 generado') },
                        {
                            label: 'Suspender Venta', icon: PauseCircle, color: 'text-amber-500 bg-amber-50', onClick: () => {
                                if (ticket.length === 0) return
                                toast('Venta suspendida. Se guardó en memoria local.')
                                setTicket([])
                            }
                        }
                    ].map((btn) => (
                        <button key={btn.label} onClick={btn.onClick} className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-2xl transition-all group text-left">
                            <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", btn.color)}>
                                <btn.icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{btn.label}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wifi className="h-3 w-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sistema Online</span>
                    </div>
                    <RefreshCw className="h-3 w-3 text-slate-400" />
                </div>
            </div>

            {/* --- COLUMNA CENTRAL: Ticket (Flex) --- */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="bg-white rounded-3xl border border-border shadow-md flex flex-col overflow-hidden">
                    {/* Header del Ticket */}
                    <div className="p-6 border-b border-border bg-slate-50/80 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Ticket #TK-20240952</span>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-black text-slate-900">Venta de Productos</h2>
                                <Badge variant="outline" className="text-[9px] font-black uppercase border-[#3841F2] text-[#3841F2] animate-pulse">En Proceso</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['Contado', 'Crédito'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTicketType(type)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        type === 'Contado' ? "bg-[#3841F2] text-white shadow-lg shadow-[#3841F2]/20 scale-105" : "text-muted-foreground hover:bg-slate-100"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Escáner de Código de Barras (El más prominente) */}
                    <div className="p-6 border-b border-slate-100 bg-white relative z-50">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Scan className="h-6 w-6 text-[#3841F2]" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Escanea o busca por código, nombre o referencia..."
                                className="w-full h-16 pl-16 pr-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-lg font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#3841F2] focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-5 flex items-center text-slate-300 hover:text-slate-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            )}

                            {/* Dropdown de resultados */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto"
                                    >
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => addProductToTicket(product)}
                                                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors text-left group/item"
                                            >
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    <Image src={product.image} alt={product.name} width={48} height={48} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-black text-slate-800 truncate">{product.name}</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-tighter">COD: {product.code}</span>
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-tighter",
                                                            product.stock < 5 ? 'text-red-500' : 'text-emerald-600'
                                                        )}>
                                                            Stock: {product.stock}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-slate-900">S/ {product.price.toFixed(2)}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{product.category}</p>
                                                </div>
                                                <div className="flex h-8 w-8 rounded-full bg-slate-100 items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <Plus className="h-4 w-4 text-[#3841F2]" />
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Tabla de Productos */}
                    <div className="flex-1 overflow-y-auto min-h-0 bg-white">
                        {ticket.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-10 opacity-40">
                                <Scan className="h-24 w-24 text-slate-200 mb-6 animate-pulse" />
                                <h3 className="text-xl font-bold text-slate-400">Escanea un producto para comenzar</h3>
                                <p className="text-slate-400 font-medium">Group Sanchez — Sistema de Punto de Venta Premium</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-20 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">PRODUCTO</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CANTIDAD</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">PRECIO</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">TOTAL</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <AnimatePresence mode="popLayout">
                                        {ticket.map((item) => (
                                            <motion.tr
                                                layout
                                                key={item.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20, height: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4 relative">
                                                        <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                            <Image src={item.image} alt={item.name} width={40} height={40} className="h-full w-full object-cover" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-black text-slate-800 truncate">{item.name}</p>
                                                                {item.stock < 10 && (
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Bajo Stock" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">ID: {item.code}</p>
                                                                <button
                                                                    onClick={() => setSelectedProduct(item)}
                                                                    className="text-blue-500 hover:text-blue-700 text-[9px] font-bold uppercase underline"
                                                                >
                                                                    Ver Detalle
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {/* Almacén Toltip on group hover */}
                                                        <div className="absolute left-0 -top-2 px-2 py-0.5 bg-slate-800 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                                                            Ubicación: Pasillo B-4
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-white transition-all active:scale-90"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-white transition-all active:scale-90"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-sm font-bold text-slate-500">S/ {item.price.toFixed(2)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-base font-black text-slate-900">S/ {(item.price * item.quantity).toFixed(2)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right w-12 text-slate-300">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -item.quantity)}
                                                        className="hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer del Ticket */}
                    <div className="p-6 bg-slate-900 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                                <p className="text-lg font-black italic">S/ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IGV (18%)</span>
                                <p className="text-lg font-black italic">S/ {igv.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="md:col-span-2 text-right bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between shadow-inner">
                                <div className="text-left">
                                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Total a Pagar</span>
                                    <p className="text-4xl font-black text-[#3841F2] drop-shadow-[0_0_15px_rgba(56,65,242,0.3)] italic">S/ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Vuelto:</span>
                                        <span className={cn(
                                            "font-black italic text-lg",
                                            change >= 0 ? "text-emerald-400" : "text-red-400"
                                        )}>S/ {Math.max(0, change).toFixed(2)}</span>
                                    </div>
                                    {change < 0 && (
                                        <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 rounded">Faltante: S/ {Math.abs(change).toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- COLUMNA DERECHA: Cobro (320px) --- */}
            <div className="w-[320px] flex flex-col gap-4">
                {/* Selector de Cliente */}
                <div className="bg-white rounded-3xl p-6 border border-border shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Cliente vinculado</h3>
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                            <Plus className="h-4 w-4 text-slate-600" />
                        </div>
                    </div>

                    {!client ? (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="DNI, RUC o Nombre..."
                                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#3841F2]"
                                onChange={(e) => {
                                    if (e.target.value === '20608542') setClient({ name: 'Corporación MotoExpress SAC', type: 'EMPRESA', ruc: '20608542301' })
                                }}
                            />
                        </div>
                    ) : (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                            <div className="h-10 w-10 rounded-xl bg-[#3841F2] text-white flex items-center justify-center font-black text-xs shrink-0">
                                {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-black text-slate-900 truncate">{client.name}</p>
                                <p className="text-[10px] font-bold text-[#3841F2] tracking-tighter">{client.type}: {client.ruc || '75482319'}</p>
                            </div>
                            <button onClick={() => setClient(null)} className="ml-auto text-slate-300 hover:text-red-500">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                        {['Ticket', 'Boleta', 'Factura'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTicketType(type)}
                                className={cn(
                                    "py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all",
                                    ticketType === type ? 'bg-[#3841F2] border-[#3841F2] text-white shadow-lg shadow-[#3841F2]/20' : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Métodos de Pago */}
                <div className="flex-1 bg-[#020659] rounded-3xl p-6 text-white border border-white/10 shadow-lg flex flex-col gap-6 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <h3 className="text-xs font-black text-blue-200 uppercase tracking-widest">Método de pago</h3>

                    <div className="grid grid-cols-2 gap-3">
                        {METHODS.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={cn(
                                    "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#3841F2]/50",
                                    paymentMethod === method.id
                                        ? 'bg-[#3841F2] border-[#3841F2] shadow-[0_0_20px_rgba(56,65,242,0.4)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                )}
                            >
                                <method.icon className={cn("h-6 w-6", paymentMethod === method.id ? 'text-white' : 'text-blue-300')} />
                                <span className="text-xs font-black uppercase tracking-tight">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 space-y-4">
                        <AnimatePresence mode="wait">
                            {paymentMethod === 'cash' && (
                                <motion.div
                                    key="cash-input"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-2 mt-4"
                                >
                                    <label className="text-[10px] font-black text-blue-300 uppercase tracking-wider">Monto Recibido</label>
                                    <div className="relative">
                                        <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                                        <input
                                            type="number"
                                            value={cashReceived}
                                            onChange={(e) => setCashReceived(e.target.value)}
                                            placeholder="S/ 0.00"
                                            className="w-full h-16 pl-12 pr-6 bg-white/10 border-2 border-white/10 rounded-2xl text-2xl font-black text-white focus:outline-none focus:border-[#3841F2] focus:bg-white/20 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        {[10, 20, 50, 100, 200].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => setCashReceived(val.toString())}
                                                className="py-1.5 px-3 bg-white/5 border border-white/10 rounded-lg text-xs font-black hover:bg-[#3841F2] transition-colors"
                                            >
                                                S/ {val}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {paymentMethod === 'yape' && (
                                <motion.div
                                    key="yape-qr"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 gap-4"
                                >
                                    <div className="h-32 w-32 bg-white p-2 rounded-2xl relative">
                                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center m-2 rounded-xl">
                                            <QrCode className="h-20 w-20 text-slate-800" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-widest text-[#3841F2]">Esperando Confirmación</p>
                                        <p className="text-[10px] font-bold text-blue-200">Monto: S/ {total.toFixed(2)}</p>
                                    </div>
                                </motion.div>
                            )}

                            {paymentMethod === 'card' && (
                                <motion.div
                                    key="card-info"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 bg-[#3841F2]/10 rounded-3xl border border-[#3841F2]/20 flex flex-col items-center gap-4 text-center mt-4"
                                >
                                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Info className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-blue-200 leading-relaxed italic">
                                        Por favor, procese la tarjeta en el terminal inalámbrico e ingrese el número de operación al finalizar.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        disabled={ticket.length === 0 || (paymentMethod === 'cash' && change < 0)}
                        onClick={handleCheckout}
                        className={cn(
                            "w-full py-5 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
                            ticket.length > 0 && !(paymentMethod === 'cash' && change < 0)
                                ? "bg-[#3841F2] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-[#3841F2]/30 text-white"
                                : "bg-white/10 text-white/40 border border-white/5"
                        )}
                    >
                        <span>COBRAR S/ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* --- MODAL: DETALLES DE PRODUCTO --- */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col md:flex-row"
                        >
                            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-slate-100">
                                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="absolute top-4 left-4 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>
                            </div>
                            <div className="flex-1 p-8 space-y-6">
                                <div>
                                    <Badge className="bg-[#3841F2] mb-2">{selectedProduct.category}</Badge>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">CÓDIGO: {selectedProduct.code}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Precio Unitario</span>
                                        <span className="text-xl font-black text-slate-900">S/ {selectedProduct.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock Disponible</span>
                                        <span className={cn("text-lg font-black", selectedProduct.stock < 5 ? "text-red-500" : "text-emerald-500")}>
                                            {selectedProduct.stock} unidades
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ubicación</span>
                                        <span className="text-sm font-black text-slate-700">Pasillo B — Estantería 4</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        addProductToTicket(selectedProduct)
                                        setSelectedProduct(null)
                                    }}
                                    className="w-full py-4 bg-[#3841F2] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Añadir al Carrito
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- OVERLAY: CAJA CERRADA --- */}
            <AnimatePresence>
                {!isCajaOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] bg-[#020659]/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white rounded-[40px] p-12 max-w-md w-full text-center shadow-2xl border border-white/20"
                        >
                            <div className="h-24 w-24 bg-blue-50 text-[#3841F2] rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <Power className="h-12 w-12" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4 italic">Cerrado</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                                Para comenzar a vender, primero debes abrir el turno de caja.
                            </p>
                            <button
                                onClick={() => {
                                    setIsCajaOpen(true)
                                    toast.success('Turno de caja abierto correctamente', { position: 'top-center' })
                                }}
                                className="w-full py-6 bg-[#3841F2] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4"
                            >
                                <Power className="h-5 w-5" />
                                Abrir Turno de Caja
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
