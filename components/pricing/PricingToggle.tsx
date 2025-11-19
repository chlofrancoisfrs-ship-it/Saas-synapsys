"use client"

import { BillingPeriod, getYearlyDiscountPercentage } from '@/lib/stripe/plans'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PricingToggleProps {
  value: BillingPeriod
  onChange: (period: BillingPeriod) => void
}

export default function PricingToggle({ value, onChange }: PricingToggleProps) {
  const discountPercentage = getYearlyDiscountPercentage()

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Bouton Mensuel */}
      <button
        onClick={() => onChange('monthly')}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all',
          value === 'monthly'
            ? 'bg-primary text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        Mensuel
      </button>

      {/* Bouton Annuel */}
      <button
        onClick={() => onChange('yearly')}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all relative',
          value === 'yearly'
            ? 'bg-primary text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        Annuel
        <Badge
          className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5"
        >
          -{discountPercentage}%
        </Badge>
      </button>
    </div>
  )
}
