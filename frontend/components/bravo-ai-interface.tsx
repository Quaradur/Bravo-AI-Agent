"use client";

import React, { useState, useRef, useEffect, FC, ReactNode, ChangeEvent, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus,
    Search,
    Bell,
    Star,
    Settings,
    HelpCircle,
    Paperclip,
    Mic,
    ChevronDown,
    Check,
    Atom,
    MessageSquare,
    Image as ImageIcon,
    Presentation,
    Sheet,
    BarChart2,
    Share2,
    User,
    RefreshCw,
    ChevronRight,
    BrainCircuit,
    LogOut,
    CalendarDays,
    Cpu,
    X,
    FileCog,
    Cloud,
    AppWindow,
    User as UserIcon,
    Sun,
    Moon,
    Monitor,
    Copy,
    Send,
    MoreHorizontal,
    Trash2,
    Edit3,
    ExternalLink,
    Globe,
    Lock,
    PlayCircle,
    StarOff,
    ArrowUpRight,
    Sparkles,
    ChevronLeft,
    Gift,
    Users,
    Languages,
    Book,
    MoreVertical,
    ArrowUp,
    LucideProps
} from 'lucide-react';

// =================================================================================
// TYPES AND INTERFACES
// =================================================================================

interface Message {
    type: 'system' | 'user_message' | 'agent_response' | 'error';
    content: string;
}

interface ChatHistoryItem {
    id: number;
    title: string;
    preview: string;
    date: string;
    isFavorite: boolean;
    active?: boolean;
}

interface CompanyLogoMap {
    [key: string]: ReactNode;
}

interface AIModelGroup {
    provider: string;
    models: string[];
    prefix: string;
}

interface OptionTooltip {
    icon: ReactNode;
    title: string;
    description: string;
}

interface TooltipProps {
    text: string;
    children: ReactNode;
    position?: 'top' | 'bottom';
}

interface HoverTooltipProps {
    content: ReactNode;
    children: ReactNode;
    preferredPosition?: 'top' | 'bottom';
    bgClass?: string;
}

interface ModalProps {
    closeModal: () => void;
}

interface TeamModalProps extends ModalProps { }
interface KnowledgeModalProps extends ModalProps { }
interface ShareModalProps extends ModalProps {
    openRedeemModal: () => void;
}
interface SearchModalProps extends ModalProps { }
interface SettingsModalProps extends ModalProps {
    initialTab: string;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}
interface AddScheduleModalProps extends ModalProps { }
interface DeleteConfirmationModalProps {
    chat: ChatHistoryItem | undefined;
    onConfirm: (id: number) => void;
    onCancel: () => void;
}
interface ShareConversationModalProps {
    chat: ChatHistoryItem | null;
    onClose: () => void;
}

// =================================================================================
// BACKEND COMMUNICATION CONSTANTS
// =================================================================================

const API_URL = "http://127.0.0.1:8000";
const WEBSOCKET_URL = "ws://127.0.0.1:8000";
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// =================================================================================
// CUSTOM ICON COMPONENTS
// =================================================================================

const SidebarToggleIcon: FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
    </svg>
);

const HomeIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const ShareFriendIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 16.5v-11A2.5 2.5 0 0 1 6.5 3H10v2H6.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V14h2v3.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5z" />
        <path d="M14 7.5c-1 0-2.5 1-2.5 2.5S13 12.5 14 12.5s2.5-1 2.5-2.5S15 7.5 14 7.5z" />
        <path d="M14 4.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5S16.5 4.5 14 4.5zm0 7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
);

// =================================================================================
// DATA AND CONFIGURATION
// =================================================================================

const CompanyLogos: CompanyLogoMap = {
    'openai/': <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0,0,256,256" className="w-4 h-4 text-zinc-800 dark:text-white fill-current"><g fill="currentColor" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: "normal" }}><g transform="scale(5.12,5.12)"><path d="M45.403,25.562c-0.506,-1.89 -1.518,-3.553 -2.906,-4.862c1.134,-2.665 0.963,-5.724 -0.487,-8.237c-1.391,-2.408 -3.636,-4.131 -6.322,-4.851c-1.891,-0.506 -3.839,-0.462 -5.669,0.088c-1.743,-2.318 -4.457,-3.7 -7.372,-3.7c-4.906,0 -9.021,3.416 -10.116,7.991c-0.01,0.001 -0.019,-0.003 -0.029,-0.002c-2.902,0.36 -5.404,2.019 -6.865,4.549c-1.391,2.408 -1.76,5.214 -1.04,7.9c0.507,1.891 1.519,3.556 2.909,4.865c-1.134,2.666 -0.97,5.714 0.484,8.234c1.391,2.408 3.636,4.131 6.322,4.851c0.896,0.24 1.807,0.359 2.711,0.359c1.003,0 1.995,-0.161 2.957,-0.45c1.742,2.322 4.445,3.703 7.373,3.703c4.911,0 9.028,-3.422 10.12,-8.003c2.88,-0.35 5.431,-2.006 6.891,-4.535c1.39,-2.408 1.759,-5.214 1.039,-7.9zM35.17,9.543c2.171,0.581 3.984,1.974 5.107,3.919c1.049,1.817 1.243,4 0.569,5.967c-0.099,-0.062 -0.193,-0.131 -0.294,-0.19l-9.169,-5.294c-0.312,-0.179 -0.698,-0.177 -1.01,0.006l-10.198,6.041l-0.052,-4.607l8.663,-5.001c1.947,-1.124 4.214,-1.421 6.384,-0.841zM29.737,22.195l0.062,5.504l-4.736,2.805l-4.799,-2.699l-0.062,-5.504l4.736,-2.805zM14.235,14.412c0,-4.639 3.774,-8.412 8.412,-8.412c2.109,0 4.092,0.916 5.458,2.488c-0.105,0.056 -0.214,0.103 -0.318,0.163l-9.17,5.294c-0.312,0.181 -0.504,0.517 -0.5,0.877l0.133,11.851l-4.015,-2.258zM6.528,23.921c-0.581,-2.17 -0.282,-4.438 0.841,-6.383c1.06,-1.836 2.823,-3.074 4.884,-3.474c-0.004,0.116 -0.018,0.23 -0.018,0.348v10.588c0,0.361 0.195,0.694 0.51,0.872l10.329,5.81l-3.964,2.348l-8.662,-5.002c-1.946,-1.123 -3.338,-2.936 -3.92,-5.107zM14.83,40.457c-2.171,-0.581 -3.984,-1.974 -5.107,-3.919c-1.053,-1.824 -1.249,-4.001 -0.573,-5.97c0.101,0.063 0.196,0.133 0.299,0.193l9.169,5.294c0.154,0.089 0.327,0.134 0.5,0.134c0.177,0 0.353,-0.047 0.51,-0.14l10.198,-6.041l0.052,4.607l-8.663,5.001c-1.946,1.125 -4.214,1.424 -6.385,0.841zM35.765,35.588c0,4.639 -3.773,8.412 -8.412,8.412c-2.119,0 -4.094,-0.919 -5.459,-2.494c0.105,-0.056 0.216,-0.098 0.32,-0.158l9.17,-5.294c0.312,-0.181 0.504,-0.517 -0.5,-0.877l-0.134,-11.85l4.015,2.258zM42.631,32.462c-1.056,1.83 -2.84,3.086 -4.884,3.483c0.004,-0.12 0.018,-0.237 0.018,-0.357v-10.588c0,-0.361 -0.195,-0.694 -0.51,-0.872l-10.329,-5.81l3.964,-2.348l8.662,5.002c1.946,1.123 3.338,2.937 3.92,5.107c0.581,2.17 0.282,4.438 -0.841,6.383z"></path></g></g></svg>,
    'anthropic/': <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#d19b75" d="M40,6H8C6.895,6,6,6.895,6,8v32c0,1.105,0.895,2,2,2h32c1.105,0,2-0.895,2-2V8	C42,6.895,41.105,6,40,6z"></path><path fill="#252525" d="M22.197,14.234h-4.404L10.037,33.67c0-0.096,4.452,0,4.452,0l1.484-4.069h8.234l1.58,4.069h4.261	L22.197,14.234z M17.362,26.059l2.729-6.894l2.633,6.894C22.723,26.059,17.266,26.059,17.362,26.059z"></path><path fill="#252525" d="M25.963,14.234L33.59,33.67h4.356l-7.803-19.436C30.144,14.234,25.963,14.186,25.963,14.234z"></path></svg>,
    'google/': <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>,
    'xai/': <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48" className="w-4 h-4 text-zinc-800 dark:text-white fill-current"><polygon fill="currentColor" fillRule="evenodd" points="24.032,28.919 40.145,5.989 33.145,5.989 20.518,23.958" clipRule="evenodd"></polygon><polygon fill="currentColor" fillRule="evenodd" points="14.591,32.393 7.145,42.989 14.145,42.989 18.105,37.354" clipRule="evenodd"></polygon><polygon fill="currentColor" fillRule="evenodd" points="14.547,18.989 7.547,18.989 24.547,42.989 31.547,42.989" clipRule="evenodd"></polygon><polygon fill="currentColor" fillRule="evenodd" points="35,16.789 35,43 41,43 41,8.251" clipRule="evenodd"></polygon></svg>,
    'mistral/': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" id="Mistral-Ai-Icon--Streamline-Svg-Logos" height="16" width="16" className="w-4 h-4"><path fill="#000000" d="M14.4092 0.8787849999999999H11.560716666666666V3.727266666666667h2.8484833333333333V0.8787849999999999Z" strokeWidth="0.1667"></path><path fill="#f7d046" d="M15.833266666666667 0.8787849999999999H12.984783333333333V3.727266666666667h2.8484833333333333V0.8787849999999999Z" strokeWidth="0.1667"></path><path fill="#000000" d="M3.01515 0.8787849999999999H0.16666666666666666V3.727266666666667h2.8484833333333333V0.8787849999999999Z" strokeWidth="0.1667"></path><path fill="#000000" d="M3.01515 3.7272499999999997H0.16666666666666666v2.8484833333333333h2.8484833333333333V3.7272499999999997Z" strokeWidth="0.1667"></path><path fill="#000000" d="M3.01515 6.5757666666666665H0.16666666666666666v2.8484833333333333h2.8484833333333333V6.5757666666666665Z" strokeWidth="0.1667"></path><path fill="#000000" d="M3.01515 9.424283333333332H0.16666666666666666v2.8484833333333333h2.8484833333333333V9.424283333333332Z" strokeWidth="0.1667"></path><path fill="#000000" d="M3.01515 12.2727H0.16666666666666666v2.8484833333333333h2.8484833333333333V12.2727Z" strokeWidth="0.1667"></path><path fill="#f7d046" d="M4.439466666666666 0.8787849999999999H1.5909833333333332V3.727266666666667h2.8484833333333333V0.8787849999999999Z" strokeWidth="0.1667"></path><path fill="#f2a73b" d="M15.833266666666667 3.7272499999999997H12.984783333333333v2.8484833333333333h2.8484833333333333V3.7272499999999997Z" strokeWidth="0.1667"></path><path fill="#f2a73b" d="M4.439466666666666 3.7272499999999997H1.5909833333333332v2.8484833333333333h2.8484833333333333V3.7272499999999997Z" strokeWidth="0.1667"></path><path fill="#000000" d="M11.560649999999999 3.7272499999999997h-2.8485v2.8484833333333333h2.8485V3.7272499999999997Z" strokeWidth="0.1667"></path><path fill="#f2a73b" d="M12.984883333333332 3.7272499999999997H10.136399999999998v2.8484833333333333h2.8484833333333333V3.7272499999999997Z" strokeWidth="0.1667"></path><path fill="#f2a73b" d="M7.2877833333333335 3.7272499999999997h-2.8485v2.8484833333333333h2.8485V3.7272499999999997Z" strokeWidth="0.1667"></path><path fill="#ee792f" d="M10.136333333333333 6.5757666666666665H7.28785v2.8484833333333333H10.136333333333333V6.5757666666666665Z" strokeWidth="0.1667"></path><path fill="#ee792f" d="M12.984883333333332 6.5757666666666665H10.136399999999998v2.8484833333333333h2.8484833333333333V6.5757666666666665Z" strokeWidth="0.1667"></path><path fill="#ee792f" d="M7.2877833333333335 6.5757666666666665h-2.8485v2.8484833333333333h2.8485V6.5757666666666665Z" strokeWidth="0.1667"></path><path fill="#000000" d="M8.7121 9.424283333333332h-2.8485v2.8484833333333333h2.8485V9.424283333333332Z" strokeWidth="0.1667"></path><path fill="#eb5829" d="M10.136333333333333 9.424283333333332H7.28785v2.8484833333333333H10.136333333333333V9.424283333333332Z" strokeWidth="0.1667"></path><path fill="#ee792f" d="M15.833266666666667 6.5757666666666665H12.984783333333333v2.8484833333333333h2.8484833333333333V6.5757666666666665Z" strokeWidth="0.1667"></path><path fill="#ee792f" d="M4.439466666666666 6.5757666666666665H1.5909833333333332v2.8484833333333333h2.8484833333333333V6.5757666666666665Z" strokeWidth="0.1667"></path><path fill="#000000" d="M14.4092 9.424283333333332H11.560716666666666v2.8484833333333333h2.8484833333333333V9.424283333333332Z" strokeWidth="0.1667"></path><path fill="#eb5829" d="M15.833266666666667 9.424283333333332H12.984783333333333v2.8484833333333333h2.8484833333333333V9.424283333333332Z" strokeWidth="0.1667"></path><path fill="#000000" d="M14.4092 12.2727H11.560716666666666v2.8484833333333333h2.8484833333333333V12.2727Z" strokeWidth="0.1667"></path><path fill="#eb5829" d="M4.439466666666666 9.424283333333332H1.5909833333333332v2.8484833333333333h2.8484833333333333V9.424283333333332Z" strokeWidth="0.1667"></path><path fill="#ea3326" d="M15.833266666666667 12.2727H12.984783333333333v2.8484833333333333h2.8484833333333333V12.2727Z" strokeWidth="0.1667"></path><path fill="#ea3326" d="M4.439466666666666 12.2727H1.5909833333333332v2.8484833333333333h2.8484833333333333V12.2727Z" strokeWidth="0.1667"></path></svg>,
    'deepseek/': <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#536dfe" d="M47.496,10.074c-0.508-0.249-0.727,0.226-1.025,0.467c-0.102,0.078-0.188,0.179-0.274,0.272	c-0.743,0.794-1.611,1.315-2.746,1.253c-1.658-0.093-3.074,0.428-4.326,1.696c-0.266-1.564-1.15-2.498-2.495-3.097	c-0.704-0.311-1.416-0.623-1.909-1.3c-0.344-0.482-0.438-1.019-0.61-1.548c-0.11-0.319-0.219-0.646-0.587-0.7	c-0.399-0.062-0.555,0.272-0.712,0.553c-0.626,1.144-0.868,2.405-0.845,3.681c0.055,2.871,1.267,5.159,3.676,6.785	c0.274,0.187,0.344,0.373,0.258,0.646c-0.164,0.56-0.36,1.105-0.532,1.665c-0.11,0.358-0.274,0.436-0.657,0.28	c-1.322-0.552-2.464-1.369-3.473-2.358c-1.713-1.657-3.262-3.486-5.194-4.918c-0.454-0.335-0.907-0.646-1.377-0.942	c-1.971-1.914,0.258-3.486,0.774-3.673c0.54-0.195,0.188-0.864-1.557-0.856c-1.744,0.008-3.34,0.591-5.374,1.369	c-0.297,0.117-0.61,0.202-0.931,0.272c-1.846-0.35-3.763-0.428-5.765-0.202c-3.77,0.42-6.782,2.202-8.996,5.245	c-2.66,3.657-3.285,7.812-2.519,12.147c0.806,4.568,3.137,8.349,6.719,11.306c3.716,3.066,7.994,4.568,12.876,4.28	c2.965-0.171,6.266-0.568,9.989-3.719c0.939,0.467,1.924,0.654,3.559,0.794c1.259,0.117,2.472-0.062,3.411-0.257	c1.471-0.311,1.369-1.673,0.837-1.922C34,36,33.471,35.441,33.471,35.441c2.19-2.591,5.491-5.284,6.782-14.007	c0.102-0.692,0.016-1.128,0-1.689c-0.008-0.342,0.07-0.475,0.462-0.514c1.079-0.125,2.128-0.42,3.09-0.949	c2.793-1.525,3.919-4.031,4.185-7.034C48.028,10.79,47.981,10.315,47.496,10.074z M23.161,37.107	c-4.177-3.284-6.203-4.365-7.04-4.319c-0.782,0.047-0.641,0.942-0.469,1.525c0.18,0.576,0.415,0.973,0.743,1.478	c0.227,0.335,0.383,0.833-0.227,1.206c-1.345,0.833-3.684-0.28-3.794-0.335c-2.722-1.603-4.998-3.72-6.602-6.614	c-1.549-2.786-2.448-5.774-2.597-8.964c-0.039-0.77,0.188-1.043,0.954-1.183c1.009-0.187,2.049-0.226,3.059-0.078	c4.263,0.623,7.893,2.529,10.936,5.548c1.737,1.72,3.051,3.774,4.404,5.782c1.439,2.132,2.988,4.163,4.959,5.828	c0.696,0.584,1.252,1.027,1.783,1.354C27.667,38.515,24.991,38.554,23.161,37.107L23.161,37.107z M25.164,24.228	c0-0.342,0.274-0.615,0.618-0.615c0.078,0,0.149,0.015,0.211,0.039c0.086,0.031,0.164,0.078,0.227,0.148	c0.11,0.109,0.172,0.265,0.172,0.428c0,0.342-0.274,0.615-0.618,0.615S25.164,24.571,25.164,24.228L25.164,24.228z M31.382,27.419	c-0.399,0.163-0.798,0.303-1.181,0.319c-0.595,0.031-1.244-0.21-1.596-0.506c-0.548-0.459-0.939-0.716-1.103-1.517	c-0.07-0.342-0.031-0.872,0.031-1.175c0.141-0.654-0.016-1.074-0.477-1.455c-0.376-0.311-0.853-0.397-1.377-0.397	c-0.196,0-0.375-0.086-0.508-0.156c-0.219-0.109-0.399-0.381-0.227-0.716c0.055-0.109,0.321-0.373,0.383-0.42	c0.712-0.405,1.533-0.272,2.292,0.031c0.704,0.288,1.236,0.817,2.003,1.564c0.782,0.903,0.923,1.152,1.369,1.829	c0.352,0.529,0.673,1.074,0.892,1.696C32.016,26.905,31.844,27.224,31.382,27.419L31.382,27.419z"></path></svg>,
    'meta/': <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#0081fb" d="M47,29.36l-2.193,1.663L42.62,29.5c0-0.16,0-0.33-0.01-0.5c0-0.16,0-0.33-0.01-0.5	c-0.14-3.94-1.14-8.16-3.14-11.25c-1.54-2.37-3.51-3.5-5.71-3.5c-2.31,0-4.19,1.38-6.27,4.38c-0.06,0.09-0.13,0.18-0.19,0.28	c-0.04,0.05-0.07,0.1-0.11,0.16c-0.1,0.15-0.2,0.3-0.3,0.46c-0.9,1.4-1.84,3.03-2.86,4.83c-0.09,0.17-0.19,0.34-0.28,0.51	c-0.03,0.04-0.06,0.09-0.08,0.13l-0.21,0.37l-1.24,2.19c-2.91,5.15-3.65,6.33-5.1,8.26C14.56,38.71,12.38,40,9.51,40	c-3.4,0-5.56-1.47-6.89-3.69C1.53,34.51,1,32.14,1,29.44l4.97,0.17c0,1.76,0.38,3.1,0.89,3.92C7.52,34.59,8.49,35,9.5,35	c1.29,0,2.49-0.27,4.77-3.43c1.83-2.53,3.99-6.07,5.44-8.3l1.37-2.09l0.29-0.46l0.3-0.45l0.5-0.77c0.76-1.16,1.58-2.39,2.46-3.57	c0.1-0.14,0.2-0.28,0.31-0.42c0.1-0.14,0.21-0.28,0.31-0.41c0.9-1.15,1.85-2.22,2.87-3.1c1.85-1.61,3.84-2.5,5.85-2.5	c3.37,0,6.58,1.95,9.04,5.61c2.51,3.74,3.82,8.4,3.97,13.25c0.01,0.16,0.01,0.33,0.01,0.5C47,29.03,47,29.19,47,29.36z"></path><linearGradient id="wSMw7pqi7WIWHewz2_TZXa_PvvcWRWxRKSR_gr1" x1="42.304" x2="13.533" y1="24.75" y2="24.75" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#0081fb"></stop><stop offset=".995" stopColor="#0064e1"></stop></linearGradient><path fill="url(#wSMw7pqi7WIWHewz2_TZXa_PvvcWRWxRKSR_gr1)" d="M4.918,15.456	C7.195,11.951,10.483,9.5,14.253,9.5c2.184,0,4.354,0.645,6.621,2.493c2.479,2.02,5.122,5.346,8.419,10.828l1.182,1.967	c2.854,4.746,4.477,7.187,5.428,8.339C37.125,34.606,37.888,35,39,35c2.82,0,3.617-2.54,3.617-5.501L47,29.362	c0,3.095-0.611,5.369-1.651,7.165C44.345,38.264,42.387,40,39.093,40c-2.048,0-3.862-0.444-5.868-2.333	c-1.542-1.45-3.345-4.026-4.732-6.341l-4.126-6.879c-2.07-3.452-3.969-6.027-5.068-7.192c-1.182-1.254-2.642-2.754-5.067-2.754	c-1.963,0-3.689,1.362-5.084,3.465L4.918,15.456z"></path><linearGradient id="wSMw7pqi7WIWHewz2_TZXb_PvvcWRWxRKSR_gr2" x1="7.635" x2="7.635" y1="32.87" y2="13.012" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#0081fb"></stop><stop offset=".995" stopColor="#0064e1"></stop></linearGradient><path fill="url(#wSMw7pqi7WIWHewz2_TZXb_PvvcWRWxRKSR_gr2)" d="M14.25,14.5	c-1.959,0-3.683,1.362-5.075,3.465C7.206,20.937,6,25.363,6,29.614c0,1.753-0.003,3.072,0.5,3.886l-3.84,2.813	C1.574,34.507,1,32.2,1,29.5c0-4.91,1.355-10.091,3.918-14.044C7.192,11.951,10.507,9.5,14.27,9.5L14.25,14.5z"></path><path d="M21.67,20.27l-0.3,0.45l-0.29,0.46c0.71,1.03,1.52,2.27,2.37,3.69l0.21-0.37c0.02-0.04,0.05-0.09,0.08-0.13 c0.09-0.17,0.19-0.34,0.28-0.51C23.19,22.5,22.39,21.29,21.67,20.27z M24.94,15.51c-0.11,0.14-0.21,0.28-0.31,0.42 c0.73,0.91,1.47,1.94,2.25,3.1c0.1-0.16,0.2-0.31,0.3-0.46c0.04-0.06,0.07-0.11,0.11-0.16c0.06-0.1,0.13-0.19,0.19-0.28 c-0.76-1.12-1.5-2.13-2.23-3.03C25.15,15.23,25.04,15.37,24.94,15.51z" opacity=".05"></path><path d="M21.67,20.27l-0.3,0.45c0.71,1.02,1.51,2.24,2.37,3.65c0.09-0.17,0.19-0.34,0.28-0.51C23.19,22.5,22.39,21.29,21.67,20.27 z M24.63,15.93c0.73,0.91,1.47,1.94,2.25,3.1c0.1-0.16,0.2-0.31,0.3-0.46c-0.77-1.14-1.52-2.16-2.24-3.06 C24.83,15.65,24.73,15.79,24.63,15.93z" opacity=".07"></path></svg>,
    'alibaba/': <svg fill="#ed6a17" width="16px" height="16px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>alibabacloud</title> <path d="M20.995 17.077h-9.991v-2.254h9.991zM26.002 6.649h-6.612l1.596 2.258 4.82 1.477c0.851 0.276 1.456 1.061 1.456 1.988 0 0.004 0 0.009-0 0.013v-0.001 7.23c0 0.004 0 0.008 0 0.012 0 0.927-0.605 1.712-1.441 1.983l-0.015 0.004-4.82 1.478-1.596 2.258h6.612c2.758 0 4.994-2.236 4.994-4.994v0-8.715c0-2.758-2.236-4.994-4.994-4.994v0zM5.998 6.649h6.612l-1.596 2.258-4.82 1.477c-0.851 0.275-1.456 1.061-1.456 1.987 0 0.005 0 0.009 0 0.014v-0.001 7.23c-0 0.004-0 0.008-0 0.012 0 0.927 0.605 1.712 1.441 1.983l0.015 0.004 4.82 1.478 1.596 2.258h-6.612c-2.758 0-4.994-2.236-4.994-4.993v0-8.715c0-2.758 2.236-4.994 4.994-4.994v0z"></path> </g></svg>,
    'default': <Cpu size={16} className="text-gray-500" />
};

const aiModels: AIModelGroup[] = [
    { provider: "OpenAI", models: ["GPT-5", "GPT-5 Mini", "GPT-5 Nano", "o3", "o3-mini", "o4-mini", "o1", "GPT-4.1 mini", "GPT-4.1 nano", "GPT-4o", "GPT-4o mini", "GPT-4 Turbo", "GPT-3.5 Turbo", "GPT OSS 120b", "GPT OSS 20b"], prefix: "openai/" },
    { provider: "Anthropic", models: ["Claude Opus 4.1", "Claude Opus 4", "Claude Sonnet 4", "Claude Sonnet 3.7", "Claude Sonnet 3.5", "Claude Haiku 3.7", "Claude Opus 3", "Claude Haiku 3"], prefix: "anthropic/" },
    { provider: "Google Vertex AI", models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash", "Gemini 2.0 Pro", "Gemini 2.0 Flash Lite", "Gemma 2 9b"], prefix: "google/" },
    { provider: "xAI", models: ["Grok 4", "Grok 3", "Grok 3 Fast", "Grok 3 Mini", "Grok 3 Mini Fast", "Grok 2 Vision", "Grok 2"], prefix: "xai/" },
    { provider: "Mistral", models: ["Mistral Large", "Mistral Small", "Devstral Small", "Magistral Medium", "Magistral Small", "Ministral 8b", "Ministral 3b", "Codestral", "Mistral Saba 24b", "Pixstral Large", "Pixstral 12b"], prefix: "mistral/" },
    { provider: "DeepSeek", models: ["DeepSeek R1", "DeppSeek V3"], prefix: "deepseek/" },
    { provider: "Meta", models: ["Llama 4 Maverick", "Llama 4 Scout", "Llama 3.3 70b", "Llama 3.2 90b", "Llama 3.2 11b", "Llama 3.2 3b", "Llama 3.1 70b", "Llama 3.1 8b", "Llama 3 70b", "Llama 3 8b"], prefix: "meta/" },
    { provider: "Alibaba Cloud", models: ["Qwen 3.3-2B", "Qwen 3-235B", "Qwen 3-32B", "Qwen 3-30B", "Qwen 3-14B"], prefix: "alibaba/" },
];

const optionTooltips: { [key: string]: OptionTooltip } = {
    agent: {
        icon: <Atom />,
        title: "Agent",
        description: "Tackle complex tasks and deliver results autonomously."
    },
    chat: {
        icon: <MessageSquare />,
        title: "Chat",
        description: "Answer everyday questions or chat before starting tasks."
    },
};

// =================================================================================
// UTILITY & HELPER COMPONENTS
// =================================================================================

const Tooltip: FC<TooltipProps> = ({ text, children, position = 'bottom' }) => {
    const [show, setShow] = useState<boolean>(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        setShow(true);
    };

    useEffect(() => {
        if (show && wrapperRef.current && tooltipRef.current) {
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let top: number, left: number;

            if (position === 'top') {
                top = wrapperRect.top - tooltipRect.height - 8; // 8px gap
                left = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2);
            } else { // bottom
                top = wrapperRect.bottom + 8; // 8px gap
                left = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2);
            }

            if (left < 8) left = 8;
            if (left + tooltipRect.width > window.innerWidth - 8) {
                left = window.innerWidth - tooltipRect.width - 8;
            }

            setCoords({ top, left });
        }
    }, [show, position]);

    const handleMouseLeave = () => {
        setShow(false);
    };

    const tooltipPortal = show && typeof document !== 'undefined' && createPortal(
        <div
            ref={tooltipRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed px-2 py-1 bg-black text-white text-xs rounded-md shadow-lg z-[9999] whitespace-nowrap"
        >
            {text}
        </div>,
        document.body
    );

    return (
        <>
            <span ref={wrapperRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="inline-flex items-center justify-center">
                {children}
            </span>
            {tooltipPortal}
        </>
    );
};

const HoverTooltip: FC<HoverTooltipProps> = ({ content, children, preferredPosition = 'bottom', bgClass = 'bg-white dark:bg-zinc-900' }) => {
    const [show, setShow] = useState<boolean>(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShow(true);
    };

    useEffect(() => {
        if (show && wrapperRef.current && tooltipRef.current) {
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let top: number, left: number;

            top = wrapperRect.bottom + 8;
            left = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2);

            if (top + tooltipRect.height > window.innerHeight && preferredPosition !== 'bottom') {
                top = wrapperRect.top - tooltipRect.height - 8;
            }

            if (preferredPosition === 'top') {
                top = wrapperRect.top - tooltipRect.height - 8;
                if (top < 0) {
                    top = wrapperRect.bottom + 8;
                }
            }

            if (left < 8) left = 8;
            if (left + tooltipRect.width > window.innerWidth - 8) {
                left = window.innerWidth - tooltipRect.width - 8;
            }

            setCoords({ top, left });
        }
    }, [show, preferredPosition]);

    const handleMouseLeave = () => {
        timeoutRef.current = window.setTimeout(() => {
            setShow(false);
        }, 200);
    };

    const tooltipPortal = show && typeof document !== 'undefined' && createPortal(
        <div
            ref={tooltipRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className={`fixed w-72 ${bgClass} text-zinc-800 dark:text-white rounded-lg shadow-lg p-3 z-[9999] border border-gray-200 dark:border-zinc-700`}
            onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            onMouseLeave={handleMouseLeave}
        >
            {content}
        </div>,
        document.body
    );

    return (
        <div ref={wrapperRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="inline-flex items-center justify-center">
            {children}
            {tooltipPortal}
        </div>
    );
};

// =================================================================================
// MODAL COMPONENTS
// =================================================================================

const KnowledgeModal: FC<KnowledgeModalProps> = ({ closeModal }) => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
    const [status, setStatus] = useState<boolean>(true);

    const AddKnowledgeView: FC = () => (
        <>
            <div className="flex items-center mb-6">
                <button onClick={() => setView('list')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 mr-3">
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-semibold">Add Knowledge</h3>
                <button onClick={closeModal} className="ml-auto p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-400">Name</label>
                    <input type="text" placeholder="Name of this knowledge" className="mt-1 w-full bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-400">When Manus will use this knowledge when...</label>
                    <input type="text" placeholder="When to use this knowledge" className="mt-1 w-full bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-400">Content</label>
                    <textarea rows={5} placeholder="Content of this knowledge" className="mt-1 w-full bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-400">Status</label>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${!status ? 'text-gray-400' : ''}`}>Disabled</span>
                        <button onClick={() => setStatus(!status)} className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${status ? 'bg-blue-500 justify-end' : 'bg-gray-300 dark:bg-zinc-700 justify-start'}`}>
                            <span className="w-4 h-4 bg-white rounded-full block transform transition-transform"></span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setView('list')} className="px-4 py-2 rounded-lg text-sm bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold">
                    Cancel
                </button>
                <button onClick={() => setView('list')} className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-white dark:bg-white dark:text-black hover:bg-black font-semibold">
                    Save
                </button>
            </div>
        </>
    );

    const KnowledgeListView: FC = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Knowledge</h3>
                    <p className="text-sm text-gray-400 mt-1">Knowledge enables Manus to learn your preferences and task-specific best practices. Manus will automatically recall relevant knowledge when needed. Supports up to 10 entries.</p>
                </div>
                <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 self-start">
                    <X size={20} />
                </button>
            </div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setView('add')} className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                    <Plus size={16} /> Add knowledge
                </button>
            </div>

            {knowledgeList.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 h-64">
                    <Book size={32} className="mb-4" />
                    <p>No knowledge yet</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-gray-400">
                            <th className="p-2">Name</th>
                            <th className="p-2">Content</th>
                            <th className="p-2">Created at</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map through knowledgeList here */}
                    </tbody>
                </table>
            )}
        </>
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeModal}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl min-h-[650px] p-6 shadow-2xl text-zinc-800 dark:text-white border border-gray-200 dark:border-zinc-700" onClick={e => e.stopPropagation()}>
                {view === 'list' ? <KnowledgeListView /> : <AddKnowledgeView />}
            </div>
        </div>,
        document.body
    );
};

const TeamModal: FC<TeamModalProps> = ({ closeModal }) => {
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('year');
    const [teamSeats, setTeamSeats] = useState<number>(10);

    const pricePerSeat = billingCycle === 'year' ? 390 : 39;
    const totalPrice = teamSeats * pricePerSeat;
    const totalCredits = (teamSeats * 3900).toLocaleString('en-US');

    return createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeModal}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl text-zinc-800 dark:text-white border border-gray-200 dark:border-zinc-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">Manus Team <span className="text-xs bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 px-2 py-0.5 rounded-md">Beta</span></h3>
                    <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setBillingCycle('month')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md ${billingCycle === 'month' ? 'bg-white dark:bg-zinc-700' : 'hover:bg-gray-200 dark:hover:bg-zinc-700/50'}`}
                    >
                        <p>US ${39}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">per member/month</p>
                    </button>
                    <button
                        onClick={() => setBillingCycle('year')}
                        className={`relative px-4 py-2 text-sm font-semibold rounded-md ${billingCycle === 'year' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-zinc-700/50'}`}
                    >
                        <span className="absolute -top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Save 17%</span>
                        <p>US ${390}</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-400">per member/year</p>
                    </button>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Team seats</label>
                        <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-md text-sm">{teamSeats}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={teamSeats}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTeamSeats(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <div className="flex justify-between items-center text-sm mb-1">
                    <p className="text-gray-500 dark:text-zinc-400">Total credits</p>
                    <p>{totalCredits}/month</p>
                </div>
                <div className="flex justify-between items-center text-sm mb-6">
                    <p className="text-gray-500 dark:text-zinc-400">Total price</p>
                    <p>${totalPrice.toLocaleString('en-US')}/{billingCycle}</p>
                </div>

                <button className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 mb-6">
                    Upgrade to Team
                </button>

                <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Shared team pool: {totalCredits} credits per member per month <HelpCircle size={14} className="text-zinc-500" /></li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Unlimited access to Chat mode</li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Use advanced models in Agent mode</li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> 10 concurrent tasks per member</li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> 10 scheduled tasks per member</li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Image generation</li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Video generation</li>
                    <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Slides generation</li>
                    <li className="flex items-center gap-3"><X size={16} className="text-zinc-500" /> Exclusive data sources</li>
                    <li className="flex items-center gap-3"><X size={16} className="text-zinc-500" /> Early access to beta features</li>
                </ul>

                <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-6">
                    Want to learn more? <a href="#" className="text-blue-500 dark:text-blue-400 hover:underline">Contact sales</a>
                </p>
            </div>
        </div>,
        document.body
    );
};

// =================================================================================
// MAIN APP COMPONENT
// =================================================================================

const App: FC = () => {
    // State for various UI elements
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isConversationStarted, setIsConversationStarted] = useState<boolean>(false);
    const [hasSentFirstMessage, setHasSentFirstMessage] = useState<boolean>(false);
    const [promptValue, setPromptValue] = useState<string>('');
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);
    const [selectedSpeed, setSelectedSpeed] = useState<string>('Speed');
    const [selectedOption, setSelectedOption] = useState<string>('agent');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
    const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState<boolean>(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<string>('openai/GPT-5');
    const [isFileMenuOpen, setIsFileMenuOpen] = useState<boolean>(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState<boolean>(false);
    const [initialSettingsTab, setInitialSettingsTab] = useState<string>('Account');
    const [theme, setTheme] = useState<string>('dark');
    const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
    const [activeChatMenu, setActiveChatMenu] = useState<number | string | null>(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
    const [renamingChatId, setRenamingChatId] = useState<number | null>(null);
    const [chatToDelete, setChatToDelete] = useState<number | null>(null);
    const [notification, setNotification] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [chatToShare, setChatToShare] = useState<ChatHistoryItem | null>(null);
    const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
    const [isQualityTooltipVisible, setIsQualityTooltipVisible] = useState<boolean>(false);

    // Chat-specific state
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
    const webSocketRef = useRef<WebSocket | null>(null);

    // Refs to handle outside clicks
    const speedMenuRef = useRef<HTMLDivElement>(null);
    const modelMenuRef = useRef<HTMLDivElement>(null);
    const fileMenuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const accountSwitcherRef = useRef<HTMLDivElement>(null);
    const userMenuTimeoutRef = useRef<number | null>(null);
    const accountSwitcherTimeoutRef = useRef<number | null>(null);
    const chatListRef = useRef<HTMLElement>(null);
    const searchModalRef = useRef<HTMLDivElement>(null);
    const qualityTooltipTimeoutRef = useRef<number | null>(null);

    // --- EFFECT FOR WEBSOCKET CONNECTION ---
    useEffect(() => {
        webSocketRef.current = new WebSocket(`${WEBSOCKET_URL}/ws/${SESSION_ID}`);

        webSocketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
            setMessages(prev => [...prev, { type: 'system', content: 'Connesso al Bravo AI Agent.' }]);
        };

        webSocketRef.current.onmessage = (event: MessageEvent) => {
            const data: Message = JSON.parse(event.data);
            console.log("Received message:", data);
            setMessages(prev => [...prev, data]);

            if (data.type === 'agent_response' || data.type === 'error') {
                setIsAgentThinking(false);
            }
        };

        webSocketRef.current.onclose = () => {
            console.log("WebSocket connection closed.");
            setMessages(prev => [...prev, { type: 'system', content: 'Disconnesso dal Bravo AI Agent.' }]);
        };

        webSocketRef.current.onerror = (event: Event) => {
            console.error("WebSocket error:", event);
            setMessages(prev => [...prev, { type: 'system', content: `Errore di connessione.` }]);
        };

        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, []);

    const openSettingsToTab = (tabName: string) => {
        setInitialSettingsTab(tabName);
        setIsSettingsModalOpen(true);
        setIsUserMenuOpen(false);
    };

    const aboutCreditsTooltipContent = (
        <div className="text-left p-1 w-64">
            <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-lg text-white">About credits</p>
                <a href="#" className="text-sm text-blue-400 hover:underline">Learn more</a>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 list-disc list-inside">
                <li>Credits are consumed in the following order: event credits, daily credits, monthly credits, add-on credits, and free credits.</li>
                <li>Monthly credits are obtained through subscription and automatically refresh on the same date each month based on your subscription date.</li>
                <li>Free credits and add-on credits never expire.</li>
                <li>Event credits can be earned by participating in events and expire when the event ends.</li>
            </ul>
        </div>
    );

    const userMenuCreditsTooltipContent = (
        <div className="text-left text-white p-3 space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Sparkles size={16} /> Credits</div>
                <p>0</p>
            </div>
            <p className="text-xs text-gray-400 pl-6 -mt-2">Free credits</p>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><CalendarDays size={16} /> Daily refresh credits</div>
                <p>300</p>
            </div>
            <p className="text-xs text-gray-400 pl-6 -mt-2">Refresh to 300 at 02:00 every day</p>

            <button onClick={() => openSettingsToTab('Usage')} className="flex items-center text-sm text-blue-400 hover:underline pt-2">
                View usage <ChevronRight size={16} />
            </button>
        </div>
    );

    const creditsTooltipContent = (
        <div className="text-left">
            <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-lg">Free</p>
                <button className="bg-white text-black px-4 py-1.5 rounded-full font-semibold text-sm">Upgrade</button>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Credits
                        <HoverTooltip content={aboutCreditsTooltipContent} preferredPosition="top" bgClass="bg-black">
                            <HelpCircle size={14} className="text-gray-400 cursor-pointer" />
                        </HoverTooltip>
                    </div>
                    <p>945</p>
                </div>
                <p className="text-xs text-gray-400 pl-6">Free credits</p>
                <div className="flex justify-between items-center">
                    <p className="flex items-center gap-2"><CalendarDays size={16} /> Daily renewal credits</p>
                    <p>300</p>
                </div>
                <p className="text-xs text-gray-400 pl-6 mb-2">Upgrades to 300 at 02:00 every day</p>
            </div>
            <button onClick={() => openSettingsToTab('Usage')} className="flex items-center text-sm text-blue-400 hover:underline mt-4">
                View usage <ChevronRight size={16} />
            </button>
        </div>
    );

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.remove('light', 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
    }, [theme]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) setIsSpeedMenuOpen(false);
            if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) setIsModelMenuOpen(false);
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) setIsFileMenuOpen(false);
            if (chatListRef.current && !chatListRef.current.contains(event.target as Node) && typeof activeChatMenu === 'string' && activeChatMenu.endsWith('-menu')) setActiveChatMenu(null);
            if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) setIsSearchModalOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeChatMenu]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [promptValue]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
        { id: 1, title: "Soccer match predictions...", preview: "I have completed the analysis...", date: "3/29", isFavorite: false },
        { id: 2, title: "Copy the DreamWorks style", preview: "Sure, I can help with that...", date: "Mar", isFavorite: true },
        { id: 3, title: "Create a detailed prompt...", preview: "The prompt should include...", date: "8/2", active: true, isFavorite: false },
        { id: 4, title: "Guide to integrate AI via software", preview: "You have no credits to continue", date: "09/22", isFavorite: false },
        { id: 5, title: "Title unclear without context or content", preview: "I have analyzed the content of the file...", date: "sab", isFavorite: false },
    ]);

    const filteredChatHistory = chatHistory.filter(chat => {
        if (activeFilter === 'Favorites') return chat.isFavorite;
        return true;
    }).sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

    const handleShareChat = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const chat = chatHistory.find(c => c.id === id);
        if (chat) setChatToShare(chat);
        setActiveChatMenu(null);
    };

    const handleRename = (id: number, newTitle: string) => {
        setChatHistory(prev => prev.map(chat => chat.id === id ? { ...chat, title: newTitle } : chat));
        setRenamingChatId(null);
    };

    const handleToggleFavorite = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setChatHistory(prev => prev.map(chat => chat.id === id ? { ...chat, isFavorite: !chat.isFavorite } : chat));
        setActiveChatMenu(null);
    };

    const handleOpenInNewTab = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        window.open(`/chat/${id}`, '_blank');
        setActiveChatMenu(null);
    };

    const handleDeleteChat = (id: number) => {
        setChatHistory(prev => prev.filter(chat => chat.id !== id));
        setChatToDelete(null);
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setPromptValue(e.target.value);
    };

    const handleSendMessage = async () => {
        if (promptValue.trim() === '' || isAgentThinking) return;

        setIsAgentThinking(true);
        const userMessage: Message = { type: 'user_message', content: promptValue };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptValue,
                    session_id: SESSION_ID
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await response.json();
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setMessages(prev => [...prev, { type: 'error', content: `Impossibile avviare il task: ${errorMessage}` }]);
            setIsAgentThinking(false);
        }

        if (!hasSentFirstMessage) setHasSentFirstMessage(true);
        setIsConversationStarted(true);
        setPromptValue('');
    };

    const getShortModelName = (fullModelName: string) => {
        return fullModelName.split('/')[1];
    }

    const handleMenuEnter = (setOpen: React.Dispatch<React.SetStateAction<boolean>>, timeoutRef: React.MutableRefObject<number | null>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleMenuLeave = (setOpen: React.Dispatch<React.SetStateAction<boolean>>, timeoutRef: React.MutableRefObject<number | null>) => {
        timeoutRef.current = window.setTimeout(() => {
            setOpen(false);
        }, 200);
    };

    const handleNewTask = () => {
        setIsConversationStarted(false);
        setHasSentFirstMessage(false);
        setPromptValue('');
        setMessages([]);
    };

    const SearchModal: FC<SearchModalProps> = ({ closeModal }) => {
        const [searchQuery, setSearchQuery] = useState('');

        const filteredHistory = chatHistory.filter(chat =>
            chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const today = filteredHistory.slice(0, 1);
        const last7Days = filteredHistory.slice(1, 3);
        const last30Days = filteredHistory.slice(3);

        return (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
                <div ref={searchModalRef} className="bg-white dark:bg-[#202123] rounded-2xl w-full max-w-2xl shadow-2xl text-zinc-800 dark:text-gray-300">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent focus:outline-none pl-10 pr-10 py-2 text-lg"
                            />
                            <button onClick={closeModal} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
                            <Plus size={18} />
                            <span className="font-semibold">New Task</span>
                        </button>

                        {searchQuery && filteredHistory.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No results found.</p>
                        )}

                        {!searchQuery && (
                            <>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-400 px-3 mb-2">Today</p>
                                    <ul>
                                        {today.map(chat => (
                                            <li key={chat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer">
                                                <MessageSquare size={18} />
                                                <span className="flex-grow truncate">{chat.title}</span>
                                                <span className="text-xs text-gray-400">{chat.date}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-400 px-3 mb-2">Last 7 days</p>
                                    <ul>
                                        {last7Days.map(chat => (
                                            <li key={chat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer">
                                                <MessageSquare size={18} />
                                                <span className="flex-grow truncate">{chat.title}</span>
                                                <span className="text-xs text-gray-400">{chat.date}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-400 px-3 mb-2">Last 30 days</p>
                                    <ul>
                                        {last30Days.map(chat => (
                                            <li key={chat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer">
                                                <MessageSquare size={18} />
                                                <span className="flex-grow truncate">{chat.title}</span>
                                                <span className="text-xs text-gray-400">{chat.date}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                        {searchQuery && filteredHistory.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-gray-400 px-3 mb-2">Search Results</p>
                                <ul>
                                    {filteredHistory.map(chat => (
                                        <li key={chat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer">
                                            <MessageSquare size={18} />
                                            <span className="flex-grow truncate">{chat.title}</span>
                                            <span className="text-xs text-gray-400">{chat.date}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({ chat, onConfirm, onCancel }) => {
        if (!chat) return null;
        return createPortal(
            <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]`}>
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-sm border border-gray-200 dark:border-zinc-700">
                    <h3 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">Delete Chat?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Are you sure you want to delete "{chat.title}"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white">
                            Cancel
                        </button>
                        <button onClick={() => onConfirm(chat.id)} className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const ShareConversationModal: FC<ShareConversationModalProps> = ({ chat, onClose }) => {
        const [access, setAccess] = useState<'private' | 'public'>('private');
        if (!chat) return null;

        return createPortal(
            <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]`} onClick={onClose}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 w-full max-w-md border border-gray-200 dark:border-zinc-700" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-white">Share this task replay</h3>

                    <div className="space-y-3 mb-6">
                        <button onClick={() => setAccess('private')} className={`w-full flex items-center gap-4 p-3 rounded-lg border-2 ${access === 'private' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
                            <Lock className="text-zinc-800 dark:text-white" size={20} />
                            <div>
                                <p className="font-semibold text-left text-zinc-800 dark:text-white">Just me</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Only visible to you</p>
                            </div>
                            {access === 'private' && <Check size={20} className="ml-auto text-blue-500" />}
                        </button>
                        <button onClick={() => setAccess('public')} className={`w-full flex items-center gap-4 p-3 rounded-lg border-2 ${access === 'public' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
                            <Globe className="text-zinc-800 dark:text-white" size={20} />
                            <div>
                                <p className="font-semibold text-left text-zinc-800 dark:text-white">Public access</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Anyone with a link can view</p>
                            </div>
                            {access === 'public' && <Check size={20} className="ml-auto text-blue-500" />}
                        </button>
                    </div>

                    <button onClick={onClose} className="w-full px-4 py-2 rounded-lg text-sm bg-black dark:bg-white text-white dark:text-black font-semibold">
                        Share
                    </button>
                    <p className="text-xs text-gray-400 mt-4 text-center">
                        Do not share personal information or third-party content without authorization, see our <a href="#" className="underline">Terms of Service</a>.
                    </p>
                </div>
            </div>,
            document.body
        );
    };

    const ShareModal: FC<ShareModalProps> = ({ closeModal, openRedeemModal }) => {
        const [view, setView] = useState<'main' | 'history'>('main');

        const MainView = () => (
            <div className="flex flex-col h-full">
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Invite to get credits</h3>
                        <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Share your invite link with friends, get 500 credits each.</p>
                </div>
                <div className="flex-grow space-y-4">
                    <div>
                        <label className="text-xs text-gray-400">Share your invite link</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="text" readOnly value="https://manus.inv/invitation/..." className="w-full bg-gray-100 dark:bg-zinc-700 p-2 rounded-lg text-sm truncate" />
                            <button className="bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 px-3 py-2 rounded-lg text-sm flex items-center gap-2"><Copy size={14} /> Copy</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Invite via email</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="email" placeholder="Enter email" className="w-full bg-gray-100 dark:bg-zinc-700 p-2 rounded-lg text-sm" />
                            <button className="bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 px-3 py-2 rounded-lg text-sm flex items-center gap-2"><Send size={14} /> Invite</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 my-6">
                        <hr className="flex-grow border-gray-200 dark:border-zinc-700" />
                        <span className="text-xs text-gray-400">Invitation history</span>
                        <hr className="flex-grow border-gray-200 dark:border-zinc-700" />
                    </div>
                    <div className="flex justify-around items-center bg-gray-100 dark:bg-zinc-800/50 p-3 rounded-lg">
                        <div className="text-center">
                            <p className="font-bold">0</p>
                            <p className="text-xs text-gray-400">Credits</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold">0</p>
                            <p className="text-xs text-gray-400">Referrals</p>
                        </div>
                        <div className="flex items-center">
                            <UserIcon size={24} className="text-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 flex justify-between items-center mt-auto pt-4">
                    <button onClick={openRedeemModal} className="text-sm text-blue-400 hover:underline">Redeem</button>
                    <button onClick={() => setView('history')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
                        Invitation history <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        );

        const HistoryView = () => (
            <div className="flex flex-col h-full">
                <div className="relative flex items-center justify-center mb-6 flex-shrink-0">
                    <button onClick={() => setView('main')} className="absolute left-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-lg font-semibold">Invitation history</h3>
                    <button onClick={closeModal} className="absolute right-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                        <Send size={24} className="transform -rotate-45" />
                    </div>
                    <p>No recipient email</p>
                </div>
            </div>
        );

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeModal}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg min-h-[500px] p-6 shadow-2xl text-zinc-800 dark:text-white border border-gray-200 dark:border-zinc-700 flex flex-col" onClick={e => e.stopPropagation()}>
                    {view === 'main' ? <MainView /> : <HistoryView />}
                </div>
            </div>
        );
    };

    const RedeemCodeModal: FC<ModalProps> = ({ closeModal }) => (
        createPortal(
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[51]" onClick={closeModal}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl text-zinc-800 dark:text-white border border-gray-200 dark:border-zinc-700 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end">
                        <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Gift size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Redeem code for credits</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Each person can redeem up to twice per month.</p>
                    <input type="text" placeholder="Enter your promo code" className="w-full bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm mb-4 text-center" />
                    <button className="w-full bg-gray-800 text-white dark:bg-white dark:text-black py-2 rounded-lg font-semibold">Redeem</button>
                </div>
            </div>,
            document.body
        )
    );

    const SettingsModal: FC<SettingsModalProps> = ({ closeModal, initialTab, currentTheme, onThemeChange }) => {
        const [activeTab, setActiveTab] = useState(initialTab);

        const tabs = [
            { name: 'Account', icon: <UserIcon size={16} /> },
            { name: 'Settings', icon: <Settings size={16} /> },
            { name: 'Usage', icon: <Sparkles size={16} /> },
            { name: 'Data Controls', icon: <FileCog size={16} /> },
            { name: 'Scheduled Tasks', icon: <CalendarDays size={16} /> },
            { name: 'Browser Cloud', icon: <Cloud size={16} /> },
            { name: 'Connected Apps', icon: <AppWindow size={16} /> },
        ];

        const AccountSettings = () => (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <img src="https://placehold.co/64x64/e2e8f0/1e293b?text=Q" alt="User Avatar" className="w-16 h-16 rounded-full" />
                    <div>
                        <h4 className="text-lg font-semibold">Quaradur</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">christianietov06@gmail.com</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Tooltip text="Edit profile" position="top">
                            <button className="p-2 rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600">
                                <UserIcon size={18} className="text-zinc-800 dark:text-white" />
                            </button>
                        </Tooltip>
                        <Tooltip text="Log out" position="top">
                            <button className="p-2 rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600">
                                <LogOut size={18} className="text-red-500" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg">Free</p>
                        <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full font-semibold text-sm">Upgrade</button>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Credits
                                <HoverTooltip content={aboutCreditsTooltipContent} preferredPosition="top" bgClass="bg-black">
                                    <HelpCircle size={14} className="text-gray-400 cursor-pointer" />
                                </HoverTooltip>
                            </div>
                            <p>945</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">Free credits</p>
                        <div className="flex justify-between items-center">
                            <p className="flex items-center gap-2"><CalendarDays size={16} /> Daily renewal credits</p>
                            <p>300</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">Refreshes to 300 at 12:00 every day</p>
                    </div>
                </div>
            </div>
        );

        const GeneralSettings = () => (
            <div className="space-y-8">
                <div>
                    <h4 className="font-semibold mb-2">Appearance</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Customize the look and feel of the application.</p>
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={() => onThemeChange('light')} className={`p-4 rounded-lg border-2 ${currentTheme === 'light' ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700'}`}>
                            <div className="w-full h-16 bg-gray-200 rounded-md flex items-center justify-center"><Sun className="text-gray-600" /></div>
                            <p className="text-center mt-2 text-sm">Light</p>
                        </button>
                        <button onClick={() => onThemeChange('dark')} className={`p-4 rounded-lg border-2 ${currentTheme === 'dark' ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700'}`}>
                            <div className="w-full h-16 bg-zinc-950 rounded-md flex items-center justify-center"><Moon className="text-gray-300" /></div>
                            <p className="text-center mt-2 text-sm">Dark</p>
                        </button>
                        <button onClick={() => onThemeChange('system')} className={`p-4 rounded-lg border-2 ${currentTheme === 'system' ? 'border-blue-500' : 'border-gray-200 dark:border-zinc-700'}`}>
                            <div className="w-full h-16 bg-gradient-to-r from-gray-200 to-zinc-950 rounded-md flex items-center justify-center"><Monitor className="text-gray-600" /></div>
                            <p className="text-center mt-2 text-sm">System</p>
                        </button>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Personalization</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p>Receive exclusive content</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Get exclusive offers, event updates, and more.</p>
                            </div>
                            <button className="w-10 h-5 bg-blue-500 rounded-full p-0.5 flex items-center"><span className="w-4 h-4 bg-white rounded-full block"></span></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p>Email me when my task is processing</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Get an email when your task starts processing.</p>
                            </div>
                            <button className="w-10 h-5 bg-blue-500 rounded-full p-0.5 flex items-center"><span className="w-4 h-4 bg-white rounded-full block"></span></button>
                        </div>
                    </div>
                </div>
            </div>
        );

        const UsageSettings = () => (
            <div className="space-y-6">
                <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg">Free</p>
                        <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full font-semibold text-sm">Upgrade</button>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Credits
                                <HoverTooltip content={aboutCreditsTooltipContent} preferredPosition="top" bgClass="bg-black">
                                    <HelpCircle size={14} className="text-gray-400 cursor-pointer" />
                                </HoverTooltip>
                            </div>
                            <p>945</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">Free credits</p>
                        <div className="flex justify-between items-center">
                            <p className="flex items-center gap-2"><CalendarDays size={16} /> Daily renewal credits</p>
                            <p>300</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">Refreshes to 300 at 02:00 every day</p>
                    </div>
                </div>
                <div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400">
                                <th className="p-2">Details</th>
                                <th className="p-2">Date</th>
                                <th className="p-2 text-right">Credit Variation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200 dark:border-zinc-800">
                                <td className="p-2">Title unclear without context or content details</td>
                                <td className="p-2">2025-08-09 11:43</td>
                                <td className="p-2 text-right">-18</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-zinc-800">
                                <td className="p-2">Copy the DreamWorks site for educational purposes?</td>
                                <td className="p-2">2025-08-05 14:24</td>
                                <td className="p-2 text-right">-184</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-zinc-800">
                                <td className="p-2">Bonus for early adopters</td>
                                <td className="p-2">2025-06-06 20:10</td>
                                <td className="p-2 text-right text-green-400">+1000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );

        const DataControlsSettings = () => (
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-zinc-800">
                    <p>Shared activities</p>
                    <button className="text-sm border border-gray-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">Manage</button>
                </div>
                <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-zinc-800">
                    <p>Shared files</p>
                    <button className="text-sm border border-gray-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">Manage</button>
                </div>
                <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-zinc-800">
                    <p>Distributed websites</p>
                    <button className="text-sm border border-gray-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">Manage</button>
                </div>
            </div>
        );

        const ScheduledTasksSettings = () => (
            <div className="text-center mt-16">
                <CalendarDays size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Schedule future activities and let Manus manage your routine.</p>
                <button onClick={() => setIsScheduleModalOpen(true)} className="bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto">
                    <Plus size={16} /> New schedule
                </button>
            </div>
        );

        const BrowserCloudSettings = () => (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p>Maintain login state between tasks</p>
                        <a href="#" className="text-xs text-blue-400 hover:underline">Learn more</a>
                    </div>
                    <button className="w-10 h-5 bg-gray-300 dark:bg-zinc-700 rounded-full p-0.5 flex items-center"><span className="w-4 h-4 bg-white rounded-full block"></span></button>
                </div>
                <div className="flex justify-between items-center">
                    <p>Cookies and other site data</p>
                    <button className="text-sm border border-gray-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">Manage</button>
                </div>
            </div>
        );

        const ConnectedAppsSettings = () => (
            <div className="space-y-4">
                <div className="flex items-center p-3 border-b border-gray-200 dark:border-zinc-800">
                    <img src="https://www.google.com/images/branding/product/2x/drive_32dp.png" alt="Google Drive" className="w-6 h-6 mr-4" />
                    <div>
                        <p>Google Drive</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add Documents, Sheets, Presentations and other files from Google Drive.</p>
                    </div>
                    <button className="ml-auto text-sm border border-gray-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">Connect</button>
                </div>
                <div className="flex items-center p-3 border-b border-gray-200 dark:border-zinc-800">
                    <img src="https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE2iI2s?ver=3499" alt="OneDrive" className="w-6 h-6 mr-4" />
                    <div>
                        <p>Microsoft OneDrive (personal)</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add documents, files and other data from Microsoft OneDrive.</p>
                    </div>
                    <button className="ml-auto text-sm border border-gray-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">Connect</button>
                </div>
                <div className="flex items-center p-3 border-b border-gray-200 dark:border-zinc-800">
                    <img src="https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE2iI2s?ver=3499" alt="OneDrive" className="w-6 h-6 mr-4" />
                    <div>
                        <p>Microsoft OneDrive (work/school)</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add documents, files and other data from Microsoft OneDrive.</p>
                    </div>
                    <button className="ml-auto text-sm border border-gray-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">Connect</button>
                </div>
            </div>
        );

        const renderContent = () => {
            switch (activeTab) {
                case 'Account': return <AccountSettings />;
                case 'Settings': return <GeneralSettings />;
                case 'Usage': return <UsageSettings />;
                case 'Data Controls': return <DataControlsSettings />;
                case 'Scheduled Tasks': return <ScheduledTasksSettings />;
                case 'Browser Cloud': return <BrowserCloudSettings />;
                case 'Connected Apps': return <ConnectedAppsSettings />;
                default: return <div>Select a tab</div>;
            }
        }

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-gray-300 rounded-2xl w-full max-w-4xl h-[700px] flex shadow-2xl">
                    <aside className="w-1/4 border-r border-gray-200 dark:border-zinc-800 p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Cpu size={24} />
                            <h2 className="text-lg font-bold">manus</h2>
                        </div>
                        <nav className="flex flex-col gap-1 flex-grow">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`flex items-center gap-3 p-2 rounded-lg text-sm text-left ${activeTab === tab.name ? 'bg-gray-200 dark:bg-zinc-800' : 'hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                                >
                                    {tab.icon} {tab.name}
                                </button>
                            ))}
                        </nav>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-zinc-800/50">
                            <div className="flex items-center gap-3"><HelpCircle size={16} /> Get Help</div>
                            <ArrowUpRight size={16} />
                        </a>
                    </aside>
                    <main className="w-3/4 p-6 relative overflow-y-auto custom-scrollbar">
                        <button onClick={closeModal} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-semibold mb-6">{activeTab}</h3>
                        <div className="text-zinc-800 dark:text-gray-300">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    const AddScheduleModal: FC<AddScheduleModalProps> = ({ closeModal }) => {
        const [taskEnabled, setTaskEnabled] = useState(true);
        const [isRepeatOpen, setIsRepeatOpen] = useState(false);
        const [selectedRepeat, setSelectedRepeat] = useState("Does not repeat");
        const repeatOptions = ["Does not repeat", "Daily", "Weekly", "Monthly"];
        const repeatRef = useRef<HTMLDivElement>(null);

        const [isCalendarOpen, setIsCalendarOpen] = useState(false);
        const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 14));
        const [displayDate, setDisplayDate] = useState(new Date(2025, 7, 14));
        const calendarRef = useRef<HTMLDivElement>(null);

        const [isTimeOpen, setIsTimeOpen] = useState(false);
        const [selectedTime, setSelectedTime] = useState("12:00 PM");
        const timeRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (repeatRef.current && !repeatRef.current.contains(event.target as Node)) setIsRepeatOpen(false);
                if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
                if (timeRef.current && !timeRef.current.contains(event.target as Node)) setIsTimeOpen(false);
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

        const renderCalendar = () => {
            const month = displayDate.getMonth();
            const year = displayDate.getFullYear();
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const days = [];
            for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(<div key={`empty-${i}`} className="p-2 text-center"></div>);
            }
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDate = new Date(year, month, i);
                const isSelected = currentDate.toDateString() === dayDate.toDateString();
                days.push(
                    <button
                        key={i}
                        onClick={() => {
                            setCurrentDate(dayDate);
                            setIsCalendarOpen(false);
                        }}
                        className={`p-2 w-10 h-10 flex items-center justify-center rounded-full text-sm ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-zinc-700'}`}
                    >
                        {i}
                    </button>
                );
            }

            return (
                <div className="absolute top-full mt-2 w-full bg-[#3a3a3c] rounded-lg shadow-lg p-4 z-20">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear() - 1, displayDate.getMonth()))} className="p-1 hover:bg-zinc-700 rounded-full"><ChevronLeft size={16} /><ChevronLeft size={16} className="-ml-2" /></button>
                        <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1))} className="p-1 hover:bg-zinc-700 rounded-full"><ChevronLeft size={16} /></button>
                        <span className="font-semibold">{monthNames[month]} {year}</span>
                        <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1))} className="p-1 hover:bg-zinc-700 rounded-full"><ChevronRight size={16} /></button>
                        <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear() + 1, displayDate.getMonth()))} className="p-1 hover:bg-zinc-700 rounded-full"><ChevronRight size={16} /><ChevronRight size={16} className="-ml-2" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                        {dayNames.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 place-items-center">
                        {days}
                    </div>
                    <button
                        onClick={() => {
                            const today = new Date();
                            setCurrentDate(today);
                            setDisplayDate(today);
                            setIsCalendarOpen(false);
                        }}
                        className="w-full mt-4 py-2 text-center text-sm font-semibold hover:bg-zinc-700 rounded-lg"
                    >
                        Today
                    </button>
                </div>
            );
        };

        const generateTimeOptions = () => {
            const times = [];
            for (let h = 0; h < 24; h++) {
                for (let m = 0; m < 60; m += 15) {
                    const d = new Date(0, 0, 0, h, m);
                    times.push(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
                }
            }
            return times;
        };
        const timeOptions = generateTimeOptions();

        return createPortal(
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeModal}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-zinc-800 dark:text-white border border-gray-200 dark:border-zinc-700" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Add scheduled task</h3>
                        <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Task enabled</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">When turned off, Manus will pause this task.</p>
                            </div>
                            <button onClick={() => setTaskEnabled(!taskEnabled)} className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${taskEnabled ? 'bg-blue-500 justify-end' : 'bg-gray-300 dark:bg-zinc-700 justify-start'}`}>
                                <span className="w-4 h-4 bg-white rounded-full block transform transition-transform"></span>
                            </button>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</label>
                            <input type="text" placeholder="Summary of AI news" className="mt-1 w-full bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Prompt</label>
                            <textarea rows={3} placeholder="Search for yesterday's most impactful AI news and send me a brief summary." className="mt-1 w-full bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Schedule</label>
                            <div className="mt-1 flex gap-2">
                                <div className="relative w-[45%]" ref={repeatRef}>
                                    <button onClick={() => setIsRepeatOpen(!isRepeatOpen)} className="w-full flex justify-between items-center bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm">
                                        <span>{selectedRepeat}</span>
                                        <ChevronDown size={16} />
                                    </button>
                                    {isRepeatOpen && (
                                        <div className="absolute top-full mt-2 w-full bg-[#3a3a3c] rounded-lg shadow-lg p-2 z-20">
                                            {repeatOptions.map(opt => (
                                                <button key={opt} onClick={() => { setSelectedRepeat(opt); setIsRepeatOpen(false); }} className="w-full flex justify-between items-center p-2 text-sm hover:bg-zinc-700 rounded-lg">
                                                    <span>{opt}</span>
                                                    {selectedRepeat === opt && <Check size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative flex-grow" ref={calendarRef}>
                                    <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm text-left">
                                        {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </button>
                                    {isCalendarOpen && renderCalendar()}
                                </div>
                                <div className="relative w-[30%]" ref={timeRef}>
                                    <button onClick={() => setIsTimeOpen(!isTimeOpen)} className="w-full flex justify-between items-center bg-gray-100 dark:bg-zinc-700 p-2.5 rounded-lg text-sm">
                                        <span>{selectedTime}</span>
                                        <ChevronDown size={16} />
                                    </button>
                                    {isTimeOpen && (
                                        <div className="absolute top-full mt-2 w-full bg-[#3a3a3c] rounded-lg shadow-lg p-2 z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                            {timeOptions.map(time => (
                                                <button key={time} onClick={() => { setSelectedTime(time); setIsTimeOpen(false); }} className="w-full flex justify-between items-center p-2 text-sm hover:bg-zinc-700 rounded-lg">
                                                    <span>{time}</span>
                                                    {selectedTime === time && <Check size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 font-semibold">
                            Cancel
                        </button>
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-white dark:bg-white dark:text-black hover:bg-black font-semibold">
                            Save
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const handleQualityTooltipEnter = () => {
        if (qualityTooltipTimeoutRef.current) clearTimeout(qualityTooltipTimeoutRef.current);
        setIsQualityTooltipVisible(true);
    };

    const handleQualityTooltipLeave = () => {
        qualityTooltipTimeoutRef.current = window.setTimeout(() => {
            setIsQualityTooltipVisible(false);
        }, 200);
    };

    const placeholderText = selectedOption === 'agent' ? "Give Bravo a task to work on" : "Ask anything";


    return (
        <>
            <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
            .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #555; }
            .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #888; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0a0a0; }
            .message { margin-bottom: 10px; padding: 8px 12px; border-radius: 10px; max-width: 80%; }
            .message.user_message { background-color: #007bff; color: white; align-self: flex-end; margin-left: auto; }
            .message.agent_response { background-color: #e9ecef; color: #333; align-self: flex-start; }
            .message.system { background-color: #f8f9fa; color: #6c757d; font-style: italic; text-align: center; align-self: center; max-width: 100%; font-size: 0.8em;}
            .message.error { background-color: #f8d7da; color: #721c24; align-self: flex-start; }
            .thinking-indicator { text-align: left; color: #6c757d; font-style: italic; padding: 5px 0; }
        `}</style>
            <div className="flex h-screen bg-white dark:bg-[#191919] text-zinc-800 dark:text-gray-300 text-sm overflow-hidden">
                {isSettingsModalOpen && <SettingsModal closeModal={() => setIsSettingsModalOpen(false)} initialTab={initialSettingsTab} currentTheme={theme} onThemeChange={setTheme} />}
                {isScheduleModalOpen && <AddScheduleModal closeModal={() => setIsScheduleModalOpen(false)} />}
                {isShareModalOpen && <ShareModal closeModal={() => setIsShareModalOpen(false)} openRedeemModal={() => setIsRedeemModalOpen(true)} />}
                {isRedeemModalOpen && <RedeemCodeModal closeModal={() => setIsRedeemModalOpen(false)} />}
                {isSearchModalOpen && <SearchModal closeModal={() => setIsSearchModalOpen(false)} />}
                {isKnowledgeModalOpen && <KnowledgeModal closeModal={() => setIsKnowledgeModalOpen(false)} />}
                {isTeamModalOpen && <TeamModal closeModal={() => setIsTeamModalOpen(false)} />}
                <DeleteConfirmationModal chat={chatHistory.find(c => c.id === chatToDelete)} onConfirm={handleDeleteChat} onCancel={() => setChatToDelete(null)} />
                <ShareConversationModal chat={chatToShare} onClose={() => setChatToShare(null)} />
                {notification && createPortal(
                    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg text-sm z-[10000]">
                        {notification}
                    </div>,
                    document.body
                )}

                {/* --- Sidebar --- */}
                <aside
                    className={`bg-[#F9F9F9] dark:bg-[#202123] flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72 p-4' : 'w-0 p-0'}`}
                    style={{ overflow: 'hidden' }}
                >
                    {isSidebarOpen && (
                        <>
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <Tooltip text="Undock" position="bottom">
                                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700">
                                            <SidebarToggleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip text="Search" position="bottom">
                                        <button onClick={() => setIsSearchModalOpen(true)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700">
                                            <Search size={20} className="text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <button onClick={handleNewTask} className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 p-2.5 rounded-lg mb-4 text-sm">
                                    <Plus size={16} />
                                    <span className="font-semibold">New Task</span>
                                    <span className="text-xs bg-gray-300 dark:bg-zinc-700 p-1 rounded">Ctrl</span>
                                    <span className="text-xs bg-gray-300 dark:bg-zinc-700 p-1 rounded">K</span>
                                </button>
                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setActiveFilter('All')} className={`border text-sm font-semibold px-4 py-1.5 rounded-full ${activeFilter === 'All' ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}>All</button>
                                    <button onClick={() => setActiveFilter('Favorites')} className={`border text-sm font-semibold px-4 py-1.5 rounded-full ${activeFilter === 'Favorites' ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}>Favorites</button>
                                    <button onClick={() => setActiveFilter('Scheduled')} className={`border text-sm font-semibold px-4 py-1.5 rounded-full ${activeFilter === 'Scheduled' ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}>Scheduled</button>
                                </div>
                            </div>
                            <nav ref={chatListRef} className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                                {activeFilter === 'Scheduled' ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                        <CalendarDays size={48} className="mb-4" />
                                        <p className="mb-4 text-sm px-4">Schedule future tasks and let Manus handle your routine on time.</p>
                                        <button onClick={() => setIsScheduleModalOpen(true)} className="bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-zinc-800 dark:text-white">
                                            <Plus size={16} /> New schedule
                                        </button>
                                    </div>
                                ) : (
                                    <ul>
                                        {filteredChatHistory.map(chat => (
                                            <li
                                                key={chat.id}
                                                onMouseEnter={() => !(typeof activeChatMenu === 'string' && activeChatMenu.endsWith('-menu')) && setActiveChatMenu(chat.id)}
                                                onMouseLeave={() => !(typeof activeChatMenu === 'string' && activeChatMenu.endsWith('-menu')) && setActiveChatMenu(null)}
                                                className={`relative rounded-lg cursor-pointer text-sm h-16 flex items-center ${chat.active ? 'bg-gray-200 dark:bg-[#343541]' : 'hover:bg-gray-100 dark:hover:bg-[#2A2B32]'}`}
                                            >
                                                <div className="p-2 flex gap-3 items-center w-full">
                                                    <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-700 rounded flex-shrink-0 flex items-center justify-center">
                                                        <MessageSquare size={16} />
                                                    </div>
                                                    <div className="flex-grow overflow-hidden">
                                                        {renamingChatId === chat.id ? (
                                                            <input
                                                                type="text"
                                                                defaultValue={chat.title}
                                                                className="w-full bg-gray-300 dark:bg-zinc-700 rounded px-1 text-sm focus:outline-none"
                                                                autoFocus
                                                                onBlur={(e) => handleRename(chat.id, e.target.value)}
                                                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                                                    if (e.key === 'Enter') handleRename(chat.id, e.currentTarget.value);
                                                                    if (e.key === 'Escape') setRenamingChatId(null);
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    {chat.isFavorite && <Star size={14} className="text-yellow-400 flex-shrink-0" fill="currentColor" />}
                                                                    <span className="font-semibold truncate text-zinc-800 dark:text-white">{chat.title}</span>
                                                                </div>
                                                                <span className="text-gray-400 dark:text-gray-500 text-xs flex-shrink-0 ml-2">{chat.date}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-gray-500 dark:text-gray-400 truncate pr-2">{chat.preview}</span>
                                                            <div className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
                                                                {(activeChatMenu === chat.id || activeChatMenu === chat.id + '-menu') && (
                                                                    <Tooltip text="More options" position="top">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveChatMenu(prev => prev === chat.id + '-menu' ? chat.id : chat.id + '-menu');
                                                                            }}
                                                                            className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-700"
                                                                        >
                                                                            <MoreHorizontal size={16} />
                                                                        </button>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {activeChatMenu === chat.id + '-menu' && (
                                                    <div className="absolute top-12 right-[-0.5rem] w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg z-[9999] p-2 border border-gray-200 dark:border-zinc-700">
                                                        <button onClick={(e) => handleShareChat(e, chat.id)} className="w-full text-left flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-zinc-800"><Share2 size={14} /> Share</button>
                                                        <button onClick={(e) => { e.stopPropagation(); setRenamingChatId(chat.id); setActiveChatMenu(null); }} className="w-full text-left flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-zinc-800"><Edit3 size={14} /> Rename</button>
                                                        <button onClick={(e) => handleToggleFavorite(e, chat.id)} className="w-full text-left flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                            {chat.isFavorite ? <StarOff size={14} /> : <Star size={14} />}
                                                            {chat.isFavorite ? 'Unfavorite' : 'Favorite'}
                                                        </button>
                                                        <button onClick={(e) => handleOpenInNewTab(e, chat.id)} className="w-full text-left flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-zinc-800"><ExternalLink size={14} /> Open in new tab</button>
                                                        <hr className="my-1 border-gray-200 dark:border-zinc-700" />
                                                        <button onClick={(e) => { e.stopPropagation(); setChatToDelete(chat.id); setActiveChatMenu(null); }} className="w-full text-left flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-red-500"><Trash2 size={14} /> Delete</button>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </nav>
                            <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-zinc-700/50">
                                <button onClick={() => setIsShareModalOpen(true)} className="w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer bg-gray-200 dark:bg-zinc-800/60 hover:bg-gray-300 dark:hover:bg-zinc-800">
                                    <ShareFriendIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <div className="text-left flex-grow">
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-white">Share Manus with a friend</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Get 500 credits each</p>
                                    </div>
                                    <ChevronRight size={16} className="ml-auto flex-shrink-0" />
                                </button>
                                <div className="flex items-baseline justify-around mt-4">
                                    <Tooltip text="Home" position="top">
                                        <a href="/" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><HomeIcon className="w-5 h-5" /></a>
                                    </Tooltip>
                                    <Tooltip text="Knowledge" position="top">
                                        <button onClick={() => setIsKnowledgeModalOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><BrainCircuit size={20} /></button>
                                    </Tooltip>
                                    <Tooltip text="Get help" position="top">
                                        <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><HelpCircle size={20} /></a>
                                    </Tooltip>
                                    <Tooltip text="Settings" position="top">
                                        <button onClick={() => openSettingsToTab('Settings')} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><Settings size={20} /></button>
                                    </Tooltip>
                                </div>
                            </div>
                        </>
                    )}
                </aside>

                {/* --- Main Content --- */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Header */}
                    <header className="flex items-center justify-between p-4 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            {!isSidebarOpen &&
                                <Tooltip text="Dock" position="bottom">
                                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900">
                                        <SidebarToggleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </Tooltip>
                            }
                            {hasSentFirstMessage && (
                                <button onClick={() => setChatToShare(chatHistory.find(c => c.active) ?? null)} className="flex items-center gap-2 text-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-900 px-3 py-1.5 rounded-full">
                                    <Share2 size={16} />
                                    <span>Share</span>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <Tooltip text="Notifications" position="bottom">
                                <button className="p-2 rounded-full border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-900"><Bell size={20} /></button>
                            </Tooltip>

                            <HoverTooltip content={creditsTooltipContent} preferredPosition="bottom" bgClass="bg-white dark:bg-zinc-900">
                                <div className="flex items-center gap-2 text-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-900 px-3 py-1.5 rounded-full cursor-pointer">
                                    <Sparkles className="w-4 h-4" />
                                    <span>1,245</span>
                                    <span className="text-gray-300 dark:text-zinc-700">|</span>
                                    <span className="text-blue-500 dark:text-blue-400 font-semibold">Upgrade</span>
                                </div>
                            </HoverTooltip>

                            <div
                                className="relative"
                                onMouseEnter={() => handleMenuEnter(setIsUserMenuOpen, userMenuTimeoutRef)}
                                onMouseLeave={() => handleMenuLeave(setIsUserMenuOpen, userMenuTimeoutRef)}
                            >
                                <button>
                                    <img src="https://placehold.co/32x32/e2e8f0/1e293b?text=Q" alt="User Avatar" className="w-8 h-8 rounded-full" />
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-4 z-30 text-zinc-800 dark:text-white border border-gray-200 dark:border-zinc-700">
                                        <div className="flex items-center gap-4 mb-4">
                                            <img src="https://placehold.co/48x48/e2e8f0/1e293b?text=Q" alt="User Avatar" className="w-12 h-12 rounded-full" />
                                            <div>
                                                <p className="font-semibold">Quaradur</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">christianietov06@gmail.com</p>
                                            </div>
                                            <div
                                                className="relative ml-auto"
                                                onMouseEnter={() => handleMenuEnter(setIsAccountSwitcherOpen, accountSwitcherTimeoutRef)}
                                                onMouseLeave={() => handleMenuLeave(setIsAccountSwitcherOpen, accountSwitcherTimeoutRef)}
                                            >
                                                <Tooltip text="Switch account" position="top">
                                                    <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 hover:text-black dark:hover:text-white">
                                                        <RefreshCw size={16} />
                                                    </button>
                                                </Tooltip>
                                                {isAccountSwitcherOpen && (
                                                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-2 z-40 border border-gray-200 dark:border-zinc-700">
                                                        <button className="w-full flex items-center justify-between p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                            <div className="flex items-center gap-2">
                                                                <img src="https://placehold.co/24x24/e2e8f0/1e293b?text=Q" alt="User Avatar" className="w-6 h-6 rounded-full" />
                                                                <div>
                                                                    <p className="font-semibold">Quaradur</p>
                                                                    <p className="text-xs text-gray-400">Personal</p>
                                                                </div>
                                                            </div>
                                                            <Check size={16} className="text-blue-500" />
                                                        </button>
                                                        <hr className="my-1 border-gray-200 dark:border-zinc-700" />
                                                        <button onClick={() => { setIsTeamModalOpen(true); setIsAccountSwitcherOpen(false); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                            <Plus size={16} /> Create a team
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-4 mb-2">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-lg">Free</p>
                                                <button className="bg-white text-black px-4 py-1.5 rounded-full font-semibold text-sm">Upgrade</button>
                                            </div>
                                            <hr className="border-gray-200 dark:border-zinc-700 my-2" />
                                            <div onClick={() => openSettingsToTab('Usage')} className="group flex justify-between items-center cursor-pointer p-2 -m-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span className="group-hover:text-zinc-600 dark:group-hover:text-gray-300">Credits</span>
                                                    <HoverTooltip content={userMenuCreditsTooltipContent} preferredPosition="bottom" bgClass="bg-black">
                                                        <HelpCircle size={14} className="text-gray-400 cursor-pointer" />
                                                    </HoverTooltip>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="group-hover:text-zinc-600 dark:group-hover:text-gray-300">1,245</span>
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                        <nav className="space-y-1 mt-4">
                                            <button onClick={() => setIsKnowledgeModalOpen(true)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"><BrainCircuit size={20} /> Knowledge</button>
                                            <hr className="border-gray-200 dark:border-zinc-700 my-1" />
                                            <button onClick={() => openSettingsToTab('Account')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"><User size={20} /> Account</button>
                                            <button onClick={() => openSettingsToTab('Settings')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"><Settings size={20} /> Settings</button>
                                            <hr className="border-gray-200 dark:border-zinc-700 my-2" />
                                            <a href="/" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                <div className="flex items-center gap-3"><HomeIcon className="w-5 h-5" /> Homepage</div>
                                                <ArrowUpRight size={16} />
                                            </a>
                                            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                <div className="flex items-center gap-3"><HelpCircle size={20} /> Get help</div>
                                                <ArrowUpRight size={16} />
                                            </a>
                                            <hr className="border-gray-200 dark:border-zinc-700 my-2" />
                                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-red-500"><LogOut size={20} /> Log out</a>
                                        </nav>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col p-4 pt-0 overflow-y-auto">
                        <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
                            <div className="flex-1 flex flex-col justify-end space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.type}`}>
                                        <strong>{msg.type.replace(/_/g, ' ')}:</strong> {msg.content}
                                    </div>
                                ))}
                                {isAgentThinking && <div className="thinking-indicator">Agent is thinking...</div>}
                            </div>

                            <div className={`w-full max-w-2xl flex-shrink-0 mt-auto ${!hasSentFirstMessage ? 'flex flex-col justify-center' : ''}`}>
                                {!hasSentFirstMessage && (
                                    <div className="text-left mb-6">
                                        <h2 className="text-4xl font-serif text-black dark:text-white">Hello Quaradur</h2>
                                        <p className="text-4xl font-serif text-gray-600 dark:text-gray-400 mt-1">What can I do for you?</p>
                                    </div>
                                )}
                                <div className="bg-white dark:bg-[#202123] rounded-3xl p-3 flex flex-col gap-2 w-full shadow-lg border border-gray-200 dark:border-transparent">
                                    <textarea
                                        ref={textareaRef}
                                        rows={1}
                                        style={{ minHeight: '60px' }}
                                        value={promptValue}
                                        onInput={handleInputChange}
                                        onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                        placeholder={placeholderText}
                                        className="w-full bg-transparent focus:outline-none resize-none placeholder-gray-500 placeholder:text-[15px] text-[15px] p-2 text-zinc-800 dark:text-white"
                                        disabled={isAgentThinking}
                                    ></textarea>
                                    <div className="flex items-center justify-between h-8">
                                        <div className="flex items-center gap-1.5 h-full">
                                            <div className="relative h-full flex items-center" ref={fileMenuRef}>
                                                <Tooltip text="Upload file and more" position="top">
                                                    <button onClick={() => setIsFileMenuOpen(!isFileMenuOpen)} className="p-2 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-900 flex-shrink-0">
                                                        <Paperclip size={14} />
                                                    </button>
                                                </Tooltip>
                                                {isFileMenuOpen && (
                                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-2 z-10 border border-gray-200 dark:border-zinc-700">
                                                        <button className="w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm">
                                                            <Paperclip size={16} />
                                                            <span>Choose local files</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-gray-100 dark:bg-zinc-900 p-0.5 rounded-full flex items-center gap-1 flex-shrink-0 h-full">
                                                {Object.entries(optionTooltips).map(([key, value]) => (
                                                    <HoverTooltip
                                                        key={key}
                                                        content={
                                                            <div className="p-1">
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    {React.cloneElement(value.icon as React.ReactElement<LucideProps>, { className: "w-5 h-5" })}
                                                                    <p className="font-bold">{value.title}</p>
                                                                </div>
                                                                <p className="text-sm text-gray-400">{value.description}</p>
                                                            </div>
                                                        }
                                                    >
                                                        <button
                                                            onClick={() => setSelectedOption(key)}
                                                            className={`p-1 rounded-full h-full flex items-center justify-center w-8 transition-colors duration-200 ${selectedOption === key ? 'bg-gray-300 dark:bg-zinc-700' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-zinc-800'}`}
                                                        >
                                                            {React.cloneElement(value.icon as React.ReactElement<LucideProps>, { className: `w-5 h-5 ${selectedOption === key ? 'text-zinc-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}` })}
                                                        </button>
                                                    </HoverTooltip>
                                                ))}
                                            </div>

                                            {(selectedOption === 'chat') && (
                                                <div className="relative h-full flex items-center" ref={modelMenuRef}>
                                                    <button onClick={() => setIsModelMenuOpen(!isModelMenuOpen)} className="flex items-center gap-1.5 text-sm hover:bg-gray-200 dark:hover:bg-zinc-800 px-2 rounded-full h-full">
                                                        {CompanyLogos[selectedModel.split('/')[0] + '/'] || CompanyLogos['default']}
                                                        <span className="text-xs">{getShortModelName(selectedModel)}</span>
                                                        <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                                                    </button>
                                                    {isModelMenuOpen && (
                                                        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg z-20 text-zinc-800 dark:text-white max-h-96 overflow-y-auto custom-scrollbar border border-gray-200 dark:border-zinc-700">
                                                            <div className="p-2">
                                                                {aiModels.map(group => (
                                                                    <div key={group.provider}>
                                                                        <p className="font-bold text-sm px-3 pt-3 pb-1 text-gray-500 dark:text-gray-400">{group.provider}</p>
                                                                        <ul>
                                                                            {group.models.map(model => {
                                                                                const fullModelName = `${group.prefix}${model}`;
                                                                                return (
                                                                                    <li
                                                                                        key={fullModelName}
                                                                                        onClick={() => { setSelectedModel(fullModelName); setIsModelMenuOpen(false); }}
                                                                                        className="flex justify-between items-center p-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm"
                                                                                    >
                                                                                        <div className="flex items-center gap-3">
                                                                                            {CompanyLogos[group.prefix] || CompanyLogos['default']}
                                                                                            <span>{model}</span>
                                                                                        </div>
                                                                                        {selectedModel === fullModelName && <Check size={16} className="text-blue-500 dark:text-blue-400" />}
                                                                                    </li>
                                                                                )
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 h-full">
                                            {selectedOption === 'agent' && (
                                                <div className="relative flex-shrink-0 h-full flex items-center" ref={speedMenuRef}>
                                                    <button onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)} className="flex items-center gap-1 px-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-xs h-full">
                                                        {selectedSpeed}
                                                        {selectedSpeed === 'Quality' && <Sparkles className="w-3.5 h-3.5 text-blue-500" fill="currentColor" />}
                                                        <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                                                    </button>
                                                    {isSpeedMenuOpen && (
                                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-2 z-10 border border-gray-200 dark:border-zinc-700">
                                                            <ul className="text-sm">
                                                                <li onClick={() => { setSelectedSpeed('Speed'); setIsSpeedMenuOpen(false); }} className="flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                                    <span>Speed</span>
                                                                    {selectedSpeed === 'Speed' && <Check size={16} />}
                                                                </li>
                                                                <li
                                                                    className="relative"
                                                                    onMouseEnter={handleQualityTooltipEnter}
                                                                    onMouseLeave={handleQualityTooltipLeave}
                                                                >
                                                                    <button onClick={() => { setSelectedSpeed('Quality'); setIsSpeedMenuOpen(false); }} className="w-full flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                                        <span className="flex items-center gap-2">Quality <Sparkles className="w-3.5 h-3.5 text-blue-500" fill="currentColor" /></span>
                                                                        {selectedSpeed === 'Quality' && <Check size={16} />}
                                                                    </button>
                                                                    {isQualityTooltipVisible && (
                                                                        <div
                                                                            onMouseEnter={handleQualityTooltipEnter}
                                                                            onMouseLeave={handleQualityTooltipLeave}
                                                                            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-max bg-black text-white text-sm rounded-md px-3 py-2 z-20"
                                                                        >
                                                                            Upgrade to use our most
                                                                            <br />
                                                                            powerful agent system
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {(promptValue.length > 0 && !isAgentThinking) ? (
                                                <Tooltip text="Send" position="top">
                                                    <button onClick={handleSendMessage} className="p-2 rounded-full bg-white dark:bg-white text-black flex-shrink-0">
                                                        <ArrowUp size={16} />
                                                    </button>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip text="Voice input" position="top">
                                                    <button className="p-2 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-900 flex-shrink-0" disabled={isAgentThinking}>
                                                        <Mic size={14} />
                                                    </button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="min-h-[52px]">
                                    {!hasSentFirstMessage && selectedOption !== 'chat' && (
                                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                                            <button className="flex items-center gap-2 bg-transparent border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 px-4 py-2 rounded-full text-sm"><ImageIcon size={16} /> Images</button>
                                            <button className="flex items-center gap-2 bg-transparent border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 px-4 py-2 rounded-full text-sm"><Presentation size={16} /> Slides</button>
                                            <button className="flex items-center gap-2 bg-transparent border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 px-4 py-2 rounded-full text-sm"><Sheet size={16} /> Web Page</button>
                                            <button className="flex items-center gap-2 bg-transparent border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 px-4 py-2 rounded-full text-sm"><BarChart2 size={16} /> Spreadsheet</button>
                                            <button className="flex items-center gap-2 bg-transparent border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 px-4 py-2 rounded-full text-sm"><BarChart2 size={16} /> Visualization</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default App;

