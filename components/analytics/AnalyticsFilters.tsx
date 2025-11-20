"use client"

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Calendar as CalendarIcon, FileDown, Table, Clock, Check } from 'lucide-react'
import { format, subDays, startOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface AnalyticsFiltersProps {
  dateRange: { from: Date; to: Date }
  platforms: string[]
  onDateRangeChange: (range: { from: Date; to: Date }) => void
  onPlatformsChange: (platforms: string[]) => void
  onExportPDF: () => void
  onExportCSV: () => void
  onScheduleReport: () => void
}

const PLATFORM_OPTIONS = [
  { value: 'youtube', label: 'YouTube', color: '#FF0000' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F' },
  { value: 'stripe', label: 'Stripe', color: '#635BFF' },
  { value: 'other', label: 'Autre', color: '#6B7280' },
]

const DATE_PRESETS = [
  { label: "Aujourd'hui", value: () => ({ from: new Date(), to: new Date() }) },
  { label: '7 derniers jours', value: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: '30 derniers jours', value: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: '90 derniers jours', value: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: 'Cette année', value: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

export default function AnalyticsFilters({
  dateRange,
  platforms,
  onDateRangeChange,
  onPlatformsChange,
  onExportPDF,
  onExportCSV,
  onScheduleReport,
}: AnalyticsFiltersProps) {
  const [platformsOpen, setPlatformsOpen] = useState(false)

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      onPlatformsChange(platforms.filter(p => p !== platform))
    } else {
      onPlatformsChange([...platforms, platform])
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange && "text-gray-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd MMM", { locale: fr })} -{" "}
                    {format(dateRange.to, "dd MMM yyyy", { locale: fr })}
                  </>
                ) : (
                  format(dateRange.from, "dd MMM yyyy", { locale: fr })
                )
              ) : (
                <span>Sélectionner une période</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <div className="border-r p-2">
                <div className="space-y-1">
                  {DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onDateRangeChange(preset.value())}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-3">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={{ from: dateRange?.from, to: dateRange?.to }}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      onDateRangeChange({ from: range.from, to: range.to })
                    }
                  }}
                  numberOfMonths={2}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Platform Multi-select */}
        <Popover open={platformsOpen} onOpenChange={setPlatformsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between">
              <span className="mr-2">
                {platforms.length === 0 ? 'Toutes les plateformes' : `${platforms.length} plateforme(s)`}
              </span>
              {platforms.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {platforms.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher..." />
              <CommandList>
                <CommandEmpty>Aucune plateforme trouvée.</CommandEmpty>
                <CommandGroup>
                  {PLATFORM_OPTIONS.map((platform) => {
                    const isSelected = platforms.includes(platform.value)
                    return (
                      <CommandItem
                        key={platform.value}
                        onSelect={() => togglePlatform(platform.value)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300",
                            isSelected && "bg-gray-900 text-white border-gray-900"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div
                          className="h-2 w-2 rounded-full mr-2"
                          style={{ backgroundColor: platform.color }}
                        />
                        <span>{platform.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected platforms badges */}
        {platforms.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {platforms.map(p => {
              const platform = PLATFORM_OPTIONS.find(opt => opt.value === p)
              return platform ? (
                <Badge key={p} variant="secondary" className="gap-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  {platform.label}
                </Badge>
              ) : null
            })}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <FileDown className="h-4 w-4 mr-2" />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Table className="h-4 w-4 mr-2" />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={onScheduleReport}>
          <Clock className="h-4 w-4 mr-2" />
          Programmer
        </Button>
      </div>
    </div>
  )
}
