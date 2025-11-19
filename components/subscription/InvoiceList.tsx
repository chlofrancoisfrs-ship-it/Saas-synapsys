"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Invoice {
  id: string
  amount_paid: number
  amount_due: number
  currency: string
  status: string
  created: number
  invoice_pdf: string | null
  hosted_invoice_url: string | null
  number: string | null
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stripe/invoices')

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des factures')
      }

      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Payée</Badge>
      case 'open':
        return <Badge className="bg-blue-500">En attente</Badge>
      case 'void':
        return <Badge variant="outline">Annulée</Badge>
      case 'uncollectible':
        return <Badge variant="destructive">Impayée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique de facturation</CardTitle>
          <CardDescription>Consultez et téléchargez vos factures</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique de facturation</CardTitle>
          <CardDescription>Consultez et téléchargez vos factures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique de facturation</CardTitle>
        <CardDescription>
          Consultez et téléchargez vos factures
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Aucune facture disponible</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">
                      {invoice.number || `Facture ${invoice.id.slice(-8)}`}
                    </p>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {format(new Date(invoice.created * 1000), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatAmount(invoice.amount_paid || invoice.amount_due, invoice.currency)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {invoice.hosted_invoice_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(invoice.hosted_invoice_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {invoice.invoice_pdf && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(invoice.invoice_pdf!, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
