"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface ScheduleReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (config: ScheduleConfig) => Promise<void>
}

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  format: ('pdf' | 'csv')[]
  content: string[]
  recipients: string[]
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
]

const CONTENT_OPTIONS = [
  { id: 'kpis', label: 'KPIs Overview' },
  { id: 'revenue', label: 'Graphique revenus' },
  { id: 'top-content', label: 'Top 10 performers' },
  { id: 'funnel', label: 'Analyse entonnoir' },
  { id: 'attribution', label: 'Modèle attribution' },
  { id: 'predictions', label: 'Projections' },
]

export default function ScheduleReportModal({ isOpen, onClose, onSchedule }: ScheduleReportModalProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly')
  const [time, setTime] = useState('09:00')
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [formatPDF, setFormatPDF] = useState(true)
  const [formatCSV, setFormatCSV] = useState(false)
  const [content, setContent] = useState<string[]>(['kpis', 'revenue'])
  const [recipients, setRecipients] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const toggleContent = (contentId: string) => {
    if (content.includes(contentId)) {
      setContent(content.filter(id => id !== contentId))
    } else {
      setContent([...content, contentId])
    }
  }

  const addRecipient = () => {
    const email = emailInput.trim()
    if (!email) return
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Email invalide')
      return
    }
    
    if (recipients.includes(email)) {
      toast.error('Cet email est déjà dans la liste')
      return
    }
    
    setRecipients([...recipients, email])
    setEmailInput('')
  }

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(e => e !== email))
  }

  const handleSubmit = async () => {
    if (recipients.length === 0) {
      toast.error('Veuillez ajouter au moins un destinataire')
      return
    }

    if (!formatPDF && !formatCSV) {
      toast.error('Veuillez sélectionner au moins un format')
      return
    }

    if (content.length === 0) {
      toast.error('Veuillez sélectionner au moins un contenu')
      return
    }

    try {
      setIsLoading(true)
      const config: ScheduleConfig = {
        frequency,
        time,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
        format: [
          ...(formatPDF ? ['pdf' as const] : []),
          ...(formatCSV ? ['csv' as const] : []),
        ],
        content,
        recipients,
      }

      await onSchedule(config)
      toast.success('Rapport programmé avec succès')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la programmation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programmer un Rapport Automatique</DialogTitle>
          <DialogDescription>
            Configurez l&apos;envoi automatique de rapports analytics par email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequency */}
          <div className="space-y-3">
            <Label>Fréquence</Label>
            <RadioGroup value={frequency} onValueChange={(v: any) => setFrequency(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="freq-daily" />
                <Label htmlFor="freq-daily" className="font-normal cursor-pointer">
                  Quotidien (tous les jours)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="freq-weekly" />
                <Label htmlFor="freq-weekly" className="font-normal cursor-pointer">
                  Hebdomadaire
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="freq-monthly" />
                <Label htmlFor="freq-monthly" className="font-normal cursor-pointer">
                  Mensuel
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Day selection for weekly */}
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Jour de la semaine</Label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Day selection for monthly */}
          {frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>Jour du mois</Label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time */}
          <div className="space-y-2">
            <Label>Heure d&apos;envoi</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Format */}
          <div className="space-y-3">
            <Label>Format</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="format-pdf"
                  checked={formatPDF}
                  onCheckedChange={(checked) => setFormatPDF(!!checked)}
                />
                <Label htmlFor="format-pdf" className="font-normal cursor-pointer">
                  PDF (avec graphiques)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="format-csv"
                  checked={formatCSV}
                  onCheckedChange={(checked) => setFormatCSV(!!checked)}
                />
                <Label htmlFor="format-csv" className="font-normal cursor-pointer">
                  CSV (données brutes)
                </Label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <Label>Contenu à inclure</Label>
            <div className="space-y-2">
              {CONTENT_OPTIONS.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={'content-' + option.id}
                    checked={content.includes(option.id)}
                    onCheckedChange={() => toggleContent(option.id)}
                  />
                  <Label htmlFor={'content-' + option.id} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>Destinataires</Label>
            <div className="flex gap-2">
              <Input
                placeholder="email@exemple.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addRecipient()
                  }
                }}
              />
              <Button type="button" onClick={addRecipient}>
                Ajouter
              </Button>
            </div>
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipients.map(email => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeRecipient(email)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Programmation...' : 'Programmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
