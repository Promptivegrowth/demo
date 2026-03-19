'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Download, RefreshCw, Search, Filter,
    Edit3, History, AlertTriangle,
    PackageX, Activity, Check, X
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabInventario({ showToast }: { showToast: Function }) {
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')
    const [seleccionados, setSeleccionados] = useState<string[]>([])

    // Modal states
    const [modalForm, setModalForm] = useState<{ isOpen: boolean, type: 'new' | 'edit', data: any }>({ isOpen: false, type: 'new', data: null })
    const [modalReabastecer, setModalReabastecer] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })
    const [modalHistorial, setModalHistorial] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null })

    // Cargar datos
    const fetchProductos = async () => {
        setRefreshing(true)
        try {
            const { data, error } = await supabase
                .from('saf_productos')
                .select('*')
                .order('nombre')

            if (error) throw error
            setProductos(data || [])
        } catch (err: any) {
            showToast('Error al cargar inventario', 'error')
            console.error(err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchProductos()
    }, [])

    // Derived Values
    const activos = productos.filter(p => p.activo)
    const stats = {
        totalActivos: activos.length,
        valorTotal: activos.reduce((sum, p) => sum + (Number(p.stock_actual) * Number(p.precio_unitario)), 0),
        stockBajo: activos.filter(p => Number(p.stock_actual) < Number(p.stock_minimo) && Number(p.stock_actual) > 0).length,
        agotados: activos.filter(p => Number(p.stock_actual) <= 0).length
    }

    // Filtered List
    const filteredList = productos.filter(p => {
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        let matchEstado = true
        const sActual = Number(p.stock_actual)
        const sMinimo = Number(p.stock_minimo)
        if (filtroEstado === 'Normal') matchEstado = sActual >= sMinimo
        else if (filtroEstado === 'Stock Bajo') matchEstado = sActual < sMinimo && sActual > 0
        else if (filtroEstado === 'Agotado') matchEstado = sActual <= 0
        return matchBusqueda && matchEstado
    })

    // Formatters
    const formatSoles = (valor: number) => `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    // Actions
    const handleExportCSV = () => {
        showToast('Exportando CSV...', 'info')

        setTimeout(() => {
            const cabeceras = ['ID', 'Nombre', 'Unidad', 'Stock Actual', 'Stock Minimo', 'Precio S/', 'Estado', 'Activo']
            const filas = productos.map(p => [
                p.id, p.nombre, p.unidad, p.stock_actual, p.stock_minimo, p.precio_unitario,
                Number(p.stock_actual) <= 0 ? 'Agotado' : Number(p.stock_actual) < Number(p.stock_minimo) ? 'Stock Bajo' : 'Normal',
                p.activo ? 'Si' : 'No'
            ])

            const csvContent = "data:text/csv;charset=utf-8,"
                + cabeceras.join(",") + "\n"
                + filas.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", encodedUri)
            link.setAttribute("download", `inventario_sergensaf_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            showToast('Exportado exitosamente', 'success')
        }, 1500)
    }

    const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const payload = {
            nombre: formData.get('nombre') as string,
            unidad: formData.get('unidad') as string,
            stock_actual: Number(formData.get('stock')),
            stock_minimo: Number(formData.get('minimo')),
            precio_unitario: Number(formData.get('precio')),
            activo: formData.get('activo') === 'on'
        }

        if (!payload.nombre || payload.precio_unitario <= 0) {
            showToast('Revise los campos obligatorios.', 'warning')
            return
        }

        try {
            if (modalForm.type === 'new') {
                const { error } = await supabase.from('saf_productos').insert(payload)
                if (error) throw error
                showToast('Producto creado exitosamente', 'success')
            } else {
                const { error } = await supabase.from('saf_productos').update(payload).eq('id', modalForm.data.id)
                if (error) throw error
                showToast('Producto actualizado', 'success')
            }
            setModalForm({ isOpen: false, type: 'new', data: null })
            fetchProductos()
        } catch (err: any) {
            showToast('Error al guardar: ' + err.message, 'error')
        }
    }

    const handleReabastecer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const cantForm = new FormData(e.currentTarget)
        const agregar = Number(cantForm.get('cantidad'))
        if (agregar <= 0) return showToast('Ingrese una cantidad válida', 'warning')

        const p = modalReabastecer.data
        const newStock = Number(p.stock_actual) + agregar

        try {
            const { error } = await supabase.from('saf_productos').update({ stock_actual: newStock }).eq('id', p.id)
            if (error) throw error
            showToast(`Stock actualizado: +${agregar} ${p.unidad}`, 'success')
            setModalReabastecer({ isOpen: false, data: null })
            fetchProductos()
        } catch (err: any) {
            showToast('Error: ' + err.message, 'error')
        }
    }

    return (
        <div className="space-y-6 text-[#e6edf3]">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-rajdhani font-bold text-[#f0a500]">Inventario de Agregados</h2>
                    <p className="text-sm text-[#8b949e]">{stats.totalActivos} productos activos</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setModalForm({ isOpen: true, type: 'new', data: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-semibold rounded-lg text-sm transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Nuevo Producto
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-medium rounded-lg text-sm border border-[#30363d] transition-colors"
                    >
                        <Download className="h-4 w-4 text-[#8b949e]" /> Exportar CSV
                    </button>
                    <button
                        onClick={fetchProductos}
                        className="p-2 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] rounded-lg border border-[#30363d] transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[#f0a500]' : ''}`} />
                    </button>
                </div>
            </div>

            {/* CARDS RESUMEN */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Total Productos Activos</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#e6edf3]">{stats.totalActivos}</p>
                </div>
                <div className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Valor Total en Stock</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#238636]">{formatSoles(stats.valorTotal)}</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border shadow-sm ${stats.stockBajo > 0 ? 'border-[#9e6a03]' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-2">
                        Productos con Stock Bajo {stats.stockBajo > 0 && <AlertTriangle className="h-3 w-3 text-[#f0a500]" />}
                    </p>
                    <p className="text-3xl font-rajdhani font-bold text-[#f0a500]">{stats.stockBajo}</p>
                </div>
                <div className={`bg-[#161b22] p-5 rounded-xl border shadow-sm ${stats.agotados > 0 ? 'border-[#da3633]' : 'border-[#30363d]'}`}>
                    <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-2">
                        Productos Agotados {stats.agotados > 0 && <PackageX className="h-3 w-3 text-[#da3633]" />}
                    </p>
                    <p className="text-3xl font-rajdhani font-bold text-[#da3633]">{stats.agotados}</p>
                </div>
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de producto..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#f0a500] transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#8b949e]" />
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#f0a500]"
                    >
                        <option value="Todos">Todos los Estados</option>
                        <option value="Normal">Normal</option>
                        <option value="Stock Bajo">Stock Bajo</option>
                        <option value="Agotado">Agotado</option>
                    </select>
                </div>
            </div>

            {/* BATCH ACTIONS (if selected) */}
            <AnimatePresence>
                {seleccionados.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#21262d] border border-[#f0a500]/30 p-3 rounded-lg flex items-center justify-between"
                    >
                        <span className="text-sm font-medium text-[#f0a500]">{seleccionados.length} items seleccionados</span>
                        <div className="flex gap-2">
                            <button onClick={() => setSeleccionados([])} className="text-xs text-[#8b949e] hover:text-white px-3 py-1">Cancelar</button>
                            <button
                                className="px-3 py-1.5 bg-[#da3633]/10 hover:bg-[#da3633]/20 text-[#da3633] text-xs font-semibold rounded border border-[#da3633]/30 transition-colors"
                                onClick={async () => {
                                    try {
                                        await supabase.from('saf_productos').update({ activo: false }).in('id', seleccionados)
                                        showToast(`${seleccionados.length} productos desactivados`, 'info')
                                        setSeleccionados([])
                                        fetchProductos()
                                    } catch (err) { showToast('Error al desactivar', 'error') }
                                }}
                            >
                                Desactivar Selección
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TABLA */}
            <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#e6edf3]">
                        <thead className="bg-[#21262d] text-[#8b949e] uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={seleccionados.length === filteredList.length && filteredList.length > 0}
                                        onChange={(e) => setSeleccionados(e.target.checked ? filteredList.map(p => p.id) : [])}
                                        className="accent-[#f0a500] bg-transparent"
                                    />
                                </th>
                                <th className="px-4 py-3 font-medium">Producto</th>
                                <th className="px-4 py-3 font-medium text-center">Unidad</th>
                                <th className="px-4 py-3 font-medium text-right">Stock Actual</th>
                                <th className="px-4 py-3 font-medium text-right">Mínimo</th>
                                <th className="px-4 py-3 font-medium text-right">Precio/m³</th>
                                <th className="px-4 py-3 font-medium text-right">Valor Stock</th>
                                <th className="px-4 py-3 font-medium text-center">Estado</th>
                                <th className="px-4 py-3 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-[#161b22]">
                                        <td className="px-4 py-4 text-center"><div className="h-4 w-4 bg-[#30363d] rounded inline-block" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-32 bg-[#30363d] rounded" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-10 bg-[#30363d] rounded mx-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-12 bg-[#30363d] rounded ml-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-12 bg-[#30363d] rounded ml-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-16 bg-[#30363d] rounded ml-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-20 bg-[#30363d] rounded ml-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-5 w-16 bg-[#30363d] rounded-full mx-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-6 w-20 bg-[#30363d] rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-[#8b949e]">
                                        No se encontraron productos en el inventario.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((p) => {
                                    const sActual = Number(p.stock_actual)
                                    const sMinimo = Number(p.stock_minimo)
                                    const agotado = sActual <= 0
                                    const bajo = !agotado && sActual < sMinimo

                                    return (
                                        <tr key={p.id} className="hover:bg-[#21262d]/50 transition-colors group">
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionados.includes(p.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSeleccionados([...seleccionados, p.id])
                                                        else setSeleccionados(seleccionados.filter(id => id !== p.id))
                                                    }}
                                                    className="accent-[#f0a500]"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium ${!p.activo ? 'text-[#8b949e] line-through' : ''}">
                                                {p.nombre}
                                                {!p.activo && <span className="ml-2 text-[9px] bg-[#30363d] px-1.5 py-0.5 rounded text-[#8b949e] uppercase">Inactivo</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center text-[#8b949e]">{p.unidad}</td>
                                            <td className={`px-4 py-3 text-right font-rajdhani font-bold text-base ${agotado ? 'text-[#da3633]' : bajo ? 'text-[#f0a500]' : 'text-[#e6edf3]'}`}>
                                                {sActual}
                                            </td>
                                            <td className="px-4 py-3 text-right text-[#8b949e]">{sMinimo}</td>
                                            <td className="px-4 py-3 text-right font-medium text-[#f0a500]">{formatSoles(Number(p.precio_unitario))}</td>
                                            <td className="px-4 py-3 text-right font-bold">{formatSoles(sActual * Number(p.precio_unitario))}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${agotado ? 'bg-[#da3633]/10 text-[#da3633] border-[#da3633]/30' :
                                                        bajo ? 'bg-[#9e6a03]/20 text-[#f0a500] border-[#9e6a03]/40' :
                                                            'bg-[#238636]/10 text-[#238636] border-[#238636]/30'
                                                    }`}>
                                                    {agotado ? <PackageX className="h-3 w-3" /> : bajo ? <AlertTriangle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                    {agotado ? 'Agotado' : bajo ? 'Stock Bajo' : 'Normal'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setModalForm({ isOpen: true, type: 'edit', data: p })} className="p-1.5 bg-[#1f6feb]/10 hover:bg-[#1f6feb]/20 text-[#1f6feb] rounded transition-colors" title="Editar">
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => setModalReabastecer({ isOpen: true, data: p })} className="p-1.5 bg-[#238636]/10 hover:bg-[#238636]/20 text-[#238636] rounded transition-colors" title="Reabastecer Rápido">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => setModalHistorial({ isOpen: true, data: p })} className="p-1.5 bg-[#30363d] hover:bg-[#8b949e]/30 text-[#8b949e] hover:text-[#e6edf3] rounded transition-colors" title="Ver Historial">
                                                        <History className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: FORMULARIO PRODUCTO */}
            <AnimatePresence>
                {modalForm.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d]">
                                <h3 className="text-lg font-rajdhani font-bold text-[#f0a500]">{modalForm.type === 'new' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
                                <button onClick={() => setModalForm({ isOpen: false, type: 'new', data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Nombre *</label>
                                    <input name="nombre" defaultValue={modalForm.data?.nombre} required className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f0a500]" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Unidad base</label>
                                        <select name="unidad" defaultValue={modalForm.data?.unidad || 'm³'} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f0a500]">
                                            <option value="m³">m³</option>
                                            <option value="ton">Toneladas</option>
                                            <option value="und">Unidad</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Precio S/. *</label>
                                        <input name="precio" type="number" step="0.01" min="0.01" defaultValue={modalForm.data?.precio_unitario} required className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f0a500]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-[#30363d] pt-4 mt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Stock Actual</label>
                                        <input name="stock" type="number" step="0.01" defaultValue={modalForm.data?.stock_actual || 0} className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-sm font-rajdhani font-bold text-[#e6edf3]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1" title="Nivel mínimo antes de alerta">Stock Mínimo</label>
                                        <input name="minimo" type="number" step="0.01" defaultValue={modalForm.data?.stock_minimo || 0} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f0a500]" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="activo" defaultChecked={modalForm.data ? modalForm.data.activo : true} className="w-4 h-4 accent-[#f0a500]" />
                                        <span className="text-sm font-medium text-[#e6edf3]">Producto Activo para ventas</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-[#30363d]">
                                    <button type="button" onClick={() => setModalForm({ isOpen: false, type: 'new', data: null })} className="flex-1 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-medium rounded-lg text-sm transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors">Guardar Producto</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: REABASTECER */}
            <AnimatePresence>
                {modalReabastecer.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d]">
                                <h3 className="text-lg font-rajdhani font-bold text-[#238636] flex items-center gap-2"><Plus className="h-5 w-5" /> Ingreso Rápido</h3>
                                <button onClick={() => setModalReabastecer({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleReabastecer} className="p-6 space-y-4">
                                <div className="text-center p-4 bg-[#21262d] rounded-lg border border-[#30363d]">
                                    <p className="text-xs text-[#8b949e] uppercase mb-1">Producto</p>
                                    <p className="font-bold text-[#e6edf3]">{modalReabastecer.data.nombre}</p>
                                    <p className="text-xs text-[#8b949e] mt-1">Stock Actual: <span className="text-white">{modalReabastecer.data.stock_actual} {modalReabastecer.data.unidad}</span></p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">Cantidad a agregar ({modalReabastecer.data.unidad})</label>
                                    <input name="cantidad" type="number" step="0.01" min="0.01" required autoFocus className="w-full bg-[#0d1117] border border-[#238636]/50 rounded-lg px-3 py-3 text-lg font-rajdhani font-bold text-center text-[#238636] focus:outline-none focus:border-[#238636] transition-colors" />
                                </div>
                                <button type="submit" className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-lg text-sm transition-colors">Confirmar Ingreso</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: HISTORIAL (Simulado) */}
            <AnimatePresence>
                {modalHistorial.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center p-5 border-b border-[#30363d]">
                                <h3 className="text-lg font-rajdhani font-bold text-[#e6edf3] flex items-center gap-2"><History className="h-5 w-5" /> Historial de Movimientos</h3>
                                <button onClick={() => setModalHistorial({ isOpen: false, data: null })} className="text-[#8b949e] hover:text-white"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="p-4 bg-[#21262d] border-b border-[#30363d]">
                                <p className="font-bold text-[#f0a500]">{modalHistorial.data.nombre}</p>
                                <p className="text-xs text-[#8b949e] mt-1">Visor simulado de movimientos recientes.</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {/* Mock logs */}
                                {[...Array(6)].map((_, i) => {
                                    const isEntrada = Math.random() > 0.5;
                                    const cant = (Math.random() * 50 + 10).toFixed(2);
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
                                            <div className="flex gap-3 items-center">
                                                <div className={`p-1.5 rounded-lg ${isEntrada ? 'bg-[#238636]/20 text-[#238636]' : 'bg-[#da3633]/20 text-[#da3633]'}`}>
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#e6edf3]">{isEntrada ? 'Reabastecimiento Producción' : 'Despacho Venta'}</p>
                                                    <p className="text-[10px] text-[#8b949e]">Hace {i + 1} días</p>
                                                </div>
                                            </div>
                                            <span className={`font-rajdhani font-bold text-lg ${isEntrada ? 'text-[#238636]' : 'text-[#da3633]'}`}>
                                                {isEntrada ? '+' : '-'}{cant}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
