"use client"

import { useState, useEffect, useRef } from "react"

// --- Componenti Icona SVG ---
// Questi sono componenti funzionali che rendono le icone SVG.
// L'uso di 'currentColor' permette di colorare l'SVG tramite classi CSS di testo (es. text-gray-800).

const GlobeIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M1.33333 8H14.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M8 1.33333C9.84167 3.21667 10.6667 5.55 10.6667 8C10.6667 10.45 9.84167 12.7833 8 14.6667C6.15833 12.7833 5.33333 10.45 5.33333 8C5.33333 5.55 6.15833 3.21667 8 1.33333V1.33333Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ChevronDownIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const NotificationIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 22.0001 12 22C11.6496 22.0001 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheckIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.3334 4L6.00008 11.3333L2.66675 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Logo = ({ className }: { className: string }) => (
  <svg
    className={className}
    width="100"
    height="28"
    viewBox="0 0 100 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M26.4785 16.333C26.4785 16.333 27.3115 14.453 28.5605 14.162C29.8095 13.871 31.3495 15.111 31.3495 15.111L30.4335 21.071L24.8945 22.031L23.4145 13.043L25.0425 12.827C25.0425 12.827 25.4595 12.999 25.5425 13.518C25.6255 14.037 26.4785 16.333 26.4785 16.333Z"
      fill="#111827"
    />
    <path
      d="M13.6885 11.666C13.6885 11.666 12.8555 13.546 11.6065 13.837C10.3575 14.128 8.81748 12.888 8.81748 12.888L9.73348 6.92801L15.2725 5.96801L16.7525 14.956L15.1245 15.172C15.1245 15.172 14.7075 15.0001 14.6245 14.481C14.5415 13.962 13.6885 11.666 13.6885 11.666Z"
      fill="#111827"
    />
    <path d="M19.9995 5.16699L18.8335 6.33299L19.9995 7.49999L21.1665 6.33299L19.9995 5.16699Z" fill="#111827" />
    <path d="M19.9995 1.66699L16.3335 5.33299L19.9995 8.99999L23.6665 5.33299L19.9995 1.66699Z" fill="#111827" />
    <path d="M19.9995 2.83301L22.5005 5.33301L19.9995 7.83301L17.5005 5.33301L19.9995 2.83301Z" fill="#111827" />
    <path
      d="M42.2773 21.5V8.5H44.8333V18.884L52.1413 8.5H55.0573V21.5H52.5013V11.116L45.1933 21.5H42.2773Z"
      fill="#111827"
    />
    <path
      d="M63.3333 18.296C63.3333 19.16 63.0533 19.88 62.4933 20.456C61.9333 21.032 61.1813 21.32 60.2373 21.32C59.2933 21.32 58.5413 21.032 57.9813 20.456C57.4213 19.88 57.1413 19.16 57.1413 18.296V11.704C57.1413 10.84 57.4213 10.12 57.9813 9.544C58.5413 8.968 59.2933 8.68 60.2373 8.68C61.1813 8.68 61.9333 8.968 62.4933 9.544C63.0533 10.12 63.3333 10.84 63.3333 11.704V18.296ZM60.2373 19.48C60.6533 19.48 60.9653 19.228 61.1733 18.724V11.276C60.9653 10.772 60.6533 10.52 60.2373 10.52C59.8213 10.52 59.5093 10.772 59.3013 11.276V18.724C59.5093 19.228 59.8213 19.48 60.2373 19.48Z"
      fill="#111827"
    />
    <path
      d="M66.4531 21.5V8.5H76.2691V10.34H68.9491V13.96H75.1171V15.8H68.9491V19.66H76.4931V21.5H66.4531Z"
      fill="#111827"
    />
    <path d="M86.7396 21.5V8.5H89.2956V19.66H96.4956V21.5H86.7396Z" fill="#111827" />
  </svg>
)

interface SiteHeaderProps {
  onPricingClick?: () => void
}

export default function SiteHeader({ onPricingClick }: SiteHeaderProps) {
  const [isLangMenuOpen, setLangMenuOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState("English")
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const languages = [
    "Deutsch",
    "English",
    "Español",
    "Español (Latinoamérica)",
    "Français",
    "Italiano",
    "Português (Brasil)",
    "Português (Portugal)",
    "Tiếng Việt",
    "Türkçe",
    "简体中文",
    "繁體中文",
    "日本語",
    "한국어",
    "العربية",
    "ไทย",
    "हिन्दी",
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [langMenuRef])

  // Funzioni per gestire la visibilità del tooltip con un ritardo
  const handleTooltipEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    setIsTooltipVisible(true)
  }

  const handleTooltipLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false)
    }, 150) // Un piccolo ritardo per permettere al cursore di spostarsi sul tooltip
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        body { 
            font-family: 'Inter', sans-serif;
            background-color: #FFFFFF;
        }
        .font-lora {
          font-family: 'Lora', serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .tooltip-container {
            position: relative;
            display: inline-block;
        }
        .tooltip {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 8px; 
            padding: 3px 7px;
            background-color: #000000; 
            color: #d1d5db; 
            border-radius: 8px; 
            font-size: 11px;
            font-weight: 600; 
            white-space: nowrap; 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
            opacity: 0; 
            transition: opacity 0.2s; 
            pointer-events: none; 
            z-index: 20;
        }
        .tooltip.visible {
            opacity: 1;
            pointer-events: auto;
        }
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
        }
        .custom-scrollbar:hover {
            scrollbar-color: #ccc transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: transparent;
            border-radius: 3px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background-color: #ccc;
        }
      `}</style>
      <header className="bg-white text-gray-800 font-inter">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Lato sinistro: Logo e Navigazione */}
            <div className="flex items-center space-x-8">
              <a href="#" aria-label="Homepage">
                <Logo className="h-7" />
              </a>
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <a href="#" className="text-gray-700 hover:text-gray-500 transition-colors">
                  Use cases
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-500 transition-colors">
                  Community
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-500 transition-colors">
                  Benchmarks
                </a>
                <button onClick={onPricingClick} className="text-gray-700 hover:text-gray-500 transition-colors">
                  Pricing
                </button>
              </nav>
            </div>

            {/* Lato destro: Azioni */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative hidden sm:block" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 text-sm text-gray-700 rounded-lg px-2 py-1.5 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <GlobeIcon className="w-4 h-4" />
                  <span>{selectedLang}</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {isLangMenuOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <ul className="py-1 max-h-[360px] overflow-y-auto custom-scrollbar">
                      {languages.map((lang) => (
                        <li key={lang}>
                          <a
                            href="#"
                            className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedLang(lang)
                              setLangMenuOpen(false)
                            }}
                          >
                            {lang}
                            {selectedLang === lang && <CheckIcon className="w-4 h-4 text-gray-800" />}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Contenitore del tooltip gestito con JavaScript */}
              <div className="tooltip-container" onMouseEnter={handleTooltipEnter} onMouseLeave={handleTooltipLeave}>
                <button className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <NotificationIcon className="w-5 h-5" />
                  <span className="sr-only">Notifications</span>
                </button>
                <div
                  className={`tooltip ${isTooltipVisible ? "visible" : ""}`}
                  onMouseEnter={handleTooltipEnter}
                  onMouseLeave={handleTooltipLeave}
                >
                  Bravo Updates
                </div>
              </div>

              {/* MODIFICA: Padding orizzontale ridotto a px-3 */}
              <a
                href="#"
                className="px-3 py-2 bg-black text-white text-sm font-semibold rounded-full hover:bg-zinc-800 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
