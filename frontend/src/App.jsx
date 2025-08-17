import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Plus, Search, Bell, Star, Settings, HelpCircle, Paperclip, Mic, ChevronDown, Check,
    Atom, MessageSquare, BrainCircuit, LogOut, CalendarDays, Cpu, X, FileCog, Cloud,
    AppWindow, User as UserIcon, Sun, Moon, Monitor, Copy, Send, MoreHorizontal, Trash2,
    Edit3, ExternalLink, Globe, Lock, ArrowUpRight, Sparkles, ChevronLeft, Users, Book,
    ArrowUp
} from 'lucide-react';
import { marked } from 'marked';

// --- COMPONENTE PER IL FILE EXPLORER (jstree) ---
const FileTree = ({ fileTreeData, onFileSelect }) => {
    const treeRef = useRef(null);

    useEffect(() => {
        // Carica dinamicamente gli script e i CSS necessari per jsTree
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
        jqueryScript.onload = () => {
            const jstreeScript = document.createElement('script');
            jstreeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js';
            jstreeScript.onload = () => {
                // Inizializza jsTree solo dopo che gli script sono stati caricati
                if (fileTreeData.length > 0) {
                    if ($(treeRef.current).jstree(true)) {
                        $(treeRef.current).jstree(true).destroy();
                    }
                    $(treeRef.current).jstree({
                        'core': { 
                            'data': fileTreeData,
                            'themes': { 'name': 'default-dark', 'responsive': true }
                        },
                        'types': {
                            "file": { "icon": "jstree-file" },
                            "folder": { "icon": "jstree-folder" }
                        },
                        "plugins": ["types"]
                    }).on('select_node.jstree', (e, data) => {
                        if (data.node.original.type === 'file') {
                            onFileSelect(data.node.id);
                        }
                    });
                }
            };
            document.head.appendChild(jstreeScript);
        };
        document.head.appendChild(jqueryScript);

        const jstreeStyle = document.createElement('link');
        jstreeStyle.rel = 'stylesheet';
        jstreeStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default-dark/style.min.css';
        document.head.appendChild(jstreeStyle);

        return () => {
            // Pulizia quando il componente viene smontato
            if ($(treeRef.current).jstree(true)) {
                $(treeRef.current).jstree(true).destroy();
            }
        };
    }, [fileTreeData, onFileSelect]);

    return <div ref={treeRef}></div>;
};


// --- COMPONENTE PRINCIPALE DELL'APPLICAZIONE ---
export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState([]);
    const [promptValue, setPromptValue] = useState('');
    const [sessionId] = useState(`session_${Date.now()}`);
    const [fileTreeData, setFileTreeData] = useState([]);
    const [viewingFile, setViewingFile] = useState(null);
    
    const chatContainerRef = useRef(null);
    const logsContainerRef = useRef(null);
    const ws = useRef(null);

    const addLog = useCallback((content, level = 'DEBUG') => {
        setLogs(prevLogs => [...prevLogs, { content, level, timestamp: new Date() }]);
    }, []);
    
    const addMessage = useCallback((sender, content, isError = false) => {
        setMessages(prev => [...prev, { sender, content, isError, timestamp: new Date() }]);
    }, []);

    const updateFileTree = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/workspace/files');
            const data = await response.json();
            if (!data.error) {
                setFileTreeData(data);
            }
        } catch (error) {
            console.error("Failed to update file tree:", error);
        }
    }, []);

    useEffect(() => {
        const connectWebSocket = () => {
            const wsUrl = `ws://localhost:8000/ws/${sessionId}`;
            ws.current = new WebSocket(wsUrl);
            ws.current.onopen = () => addLog("WebSocket connection established.", "INFO");
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'log': addLog(data.content); break;
                    case 'user_message': addMessage('User', data.content); break;
                    case 'agent_response': 
                        addMessage('Agent', data.content);
                        updateFileTree();
                        break;
                    case 'error': addMessage('System Error', data.content, true); break;
                }
            };
            ws.current.onclose = () => {
                addLog("WebSocket connection closed. Reconnecting in 3s...", "WARNING");
                setTimeout(connectWebSocket, 3000);
            };
            ws.current.onerror = (error) => {
                addLog(`WebSocket error: ${error.message || 'Unknown error'}`, "ERROR");
                ws.current.close();
            };
        };
        connectWebSocket();
        updateFileTree();
        const interval = setInterval(updateFileTree, 10000);
        return () => {
            if (ws.current) ws.current.close();
            clearInterval(interval);
        };
    }, [sessionId, addLog, addMessage, updateFileTree]);

    useEffect(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (logsContainerRef.current) logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }, [logs]);

    const handleFileSelect = useCallback(async (filePath) => {
        try {
            const response = await fetch(`http://localhost:8000/api/workspace/files/${filePath}`);
            const fileData = await response.json();
            if (fileData.content) {
                setViewingFile({ path: filePath, content: fileData.content });
            } else {
                addMessage('System Error', `Error reading file: ${fileData.error}`, true);
            }
        } catch (error) {
             addMessage('System Error', `Failed to fetch file: ${error}`, true);
        }
    }, [addMessage]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const prompt = promptValue;
        if (!prompt.trim()) return;
        setPromptValue('');
        try {
            await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, session_id: sessionId })
            });
        } catch (error) {
            addMessage('System Error', `Failed to send prompt: ${error.message}`, true);
        }
    };

    return (
        <div className="h-screen flex flex-col p-4 gap-4 bg-[#1a1b26] text-[#a9b1d6]">
            <header className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                    <BrainCircuit /> Bravo AI Agent
                </h1>
            </header>

            <main className="flex-grow flex gap-4 overflow-hidden">
                <div className={`panel rounded-lg flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-1/4' : 'w-0 p-0 border-0'}`} style={{ overflow: 'hidden' }}>
                    {isSidebarOpen && <>
                        <div className="flex justify-between items-center p-3 border-b border-[#414868]">
                           <h2 className="text-lg font-semibold">Workspace</h2>
                           <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded hover:bg-[#292e42]"><X size={18}/></button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-3">
                           <FileTree fileTreeData={fileTreeData} onFileSelect={handleFileSelect} />
                        </div>
                    </>}
                </div>

                <div className="panel rounded-lg flex-grow flex flex-col relative">
                    {!isSidebarOpen && 
                        <button onClick={() => setIsSidebarOpen(true)} className="absolute top-3 left-3 p-2 rounded-full hover:bg-[#292e42] z-10">
                            <SidebarOpen />
                        </button>
                    }
                    <div ref={chatContainerRef} className={`flex-grow p-4 overflow-y-auto ${viewingFile ? 'hidden' : ''}`}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`p-3 mb-4 rounded-r-lg border-l-4 ${msg.sender === 'User' ? 'bg-[#292e42] border-[#7aa2f7]' : 'bg-[#2f3549] border-[#c0caf5]'}`}>
                                <div className="font-bold mb-1 flex items-center gap-2">
                                    {msg.sender === 'User' ? <UserIcon size={16}/> : <BrainCircuit size={16}/>}
                                    {msg.sender}
                                </div>
                                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || "*Thinking...*") }}></div>
                            </div>
                        ))}
                    </div>
                    {viewingFile && (
                        <div className="flex-grow p-4 overflow-y-auto flex flex-col">
                            <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                <h3 className="font-mono">{viewingFile.path}</h3>
                                <button onClick={() => setViewingFile(null)} className="p-1 rounded-full hover:bg-gray-700"><X /></button>
                            </div>
                            <pre className="bg-black/50 p-2 rounded text-sm whitespace-pre-wrap w-full h-full overflow-auto">{viewingFile.content}</pre>
                        </div>
                    )}
                    <div className="p-4 border-t border-[#414868]">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input 
                                type="text" 
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                className="flex-grow rounded-md px-3 py-2 bg-[#292e42] border border-[#414868] focus:border-[#7aa2f7] focus:ring-2 focus:ring-[#7aa2f7]/50 outline-none" 
                                placeholder="Scrivi la tua richiesta qui..."
                            />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center">
                                <Send />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="panel rounded-lg w-1/4 flex flex-col">
                    <h2 className="text-lg font-semibold p-3 border-b border-[#414868]">Agent Logs</h2>
                    <div ref={logsContainerRef} className="flex-grow p-3 overflow-y-auto text-xs font-mono">
                        {logs.map((log, index) => (
                           <div key={index} className={`log-line ${log.level}`}>{log.content}</div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
