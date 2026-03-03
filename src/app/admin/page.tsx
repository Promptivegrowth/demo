'use client'

import { useEffect, useState } from 'react'
import { supabase, createUserAccount } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CrudDialog } from '@/components/shared/crud-dialog'
import { Shield, UserPlus, Users, KeyRound, CheckCircle2, XCircle, Eye, EyeOff, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Profile { id: string; full_name: string; email: string; role: string; is_active: boolean; created_at: string }

export default function AdminPage() {
    const { isAdmin } = useAuthStore()
    const router = useRouter()
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [pwdOpen, setPwdOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newRole, setNewRole] = useState<'admin' | 'operativo'>('operativo')
    const [showPwd, setShowPwd] = useState(false)
    const [changePwd, setChangePwd] = useState('')

    useEffect(() => {
        if (!isAdmin()) { router.push('/'); return }
        fetchProfiles()
    }, [isAdmin, router])

    async function fetchProfiles() {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        setProfiles(data || [])
        setLoading(false)
    }

    async function handleCreateUser() {
        if (!newName || !newEmail || !newPassword) { toast.error('Complete todos los campos'); return }
        setSaving(true)
        try {
            await createUserAccount(newEmail, newPassword, newName, newRole)
            toast.success(`Usuario ${newName} creado como ${newRole}`)
            setCreateOpen(false); setNewName(''); setNewEmail(''); setNewPassword('')
            fetchProfiles()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Error al crear')
        }
        setSaving(false)
    }

    async function handleToggleRole(profile: Profile) {
        const newRole = profile.role === 'admin' ? 'operativo' : 'admin'
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id)
        if (error) toast.error('Error al cambiar rol')
        else { toast.success(`Rol cambiado a ${newRole}`); fetchProfiles() }
    }

    async function handleToggleActive(profile: Profile) {
        const { error } = await supabase.from('profiles').update({ is_active: !profile.is_active }).eq('id', profile.id)
        if (error) toast.error('Error al cambiar estado')
        else { toast.success(profile.is_active ? 'Usuario desactivado' : 'Usuario activado'); fetchProfiles() }
    }

    async function handleChangePassword() {
        if (!changePwd || changePwd.length < 6) { toast.error('Mínimo 6 caracteres'); return }
        setSaving(true)
        const { error } = await supabase.auth.admin.updateUserById(selectedProfile!.id, { password: changePwd })
        if (error) {
            // Admin API may not be available with anon key - fallback notification
            toast.info('Función de reset requiere service_role. El usuario puede cambiar su contraseña desde login.')
        } else {
            toast.success('Contraseña actualizada')
        }
        setPwdOpen(false); setChangePwd(''); setSaving(false)
    }

    const filtered = profiles.filter(p =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    )
    const activeCount = profiles.filter(p => p.is_active).length
    const adminCount = profiles.filter(p => p.role === 'admin').length

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestión de usuarios, roles y permisos del sistema</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="promptive-btn text-white">
                    <UserPlus className="h-4 w-4 mr-2" />Nuevo Usuario
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B234BD] to-[#8b5cf6]"><Users className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Total Usuarios</p><p className="text-xl font-bold">{profiles.length}</p></div>
                    </div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1AA3D9] to-[#0ea5e9]"><CheckCircle2 className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Activos</p><p className="text-xl font-bold">{activeCount}</p></div>
                    </div>
                </Card>
                <Card className="p-4 border-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F6AD27] to-[#f59e0b]"><Shield className="h-5 w-5 text-white" /></div>
                        <div><p className="text-xs text-muted-foreground">Administradores</p><p className="text-xl font-bold">{adminCount}</p></div>
                    </div>
                </Card>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar usuarios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            {/* User List */}
            <div className="grid gap-3">
                {filtered.map(profile => (
                    <Card key={profile.id} className="p-4 border-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full promptive-gradient text-white text-sm font-bold shrink-0">
                                    {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-sm">{profile.full_name}</p>
                                        <Badge variant="secondary" className={`text-[10px] ${profile.role === 'admin' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
                                            {profile.role === 'admin' ? '🔑 Admin' : '👤 Operativo'}
                                        </Badge>
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${profile.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${profile.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                                            {profile.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:shrink-0">
                                {/* Role Toggle */}
                                <select
                                    value={profile.role}
                                    onChange={() => handleToggleRole(profile)}
                                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="operativo">Operativo</option>
                                </select>

                                {/* Active Toggle */}
                                <button
                                    onClick={() => handleToggleActive(profile)}
                                    className={`relative h-6 w-11 rounded-full transition-colors ${profile.is_active ? 'bg-emerald-500' : 'bg-muted'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${profile.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>

                                {/* Password */}
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedProfile(profile); setPwdOpen(true) }}>
                                    <KeyRound className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create User */}
            <CrudDialog open={createOpen} onClose={() => setCreateOpen(false)} title="Crear Nuevo Usuario" onSave={handleCreateUser} loading={saving}>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre Completo</label>
                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="María García" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                    <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="maria@empresa.pe" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Contraseña</label>
                    <div className="relative">
                        <Input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="pr-10" />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Rol</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setNewRole('operativo')} className={`p-3 rounded-xl border text-center text-sm transition-all ${newRole === 'operativo' ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan font-medium' : 'border-border hover:border-brand-cyan/30'}`}>
                            👤 Operativo
                        </button>
                        <button onClick={() => setNewRole('admin')} className={`p-3 rounded-xl border text-center text-sm transition-all ${newRole === 'admin' ? 'border-brand-purple bg-brand-purple/10 text-brand-purple font-medium' : 'border-border hover:border-brand-purple/30'}`}>
                            🔑 Administrador
                        </button>
                    </div></div>
            </CrudDialog>

            {/* Change Password */}
            <CrudDialog open={pwdOpen} onClose={() => { setPwdOpen(false); setChangePwd('') }} title={`Cambiar Contraseña: ${selectedProfile?.full_name}`} onSave={handleChangePassword} loading={saving} saveLabel="Cambiar">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Nueva Contraseña</label>
                    <Input type="password" value={changePwd} onChange={e => setChangePwd(e.target.value)} placeholder="Mínimo 6 caracteres" /></div>
            </CrudDialog>
        </div>
    )
}
