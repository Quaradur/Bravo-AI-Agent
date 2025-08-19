"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

// --- Componente per lo sfondo animato ---
const AnimatedGridBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles: Particle[] = [];

        const particleSettings = {
            gridGap: 20,
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            baseAlpha: number;
            alpha: number;
            targetAlpha: number;
            vx: number;
            vy: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                this.baseAlpha = Math.random() * 0.05 + 0.02;
                this.alpha = this.baseAlpha;
                this.targetAlpha = this.baseAlpha;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
            }

            update() {
                if (Math.abs(this.alpha - this.targetAlpha) < 0.01) {
                    this.targetAlpha = Math.random() > 0.99 ? Math.random() * 0.5 + 0.1 : this.baseAlpha;
                }
                this.alpha += (this.targetAlpha - this.alpha) * 0.03;

                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            particles = [];
            const cols = Math.floor(width / particleSettings.gridGap);
            const rows = Math.floor(height / particleSettings.gridGap);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    if (Math.random() > 0.5) {
                        const x = i * particleSettings.gridGap + particleSettings.gridGap / 2;
                        const y = j * particleSettings.gridGap + particleSettings.gridGap / 2;
                        particles.push(new Particle(x, y));
                    }
                }
            }
        }

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener('resize', handleResize);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 0,
                backgroundColor: '#000',
            }}
        />
    );
};


// --- Componente Icona Google ---
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// --- Componente Icona Apple ---
const AppleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);


export default function SignInPage() {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isHuman, setIsHuman] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)

    const [focusedInput, setFocusedInput] = useState<string | null>(null)
    const [isSignInClicked, setIsSignInClicked] = useState(false)

    const hcaptchaContainerRef = useRef<HTMLDivElement | null>(null);
    const hcaptchaWidgetIdRef = useRef<string | null>(null);

    const isFormValid = fullName.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6 && isHuman

    // Carica lo script di hCaptcha
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Definisce la funzione di callback a livello globale
        window.onHCaptchaLoaded = () => {
            if (showEmailForm && hcaptchaContainerRef.current && window.hcaptcha && hcaptchaWidgetIdRef.current === null) {
                const widgetId = window.hcaptcha.render(hcaptchaContainerRef.current, {
                    sitekey: '10000000-0000-0000-0000-000000000001', // Chiave di test, sostituisci con la tua
                    theme: 'dark',
                    lang: 'en',
                    callback: (token) => {
                        console.log(`hCaptcha token: ${token}`);
                        setIsHuman(true);
                    },
                    'expired-callback': () => setIsHuman(false),
                    'error-callback': () => setIsHuman(false),
                });
                hcaptchaWidgetIdRef.current = widgetId;
            }
        };

        const script = document.createElement('script');
        script.src = "https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHCaptchaLoaded";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                document.body.removeChild(script);
            }
            window.onHCaptchaLoaded = null;
        };
    }, [showEmailForm]);

    const handleEmailSignIn = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return

        setIsSignInClicked(true)
        setIsLoading(true)
        console.log("Attempting to sign in with:", { fullName, email, password })

        setTimeout(() => {
            setIsLoading(false)
            setIsSignInClicked(false)
            console.log("Sign in successful (simulated)")
        }, 2000)
    }

    const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"';

    return (
        <>
            <AnimatedGridBackground />
            <div
                className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4 relative overflow-hidden"
                style={{ fontFamily: systemFont }}
            >

                <div className="absolute top-8 left-8 z-10">
                    <Link href="/" className="flex items-center gap-2 transition-all duration-200 hover:opacity-70 hover:scale-105">
                        <img
                            src="https://i.imgur.com/8p8S1Yj.jpeg"
                            alt="Bravo AI Logo"
                            style={{ width: '117px', height: '38px' }}
                        />
                    </Link>
                </div>

                <main className="w-full max-w-[360px] mx-auto z-10 flex-1 flex flex-col justify-center pb-20">
                    <div className="text-center mb-8">
                        <div className="inline-block h-20 w-20">
                            <img
                                src="https://i.imgur.com/3JYw2bT.jpeg"
                                alt="Bravo AI Icon"
                                className="h-full w-full mx-auto mb-6"
                            />
                        </div>
                        <h1 className="text-[20px] font-bold text-[#DADADA] mb-2 h-[30px] flex items-center justify-center">Sign in to Bravo</h1>
                        <p className="text-[#7F7F7F] text-[14px] h-[20px] flex items-center justify-center">No waitlist—start creating now</p>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <button
                                disabled={isLoading}
                                className={`w-full backdrop-blur-sm text-white border-gray-700/50 h-10 flex items-center justify-center gap-[6px] rounded-lg font-normal transition-colors duration-200 transform text-[14px] cursor-pointer bg-[#3E3D3E] hover:bg-[#333233] ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <GoogleIcon />
                                <span className="h-[20px] flex items-center">Sign in with Google</span>
                            </button>
                            <span className="absolute -top-2 right-4 bg-[#3b82f6] text-white text-[10px] px-2 py-0.5 rounded font-medium animate-pulse">
                                Most used
                            </span>
                        </div>

                        <button
                            disabled={isLoading}
                            className={`w-full backdrop-blur-sm text-white border-gray-700/50 h-10 flex items-center justify-center gap-[6px] rounded-lg font-normal transition-colors duration-200 transform text-[14px] cursor-pointer bg-[#3E3D3E] hover:bg-[#333233] ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <AppleIcon />
                            <span className="h-[20px] flex items-center">Sign in with Apple</span>
                        </button>
                    </div>

                    <div className="relative my-6 flex items-center">
                        <div className="flex-grow border-t" style={{ borderColor: '#FFFFFF14' }}></div>
                        <span className="flex-shrink mx-4 text-[12px] text-[#7F7F7F]">Or</span>
                        <div className="flex-grow border-t" style={{ borderColor: '#FFFFFF14' }}></div>
                    </div>

                    <div className={`transition-all duration-1000 ease-in-out overflow-hidden ${showEmailForm ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-[13px] text-[#DADADA] mb-2">
                                    Full name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onFocus={() => setFocusedInput("fullName")}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="Your name"
                                    className={`w-full backdrop-blur-sm border text-white placeholder-gray-500 h-10 rounded-lg px-3 transition-all duration-200 focus:outline-none focus:ring-0 ${focusedInput === "fullName" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-gray-700/50 hover:border-gray-600/50"}`}
                                    style={{ backgroundColor: '#363537' }}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-[13px] text-[#DADADA] mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedInput("email")}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="mail@domain.com"
                                    className={`w-full backdrop-blur-sm border text-white placeholder-gray-500 h-10 rounded-lg px-3 transition-all duration-200 focus:outline-none focus:ring-0 ${focusedInput === "email" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-gray-700/50 hover:border-gray-600/50"}`}
                                    style={{ backgroundColor: '#363537' }}
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="password" className="block text-[13px] text-[#DADADA]">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <Link href="/forgot-password" className="text-[13px] text-[#7F7F7F] hover:text-white underline transition-colors duration-200">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedInput("password")}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="Enter password"
                                        className={`w-full backdrop-blur-sm border text-white placeholder-gray-500 pr-10 h-10 rounded-lg px-3 transition-all duration-200 focus:outline-none focus:ring-0 ${focusedInput === "password" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-gray-700/50 hover:border-gray-600/50"}`}
                                        style={{ backgroundColor: '#363537' }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div ref={hcaptchaContainerRef} className="flex justify-center"></div>

                            <button
                                type="submit"
                                disabled={!isFormValid || isLoading}
                                className={`w-full h-10 rounded-lg font-medium transition-all duration-300 transform text-[14px] flex items-center justify-center ${isFormValid && !isLoading ? "hover:brightness-110 active:scale-95 shadow-lg" : "cursor-not-allowed"} ${isSignInClicked ? "animate-click" : ""}`}
                                style={{
                                    backgroundColor: isFormValid && !isLoading ? '#FFFFFF' : '#939393',
                                }}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </div>
                                ) : <span className="h-[20px] flex items-center" style={{ color: '#000000E6' }}>Sign in</span>}
                            </button>
                        </form>
                    </div>

                    {!showEmailForm && (
                        <div className="transition-opacity duration-1000 ease-in-out">
                            <button
                                onClick={() => setShowEmailForm(true)}
                                className="w-full h-10 rounded-lg font-medium transition-all duration-300 transform text-[14px] flex items-center justify-center cursor-pointer hover:brightness-90 active:scale-95"
                                style={{ backgroundColor: '#FFFFFF', color: '#000000E6' }}
                            >
                                Continue with email
                            </button>
                        </div>
                    )}

                    <p className="text-center text-[13px] text-[#7F7F7F] mt-6">
                        Don't have an account?{" "}
                        <Link href="/sign-up" className="text-[#ACACAC] hover:text-white underline transition-colors duration-200">
                            Sign up
                        </Link>
                    </p>
                </main>

                <footer className="absolute bottom-0 left-0 right-0 bg-transparent z-10">
                    <div className="text-center py-4 space-x-6">
                        <Link href="/terms" className="hover:text-white underline transition-colors duration-200 text-[12px] text-[#7F7F7F]">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="hover:text-white underline transition-colors duration-200 text-[12px] text-[#7F7F7F]">
                            Privacy Policy
                        </Link>
                    </div>
                </footer>

                <style jsx>{`
          @keyframes click {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }

          .animate-click {
            animation: click 0.3s ease-out;
          }
        `}</style>
            </div>
        </>
    )
}











