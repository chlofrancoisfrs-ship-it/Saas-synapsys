"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, SignupInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'
import LanguageSelector from '@/components/auth/LanguageSelector'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      language: 'fr' as const,
    },
  })

  const password = watch('password')
  const language = watch('language')

  const onSubmit = async (data: SignupInput) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            language: data.language,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        },
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        setSuccess(true)

        // Attendre 2 secondes avant de rediriger
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Erreur inscription:', err)

      if (err.message?.includes('already registered')) {
        setError('Cet email est déjà utilisé')
      } else if (err.message?.includes('email')) {
        setError('Email invalide')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Compte créé avec succès !
          </CardTitle>
          <CardDescription>
            Vérifiez votre boîte email pour confirmer votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-600">
            Redirection en cours...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Créer un compte
          </CardTitle>
          <LanguageSelector
            value={language}
            onChange={(lang) => setValue('language', lang)}
          />
        </div>
        <CardDescription>
          Commencez à optimiser votre business dès aujourd&apos;hui
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Nom complet */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jean Dupont"
              {...register('fullName')}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            {password && <PasswordStrengthIndicator password={password} />}
          </div>

          {/* Confirmer mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Language (hidden field) */}
          <input type="hidden" {...register('language')} />

          {/* Bouton S'inscrire */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Création du compte...</span>
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>
        </form>

        {/* Séparateur */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Ou continuer avec
            </span>
          </div>
        </div>

        {/* Google Auth */}
        <GoogleAuthButton text="S'inscrire avec Google" />

        {/* Lien vers Login */}
        <div className="mt-6 text-center text-sm">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </div>

        {/* CGV */}
        <div className="mt-4 text-center text-xs text-gray-600">
          En vous inscrivant, vous acceptez nos{' '}
          <Link href="/legal/terms" className="text-primary hover:underline">
            Conditions d&apos;utilisation
          </Link>{' '}
          et notre{' '}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Politique de confidentialité
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
