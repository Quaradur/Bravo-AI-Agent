"use client"

import { useState } from "react"
import Header from "@/components/header"
import BravoAIInterface from "@/components/bravo-ai-interface"
import LoginInterface from "@/components/login-interface" // Added LoginInterface import

export default function HomePage() {
  const [showPricingInterface, setShowPricingInterface] = useState(false)
  const [showLoginInterface, setShowLoginInterface] = useState(false) // Added login interface state

  const handlePricingClick = () => {
    setShowPricingInterface(true)
    setShowLoginInterface(false) // Hide login when showing pricing
  }

  const handleGetStartedClick = () => {
    // Added get started click handler
    setShowLoginInterface(true)
    setShowPricingInterface(false)
  }

  const handleBackToHome = () => {
    setShowPricingInterface(false)
    setShowLoginInterface(false) // Hide both interfaces when going back to home
  }

  if (showLoginInterface) {
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
        <LoginInterface />
      </div>
    )
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
      <Header onPricingClick={handlePricingClick} onGetStartedClick={handleGetStartedClick} />{" "}
      {/* Added onGetStartedClick prop */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Bravo Web App</h1>
          <p className="text-muted-foreground text-lg">Your application is ready with the new header navbar.</p>
        </div>
      </main>
    </div>
  )
}

