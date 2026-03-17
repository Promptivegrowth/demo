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
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

// --- MOCK DATA ---
const PRODUCTS = [
    { id: '001', name: 'Vaso PP 12oz', price: 0.12, image: '/manufactura/vaso.png', category: 'Vasos', stock: 15400 },
    { id: '002', name: 'Plato PET 9"', price: 0.25, image: '/manufactura/plato.png', category: 'Platos', stock: 8200 },
    { id: '003', name: 'Contenedor Vianda', price: 0.45, image: '/manufactura/contenedor.png', category: 'Contenedores', stock: 3100 },
    { id: '004', name: 'Cubiertos Premium', price: 0.35, image: '/manufactura/cubiertos.png', category: 'Cubiertos', stock: 12500 },
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
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('efectivo')
    const [cashReceived, setCashReceived] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [sunatStatus, setSunatStatus] = useState<'idle' | 'processing' | 'success'>('idle')


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

    const handleCheckout = () => {
        setIsProcessing(true)
        setSunatStatus('processing')
        setTimeout(() => {
            setSunatStatus('success')
            setIsProcessing(false)
            setTimeout(() => {
                setCart([])
                setIsCheckoutOpen(false)
                setSunatStatus('idle')
            }, 2000)
        }, 3000)
    }

    const change = parseFloat(cashReceived) - total


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

                        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full bg-[#e8820c] hover:bg-[#ff9500] text-white font-black text-xs uppercase italic tracking-widest h-14 shadow-[0_10px_30px_rgba(232,130,12,0.3)] gap-2 group"
                                    disabled={cart.length === 0}
                                >
                                    Procesar Pago
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl border-none p-0 overflow-hidden max-w-2xl">
                                {sunatStatus === 'idle' ? (
                                    <>
                                        <div className="p-8 bg-[#0f4c81] text-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="text-2xl font-black italic uppercase leading-none mb-1">Finalizar Venta</h2>
                                                    <p className="text-white/60 text-xs font-medium italic">Selecciona el método de pago y emite el comprobante.</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Total a Cobrar</span>
                                                    <span className="text-3xl font-black italic tracking-tighter text-emerald-400">S/ {total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 grid grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Método de Pago</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {['efectivo', 'tarjeta', 'yape', 'transferencia'].map(m => (
                                                            <Button
                                                                key={m}
                                                                variant="outline"
                                                                className={cn(
                                                                    "h-12 font-black uppercase italic text-[10px] rounded-xl border-slate-100",
                                                                    paymentMethod === m ? "bg-[#0f4c81] text-white border-transparent" : "text-slate-500"
                                                                )}
                                                                onClick={() => setPaymentMethod(m)}
                                                            >
                                                                {m}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {paymentMethod === 'efectivo' && (
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#e8820c] italic">Monto Recibido</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black italic">S/</span>
                                                            <Input
                                                                className="pl-10 h-12 rounded-xl text-lg font-black italic border-slate-100 focus:border-[#e8820c]"
                                                                placeholder="0.00"
                                                                value={cashReceived}
                                                                onChange={(e) => setCashReceived(e.target.value)}
                                                            />
                                                        </div>
                                                        {cashReceived && (
                                                            <div className={cn(
                                                                "p-3 rounded-xl font-black italic text-center text-xs",
                                                                change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                            )}>
                                                                {change >= 0
                                                                    ? `Vuelto: S/ ${change.toFixed(2)} ${change === 0 ? ' (Exacto ✓)' : ''}`
                                                                    : `Faltan: S/ ${Math.abs(change).toFixed(2)}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {paymentMethod === 'tarjeta' && (
                                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center animate-in fade-in slide-in-from-top-2">
                                                        <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                                        <p className="text-[10px] text-blue-700 font-black uppercase italic">Esperando comunicación con POS Izipay/Niubiz...</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Tipo de Comprobante</Label>
                                                    <Select defaultValue="boleta">
                                                        <SelectTrigger className="h-12 rounded-xl border-slate-100 font-black italic uppercase">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="boleta">Boleta Electrónica</SelectItem>
                                                            <SelectItem value="factura">Factura Electrónica</SelectItem>
                                                            <SelectItem value="nota">Nota de Venta</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                                                    <div className="flex justify-between text-[9px] font-black italic text-slate-400 uppercase">
                                                        <span>ITEMS</span>
                                                        <span>{cart.length}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[9px] font-black italic text-slate-400 uppercase">
                                                        <span>IGV (18%)</span>
                                                        <span>S/ {igv.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-black italic text-[#0f4c81] uppercase pt-2 border-t border-slate-200">
                                                        <span>TOTAL</span>
                                                        <span>S/ {total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black italic uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                    onClick={handleCheckout}
                                                    disabled={isProcessing || (paymentMethod === 'efectivo' && (!cashReceived || change < 0))}
                                                >
                                                    Confirmar Pago
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                                        {sunatStatus === 'processing' ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                    className="p-4 bg-blue-50 rounded-full border-4 border-t-[#0f4c81] border-blue-100"
                                                >
                                                    <Cloud className="h-12 w-12 text-[#0f4c81]" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-xl font-black italic uppercase text-slate-800">Comunicando con SUNAT</h3>
                                                    <p className="text-sm text-slate-500 font-medium italic">Se está generando el archivo XML y firmando digitalmente...</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="p-4 bg-emerald-50 rounded-full text-emerald-500"
                                                >
                                                    <CheckCircle2 className="h-16 w-16" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-black italic uppercase text-emerald-600">¡Venta Exitosa!</h3>
                                                    <p className="text-sm text-slate-500 font-medium italic mb-4">Comprobante B001-000456 emitido y verificado.</p>
                                                    <div className="flex gap-2 justify-center">
                                                        <Button size="sm" variant="outline" className="rounded-xl font-bold uppercase text-[9px] h-9 italic"><Printer className="h-3.5 w-3.5 mr-2" /> Imprimir</Button>
                                                        <Button size="sm" variant="outline" className="rounded-xl font-bold uppercase text-[9px] h-9 italic"><Mail className="h-3.5 w-3.5 mr-2" /> Enviar</Button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </div>
    )
}
