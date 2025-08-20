"use client";

import React, { useState, useRef, useEffect, FC, ReactNode, ChangeEvent, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from "framer-motion"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Plus, Search, Bell, Star, Settings, HelpCircle, Paperclip, Mic, ChevronDown, Check, Atom, MessageSquare,
    ImageIcon, Presentation, Sheet, BarChart2, Share2, User, RefreshCw, ChevronRight, BrainCircuit, LogOut,
    CalendarDays, Cpu, X, FileCog, Cloud, AppWindow, User as UserIcon, Sun, Moon, Monitor, Copy, Send,
    MoreHorizontal, Trash2, Edit3, ExternalLink, Globe, Lock, PlayCircle, StarOff, ArrowUpRight, Sparkles,
    ChevronLeft, Gift, Users, Languages, Book, MoreVertical, ArrowUp, LucideProps, Loader, CircleDot, FileText, Terminal, Code, Bot
} from 'lucide-react';

// =================================================================================
// TIPI E INTERFACCE
// =================================================================================

// Tipi per la UI esistente
interface ChatHistoryItem {
    id: number;
    title: string;
    preview: string;
    date: string;
    isFavorite: boolean;
    active?: boolean;
}
// ... (tutti gli altri tipi esistenti per modali, etc. restano validi)

// NUOVI TIPI per il flusso di eventi dell'agente
export type PlanStep = { id: string; text: string; status: 'completed' | 'in_progress' | 'pending'; };
export type BaseEvent = { id: string; };
export type PlanEvent = BaseEvent & { type: 'plan'; steps: PlanStep[]; };
export type ThoughtEvent = BaseEvent & { type: 'thought'; content: string; };
export type ActionEvent = BaseEvent & { type: 'action'; title: string; content: string; };
export type SummaryEvent = BaseEvent & { type: 'summary'; content: string; };
export type UserMessageEvent = BaseEvent & { type: 'user_message'; content: string; };
export type AgentEvent = PlanEvent | ThoughtEvent | ActionEvent | SummaryEvent | UserMessageEvent;


// =================================================================================
// COMPONENTI UI SPECIFICI PER GLI EVENTI
// =================================================================================

const PlanComponent: FC<{ event: PlanEvent }> = ({ event }) => (
    <div className="border dark:border-zinc-700 rounded-lg p-4 bg-gray-50 dark:bg-zinc-800/50">
        <h3 className="font-semibold mb-3 text-zinc-800 dark:text-gray-200">Piano d'azione:</h3>
        <ul className="space-y-2">
            {event.steps.map((step) => (
                <li key={step.id} className="flex items-center gap-3 text-sm">
                    {step.status === 'completed' && <CheckCircle2 className="text-green-500 w-4 h-4 flex-shrink-0" />}
                    {step.status === 'in_progress' && <Loader className="animate-spin text-blue-500 w-4 h-4 flex-shrink-0" />}
                    {step.status === 'pending' && <CircleDot className="text-gray-400 w-4 h-4 flex-shrink-0" />}
                    <span className={step.status === 'completed' ? 'line-through text-gray-500' : 'text-zinc-800 dark:text-gray-300'}>
                        {step.text}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

const ThoughtComponent: FC<{ event: ThoughtEvent }> = ({ event }) => (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50 my-2">
        <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{event.content}</p>
    </div>
);

const ActionComponent: FC<{ event: ActionEvent }> = ({ event }) => (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pl-2 my-1">
        <span className="flex-shrink-0">{event.title}</span>
        <code className="bg-gray-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-xs truncate">{event.content}</code>
    </div>
);

const SummaryComponent: FC<{ event: SummaryEvent }> = ({ event }) => (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
        <div className="flex items-start gap-3">
            <Bot className="w-5 h-5 mt-1 text-green-600 dark:text-green-300 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">{event.content}</p>
        </div>
    </div>
);

const UserMessageComponent: FC<{ event: UserMessageEvent }> = ({ event }) => (
    <div className="flex items-start gap-3 justify-end">
        <div className="rounded-lg p-3 max-w-xl bg-blue-600 text-white">
            <p className="text-sm whitespace-pre-wrap">{event.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
            <User size={18} />
        </div>
    </div>
);

// =================================================================================
// COMPONENTE PRINCIPALE
// =================================================================================

const App: FC = () => {
    // --- STATO ESISTENTE PER LA UI (Mantenuto) ---
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [initialSettingsTab, setInitialSettingsTab] = useState<string>('Account');
    const [theme, setTheme] = useState<string>('dark');
    // Aggiungi qui gli altri stati della UI che avevi...

    // --- NUOVO STATO PER LA LOGICA DELL'AGENTE ---
    const [promptValue, setPromptValue] = useState<string>('');
    const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [activeView, setActiveView] = useState<'terminal' | 'browser' | 'editor'>('terminal');
    const [terminalOutput, setTerminalOutput] = useState("Il terminale dell'agente apparirà qui...");
    const [browserState, setBrowserState] = useState({ url: "N/D", screenshot: "" });
    const [editorState, setEditorState] = useState({ language: "plaintext", code: "Il codice scritto dall'agente apparirà qui..." });

    const webSocketRef = useRef<WebSocket | null>(null);
    const session_id = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // --- EFFECT PER WEBSOCKET ---
    useEffect(() => {
        webSocketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/${session_id.current}`);
        webSocketRef.current.onopen = () => console.log("WebSocket connection established.");
        webSocketRef.current.onclose = () => console.log("WebSocket connection closed.");
        webSocketRef.current.onerror = (error) => console.error("WebSocket error:", error);

        webSocketRef.current.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);
            const newEventId = uuidv4();

            switch (message.type) {
                case 'thought':
                    setAgentEvents(prev => [...prev, { id: newEventId, type: 'thought', content: message.content }]);
                    break;
                case 'plan':
                    setAgentEvents(prev => [...prev, { id: newEventId, type: 'plan', steps: message.steps }]);
                    break;
                case 'action':
                    setAgentEvents(prev => [...prev, { id: newEventId, type: 'action', title: message.title, content: message.content }]);
                    break;
                case 'summary':
                case 'chat':
                    setAgentEvents(prev => [...prev, { id: newEventId, type: 'summary', content: message.content }]);
                    break;
                case 'terminal_output':
                    setTerminalOutput(prev => prev.startsWith("Il terminale") ? message.content : prev + "\n\n" + message.content);
                    setActiveView('terminal');
                    break;
                case 'browser_view':
                    setBrowserState({ url: message.url, screenshot: message.content });
                    setActiveView('browser');
                    break;
                case 'code_editor':
                    setEditorState({ language: message.language, code: message.content });
                    setActiveView('editor');
                    break;
                case 'task_complete':
                    setIsProcessing(false);
                    break;
            }
        };

        return () => webSocketRef.current?.close();
    }, []);

    // --- GESTIONE INVIO MESSAGGIO ---
    const handleSendMessage = async () => {
        if (promptValue.trim() === '' || isProcessing) return;
        setIsProcessing(true);
        setAgentEvents(prev => [...prev, { id: uuidv4(), type: 'user_message', content: promptValue }]);

        try {
            await fetch("http://127.0.0.1:8000/chat", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptValue, session_id: session_id.current }),
            });
        } catch (error) {
            console.error("Failed to start task:", error);
            const errorEvent: SummaryEvent = { id: uuidv4(), type: 'summary', content: `❌ Errore: Impossibile avviare il task. Controlla che il backend sia in esecuzione.` };
            setAgentEvents(prev => [...prev, errorEvent]);
            setIsProcessing(false);
        }
        setPromptValue('');
    };

    // --- ALTRI EFFETTI E HANDLER ---
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('div');
            if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [agentEvents]);

    const handleNewTask = () => {
        // Logica per resettare lo stato per un nuovo task
        setAgentEvents([]);
        setTerminalOutput("Il terminale dell'agente apparirà qui...");
        setBrowserState({ url: "N/D", screenshot: "" });
        setEditorState({ language: "plaintext", code: "Il codice scritto dall'agente apparirà qui..." });
        setIsProcessing(false);
        setPromptValue("");
    };

    // --- RENDERIZZAZIONE ---
    return (
        <>
            {/* Manteniamo i modali e i portali. Assicurati di avere le funzioni per aprirli */}
            {/* Esempio: {isSettingsModalOpen && <SettingsModal ... />} */}

            <div className="flex h-screen bg-white dark:bg-[#191919] text-zinc-800 dark:text-gray-300 text-sm overflow-hidden font-sans">
                {/* --- Sidebar (Il tuo codice della sidebar va qui) --- */}
                <aside className={`bg-[#F9F9F9] dark:bg-[#202123] flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72 p-4' : 'w-0 p-0'}`}>
                    {isSidebarOpen && (
                        <>
                            {/* Incolla qui tutto il JSX della tua sidebar */}
                            <p>La tua Sidebar UI va qui...</p>
                        </>
                    )}
                </aside>

                {/* --- Main Content --- */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Header (Il tuo codice dell'header va qui) */}
                    <header className="flex items-center justify-between p-4 flex-shrink-0 border-b dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            {!isSidebarOpen &&
                                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900">
                                    {/* Usa la tua SidebarToggleIcon o una simile */}
                                    <ChevronRight />
                                </button>
                            }
                        </div>
                        <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">Bravo AI Agent</h1>
                        <div>{/* Altri elementi dell'header */}</div>
                    </header>

                    {/* NUOVA AREA CENTRALE A DUE PANNELLI */}
                    <div className="flex-grow p-4 overflow-hidden">
                        {agentEvents.length === 0 ? (
                            <div className="text-center flex flex-col justify-center items-center h-full">
                                <h2 className="text-4xl font-serif text-black dark:text-white">Ciao!</h2>
                                <p className="text-4xl font-serif text-gray-600 dark:text-gray-400 mt-1">Cosa posso fare per te?</p>
                            </div>
                        ) : (
                            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                                {/* PANNELLO SINISTRO: FLUSSO EVENTI */}
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <div className="flex h-full flex-col pr-4">
                                        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                                            <div className="space-y-4">
                                                <AnimatePresence>
                                                    {agentEvents.map((event) => (
                                                        <motion.div
                                                            key={event.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            {event.type === 'user_message' && <UserMessageComponent event={event} />}
                                                            {event.type === 'plan' && <PlanComponent event={event} />}
                                                            {event.type === 'thought' && <ThoughtComponent event={event} />}
                                                            {event.type === 'action' && <ActionComponent event={event} />}
                                                            {event.type === 'summary' && <SummaryComponent event={event} />}
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                {/* PANNELLO DESTRO: COMPUTER DELL'AGENTE */}
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <div className="flex h-full flex-col bg-black rounded-lg border border-zinc-700">
                                        <div className="flex items-center p-2 bg-zinc-800 rounded-t-lg border-b border-zinc-700 flex-shrink-0">
                                            <div className="flex gap-1.5">
                                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                            </div>
                                            <div className="flex-grow text-center text-sm text-gray-400">
                                                {activeView === 'browser' && `🌐 Browser - ${browserState.url}`}
                                                {activeView === 'editor' && `📄 Editor - ${editorState.language}`}
                                                {activeView === 'terminal' && `>_ Terminale`}
                                            </div>
                                        </div>
                                        <div className="flex-grow relative overflow-hidden">
                                            {activeView === 'terminal' && <ScrollArea className="absolute inset-0 p-4 font-mono text-sm"><pre className="whitespace-pre-wrap">{terminalOutput}</pre></ScrollArea>}
                                            {activeView === 'browser' && <div className="absolute inset-0 bg-white"><img src={browserState.screenshot} alt="Browser Screenshot" className="w-full h-full object-cover object-top" /></div>}
                                            {activeView === 'editor' && <ScrollArea className="absolute inset-0 p-4 font-mono text-sm"><pre><code>{editorState.code}</code></pre></ScrollArea>}
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        )}
                    </div>

                    {/* Input Area (Il tuo codice dell'input area va qui, collegato a `promptValue` e `handleSendMessage`) */}
                    <div className="p-4 border-t dark:border-zinc-800 flex-shrink-0">
                        <div className="relative max-w-3xl mx-auto">
                            <Input
                                placeholder="Scrivi le tue istruzioni a Bravo AI..."
                                className="pr-24 h-12 text-base"
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={isProcessing}
                            />
                            <Button
                                className="absolute top-1/2 right-2 -translate-y-1/2 h-9"
                                onClick={handleSendMessage}
                                disabled={isProcessing || !promptValue.trim()}
                            >
                                {isProcessing ? <Loader className="animate-spin w-4 h-4" /> : <Send size={16} />}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default App;


