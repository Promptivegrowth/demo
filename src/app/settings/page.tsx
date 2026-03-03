'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShieldCheck, Lock, Eye, Edit3, Trash2, Activity } from 'lucide-react'

const MODULES = ['CRM & Ventas', 'Inventario', 'Finanzas', 'Operaciones', 'RR.HH.', 'Seguimiento', 'Analítica']

const ROLES = [
    { name: 'Administrador', color: 'bg-blue-500', permissions: [true, true, true, true, true, true, true] },
    { name: 'Operador', color: 'bg-amber-500', permissions: [false, true, false, true, false, true, false] },
    { name: 'Contador', color: 'bg-emerald-500', permissions: [true, false, true, false, true, false, true] },
    { name: 'Invitado', color: 'bg-gray-500', permissions: [false, false, false, false, false, false, false] },
]

const AUDIT_LOG = [
    { time: 'Hace 2 min', user: 'Carlos Mendoza', action: 'actualizó stock en', module: 'Inventario', color: 'text-brand-cyan' },
    { time: 'Hace 15 min', user: 'Sistema', action: 'generó reporte mensual de', module: 'RR.HH.', color: 'text-emerald-500' },
    { time: 'Hace 1 hora', user: 'Elena Rivas', action: 'creó nueva factura en', module: 'Finanzas', color: 'text-brand-purple' },
    { time: 'Hace 3 horas', user: 'Sistema', action: 'detectó stock bajo en', module: 'Inventario', color: 'text-brand-amber' },
    { time: 'Hace 1 día', user: 'Carlos Mendoza', action: 'cambió estado de workflow en', module: 'Operaciones', color: 'text-rose-500' },
]

export default function SettingsPage() {
    const [selectedRole, setSelectedRole] = useState(ROLES[0])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configuración & Seguridad</h1>
                <p className="text-sm text-muted-foreground mt-1">Gestión de accesos, roles y registro de auditoría</p>
            </div>

            {/* Role Management */}
            <Card className="p-5 border-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-brand-cyan" />
                        <h3 className="text-sm font-semibold">Matriz de Permisos (RBAC)</h3>
                    </div>
                    <div className="flex bg-muted p-1 rounded-xl gap-1">
                        {ROLES.map((role) => (
                            <button
                                key={role.name}
                                onClick={() => setSelectedRole(role)}
                                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${selectedRole.name === role.name
                                        ? 'bg-card shadow-sm text-blue-600 dark:text-blue-400'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <div className={`h-2 w-2 rounded-full ${role.color}`} />
                                    {role.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Módulo</TableHead>
                            <TableHead className="text-center">Ver</TableHead>
                            <TableHead className="text-center">Editar</TableHead>
                            <TableHead className="text-center">Eliminar</TableHead>
                            <TableHead>Acceso</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MODULES.map((mod, index) => {
                            const hasAccess = selectedRole.permissions[index]
                            return (
                                <TableRow key={mod} className={!hasAccess ? 'opacity-40' : ''}>
                                    <TableCell className="font-medium">{mod}</TableCell>
                                    <TableCell className="text-center">
                                        <Eye className={`h-4 w-4 mx-auto ${hasAccess ? 'text-brand-cyan' : 'text-muted-foreground/30'}`} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Edit3 className={`h-4 w-4 mx-auto ${hasAccess ? 'text-brand-cyan' : 'text-muted-foreground/30'}`} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Trash2 className={`h-4 w-4 mx-auto ${hasAccess ? 'text-brand-cyan' : 'text-muted-foreground/30'}`} />
                                    </TableCell>
                                    <TableCell>
                                        {hasAccess ? (
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <ShieldCheck className="h-3 w-3 mr-1" />Acceso Total
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                                                <Lock className="h-3 w-3 mr-1" />Restringido
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Card>

            {/* Audit Log */}
            <Card className="p-5 border-0 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4 text-brand-cyan" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Registro de Auditoría</h3>
                </div>
                <div className="space-y-3">
                    {AUDIT_LOG.map((log, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                            <span className={`text-xs font-semibold whitespace-nowrap ${log.color}`}>{log.time}</span>
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{log.user}</span> {log.action}{' '}
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{log.module}</Badge>
                            </p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Multi-tenancy Info */}
            <Card className="p-5 border-0 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">🏢 Multi-Tenancy Ready</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                    La estructura de base de datos está preparada para separar datos por organizaciones.
                    Cada registro incluye un campo <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">org_id</code> que
                    permite aislar datos entre empresas, garantizando privacidad y seguridad de nivel empresarial.
                </p>
            </Card>
        </div>
    )
}
