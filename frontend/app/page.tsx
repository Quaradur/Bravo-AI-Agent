"use client"

import { useState } from "react"
import Header from "@/components/header"
import BravoAIInterface from "@/components/bravo-ai-interface"

export default function HomePage() {
  const [showPricingInterface, setShowPricingInterface] = useState(false)

  const handlePricingClick = () => {
    setShowPricingInterface(true)
  }

  const handleBackToHome = () => {
    setShowPricingInterface(false)
  }

  if (showPricingInterface) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-4 p-4">
          <button
            onClick={handleBackToHome}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        <BravoAIInterface />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onPricingClick={handlePricingClick} />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Bravo Web App</h1>
          <p className="text-muted-foreground text-lg">Your application is ready with the new header navbar.</p>
        </div>
      </main>
    </div>
  )
}
