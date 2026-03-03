import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

export function formatPercent(value: number): string {
  return `${value}%`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // General
    activo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pagada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    finalizado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    customer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    // Warning
    pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    en_revision: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    revision: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    qualified: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    proposal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    // In Progress
    en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    planeamiento: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    borrador: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    lead: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    // Danger
    vencida: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    licencia: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    vacaciones: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    // Misc
    media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    alta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    baja: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    lead: 'Lead',
    qualified: 'Calificado',
    proposal: 'Propuesta',
    won: 'Ganado',
    lost: 'Perdido',
    customer: 'Cliente',
    activo: 'Activo',
    vacaciones: 'Vacaciones',
    licencia: 'Licencia',
    completado: 'Completado',
    en_progreso: 'En Progreso',
    planeamiento: 'Planeamiento',
    revision: 'En Revisión',
    en_revision: 'En Revisión',
    pendiente: 'Pendiente',
    finalizado: 'Finalizado',
    pagada: 'Pagada',
    vencida: 'Vencida',
    borrador: 'Borrador',
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  }
  return labels[status] || status.charAt(0).toUpperCase() + status.slice(1)
}
