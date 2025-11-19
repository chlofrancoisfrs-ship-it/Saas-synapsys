"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Plug, Zap, TrendingUp, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingModalProps {
  open: boolean
  userId: string
}

const steps = [
  {
    icon: Plug,
    title: 'Connecter vos plateformes',
    description: 'YouTube, LinkedIn, Instagram, Stripe minimum',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Configurer vos workflows',
    description: 'Activez l\'analyse automatique',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: TrendingUp,
    title: 'Optimiser votre business',
    description: 'Suivez vos résultats en temps réel',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
]

export default function OnboardingModal({ open, userId }: OnboardingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGetStarted = async () => {
    try {
      setIsLoading(true)

      // Mark onboarding as completed
      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      // Redirect to integrations page
      router.push('/dashboard/integrations')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    try {
      setIsLoading(true)

      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      router.refresh()
    } catch (error) {
      console.error('Error skipping onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-3xl">
            Bienvenue sur Synapsys ! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Connectez vos plateformes pour débloquer toute la puissance de Synapsys
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-6">
          {/* Video Placeholder */}
          {process.env.NEXT_PUBLIC_ONBOARDING_VIDEO_URL ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={process.env.NEXT_PUBLIC_ONBOARDING_VIDEO_URL}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <div className="h-12 w-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Automatisez votre business
                </h3>
                <p className="text-sm text-gray-600">
                  Synapsys analyse vos données et optimise votre génération de revenus automatiquement
                </p>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-3 rounded-lg', step.bgColor)}>
                        <Icon className={cn('h-6 w-6', step.color)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      <div className="h-6 w-6 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={handleGetStarted}
            disabled={isLoading}
            className="w-full"
          >
            <Plug className="h-5 w-5 mr-2" />
            Connecter mes plateformes
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full"
          >
            Passer l&apos;introduction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
