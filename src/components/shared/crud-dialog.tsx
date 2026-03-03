'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CrudDialogProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    onSave: () => void
    loading?: boolean
    saveLabel?: string
    children: React.ReactNode
}

export function CrudDialog({ open, onClose, title, description, onSave, loading, saveLabel = 'Guardar', children }: CrudDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="space-y-4 py-2">{children}</div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={onSave} disabled={loading} className="promptive-btn text-white border-0">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saveLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
