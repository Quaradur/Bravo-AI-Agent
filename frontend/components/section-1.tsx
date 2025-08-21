import React, { useState, useEffect, useRef } from 'react';

// Componente per l'icona del Play
const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-16 h-16"
    >
        <circle cx="12" cy="12" r="12" fill="black" />
        <path d="M10 8 L16 12 L10 16 Z" fill="white" />
    </svg>
);

export default function App() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const playerRef = useRef(null);
    const videoBoxRef = useRef<HTMLDivElement>(null);

    // Video ID dal link YouTube fornito
    const videoId = 'K27diMbCsuw';

    // Carica l'API IFrame di YouTube solo una volta
    useEffect(() => {
        // Se lo script esiste già, non fare nulla
        if (document.getElementById('youtube-iframe-api')) {
            return;
        }

        const scriptTag = document.createElement('script');
        scriptTag.id = 'youtube-iframe-api';
        scriptTag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(scriptTag);
    }, []);

    // Questo effetto si attiva quando l'utente clicca play (isPlaying diventa true)
    // e si occupa di creare e controllare il player.
    useEffect(() => {
        // Se non stiamo cercando di riprodurre il video, o se il player esiste già, non fare nulla.
        if (!isPlaying || playerRef.current) {
            return;
        }

        // Funzione per creare e avviare il player
        const createPlayer = () => {
            playerRef.current = new window.YT.Player('youtube-player-container', {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,           // Avvia automaticamente il video
                    rel: 0,               // Non mostra video correlati
                    controls: 1,          // Mostra i controlli del player
                    showinfo: 0,          // Non mostra info del video
                    modestbranding: 1,    // Branding YouTube ridotto
                    playsinline: 1,       // Riproduzione inline su mobile
                    start: 0              // Inizia dall'inizio
                },
                events: {
                    // Quando il player è pronto, avvia automaticamente il video
                    'onReady': (event: any) => {
                        console.log('YouTube player ready');
                        event.target.playVideo();
                    },
                    // Gestisce gli stati del player
                    'onStateChange': (event: any) => {
                        console.log('Player state changed:', event.data);
                    }
                }
            });
        };

        // Controlliamo se l'API di YouTube è pronta
        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            // Se l'API non è ancora pronta, aspettiamo l'evento globale
            window.onYouTubeIframeAPIReady = createPlayer;
        }

    }, [isPlaying]); // Questo effetto dipende solo da 'isPlaying'

    // Gestione dell'effetto mouse tracking
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoBoxRef.current || isPlaying) return;

        const rect = videoBoxRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Normalizza i valori con profondità leggermente aumentata
        const rotateX = (mouseY / (rect.height / 2)) * -3; // Aumentato da -2 a -3
        const rotateY = (mouseX / (rect.width / 2)) * 3;   // Aumentato da 2 a 3

        setMousePosition({ x: rotateY, y: rotateX });
    };

    const handleMouseEnter = () => {
        if (!isPlaying) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
    };

    const handlePlayClick = () => {
        console.log('Play button clicked, starting video:', videoId);
        setIsPlaying(true);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
                body, .font-baskerville {
                    font-family: 'Libre Baskerville', serif;
                }
                .try-bravo-btn:hover {
                    color: #CCCCCC !important;
                }

                /* Stili per l'effetto 3D del video box */
                .video-container {
                    will-change: transform, box-shadow;
                }
            `}</style>
            <div className="bg-white font-baskerville">
                <div
                    className="flex flex-col items-center px-4 sm:px-6 lg:px-8"
                    style={{ paddingTop: '120px', paddingBottom: '80px' }}
                >
                    <div className="max-w-5xl w-full text-center mx-auto px-4">
                        <h1
                            className="text-gray-900 tracking-tight"
                            style={{
                                fontSize: 'clamp(32px, 8vw, 64px)',
                                fontWeight: 400,
                                lineHeight: '1.2',
                                textAlign: 'center'
                            }}
                        >
                            Leave it to Bravo
                        </h1>
                        <p
                            className="mx-auto"
                            style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                color: '#858481',
                                fontSize: 'clamp(16px, 2.5vw, 20px)',
                                fontWeight: 300,
                                width: 'min(770px, 100%)',
                                maxWidth: '770px',
                                marginTop: '24px',
                                lineHeight: '1.5',
                                textAlign: 'center'
                            }}
                        >
                            Bravo is a general AI agent that bridges minds and actions. It doesn't just think, it delivers results. Bravo excels at various tasks in work and life, getting everything done while you rest.
                        </p>

                        <div className="mt-20 w-full flex justify-center">
                            <div
                                ref={videoBoxRef}
                                className="relative rounded-2xl shadow-2xl overflow-hidden video-container"
                                style={{
                                    width: 'min(1000px, calc(100% - 0px), calc(90vw))',
                                    height: 'min(563px, calc((100% - 0px) * 563 / 1000), calc(90vw * 563 / 1000))',
                                    maxWidth: '1000px',
                                    maxHeight: '563px',
                                    aspectRatio: '1000 / 563',
                                    transform: !isPlaying && isHovered
                                        ? `perspective(1500px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) translateZ(6px)`
                                        : 'perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
                                    transition: isHovered
                                        ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s ease'
                                        : 'transform 2s cubic-bezier(0.23, 1, 0.320, 1), box-shadow 1s ease',
                                    transformStyle: 'preserve-3d',
                                    boxShadow: isHovered
                                        ? '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                                        : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                {!isPlaying ? (
                                    // Copertina del video - usando approccio diretto con img
                                    <div className="w-full h-full cursor-pointer relative">
                                        {/* Immagine di copertina principale */}
                                        <img
                                            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                                            alt="Copertina video Bravo AI Agent"
                                            className="w-full h-full object-cover"
                                            style={{
                                                display: 'block',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                // Fallback a immagine di qualità standard se maxres non funziona
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                            }}
                                            onClick={handlePlayClick}
                                        />

                                        {/* Overlay scuro per migliorare la visibilità del pulsante */}
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-40 cursor-pointer"
                                            onClick={handlePlayClick}
                                        ></div>

                                        {/* Pulsante Play personalizzato */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <button
                                                onClick={handlePlayClick}
                                                className="bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300 hover:bg-white shadow-2xl pointer-events-auto cursor-pointer"
                                                style={{
                                                    padding: 'clamp(12px, 2vw, 20px)',
                                                    width: 'clamp(60px, 8vw, 80px)',
                                                    height: 'clamp(60px, 8vw, 80px)',
                                                    transform: `translateZ(10px) ${isHovered ? 'scale(1.03)' : 'scale(1)'}`,
                                                    transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                                }}
                                                aria-label="Riproduci video YouTube"
                                                type="button"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16"
                                                    fill="none"
                                                >
                                                    <circle cx="12" cy="12" r="12" fill="#000000" />
                                                    <path d="M10 8 L16 12 L10 16 Z" fill="#ffffff" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Player YouTube incorporato
                                    <div
                                        id="youtube-player-container"
                                        className="w-full h-full"
                                    ></div>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 flex items-center justify-center">
                            <button
                                className="rounded-full flex items-center justify-center try-bravo-btn"
                                style={{
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    fontSize: 'clamp(14px, 2vw, 16px)',
                                    color: '#FFFFFF',
                                    backgroundColor: '#1A1A19',
                                    fontWeight: 600,
                                    width: 'min(269px, 80vw)',
                                    height: 'min(56px, 12vw)',
                                    minHeight: '48px',
                                    transition: 'color 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                Try Bravo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
