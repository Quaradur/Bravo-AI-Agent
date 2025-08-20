"use client"

import { useState, useEffect, useRef } from "react"

// --- Icone SVG ---
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
  <img
    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Bravo%20AI%20con%20scritta%20Nero-q6ncQH7TcB2ndwhznHluCARKWvRu5s.png"
    alt="Bravo AI"
    className={className}
    style={{ width: "105.27px", height: "36px" }}
  />
)

interface SiteHeaderProps {
  onPricingClick?: () => void
  onGetStartedClick?: () => void
}

export default function SiteHeader({ onPricingClick, onGetStartedClick }: SiteHeaderProps) {
  const [isLangMenuOpen, setLangMenuOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState("English")
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleTooltipEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    setIsTooltipVisible(true)
  }

  const handleTooltipLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => setIsTooltipVisible(false), 150)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .font-system {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
        }
        .text-main { color: #34322D; }
        .text-subtle { color: #5E5E5B; }
        .btn-get-started { font-size: 14px; color: #FFFFFF; background-color: #1A1A19; }

        body { margin: 0; font-family: 'Inter', sans-serif; background-color: #FFFFFF; }
        .font-lora { font-family: 'Lora', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .tooltip-container { position: relative; display: inline-block; }
        .tooltip {
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 8px;
          padding: 3px 7px; background-color: #000000; color: #d1d5db; border-radius: 8px;
          font-size: 11px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,.1);
          opacity: 0; transition: opacity .2s; pointer-events: none; z-index: 20;
        }
        .tooltip.visible { opacity: 1; pointer-events: auto; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: #ccc transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 3px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #ccc; }
      `}</style>

      <header className="bg-white font-system">
        <div className="max-w-screen-2xl mx-auto px-12">
          {/* Riga principale: padding-top 20px per i pulsanti; il logo viene compensato a -11px */}
          <div className="flex items-start justify-between pt-[20px] pb-4">
            {/* Colonna sinistra */}
            <div className="flex items-start space-x-8">
              {/* Logo: trattato come "fuori" dal header → 9px dal top pagina (20 - 11) */}
              <a href="#" aria-label="Homepage" className="flex items-center cursor-pointer -mt-[11px]">
                <Logo className="" />
              </a>

              {/* Nav sinistro: nessun offset verticale aggiuntivo → 20px dal top pagina */}
              <nav className="hidden md:flex items-center space-x-6 font-medium text-sm">
                <a href="#" className="text-main hover:text-gray-500 transition-colors cursor-pointer">Use cases</a>
                <a href="#" className="text-main hover:text-gray-500 transition-colors cursor-pointer">Community</a>
                <a href="#" className="text-main hover:text-gray-500 transition-colors cursor-pointer">Benchmarks</a>
                <button onClick={onPricingClick} className="text-main hover:text-gray-500 transition-colors cursor-pointer">
                  Pricing
                </button>
              </nav>
            </div>

            {/* Colonna destra: lingua, notifiche, CTA → 20px dal top pagina */}
            <div className="flex items-center space-x-6">
              <div className="relative hidden sm:block" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 text-main rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
                >
                  <GlobeIcon className="w-4 h-4" />
                  <span>{selectedLang}</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isLangMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <ul className="py-1 max-h-[360px] overflow-y-auto custom-scrollbar">
                      {languages.map((lang) => (
                        <li key={lang}>
                          <a
                            href="#"
                            className="flex justify-between items-center px-4 py-2 text-subtle hover:bg-gray-100 cursor-pointer font-system text-sm"
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

              <div className="tooltip-container" onMouseEnter={handleTooltipEnter} onMouseLeave={handleTooltipLeave}>
                <button className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
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

              <button
                onClick={onGetStartedClick}
                className="px-3 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer font-system btn-get-started"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}





























