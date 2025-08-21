"use client"

import { useState, useEffect, useRef } from "react"
import Image from 'next/image';

// --- Componenti Icona SVG ---
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

const HamburgerIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  <Image
    src="/black-logo-Bravo-AI.png"
    alt="Bravo AI"
    className={className}
    width={105.27}
    height={36}
    priority
  />
);

interface SiteHeaderProps {
  onPricingClick?: () => void
  onGetStartedClick?: () => void
}

export default function SiteHeader({ onPricingClick, onGetStartedClick }: SiteHeaderProps) {
  const [isLangMenuOpen, setLangMenuOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState("English")
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        if (!target.closest('.hamburger-btn')) {
          setMobileMenuOpen(false)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleTooltipEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    setIsTooltipVisible(true)
  }

  const handleTooltipLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false)
    }, 150)
  }

  const handleLanguageSelect = (lang: string) => {
    setSelectedLang(lang);
    setLangMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .font-system {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
        }
        .text-main { color: #34322D; }
        .text-subtle { color: #5E5E5B; }
        .btn-get-started {
          font-size: 14px;
          color: #FFFFFF;
          background-color: #1A1A19;
        }

        body { font-family: 'Inter', sans-serif; background-color: #FFFFFF; }
        .font-lora { font-family: 'Lora', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .tooltip-container { position: relative; display: inline-block; }
        .tooltip {
            position: absolute; top: 100%; left: 50%;
            transform: translateX(-50%); margin-top: 8px;
            padding: 3px 7px; background-color: #000000;
            color: #d1d5db; border-radius: 8px;
            font-size: 11px; font-weight: 600;
            white-space: nowrap; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            opacity: 0; transition: opacity 0.2s;
            pointer-events: none; z-index: 20;
        }
        .tooltip.visible { opacity: 1; pointer-events: auto; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: #ccc transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 3px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #ccc; }

        /* Perfect alignment styles */
        .header-perfect-align {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .left-section {
          display: flex;
          align-items: center;
          height: 56px;
          gap: 32px;
        }

        .navigation-section {
          display: flex;
          align-items: center;
          height: 56px;
          gap: 32px;
        }

        .right-section {
          display: flex;
          align-items: center;
          height: 56px;
          gap: 20px;
        }

        /* Perfect alignment styles */
        .header-perfect-align {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .left-section {
          display: flex;
          align-items: center;
          height: 48px;
          gap: 32px;
        }

        .navigation-section {
          display: flex;
          align-items: center;
          height: 48px;
          gap: 32px;
        }

        .right-section {
          display: flex;
          align-items: center;
          height: 48px;
          gap: 20px;
        }

        .mobile-right-section {
          display: flex;
          align-items: center;
          height: 48px;
          gap: 16px;
        }

        .nav-link {
          height: 36px;
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 500;
          color: #34322D;
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #6b7280;
        }

        .lang-selector {
          height: 28px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 8px;
          border-radius: 8px;
          font-size: 14px;
          color: #34322D;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .lang-selector:hover {
          background-color: #f3f4f6;
        }

        .notification-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #1f2937;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-btn:hover {
          background-color: #f3f4f6;
        }

        .get-started-btn {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          border-radius: 16px;
          background-color: #1A1A19;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .get-started-btn:hover {
          opacity: 0.9;
        }

        /* Mobile specific styles */
        @media (max-width: 1023px) {
          .left-section {
            gap: 0;
          }

          .navigation-section {
            display: none;
          }

          .right-section {
            display: none;
          }

          .mobile-right-section {
            display: flex;
          }

          .header-perfect-align {
            position: relative;
          }

          .lang-selector {
            padding: 0 6px;
            gap: 2px;
            font-size: 13px;
            height: 24px;
          }

          .notification-btn {
            width: 24px;
            height: 24px;
          }

          .hamburger-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            color: #1f2937;
            cursor: pointer;
            transition: background-color 0.2s;
            border-radius: 6px;
          }

          .hamburger-btn:hover {
            background-color: #f3f4f6;
          }

          .mobile-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 50;
            display: block;
            animation: slideDown 0.2s ease-out;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .mobile-menu-item {
            display: block;
            padding: 16px 20px;
            color: #34322D;
            font-size: 16px;
            font-weight: 500;
            text-decoration: none;
            border-bottom: 1px solid #f3f4f6;
            background: transparent;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .mobile-menu-item:hover {
            background-color: #f9fafb;
          }

          .mobile-menu-item:last-child {
            border-bottom: none;
          }
        }

        /* Desktop specific styles */
        @media (min-width: 1024px) {
          .mobile-right-section {
            display: none;
          }
        }
      `}</style>
      <header className="bg-white font-system relative">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 relative">
          <div className="header-perfect-align py-4">
            {/* Left Section - Logo + Navigation */}
            <div className="left-section">
              <a
                href="#"
                aria-label="Homepage"
                className="flex items-center cursor-pointer"
              >
                <Logo className="" />
              </a>

              {/* Navigation */}
              <nav className="navigation-section hidden lg:flex">
                <a href="#" className="nav-link">
                  Use cases
                </a>
                <a href="#" className="nav-link">
                  Community
                </a>
                <a href="#" className="nav-link">
                  Benchmarks
                </a>
                <button
                  onClick={onPricingClick}
                  className="nav-link bg-transparent border-none cursor-pointer"
                >
                  Pricing
                </button>
              </nav>
            </div>

            {/* Desktop Right Section - Controls */}
            <div className="right-section">
              {/* Language Selector */}
              <div className="relative hidden lg:block" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen(!isLangMenuOpen)}
                  className="lang-selector"
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
                          <button
                            className="flex justify-between items-center px-4 py-2 text-subtle hover:bg-gray-100 cursor-pointer font-system text-sm w-full text-left"
                            onClick={() => handleLanguageSelect(lang)}
                          >
                            {lang}
                            {selectedLang === lang && <CheckIcon className="w-4 h-4 text-gray-800" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Notification Button */}
              <div className="tooltip-container hidden lg:block" onMouseEnter={handleTooltipEnter} onMouseLeave={handleTooltipLeave}>
                <button className="notification-btn">
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

              {/* Get Started Button */}
              <button
                onClick={onGetStartedClick}
                className="get-started-btn hidden lg:flex"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Right Section */}
            <div className="mobile-right-section">
              {/* Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen(!isLangMenuOpen)}
                  className="lang-selector"
                >
                  <GlobeIcon className="w-4 h-4" />
                  <span>{selectedLang}</span>
                  <ChevronDownIcon className={`w-3 h-3 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {isLangMenuOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <ul className="py-1 max-h-[360px] overflow-y-auto custom-scrollbar">
                      {languages.map((lang) => (
                        <li key={lang}>
                          <button
                            className="flex justify-between items-center px-4 py-2 text-subtle hover:bg-gray-100 cursor-pointer font-system text-sm w-full text-left"
                            onClick={() => handleLanguageSelect(lang)}
                          >
                            {lang}
                            {selectedLang === lang && <CheckIcon className="w-4 h-4 text-gray-800" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Notification Button */}
              <div className="tooltip-container" onMouseEnter={handleTooltipEnter} onMouseLeave={handleTooltipLeave}>
                <button className="notification-btn">
                  <NotificationIcon className="w-4 h-4" />
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

              {/* Hamburger Menu */}
              <button
                className="hamburger-btn"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              >
                <HamburgerIcon className="w-5 h-5" />
                <span className="sr-only">Menu</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-menu lg:hidden" ref={mobileMenuRef}>
              <a href="#" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                Use cases
              </a>
              <a href="#" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                Community
              </a>
              <a href="#" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                Benchmarks
              </a>
              <button
                onClick={() => {
                  onPricingClick?.()
                  setMobileMenuOpen(false)
                }}
                className="mobile-menu-item"
              >
                Pricing
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
































