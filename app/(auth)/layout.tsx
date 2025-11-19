import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-blue-100/50">
      {/* Logo et header */}
      <div className="w-full py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center">
            <h1 className="text-3xl font-bold text-primary">
              Synapsys
            </h1>
          </Link>
        </div>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <Link href="/legal/terms" className="hover:text-primary transition-colors">
                Conditions d&apos;utilisation
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                Confidentialité
              </Link>
            </div>
            <div className="text-gray-500">
              © {new Date().getFullYear()} Synapsys. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
