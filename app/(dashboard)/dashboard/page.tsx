"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRow, SubscriptionRow } from '@/types/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import OnboardingModal from '@/components/dashboard/OnboardingModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Video,
  Clock,
  Phone,
  MessageCircle,
  Zap,
  Plug,
  Play,
  Download,
  Mail,
  AlertCircle,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const [user, setUser] = useState<UserRow | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Mock data - in production, fetch from API
  const financialData = {
    currentMonth: 12450.67,
    previousMonth: 10800.00,
    percentageChange: 15.3,
    monthlyGoal: 15000,
    projected: 14200.50,
    dailyData: Array.from({ length: 30 }, (_, i) => ({
      date: `${i + 1} nov`,
      amount: Math.random() * 1000 + 300
    }))
  }

  const workflows = [
    { id: '1', name: 'Creator Insights', icon: Users, color: 'text-purple-600', isActive: true, stat: '5 nouveaux patterns détectés' },
    { id: '2', name: 'YouTube Conversion', icon: Video, color: 'text-red-600', isActive: true, stat: '12 appels générés' },
    { id: '3', name: 'Performance Tracking', icon: TrendingUp, color: 'text-blue-600', isActive: false, stat: '↗️ +12% cette semaine' },
    { id: '4', name: 'Time-to-Cash', icon: Clock, color: 'text-orange-600', isActive: true, stat: 'Score : 85/100' },
    { id: '5', name: 'Call Analysis', icon: Phone, color: 'text-green-600', isActive: true, stat: 'Taux closing: 35%' },
    { id: '6', name: 'WhatsApp Onboarding', icon: MessageCircle, color: 'text-green-700', isActive: false, stat: '8 prospects onboardés' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData as UserRow)
        setShowOnboarding(!userData.onboarding_completed)
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (subData) {
        setSubscription(subData as SubscriptionRow)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isTrialing = subscription?.status === 'trialing'
  const trialDaysLeft = subscription?.trial_end
    ? Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Onboarding Modal */}
      {showOnboarding && user && (
        <OnboardingModal open={showOnboarding} userId={user.id} />
      )}

      {/* Trial Banner */}
      {isTrialing && trialDaysLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-primary text-white rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold">
                Votre essai gratuit se termine dans {trialDaysLeft} jour{trialDaysLeft > 1 ? 's' : ''}
              </p>
              <p className="text-sm opacity-90">Profitez de toutes les fonctionnalités</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white text-primary hover:bg-gray-100" onClick={() => router.push('/settings/billing')}>
            Gérer mon abonnement
          </Button>
        </motion.div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.full_name || 'Bienvenue'} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Financial Overview */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold">Vue d&apos;ensemble financière</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">CA mois en cours</CardTitle>
                <Wallet className={`h-5 w-5 ${financialData.percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <CountUp end={financialData.currentMonth} decimals={2} suffix=" €" />
                </div>
                <p className={`text-sm mt-1 flex items-center gap-1 ${financialData.percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialData.percentageChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {financialData.percentageChange > 0 ? '+' : ''}{financialData.percentageChange}%
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">CA mois précédent</CardTitle>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {financialData.previousMonth.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Objectif mensuel</CardTitle>
                <Target className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {((financialData.currentMonth / financialData.monthlyGoal) * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {financialData.monthlyGoal.toLocaleString('fr-FR')} € objectif
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Projection fin de mois</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {financialData.projected.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </div>
                <p className="text-sm text-gray-600 mt-1">Basé sur tendance actuelle</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du CA - 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={financialData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)} €`, 'CA']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Section */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold">Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow, index) => {
            const Icon = workflow.icon
            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${workflow.color}`} />
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      </div>
                      <Badge variant={workflow.isActive ? 'default' : 'outline'} className={workflow.isActive ? 'bg-green-500' : ''}>
                        {workflow.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{workflow.stat}</p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/dashboard/workflows')}>
                      <Play className="h-4 w-4 mr-2" />
                      {workflow.isActive ? 'Voir le rapport' : 'Configurer'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/dashboard/integrations')}>
            <Plug className="h-5 w-5" />
            Connecter une plateforme
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/dashboard/workflows')}>
            <Zap className="h-5 w-5" />
            Lancer un workflow
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Download className="h-5 w-5" />
            Exporter rapport PDF
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Mail className="h-5 w-5" />
            Recevoir par email
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
