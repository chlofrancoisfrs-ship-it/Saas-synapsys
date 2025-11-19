"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface LanguageSelectorProps {
  value?: 'fr' | 'en'
  onChange?: (language: 'fr' | 'en') => void
  className?: string
}

export default function LanguageSelector({
  value,
  onChange,
  className = ''
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en'>(value || 'fr')

  useEffect(() => {
    // Charger la langue depuis localStorage au montage
    if (!value) {
      const storedLanguage = localStorage.getItem('language') as 'fr' | 'en' | null
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage)
      }
    }
  }, [value])

  const handleLanguageChange = (language: 'fr' | 'en') => {
    setSelectedLanguage(language)
    localStorage.setItem('language', language)
    if (onChange) {
      onChange(language)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant={selectedLanguage === 'fr' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('fr')}
        className="flex items-center gap-2"
      >
        <span className="text-lg">🇫🇷</span>
        <span>FR</span>
      </Button>
      <Button
        type="button"
        variant={selectedLanguage === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
        className="flex items-center gap-2"
      >
        <span className="text-lg">🇬🇧</span>
        <span>EN</span>
      </Button>
    </div>
  )
}
