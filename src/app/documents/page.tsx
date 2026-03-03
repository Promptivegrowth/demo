'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FileText, FolderOpen, Search, Plus, Trash2, Upload, Download, FileSpreadsheet, FileType, Image, Presentation } from 'lucide-react'
import { toast } from 'sonner'

interface Document { id: string; name: string; file_type: string; file_size: number; folder: string; status: string; file_url?: string; created_at: string }

const FILE_ICONS: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-5 w-5 text-brand-pink" />,
    docx: <FileType className="h-5 w-5 text-brand-cyan" />,
    xlsx: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
    pptx: <Presentation className="h-5 w-5 text-brand-amber" />,
    jpg: <Image className="h-5 w-5 text-brand-purple" />,
    png: <Image className="h-5 w-5 text-brand-purple" />,
}

const STATUS_LABELS: Record<string, string> = { borrador: 'Borrador', revision: 'En Revisión', aprobado: 'Aprobado', archivado: 'Archivado' }

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Document[]>([])
    const [search, setSearch] = useState('')
    const [folderFilter, setFolderFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [newName, setNewName] = useState('')
    const [newType, setNewType] = useState('pdf')
    const [newFolder, setNewFolder] = useState('General')
    const [newStatus, setNewStatus] = useState('borrador')
    const [uploadFile, setUploadFile] = useState<File | null>(null)

    useEffect(() => { fetchDocs() }, [])

    async function fetchDocs() {
        const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
        setDocs(data || [])
        setLoading(false)
    }

    const folders = ['all', ...new Set(docs.map(d => d.folder))]
    const filtered = docs.filter(d => {
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
        const matchFolder = folderFilter === 'all' || d.folder === folderFilter
        return matchSearch && matchFolder
    })

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            setUploadFile(file)
            setNewName(file.name)
            const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
            setNewType(ext)
        }
    }

    async function handleCreate() {
        if (!newName) { toast.error('El nombre es obligatorio'); return }
        setSaving(true)
        const orgResult = await supabase.from('organizations').select('id').limit(1).single()

        let fileUrl = ''
        let fileSize = Math.floor(Math.random() * 500000) + 10000

        // Upload file if selected
        if (uploadFile) {
            setUploading(true)
            const fileName = `${Date.now()}_${uploadFile.name}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, uploadFile)

            if (uploadError) {
                // Storage bucket might not exist, that's ok for demo
                toast.info('Archivo registrado (almacenamiento demo)')
            } else if (uploadData) {
                const { data: urlData } = supabase.storage.from('documents').getPublicUrl(uploadData.path)
                fileUrl = urlData.publicUrl
            }
            fileSize = uploadFile.size
            setUploading(false)
        }

        const { error } = await supabase.from('documents').insert({
            name: newName, file_type: newType, file_size: fileSize,
            folder: newFolder, status: newStatus, file_url: fileUrl, org_id: orgResult.data?.id
        })
        if (error) toast.error('Error al crear documento')
        else { toast.success('Documento creado'); setCreateOpen(false); setNewName(''); setUploadFile(null); fetchDocs() }
        setSaving(false)
    }

    async function handleDelete() {
        if (!selectedDoc) return
        setSaving(true)
        const { error } = await supabase.from('documents').delete().eq('id', selectedDoc.id)
        if (error) toast.error('Error al eliminar')
        else { toast.success('Documento eliminado'); setDeleteOpen(false); setSelectedDoc(null); fetchDocs() }
        setSaving(false)
    }

    async function handleStatusChange(doc: Document, newStatus: string) {
        const { error } = await supabase.from('documents').update({ status: newStatus }).eq('id', doc.id)
        if (error) toast.error('Error al actualizar')
        else { toast.success('Estado actualizado'); fetchDocs() }
    }

    function handleDownload(doc: Document) {
        if (doc.file_url) {
            window.open(doc.file_url, '_blank')
        } else {
            // Demo: generate a simulated file download
            const content = `PROMPTIVE - ${doc.name}\n\nEste es un archivo de demostración generado por la plataforma PROMPTIVE.\n\nTipo: ${doc.file_type.toUpperCase()}\nCarpeta: ${doc.folder}\nEstado: ${STATUS_LABELS[doc.status]}\nTamaño: ${formatFileSize(doc.file_size)}\nFecha: ${new Date(doc.created_at).toLocaleDateString('es-PE')}\n`
            const blob = new Blob([content], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `${doc.name}.txt`; a.click()
            URL.revokeObjectURL(url)
            toast.success('Archivo descargado')
        }
    }

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestor de archivos corporativos</p></div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-1" />Subir Archivo
                    </Button>
                    <Button size="sm" onClick={() => setCreateOpen(true)} className="promptive-btn text-white">
                        <Plus className="h-4 w-4 mr-1" />Nuevo
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.docx,.xlsx,.pptx,.jpg,.png,.txt" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <Card key={key} className="p-3 border-0">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: key === 'borrador' ? '#94a3b8' : key === 'revision' ? '#F6AD27' : key === 'aprobado' ? '#22c55e' : '#1AA3D9' }} />
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className="ml-auto text-sm font-bold">{docs.filter(d => d.status === key).length}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar documentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
                <select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {folders.map(f => <option key={f} value={f}>{f === 'all' ? 'Todas las carpetas' : f}</option>)}
                </select>
            </div>

            {/* Upload preview */}
            {uploadFile && !createOpen && (
                <Card className="p-4 border-brand-purple/30 bg-brand-purple/5 border-dashed">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Upload className="h-5 w-5 text-brand-purple" />
                            <div><p className="text-sm font-medium">{uploadFile.name}</p><p className="text-xs text-muted-foreground">{formatFileSize(uploadFile.size)}</p></div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setUploadFile(null)}>Cancelar</Button>
                            <Button size="sm" className="promptive-btn text-white" onClick={() => setCreateOpen(true)}>Registrar</Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* File Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(doc => (
                    <Card key={doc.id} className="p-4 border-0 hover:shadow-lg transition-all group">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                                {FILE_ICONS[doc.file_type] || <FileText className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                                <div className="flex items-center gap-2 mt-1"><span className="text-xs text-muted-foreground uppercase">{doc.file_type}</span><span className="text-xs text-muted-foreground">·</span><span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</span></div>
                                <div className="flex items-center gap-2 mt-2"><FolderOpen className="h-3 w-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{doc.folder}</span></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <select value={doc.status} onChange={(e) => handleStatusChange(doc, e.target.value)} className="h-7 rounded-md border border-input bg-background px-2 text-xs">
                                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-brand-cyan hover:text-brand-cyan hover:bg-brand-cyan/10" onClick={() => handleDownload(doc)}>
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-brand-pink hover:text-brand-pink hover:bg-brand-pink/10" onClick={() => { setSelectedDoc(doc); setDeleteOpen(true) }}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo Documento" onSave={handleCreate} loading={saving || uploading} saveLabel={uploading ? 'Subiendo...' : 'Crear'}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre del Archivo</label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contrato-2026.pdf" /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                        <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="pdf">PDF</option><option value="docx">DOCX</option><option value="xlsx">XLSX</option><option value="pptx">PPTX</option><option value="jpg">JPG</option>
                        </select></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Estado</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select></div>
                </div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Carpeta</label><Input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="Contratos" /></div>
                {uploadFile && (
                    <div className="p-3 rounded-lg bg-brand-purple/5 border border-brand-purple/20">
                        <div className="flex items-center gap-2"><Upload className="h-4 w-4 text-brand-purple" /><span className="text-sm">{uploadFile.name}</span><span className="text-xs text-muted-foreground ml-auto">{formatFileSize(uploadFile.size)}</span></div>
                    </div>
                )}
            </CrudDialog>

            <ConfirmDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedDoc(null) }} onConfirm={handleDelete} title="Eliminar Documento" description={`¿Eliminar "${selectedDoc?.name}"?`} loading={saving} />
        </div>
    )
}
