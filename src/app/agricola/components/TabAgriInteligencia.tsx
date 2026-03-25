import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Cpu, Thermometer, Droplets, Wind, AlertTriangle,
    CheckCircle2, Info, TrendingUp, BarChart3, Leaf, Download, Clock
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Portal } from '@/components/shared/Portal'

export function TabAgriInteligencia() {
    const [parcelas, setParcelas] = useState<any[]>([])
    const [alertas, setAlertas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const [p, a] = await Promise.all([
                    agriService.getParcelas(),
                    agriService.getAlertasInteligentes()
                ])
                setParcelas(p)
                setAlertas(a)
            } catch (err) {
                toast.error('Error al conectar con el motor de IA')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const exportToPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.setTextColor(22, 101, 52)
        doc.text('REPORTE EJECUTIVO - INTELIGENCIA AGRÍCOLA', 20, 25)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 35)

        doc.setFontSize(14)
        doc.text('1. Salud de Suelo por Parcela', 20, 50)
        // @ts-ignore
        doc.autoTable({
            startY: 55,
            head: [['Parcela', 'Área', 'Salud', 'pH', 'N', 'P', 'K']],
            body: parcelas.map(p => [p.nombre, p.area, `${p.salud_suelo}%`, p.ph, p.n, p.p, p.k]),
            theme: 'grid',
            headStyles: { fillColor: [22, 101, 52], fontStyle: 'bold' }
        })

        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 100;

        doc.setFontSize(14)
        doc.text('2. Alertas de Inteligencia Detectadas', 20, finalY + 20)
        // @ts-ignore
        doc.autoTable({
            startY: finalY + 25,
            head: [['Tipo', 'Alerta', 'Gravedad', 'Descripción']],
            body: alertas.map(a => [a.tipo, a.titulo, a.severity, a.desc]),
            theme: 'striped',
            headStyles: { fillColor: [202, 138, 4], textColor: [0, 0, 0] }
        })

        doc.save('Reporte_Ejecutivo_Agricola_V2.pdf')
        toast.success('Reporte PDF (Parcelas + Alertas) generado')
    }

    const exportToExcel = () => {
        const headers = ['Parcela', 'Area', 'Salud', 'pH', 'Nitrogeno', 'Fosforo', 'Potasio']
        const csvContent = "data:text/csv;charset=utf-8," +
            headers.join(",") + "\n" +
            parcelas.map(p => `${p.nombre},${p.area},${p.salud_suelo},${p.ph},${p.n},${p.p},${p.k}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Consolidado_Agro_IA.csv");
        document.body.appendChild(link);
        link.click();
        toast.success('Excel consolidado generado')
    }

    const [selectedParcela, setSelectedParcela] = useState<any>(null)
    const [showRecom, setShowRecom] = useState(false)
    const [recomData, setRecomData] = useState<any>(null)
    const [loadingRecom, setLoadingRecom] = useState(false)

    const handleGenerateRecom = async (p: any) => {
        setSelectedParcela(p)
        setLoadingRecom(true)
        setShowRecom(true)
        try {
            const data = await agriService.getRecomendacionesIA(p.id)
            setRecomData(data)
        } catch (err) {
            toast.error('Error al generar recomendaciones')
            setShowRecom(false)
        } finally {
            setLoadingRecom(false)
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#166534] animate-pulse uppercase tracking-tighter">Sincronizando con Satélites...</div>

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Temperatura Campo', val: '28.4°C', sub: 'Condiciones Ideales', icon: Thermometer, color: 'text-[#166534]' },
                    { label: 'Humedad Suelo', val: '42.8%', sub: 'Riego Programado: 6:00 PM', icon: Droplets, color: 'text-blue-600' },
                    { label: 'Viento Promedio', val: '12 km/h', sub: 'Viento de Cola Norte', icon: Wind, color: 'text-slate-400' }
                ].map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                            <s.icon className={`w-20 h-20 ${s.color}`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-4xl font-black text-slate-800 tabular-nums tracking-tighter">{s.val}</p>
                        <p className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${s.color}`}>{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
                {/* Plots Analysis (Left) */}
                <div className="lg:col-span-8 bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full" />
                    <h4 className="font-black tracking-tight uppercase text-xs text-green-400 mb-8 flex items-center gap-2 relative z-10">
                        <BarChart3 className="w-4 h-4" />
                        Análisis de Salud de Cultivos y Suelo
                    </h4>

                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6 max-h-[850px] relative z-10">
                        {parcelas.map(p => (
                            <motion.div
                                key={p.id}
                                whileHover={{ x: 10 }}
                                className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all flex flex-col xl:flex-row gap-8"
                            >
                                <div className="xl:w-1/3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-xl font-black tracking-tight">{p.nombre}</p>
                                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${p.salud_suelo > 70 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {p.cultivo}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Extensión: {p.area} • Rev: {p.ultima_revision}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white/10 h-3 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${p.salud_suelo > 70 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${p.salud_suelo}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-green-400">{p.salud_suelo}%</span>
                                    </div>
                                    <button
                                        onClick={() => handleGenerateRecom(p)}
                                        className="mt-6 w-full py-3 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
                                    >
                                        Ver Recomendaciones IA
                                    </button>
                                </div>

                                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'pH Suelo', val: p.ph, icon: Info, color: 'text-indigo-400' },
                                        { label: 'Nitrógeno (N)', val: `${p.n}mg/kg`, icon: Leaf, color: 'text-green-400' },
                                        { label: 'Fósforo (P)', val: `${p.p}mg/kg`, icon: Leaf, color: 'text-amber-400' },
                                        { label: 'Potasio (K)', val: `${p.k}mg/kg`, icon: Leaf, color: 'text-orange-400' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center group/stat hover:bg-white/10 transition-all">
                                            <stat.icon className={`w-4 h-4 ${stat.color} mb-3 group-hover/stat:scale-125 transition-transform`} />
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">{stat.label}</p>
                                            <p className="text-sm font-black">{stat.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Intelligent Alerts (Right) */}
                <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative">
                    <h4 className="font-black text-slate-800 tracking-tight mb-8 uppercase text-xs flex items-center justify-between">
                        Alertas de Inteligencia
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </h4>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[850px] mb-6">
                        {alertas.map(a => (
                            <div key={a.id} className={`p-6 rounded-[1.5rem] border-2 flex flex-col gap-3 transition-all hover:translate-x-1 ${a.severity === 'High' ? 'bg-red-50 border-red-100' :
                                a.severity === 'Medium' ? 'bg-amber-50 border-amber-100' :
                                    'bg-blue-50 border-blue-100'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${a.severity === 'High' ? 'bg-red-500 text-white' :
                                        a.severity === 'Medium' ? 'bg-amber-500 text-white' :
                                            'bg-blue-500 text-white'
                                        }`}>
                                        {a.tipo}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-300" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase">{a.fecha}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-tight">{a.titulo}</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{a.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button
                            onClick={() => handleGenerateRecom(parcelas[0])}
                            className="w-full py-5 bg-[#166534] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Cpu className="w-5 h-5 text-green-300" />
                            Auditoría de Cultivo IA
                        </button>
                    </div>
                </div>
            </div>

            {/* Export Center */}
            <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-200 flex flex-col items-center justify-center text-center gap-8 shadow-inner">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 shadow-sm outline outline-offset-4 outline-green-500/10">
                    <Download className="w-10 h-10 text-[#166534] animate-bounce" />
                </div>
                <div className="max-w-2xl">
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight mb-3 uppercase tracking-tighter">Central de Reportes Ejecutivos</h4>
                    <p className="text-sm text-slate-400 font-medium px-8 italic leading-relaxed">Exporta la analítica consolidada de salud de suelo, alertas críticas y proyecciones climáticas para la toma de decisiones estratégicas en gerencia.</p>
                </div>
                <div className="flex flex-wrap gap-6 justify-center">
                    <button
                        onClick={exportToPDF}
                        className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs shadow-2xl shadow-slate-900/30 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border border-white/10"
                    >
                        PDF Ejecutivo de Campaña
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="px-12 py-5 bg-[#ca8a04] text-slate-900 rounded-[2rem] font-black text-xs shadow-2xl shadow-amber-950/30 hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        Data Consolidada (Excel/CSV)
                    </button>
                </div>
            </div>

            {/* Modal Recomendaciones IA */}
            {showRecom && (
                <Portal>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setShowRecom(false)} />
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-2xl w-full z-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 -mr-16 -mt-16 rounded-full blur-3xl" />

                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center">
                                    <Cpu className="w-10 h-10 text-green-600 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-2">RECOMENDACIONES IA</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedParcela?.nombre} • {selectedParcela?.cultivo}</p>
                                </div>
                            </div>

                            {loadingRecom ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ejecutando Modelos de Salud...</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="bg-[#166534] text-white p-8 rounded-[2rem] relative overflow-hidden">
                                        <TrendingUp className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
                                        <p className="text-[10px] font-black uppercase text-green-300 mb-2 tracking-widest">Ahorro Estimado de Insumos</p>
                                        <p className="text-4xl font-black tracking-tighter">{recomData?.ahorro_estimado}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            Hoja de Ruta Técnica
                                        </h4>
                                        <div className="space-y-3">
                                            {recomData?.consejos?.map((c: string, i: number) => (
                                                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-green-200 transition-all">
                                                    <span className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400">{i + 1}</span>
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{c}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button onClick={() => setShowRecom(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cerrar</button>
                                        <button onClick={() => { toast.success('Recomendaciones enviadas al equipo de campo'); setShowRecom(false); }} className="flex-[2] py-5 bg-[#166534] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-105 active:scale-95 transition-all">Programar Tareas en Campo</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </Portal>
            )}
        </div>
    )
}
