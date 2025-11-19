"use client"

import { useMemo } from 'react'
import { calculatePasswordStrength } from '@/lib/validations/auth'
import { CheckCircle2, XCircle } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  showFeedback?: boolean
}

export default function PasswordStrengthIndicator({
  password,
  showFeedback = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    return calculatePasswordStrength(password)
  }, [password])

  if (!password) return null

  const labelText = {
    weak: 'Faible',
    fair: 'Moyen',
    good: 'Bon',
    strong: 'Fort',
  }

  return (
    <div className="space-y-2">
      {/* Barre de progression */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Force du mot de passe</span>
          <span
            className="font-medium"
            style={{ color: strength.color }}
          >
            {labelText[strength.label]}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${strength.percentage}%`,
              backgroundColor: strength.color,
            }}
          />
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-600">Critères requis :</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs">
              {password.length >= 8 ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span className={password.length >= 8 ? 'text-green-700' : 'text-gray-600'}>
                Minimum 8 caractères
              </span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              {/[A-Z]/.test(password) ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span className={/[A-Z]/.test(password) ? 'text-green-700' : 'text-gray-600'}>
                Une majuscule
              </span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              {/[0-9]/.test(password) ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span className={/[0-9]/.test(password) ? 'text-green-700' : 'text-gray-600'}>
                Un chiffre
              </span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-700' : 'text-gray-600'}>
                Un caractère spécial (!@#$%...)
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
