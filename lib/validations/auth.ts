import { z } from 'zod'

// =====================================================
// VALIDATION SCHEMAS FOR AUTHENTICATION
// =====================================================

// Messages d'erreur personnalisés
const errorMessages = {
  fr: {
    email: {
      required: 'L\'email est requis',
      invalid: 'Email invalide',
    },
    password: {
      required: 'Le mot de passe est requis',
      minLength: 'Minimum 8 caractères',
      uppercase: 'Au moins une majuscule requise',
      number: 'Au moins un chiffre requis',
      special: 'Au moins un caractère spécial requis',
    },
    confirmPassword: {
      required: 'Veuillez confirmer votre mot de passe',
      mismatch: 'Les mots de passe ne correspondent pas',
    },
    fullName: {
      required: 'Le nom complet est requis',
      minLength: 'Minimum 2 caractères',
    },
  },
  en: {
    email: {
      required: 'Email is required',
      invalid: 'Invalid email',
    },
    password: {
      required: 'Password is required',
      minLength: 'Minimum 8 characters',
      uppercase: 'At least one uppercase letter required',
      number: 'At least one number required',
      special: 'At least one special character required',
    },
    confirmPassword: {
      required: 'Please confirm your password',
      mismatch: 'Passwords do not match',
    },
    fullName: {
      required: 'Full name is required',
      minLength: 'Minimum 2 characters',
    },
  },
}

// Fonction pour obtenir les messages selon la langue
export const getErrorMessages = (lang: 'fr' | 'en' = 'fr') => errorMessages[lang]

// =====================================================
// PASSWORD VALIDATION
// =====================================================

const passwordRegex = {
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
}

export const passwordSchema = z
  .string()
  .min(1, 'Le mot de passe est requis')
  .min(8, 'Minimum 8 caractères')
  .regex(passwordRegex.uppercase, 'Au moins une majuscule requise')
  .regex(passwordRegex.number, 'Au moins un chiffre requis')
  .regex(passwordRegex.special, 'Au moins un caractère spécial requis')

// =====================================================
// LOGIN SCHEMA
// =====================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

// =====================================================
// SIGNUP SCHEMA
// =====================================================

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Le nom complet est requis')
      .min(2, 'Minimum 2 caractères')
      .max(100, 'Maximum 100 caractères'),
    email: z
      .string()
      .min(1, 'L\'email est requis')
      .email('Email invalide'),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Veuillez confirmer votre mot de passe'),
    language: z.enum(['fr', 'en']).optional().default('fr'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

// =====================================================
// RESET PASSWORD SCHEMA
// =====================================================

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// =====================================================
// UPDATE PASSWORD SCHEMA
// =====================================================

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

// =====================================================
// PASSWORD STRENGTH CALCULATOR
// =====================================================

export interface PasswordStrength {
  score: number // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong'
  color: string
  percentage: number
  feedback: string[]
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  const feedback: string[] = []

  if (!password) {
    return {
      score: 0,
      label: 'weak',
      color: '#EF4444',
      percentage: 0,
      feedback: ['Entrez un mot de passe'],
    }
  }

  // Longueur
  if (password.length >= 8) score++
  else feedback.push('Minimum 8 caractères')

  if (password.length >= 12) score++

  // Majuscules
  if (passwordRegex.uppercase.test(password)) score++
  else feedback.push('Ajoutez une majuscule')

  // Chiffres
  if (passwordRegex.number.test(password)) score++
  else feedback.push('Ajoutez un chiffre')

  // Caractères spéciaux
  if (passwordRegex.special.test(password)) score++
  else feedback.push('Ajoutez un caractère spécial')

  // Déterminer le label et la couleur
  let label: PasswordStrength['label'] = 'weak'
  let color = '#EF4444' // Rouge

  if (score >= 4) {
    label = 'strong'
    color = '#10B981' // Vert
  } else if (score >= 3) {
    label = 'good'
    color = '#3B82F6' // Bleu
  } else if (score >= 2) {
    label = 'fair'
    color = '#F59E0B' // Orange
  }

  return {
    score,
    label,
    color,
    percentage: (score / 5) * 100,
    feedback,
  }
}

// =====================================================
// EMAIL DOMAIN VALIDATION
// =====================================================

const disposableEmailDomains = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
]

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase()
  return disposableEmailDomains.includes(domain)
}

// =====================================================
// RATE LIMITING (pour utilisation côté serveur)
// =====================================================

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // en millisecondes
}

export const rateLimitConfig: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 60 * 60 * 1000, // 1 heure
}
