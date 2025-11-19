import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          Bienvenue sur <span className="text-primary">Synapsys</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Centralisez toutes vos données business et optimisez votre temps pour générer du cash.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Commencer gratuitement
            </Button>
          </Link>

          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Se connecter
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-primary text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics Centralisés</h3>
            <p className="text-gray-600">
              Visualisez toutes vos données business en un seul endroit
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-primary text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Workflows Automatisés</h3>
            <p className="text-gray-600">
              Automatisez vos tâches répétitives avec N8N
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-primary text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Intégrations Multiples</h3>
            <p className="text-gray-600">
              Connectez tous vos outils préférés en quelques clics
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
