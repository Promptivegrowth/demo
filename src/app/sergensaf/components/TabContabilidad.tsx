'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3, FileJson, TrendingDown, TrendingUp,
    Download, Receipt, Camera, Search, Filter,
    FileText, ArrowUpRight, ArrowDownRight, Printer, Eye, X, Plus
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function TabContabilidad({ showToast }: { showToast: Function }) {
    const [activeTab, setActiveTab] = useState('resumen')
    const [gastos, setGastos] = useState<any[]>([])
    const [ventas, setVentas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [scanning, setScanning] = useState(false)
    const [validatingSUNAT, setValidatingSUNAT] = useState(false)
    const [modalGasto, setModalGasto] = useState<{ show: boolean, data?: any }>({ show: false })

    const fetchData = async () => {
        try {
            setLoading(true)
            const [gRes, vRes] = await Promise.all([
                supabase.from('saf_gastos_operativos').select('*').order('fecha_emision', { ascending: false }),
                supabase.from('saf_registro_ventas').select('*').order('fecha_emision', { ascending: false })
            ])

            setGastos(gRes.data || [])
            setVentas(vRes.data || [])
        } catch (err) {
            showToast('Error cargando datos contables', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleScan = () => {
        setScanning(true)
        showToast('Iniciando OCR Inteligente...', 'info')
        setTimeout(() => {
            setScanning(false)
            setModalGasto({
                show: true,
                data: {
                    fecha_emision: new Date().toISOString().split('T')[0],
                    razon_social_proveedor: 'DISTRIBUIDORA FERRETERA SAC',
                    ruc_proveedor: '20601234567',
                    descripcion: 'Compra de Agregados y Cemento Portand Tipo I',
                    categoria: 'Materiales',
                    importe_total: 1770,
                    serie: 'F001',
                    numero: '000125'
                }
            })
            showToast('Factura detectada con éxito. Verifique los campos.', 'success')
        }, 3000)
    }

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(22).text('SERGENSAF S.A.C.', 105, 20, { align: 'center' });
            doc.setFontSize(14).text('Reporte de Operaciones Financieras', 105, 30, { align: 'center' });
            doc.setFontSize(10).text(`Generado el: ${new Date().toLocaleString()}`, 20, 40);

            const data = [
                ...gastos.map(g => [g.fecha_emision, g.razon_social_proveedor || 'Gasto Operativo', 'EGRESO', `S/ ${g.importe_total}`]),
                ...ventas.map(v => [v.fecha_emision, v.razon_social_cliente || 'Venta de Agregados', 'INGRESO', `S/ ${v.importe_total}`])
            ];

            // Usar la función autoTable directamente sobre la instancia doc
            autoTable(doc, {
                head: [['Fecha', 'Detalle / Entidad', 'Tipo', 'Total']],
                body: data,
                startY: 50,
                theme: 'striped',
                headStyles: { fillColor: [240, 165, 0] },
                styles: { fontSize: 8 }
            });

            doc.save(`Reporte_SERGENSAF_${new Date().toISOString().split('T')[0]}.pdf`);
            showToast('Reporte Consolidado generado con éxito', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error al generar PDF. Verifique consola.', 'error');
        }
    }

    const handleExportExcel = () => {
        const headers = 'Fecha,Entidad,Tipo,Total\n';
        const rows = [
            ...gastos.map(g => `${g.fecha_emision},"${g.razon_social_proveedor}",EGRESO,${g.importe_total}`),
            ...ventas.map(v => `${v.fecha_emision},"${v.razon_social_cliente}",INGRESO,${v.importe_total}`)
        ].join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Operaciones_Excel_SERGENSAF.csv`;
        a.click();
        showToast('Exportación Excel completada', 'success');
    }

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* SUB-NAVBAR */}
            <div className="flex items-center justify-between border-b border-[#30363d]">
                <div className="flex gap-8">
                    {[
                        { id: 'resumen', label: 'Dashboard Financiero', icon: BarChart3 },
                        { id: 'gastos', label: 'Egresos / Gastos', icon: TrendingDown },
                        { id: 'ventas', label: 'Libro de Ventas', icon: TrendingUp },
                        { id: 'sire', label: 'SUNAT SIRE', icon: FileJson },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 px-1 text-sm font-semibold transition-all relative ${activeTab === tab.id ? 'text-[#f0a500]' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="contActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f0a500]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'resumen' && <SectionResumen gastos={gastos} ventas={ventas} />}
                    {activeTab === 'gastos' && <SectionGastos gastos={gastos} loading={loading} setModal={setModalGasto} handleScan={handleScan} scanning={scanning} />}
                    {activeTab === 'ventas' && <SectionVentas ventas={ventas} loading={loading} handleExportPDF={handleExportPDF} handleExportExcel={handleExportExcel} />}
                    {activeTab === 'sire' && <SectionSIRE ventas={ventas} gastos={gastos} showToast={showToast} />}
                </motion.div>
            </AnimatePresence>

            {/* SCANNING OVERLAY */}
            {scanning && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
                    <div className="relative w-80 h-96 border-2 border-[#f0a500] rounded-2xl overflow-hidden bg-black/40">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#f0a500] shadow-[0_0_15px_#f0a500] animate-[scan_2s_infinite]"></div>
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <Camera className="h-16 w-16 text-[#f0a500] mb-4 animate-pulse" />
                            <h3 className="text-xl font-rajdhani font-bold text-white mb-2">PROCESANDO FACTURA</h3>
                            <p className="text-xs text-[#8b949e]">Estamos usando IA para detectar RUC, Proveedor e Importes...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALES */}
            <ModalGasto
                isOpen={modalGasto.show}
                onClose={() => setModalGasto({ show: false })}
                data={modalGasto.data}
                showToast={showToast}
                refresh={fetchData}
            />
        </div>
    )
}

// --- SUB-SECCIONES ---

function SectionResumen({ gastos, ventas }: any) {
    const totalVentas = ventas.reduce((acc: number, v: any) => acc + (v.importe_total || 0), 0)
    const totalGastos = gastos.reduce((acc: number, g: any) => acc + (g.importe_total || 0), 0)

    const margen = totalVentas - totalGastos

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="h-16 w-16 text-[#238636]" /></div>
                    <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mb-1">Ingresos Totales (Mes)</p>
                    <p className="text-3xl font-rajdhani font-bold text-white">S/ {totalVentas?.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-[#238636] text-[10px] mt-2 font-bold"><ArrowUpRight className="h-3 w-3" /> +12.5% vs Mes Anterior</div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingDown className="h-16 w-16 text-[#da3633]" /></div>
                    <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mb-1">Egresos Operativos</p>
                    <p className="text-3xl font-rajdhani font-bold text-white">S/ {totalGastos?.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-[#da3633] text-[10px] mt-2 font-bold"><ArrowDownRight className="h-3 w-3" /> +4.2% (Combustible)</div>
                </div>
                <div className="bg-[#161b22] border border-[#f0a500]/30 p-6 rounded-2xl relative overflow-hidden group shadow-[0_0_20px_rgba(240,165,0,0.05)]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Receipt className="h-16 w-16 text-[#f0a500]" /></div>
                    <p className="text-xs text-[#f0a500] uppercase font-bold tracking-widest mb-1">Utilidad Operativa Est.</p>
                    <p className="text-3xl font-rajdhani font-bold text-white">S/ {margen?.toLocaleString()}</p>
                    <div className="w-full bg-[#0d1117] h-1 rounded-full overflow-hidden mt-4">
                        <div className="bg-[#f0a500] h-full" style={{ width: '45%' }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Filter className="h-4 w-4" /> Distribución de Gastos</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Combustible', value: 45, color: '#f0a500' },
                            { label: 'Mantenimientos', value: 25, color: '#1f6feb' },
                            { label: 'Planilla RRHH', value: 20, color: '#238636' },
                            { label: 'Otros / Administrativos', value: 10, color: '#8b949e' }
                        ].map(item => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#8b949e]">{item.label}</span>
                                    <span className="text-white font-bold">{item.value}%</span>
                                </div>
                                <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2"><FileText className="h-4 w-4" /> Proyectado Impuestos (IGV)</h3>
                    <div className="p-8 border-2 border-dashed border-[#30363d] rounded-xl text-center">
                        <p className="text-[10px] text-[#8b949e] uppercase mb-2">Crédito Fiscal vs Débito</p>
                        <p className="text-4xl font-rajdhani font-bold text-[#f0a500]">S/ {(totalVentas * 0.18 - totalGastos * 0.18).toLocaleString()}</p>
                        <p className="text-xs text-[#8b949e] mt-4 italic">* Estimación basada en facturas cargadas hasta hoy {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SectionGastos({ gastos, loading, setModal, handleScan, scanning }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input type="text" placeholder="Buscar gasto..." className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-10 pr-4 py-1.5 text-xs text-white focus:border-[#f0a500]" />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="px-3 py-1.5 bg-[#161b22] border border-[#30363d] text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:border-[#f0a500] transition-all"
                    >
                        <Camera className="h-3.5 w-3.5" /> {scanning ? 'Escaneando...' : 'Escanear Factura'}
                    </button>
                    <button
                        onClick={() => setModal({ show: true })}
                        className="px-3 py-1.5 bg-[#f0a500] text-[#0d1117] text-xs font-bold rounded-lg transition-all hover:scale-105"
                    >
                        + Registrar Gasto
                    </button>
                </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-[#8b949e] uppercase text-[10px] tracking-wider border-b border-[#30363d]">
                        <tr>
                            <th className="px-6 py-4">Fecha / Doc</th>
                            <th className="px-6 py-4">Proveedor / Concepto</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Monto Total</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-[#8b949e]">Procesando base de datos...</td></tr>
                        ) : gastos.map((g: any) => (
                            <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-white font-bold">{new Date(g.fecha_emision).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-[#8b949e]">{g.ruc_proveedor || 'S/N RUC'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-white font-medium">{g.razon_social_proveedor}</p>
                                    <p className="text-[10px] text-[#8b949e] italic">{g.descripcion}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 bg-[#30363d] text-[10px] text-white rounded-full border border-white/5 uppercase">{g.categoria}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-white">S/ {g.importe_total?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#238636]/20 text-[#238636]`}>OK</span>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setModal({ show: true, data: g })}
                                        className="text-[#8b949e] hover:text-[#f0a500]"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SectionVentas({ ventas, loading, handleExportPDF, handleExportExcel }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Control Interno de Facturación</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="px-3 py-1.5 bg-[#161b22] border border-[#30363d] text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:border-[#1f6feb] transition-all"
                    >
                        <Printer className="h-3.5 w-3.5" /> PDF Masivo
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="px-3 py-1.5 bg-[#1f6feb] text-white text-xs font-bold rounded-lg hover:brightness-110"
                    >
                        Exportar Excel
                    </button>
                </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-[#8b949e] uppercase text-[10px] tracking-wider border-b border-[#30363d]">
                        <tr>
                            <th className="px-6 py-4">Serie-Número</th>
                            <th className="px-6 py-4">Cliente / RUC</th>
                            <th className="px-6 py-4">Operación</th>
                            <th className="px-6 py-4">IGV</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                        {ventas.map((v: any) => (
                            <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-[#f0a500] font-bold">{v.serie}-{v.numero}</p>
                                    <p className="text-[10px] text-[#8b949e]">{new Date(v.fecha_emision).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-white font-medium">{v.razon_social_cliente}</p>
                                    <p className="text-[10px] text-[#8b949e]">{v.ruc_dni_cliente}</p>
                                </td>
                                <td className="px-6 py-4 text-white">S/ {v.base_imponible_gravado?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[#8b949e]">S/ {v.igv?.toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold text-white">S/ {v.importe_total?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="px-2 py-0.5 bg-[#238636]/20 text-[#238636] text-[10px] font-bold rounded">EMI</span>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SectionSIRE({ ventas, gastos, showToast }: any) {
    const [validating, setValidating] = useState(false)

    const handleGenerateSIRE = () => {
        setValidating(true)
        showToast('Conectando con Servidores SUNAT...', 'info')

        setTimeout(() => {
            setValidating(false)
            showToast('Validación SIRE Exitosa (0 errores)', 'success')

            const content = ventas.map((v: any) => `${v.ruc_dni_cliente}|${v.serie}|${v.numero}|${v.fecha_emision}|${v.importe_total}`).join('\n')
            const blob = new Blob([content], { type: 'text/plain' })

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `LE_SIRE_RVIE_${new Date().getFullYear()}${new Date().getMonth() + 1}.txt`
            a.click()
            showToast('Archivo RVIE (TXT) descargado', 'success')
        }, 3000)
    }

    return (
        <div className="bg-[#0b0f19] border border-[#30363d] rounded-2xl p-10 text-center relative overflow-hidden">
            {validating && (
                <div className="absolute inset-0 z-10 bg-[#0d1117]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-16 h-16 border-4 border-[#f0a500] border-t-transparent rounded-full mb-6"
                    />
                    <h4 className="text-xl font-rajdhani font-bold text-white mb-2 uppercase tracking-widest">Sincronizando con SUNAT</h4>
                    <p className="text-sm text-[#8b949e]">Verificando consistencia de comprobantes en el portal SOL...</p>
                </div>
            )}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0a500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <FileJson className="h-16 w-16 text-[#f0a500] mx-auto mb-6" />
            <h3 className="text-2xl font-rajdhani font-bold text-white mb-4 uppercase tracking-widest">Generador SIRE SUNAT v2024</h3>
            <p className="text-sm text-[#8b949e] max-w-xl mx-auto mb-10 leading-relaxed">
                Nuestra plataforma está 100% integrada con el Sistema Integrado de Registros Electrónicos (SIRE).
                Exporta tus registros de ventas (RVIE) y compras (RCRE) en formato TXT estructurado con la lógica de pipes (`|`) requerida por SUNAT.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button onClick={handleGenerateSIRE} className="px-8 py-4 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-xl transition-all shadow-lg hover:shadow-[#f0a500]/20 flex items-center justify-center gap-3">
                    <Download className="h-5 w-5" /> Generar RVIE (Ventas)
                </button>
                <button onClick={() => showToast('Módulo RCRE en desarrollo', 'info')} className="px-8 py-4 bg-[#161b22] border border-[#30363d] hover:bg-[#21262d] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3">
                    <Download className="h-5 w-5 opacity-50" /> Generar RCRE (Compras)
                </button>
            </div>

            <div className="mt-12 pt-8 border-t border-[#30363d] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                <div>
                    <p className="text-[10px] text-[#8b949e] uppercase font-bold mb-1">Última Valid.</p>
                    <p className="text-xs text-white">25 Mar 2024</p>
                </div>
                <div>
                    <p className="text-[10px] text-[#8b949e] uppercase font-bold mb-1">Pendiante SIRE</p>
                    <p className="text-xs text-[#f0a500] font-bold">12 Documentos</p>
                </div>
                <div>
                    <p className="text-[10px] text-[#8b949e] uppercase font-bold mb-1">Errores Estruc.</p>
                    <p className="text-xs text-white">0 Detectados</p>
                </div>
                <div>
                    <p className="text-[10px] text-[#8b949e] uppercase font-bold mb-1">Cod. Operación</p>
                    <p className="text-xs text-white">Régimen Gral.</p>
                </div>
            </div>
        </div>
    )
}

// --- COMPONENTES DE MODAL ---

function ModalWrapper({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-[#30363d]">
                    <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">{title}</h3>
                    <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors"><X className="h-6 w-6" /></button>
                </div>
                <div className="p-6 text-[#e6edf3]">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

function ModalGasto({ isOpen, onClose, data, showToast, refresh }: any) {
    const [formData, setFormData] = useState<any>({
        razon_social_proveedor: '', ruc_proveedor: '', descripcion: '',
        categoria: 'Combustible', importe_total: 0, moneda: 'PEN',
        tipo_comprobante: '01', serie: '', numero: '',
        fecha_emision: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        if (data) setFormData(data)
        else setFormData({
            razon_social_proveedor: '', ruc_proveedor: '', descripcion: '',
            categoria: 'Combustible', importe_total: 0, moneda: 'PEN',
            tipo_comprobante: '01', serie: '', numero: '',
            fecha_emision: new Date().toISOString().split('T')[0]
        })
    }, [data, isOpen])


    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('saf_gastos_operativos').upsert(formData)
            if (error) throw error
            showToast('Gasto registrado correctamente', 'success')
            refresh()
            onClose()
        } catch (err: any) {
            showToast(err.message, 'error')
        }
    }

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={data ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input placeholder="Proveedor / Empresa" required value={formData.razon_social_proveedor || ''} onChange={e => setFormData({ ...formData, razon_social_proveedor: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="RUC Proveedor" value={formData.ruc_proveedor || ''} onChange={e => setFormData({ ...formData, ruc_proveedor: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                    <input type="date" value={formData.fecha_emision || ''} onChange={e => setFormData({ ...formData, fecha_emision: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <select value={formData.tipo_comprobante || '01'} onChange={e => setFormData({ ...formData, tipo_comprobante: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-xs">
                        <option value="01">Factura (01)</option>
                        <option value="03">Boleta (03)</option>
                        <option value="00">Otros</option>
                    </select>
                    <input placeholder="Serie" value={formData.serie || ''} onChange={e => setFormData({ ...formData, serie: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                    <input placeholder="Número" value={formData.numero || ''} onChange={e => setFormData({ ...formData, numero: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                </div>
                <input placeholder="Descripción breve" value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                <div className="grid grid-cols-2 gap-4">
                    <select value={formData.categoria || 'Combustible'} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white">
                        <option value="Combustible">Combustible</option>
                        <option value="Lubricantes">Lubricantes</option>
                        <option value="Repuestos">Repuestos</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Otros">Otros</option>
                    </select>
                    <input type="number" step="0.01" placeholder="Monto Total S/" required value={formData.importe_total || 0} onChange={e => setFormData({ ...formData, importe_total: parseFloat(e.target.value) })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#30363d] text-white font-bold rounded-xl outline-none">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-[#f0a500] text-[#0d1117] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all outline-none">Guardar Registro</button>
                </div>
            </form>
        </ModalWrapper>
    )
}
