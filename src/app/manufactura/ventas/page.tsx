'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart, FileText, UserSquare2, CreditCard,
    Search, Plus, Minus, Trash2, CheckCircle2,
    Cloud, Server, ShieldCheck, Printer, Mail,
    Smartphone, Download, MoreVertical, LayoutGrid, List,
    Percent, ArrowRight, Zap, History, Receipt, Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

// --- MOCK DATA ---
const PRODUCTS = [
    { id: '001', name: 'Vaso PP 12oz', price: 0.12, image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/vaso_descartable_pp_1773781872568.png', category: 'Vasos', stock: 15400 },
    { id: '002', name: 'Plato PET 9"', price: 0.25, image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/plato_descartable_pet_1773781887432.png', category: 'Platos', stock: 8200 },
    { id: '003', name: 'Contenedor Vianda', price: 0.45, image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/contenedor_bisagra_portacomida_peru_1773781902193.png', category: 'Contenedores', stock: 3100 },
    { id: '004', name: 'Cubiertos Premium', price: 0.35, image: '/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/cubiertos_descartables_premium_1773781915994.png', category: 'Cubiertos', stock: 12500 },
]

const CUSTOMER_TYPES = [
    { id: 'dist', name: 'Distribuidor Gold (-15%)', color: 'bg-emerald-500' },
    { id: 'mayor', name: 'Mayorista (-10%)', color: 'bg-[#0f4c81]' },
    { id: 'minor', name: 'Minorista (Precio Base)', color: 'bg-slate-400' },
]

const SALES_PRODUCTS = PRODUCTS;

export default function VentasFacturacion() {
    const [cart, setCart] = useState<any[]>([])
    const [customerType, setCustomerType] = useState('minor')
    const [searchTerm, setSearchTerm] = useState('')

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.id === product.id)
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
        } else {
            setCart([...cart, { ...product, qty: 1 }])
        }
    }

    const removeFromCart = (id: string) => {
        const existing = cart.find(item => item.id === id)
        if (existing.qty > 1) {
            setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item))
        } else {
            setCart(cart.filter(item => item.id !== id))
        }
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    const discount = customerType === 'dist' ? subtotal * 0.15 : customerType === 'mayor' ? subtotal * 0.10 : 0
    const igv = (subtotal - discount) * 0.18
    const total = subtotal - discount + igv

    return (
        <div className="space-y-8 pb-10">
            {/* Header with Connectivity Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0f4c81] rounded-2xl text-white shadow-lg">
                        <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-1">Punto de Venta & Facturación</h1>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-tighter italic">
                                <ShieldCheck className="h-3 w-3 mr-1" /> SUNAT ONLINE
                            </Badge>
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-tighter italic">
                                <Cloud className="h-3 w-3 mr-1" /> SYNC NUBE OK
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-black uppercase tracking-tighter text-[10px]">
                        <History className="h-4 w-4 mr-2" /> Historial de Docs
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-black uppercase tracking-tighter text-[10px]">
                        <UserSquare2 className="h-4 w-4 mr-2" /> Cambiar Cliente
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Product Catalog */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Search & Filter */}
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-border shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Escanee código o busque producto..."
                                className="pl-10 h-10 rounded-xl border-none bg-slate-50 text-sm font-medium italic"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['Todos', 'Vasos', 'Platos', 'Cubiertos', 'Bolsas'].map(cat => (
                                <Button key={cat} variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-tighter rounded-lg h-9">
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Grid de Productos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {SALES_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                            <motion.div
                                key={p.id}
                                whileHover={{ scale: 1.02, y: -4 }}
                                className="p-4 bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => addToCart(p)}
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-4xl">{p.image}</span>
                                </div>
                                <div className="relative">
                                    <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] uppercase tracking-widest mb-2">
                                        {p.category}
                                    </Badge>
                                    <h3 className="font-black text-slate-800 text-sm italic uppercase leading-tight mb-4 min-h-[40px]">{p.name}</h3>

                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">P. Unitario</span>
                                            <span className="text-lg font-black text-[#0f4c81] italic leading-none">S/ {p.price.toFixed(2)}</span>
                                        </div>
                                        <div className="p-2 bg-[#0f4c81] rounded-xl text-white group-hover:bg-[#e8820c] transition-colors">
                                            <Plus className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                                        <span>Stock: {p.stock}</span>
                                        <span>Cód: {p.id}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Checkout Panel */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-border border-l-4 border-l-[#0f4c81] shadow-2xl flex flex-col h-[calc(100vh-200px)] sticky top-24">
                    {/* Header Checkout */}
                    <div className="p-6 border-b border-border bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-sm text-slate-800 uppercase italic tracking-widest flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-[#0f4c81]" />
                                Carrito de Venta
                            </h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => setCart([])}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Customer Dynamic Pricing Selector */}
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Tipo de Cliente / Lista de Precios</span>
                            <div className="flex gap-2">
                                {CUSTOMER_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setCustomerType(type.id)}
                                        className={cn(
                                            "flex-1 py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all",
                                            customerType === type.id
                                                ? `${type.color} text-white border-transparent shadow-lg scale-105`
                                                : "bg-[#0f4c81]/5 border-transparent text-slate-500 hover:bg-[#0f4c81]/10"
                                        )}
                                    >
                                        {type.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <ScrollArea className="flex-1 p-6">
                        <AnimatePresence>
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 mt-10">
                                    <ShoppingCart className="h-12 w-12" />
                                    <p className="text-sm font-black italic uppercase tracking-widest text-center">Carrito Vacío — Escanea o selecciona</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex items-center gap-4 group"
                                        >
                                            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all border border-slate-100">
                                                {item.image}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-black text-slate-800 uppercase italic truncate leading-none mb-1">{item.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 italic">S/ {item.price.toFixed(2)} / Uni</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                                                    <button className="h-6 w-6 rounded-md hover:bg-white flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" onClick={() => removeFromCart(item.id)}>
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-xs font-black text-slate-800 w-4 text-center">{item.qty}</span>
                                                    <button className="h-6 w-6 rounded-md hover:bg-white flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors" onClick={() => addToCart(item)}>
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <span className="text-xs font-black text-[#0f4c81] w-14 text-right italic">S/ {(item.price * item.qty).toFixed(2)}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </ScrollArea>

                    {/* Totals & Summary */}
                    <div className="p-6 bg-slate-900 border-t border-slate-800 rounded-b-3xl text-white">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
                                <span>Subtotal</span>
                                <span>S/ {subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#e8820c]">
                                    <span>Descuento Especial</span>
                                    <span>-S/ {discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
                                <span>IGV (18%)</span>
                                <span>S/ {igv.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                <span className="text-xs font-black uppercase italic tracking-widest text-emerald-400">Total a Pagar</span>
                                <span className="text-2xl font-black italic tracking-tighter text-emerald-400 leading-none">S/ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-tighter italic h-12 flex flex-col gap-0.5">
                                <Smartphone className="h-4 w-4 mb-0.5" />
                                Cotización
                            </Button>
                            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-tighter italic h-12 flex flex-col gap-0.5">
                                <Receipt className="h-4 w-4 mb-0.5" />
                                Boleta / Fac.
                            </Button>
                        </div>

                        <Button className="w-full bg-[#e8820c] hover:bg-[#ff9500] text-white font-black text-xs uppercase italic tracking-widest h-14 shadow-[0_10px_30px_rgba(232,130,12,0.3)] gap-2 group">
                            Procesar Pago
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
