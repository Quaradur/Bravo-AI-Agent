"use client"

import { useState } from "react"
import Header from "@/components/header"
import BravoAIInterface from "@/components/bravo-ai-interface"
import LoginInterface from "@/components/login-interface"

export default function HomePage() {
  const [showPricingInterface, setShowPricingInterface] = useState(false)
  const [showLoginInterface, setShowLoginInterface] = useState(false)

  const handlePricingClick = () => {
    setShowPricingInterface(true)
    setShowLoginInterface(false)
  }

  const handleGetStartedClick = () => {
    setShowLoginInterface(true)
    setShowPricingInterface(false)
  }

  const handleBackToHome = () => {
    setShowPricingInterface(false)
    setShowLoginInterface(false)
  }

  if (showLoginInterface) {
    return <LoginInterface onBackToHome={handleBackToHome} />
  }

  if (showPricingInterface) {
    return <BravoAIInterface />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onPricingClick={handlePricingClick} onGetStartedClick={handleGetStartedClick} />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Bravo Web App</h1>
          <p className="text-muted-foreground text-lg">Your application is ready with the new header navbar.</p>
        </div>
      </main>
    </div>
  )
}


