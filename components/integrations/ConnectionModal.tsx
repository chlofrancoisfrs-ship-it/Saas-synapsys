"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlatformConfig } from '@/lib/integrations/platforms'
import { CheckCircle, Lock, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface ConnectionModalProps {
  platform: PlatformConfig
  isOpen: boolean
  onClose: () => void
  onConnect: (apiKey?: string) => Promise<void>
}

export default function ConnectionModal({
  platform,
  isOpen,
  onClose,
  onConnect,
}: ConnectionModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isOAuth = platform.authType === 'oauth'

  const handleConnect = async () => {
    try {
      setError('')
      setIsLoading(true)

      if (!isOAuth && !apiKey.trim()) {
        setError('Veuillez entrer votre API key')
        return
      }

      await onConnect(isOAuth ? undefined : apiKey)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const getInstructions = () => {
    switch (platform.id) {
      case 'telegram':
        return [
          'Ouvrez Telegram et cherchez @BotFather',
          'Envoyez /newbot et suivez les instructions',
          'Copiez le token API fourni',
          'Collez le token ci-dessous',
        ]
      case 'phantombuster':
        return [
          'Connectez-vous à PhantomBuster',
          'Allez dans Settings > API',
          'Créez une nouvelle API key',
          'Copiez la clé et collez-la ci-dessous',
        ]
      case 'whatsapp':
        return [
          'Configurez WhatsApp Business API via Meta',
          'Récupérez votre Phone Number ID',
          'Générez votre token d\'accès',
          'Collez le token ci-dessous',
        ]
      default:
        return []
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${platform.color}15` }}
            >
              {platform.logo}
            </div>
            Connecter {platform.name}
          </DialogTitle>
          <DialogDescription>
            {isOAuth
              ? `Autorisez Synapsys à accéder à votre compte ${platform.name}`
              : `Entrez votre API key ${platform.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Ce que nous récupérerons :</p>
            <ul className="space-y-1">
              {platform.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* OAuth Permissions */}
          {isOAuth && platform.scopes && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Permissions requises :
              </p>
              <ul className="space-y-1 text-xs text-gray-600">
                {platform.scopes.map((scope, index) => (
                  <li key={index}>• {scope}</li>
                ))}
              </ul>
            </div>
          )}

          {/* API Key Instructions */}
          {!isOAuth && (
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Instructions :</p>
                <ol className="space-y-1 text-sm text-gray-600">
                  {getInstructions().map((instruction, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-medium">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Entrez votre API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <Lock className="h-3 w-3 inline mr-1" />
              Vos données sont sécurisées et chiffrées. Nous ne partageons jamais vos informations.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* Documentation Link */}
          {platform.docs && (
            <a
              href={platform.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Besoin d&apos;aide ?
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="flex-1"
            style={{ backgroundColor: platform.color }}
          >
            {isLoading ? 'Connexion...' : isOAuth ? `Autoriser ${platform.name}` : 'Valider et connecter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
