"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { WorkflowConfig, WorkflowConfigField } from '@/lib/workflows/workflows'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface ConfigurationModalProps {
  workflow: WorkflowConfig
  isOpen: boolean
  currentConfig?: Record<string, any>
  onClose: () => void
  onSave: (config: Record<string, any>) => Promise<void>
}

export default function ConfigurationModal({
  workflow,
  isOpen,
  currentConfig = {},
  onClose,
  onSave,
}: ConfigurationModalProps) {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [frequency, setFrequency] = useState(workflow.defaultFrequency)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Initialize with current config or defaults
    const initialConfig: Record<string, any> = {}
    workflow.configFields.forEach(field => {
      initialConfig[field.key] = currentConfig[field.key] ?? field.defaultValue
    })
    setConfig(initialConfig)

    if (currentConfig.frequency) {
      setFrequency(currentConfig.frequency)
    }
    if (currentConfig.email_notifications !== undefined) {
      setEmailNotifications(currentConfig.email_notifications)
    }
    if (currentConfig.in_app_notifications !== undefined) {
      setInAppNotifications(currentConfig.in_app_notifications)
    }
  }, [workflow, currentConfig])

  const handleFieldChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setError('')
      setIsLoading(true)

      // Validate required fields
      for (const field of workflow.configFields) {
        if (field.required && !config[field.key]) {
          setError(`Le champ "${field.label}" est requis`)
          return
        }
      }

      const fullConfig = {
        ...config,
        frequency,
        email_notifications: emailNotifications,
        in_app_notifications: inAppNotifications,
      }

      await onSave(fullConfig)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (field: WorkflowConfigField) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.key}
              type={field.type}
              value={config[field.key] || ''}
              onChange={(e) => handleFieldChange(
                field.key,
                field.type === 'number' ? parseFloat(e.target.value) : e.target.value
              )}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={config[field.key] || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={config[field.key] || field.defaultValue}
              onValueChange={(value) => handleFieldChange(field.key, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'multiselect':
        const selectedValues = config[field.key] || field.defaultValue || []
        return (
          <div key={field.key} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2 border rounded-md p-3">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.key}-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFieldChange(field.key, [...selectedValues, option.value])
                      } else {
                        handleFieldChange(
                          field.key,
                          selectedValues.filter((v: string) => v !== option.value)
                        )
                      }
                    }}
                  />
                  <label
                    htmlFor={`${field.key}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={config[field.key] ?? field.defaultValue ?? false}
              onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
            />
            <div className="space-y-1 leading-none">
              <label
                htmlFor={field.key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {field.label}
              </label>
              {field.helpText && (
                <p className="text-xs text-gray-500">{field.helpText}</p>
              )}
            </div>
          </div>
        )

      case 'slider':
        const sliderValue = config[field.key] ?? field.defaultValue ?? field.min ?? 0
        return (
          <div key={field.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <span className="text-sm font-medium">{sliderValue}</span>
            </div>
            <input
              id={field.key}
              type="range"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              value={sliderValue}
              onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'radio':
        return (
          <div key={field.key} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={config[field.key] || field.defaultValue}
              onValueChange={(value) => handleFieldChange(field.key, value)}
            >
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.key}-${option.value}`} />
                  <Label htmlFor={`${field.key}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${workflow.color}15` }}
            >
              <workflow.icon className="h-5 w-5" style={{ color: workflow.color }} />
            </div>
            Configurer {workflow.name}
          </DialogTitle>
          <DialogDescription>
            {workflow.longDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequency Configuration */}
          <div className="space-y-2">
            <Label>Fréquence d'exécution *</Label>
            <RadioGroup value={frequency} onValueChange={setFrequency}>
              {workflow.allowedFrequencies.includes('daily') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="freq-daily" />
                  <Label htmlFor="freq-daily">Quotidienne (tous les jours à 9h)</Label>
                </div>
              )}
              {workflow.allowedFrequencies.includes('weekly') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="freq-weekly" />
                  <Label htmlFor="freq-weekly">Hebdomadaire (tous les lundis à 9h)</Label>
                </div>
              )}
              {workflow.allowedFrequencies.includes('on_demand') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="on_demand" id="freq-on-demand" />
                  <Label htmlFor="freq-on-demand">Sur demande uniquement</Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Notifications */}
          <div className="space-y-3 border-t pt-4">
            <Label>Notifications</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-notif"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => setEmailNotifications(!!checked)}
                />
                <label htmlFor="email-notif" className="text-sm">
                  M'envoyer un email après chaque exécution
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="app-notif"
                  checked={inAppNotifications}
                  onCheckedChange={(checked) => setInAppNotifications(!!checked)}
                />
                <label htmlFor="app-notif" className="text-sm">
                  M'envoyer une notification in-app
                </label>
              </div>
            </div>
          </div>

          {/* Workflow-specific fields */}
          {workflow.configFields.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-base font-semibold">Configuration spécifique</Label>
              {workflow.configFields.map(field => renderField(field))}
            </div>
          )}

          {/* Required integrations warning */}
          {workflow.requiredIntegrations.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Intégrations requises</p>
                <p className="text-blue-700">
                  Ce workflow nécessite : {workflow.requiredIntegrations.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            style={{ backgroundColor: workflow.color }}
          >
            {isLoading ? (
              'Enregistrement...'
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Enregistrer et activer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
