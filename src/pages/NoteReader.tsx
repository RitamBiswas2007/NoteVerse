import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Search,
    Highlighter,
    PenTool,
    MousePointer2,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Bot,
    Menu,
    Zap,
    MessageSquare,
    Loader2,
    FileText,
    Bookmark,
    Layers,
    ArrowLeft,
    X,
    BrainCircuit,
    X as XIcon,
    RotateCw,
    LayoutGrid,
    List,
    Clock,
    Check,
    History,
    Lock,
    File,
} from "lucide-react";
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { INITIAL_NOTES, Note, useNotes } from "@/hooks/useNotes";
import { LivePresence } from "@/components/features/LivePresence";
import { MessageBubble } from "@/components/ui/MessageBubble";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useStudyShield } from "@/hooks/useStudyShield";
import { LikeButton } from "@/components/cards/FeatureCards";
import { useNoteComments } from "@/hooks/useNoteComments";
import { useActivity } from "@/hooks/useActivity";
import { AmbientPlayer } from "@/components/features/AmbientPlayer";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the heavy PDF Viewer
const PDFViewer = lazy(() => import("@/components/features/PDFViewer"));

import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { FlashcardGenerator } from "@/components/modals/FlashcardGenerator";
import { NoteReaderGuide } from "@/components/features/NoteReaderGuide";

export default function NoteReader() {
    const { id } = useParams();
    const { user } = useAuth();
    const { trackAction } = useActivity();
    const navigate = useNavigate();
    const { upvoteNote } = useNotes();
    const { closeView } = useSmartNavigation();

    // 1. Missing State Variables Restoration
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [flashcards, setFlashcards] = useState<{ q: string; a: string }[]>([]);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [fileSearchQuery, setFileSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    const { comments, addComment } = useNoteComments(id);
    const {
        content: noteContent,
        updateContent: setNoteContent,
        isSaving: isAutoSaving,
        lastSaved,
        hasUnsavedChanges,
        history: saveHistory,
        restoreVersion
    } = useStudyShield(id || "default");

    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [numPages, setNumPages] = useState<number>(0);
    const [currPage, setCurrPage] = useState<number>(1);
    const [activeTool, setActiveTool] = useState("select");
    const [rightPanel, setRightPanel] = useState<"ai" | "comments" | "notes" | null>(null);
    const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
    const [pdfError, setPdfError] = useState<Error | null>(null);
    // Refs for scroll sync
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    // AI Chat State
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Hello! I'm analyzing this document. I can summarize it, explain complex topics, or answer specific questions. What do you need?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [lastContext, setLastContext] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [pdfText, setPdfText] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Data Fetching
    const { data: note, isLoading } = useQuery({
        queryKey: ["note-reader", id],
        queryFn: async () => {
            // Simulate network feeling
            await new Promise(resolve => setTimeout(resolve, 600));

            // 1. Fetch from Local Storage (Priority: User Personal -> Legacy -> Mock)
            const userKey = user ? `noteverse_notes_${user.id}` : "local_notes_data";
            const storedNotesFn = localStorage.getItem(userKey);
            const storedNotes = storedNotesFn ? JSON.parse(storedNotesFn) : [];

            const legacyFn = localStorage.getItem("local_notes_data");
            const legacyNotes = legacyFn ? JSON.parse(legacyFn) : [];

            const allNotes = [...storedNotes, ...legacyNotes, ...INITIAL_NOTES];
            const foundNote = allNotes.find((n: any) => String(n.id) === id);

            // 2. If found locally, return it
            if (foundNote) {
                if (!foundNote.files) {
                    foundNote.files = (foundNote as any).file_url
                        ? [{ name: `${foundNote.title.replace(/ /g, "_")}.pdf`, url: (foundNote as any).file_url }]
                        : [];
                }
                return foundNote as Note;
            }

            // 3. Keep fallback logic for legacy numeric IDs if they weren't in INITIAL_NOTES (Safety)
            // But since we checked allNotes, likely irrelevant.

            // 4. Fetch from Supabase (Real Cloud Notes)
            console.log(`Fetching note ${id} from Supabase...`);
            try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { data, error } = await supabase
                    .from('peer_notes' as any)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.warn("Supabase fetch failed (likely not found or invalid ID):", error);
                    throw new Error("Note not found in database");
                }

                if (data) {
                    const dbNote = data as any;
                    // Map DB structure to Note Interface
                    return {
                        id: dbNote.id,
                        title: dbNote.title,
                        subject: dbNote.subject,
                        author: dbNote.author_name || "Anonymous",
                        userId: dbNote.author_id,
                        university: dbNote.university,
                        country: dbNote.country,
                        upvotes: dbNote.upvotes || 0,
                        views: dbNote.views || 0,
                        tags: dbNote.tags || [],
                        created_at: dbNote.created_at,
                        files: (dbNote.files && Array.isArray(dbNote.files) && dbNote.files.length > 0)
                            ? dbNote.files
                            : (dbNote.file_url ? [{ name: `${dbNote.title || 'Document'}.pdf`, url: dbNote.file_url }] : []),
                        description: dbNote.description
                    } as unknown as Note;
                }
            } catch (err) {
                console.error("Error during Supabase fetch:", err);
                throw err;
            }

            throw new Error("Note not found");
        },
        enabled: !!id,
        retry: false
    });

    useEffect(() => {
        if (note && note.files && note.files.length === 1 && activeFileIndex === null) {
            setActiveFileIndex(0);
        }
    }, [note, activeFileIndex]);

    // Handle PDF Load
    const handlePdfLoadSuccess = (numPages: number) => {
        setNumPages(numPages);
        setIsAnalyzing(true);
    };

    const handlePdfTextExtracted = (text: string) => {
        setPdfText(text);
        setIsAnalyzing(false);
        if (text.length > 200 && messages.filter(m => m.role === 'ai').length < 2) {
            setMessages(prev => [...prev, { role: 'ai', content: `I've finished reading the ${numPages} pages of this document. I'm ready to answer deep questions about its content!` }]);
        }
    };

    // Scroll to Page Function
    const scrollToPage = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > numPages) return;
        const pageEl = pageRefs.current[pageNumber - 1];
        if (pageEl) {
            pageEl.scrollIntoView({ behavior: 'smooth' });
            setCurrPage(pageNumber);
        }
    };

    // Detect Current Page on Scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (!pageRefs.current.length) return;

            for (let i = 0; i < pageRefs.current.length; i++) {
                const rect = pageRefs.current[i]?.getBoundingClientRect();
                if (rect && rect.top >= 0 && rect.top < window.innerHeight / 2) {
                    setCurrPage(i + 1);
                    break;
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [numPages]);

    const handleClose = () => {
        closeView("/notes");
    };


    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col bg-zinc-950 text-zinc-400 items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-xs tracking-widest uppercase opacity-50">Opening Document environment...</p>
            </div>
        );
    }

    if (!note) return <div>Note Not Found</div>;





    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            let aiResponse = "";
            const lowerInput = userMsg.toLowerCase();
            const commandWords = ['summarize', 'summary', 'explain', 'quiz', 'analyze', 'reading', 'test', 'chat', 'ask'];

            // Helper for proper capitalization
            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

            // 1. Identify Intent & Nuance
            // Intent Mapping
            const isSummary = (lowerInput.includes('summarize') || lowerInput.includes('summary'));
            const isQuiz = lowerInput.includes('quiz') || lowerInput.includes('test');
            const isDefinition = lowerInput.includes('what is') || lowerInput.includes('define') || lowerInput.startsWith('what') || lowerInput.startsWith('who');

            // "Brief" Intent: Quick definitions, short answers, "what is"
            const isBrief = lowerInput.includes('short') || lowerInput.includes('brief') || lowerInput.includes('simple') || lowerInput.includes('quick') || lowerInput.includes('define') || lowerInput.startsWith('what') || lowerInput.startsWith('who');

            // "Explain" covers deep dives
            const isDeepDive = lowerInput.includes('explain') || lowerInput.includes('detail') || lowerInput.includes('elaborate') || lowerInput.includes('history') || lowerInput.includes('full');

            // 2. Identify Context / References (Conversational Memory)
            const refWords = ['it', 'this', 'that', 'they', 'them', 'he', 'she', 'continuation', 'continue', 'more', 'and', 'also'];
            const hasReference = refWords.some(w => lowerInput.split(' ').includes(w));

            // 3. Extract Content Keywords (for internal search)
            let keywords = lowerInput.replace(/[?.,!]/g, '')
                .split(' ')
                .filter((w: string) => w.length > 2 && !['what', 'where', 'when', 'how', 'this', 'that', 'with', 'from', 'about', 'please', 'could', 'would', 'does', 'define', 'explain', 'tell', 'me', 'more', 'can', 'you'].includes(w) && !commandWords.includes(w));

            // Extract Natural Query (for external search)
            const prefixes = /^(what\s+(is|are|was|were)|who\s+(is|was)|explain|tell\s+me\s+about|define|describe|summary\s+of)\s+/i;
            const naturalTopic = userMsg.replace(/[?.,!]/g, '').replace(prefixes, '').trim();

            let currentTopic = naturalTopic.length > 2 ? naturalTopic : keywords.join(' ');

            // MEMORY LOGIC: If no new strong keywords OR explicit reference used, use last context
            if ((keywords.length === 0 || hasReference) && lastContext) {
                keywords = [lastContext, ...keywords];
                currentTopic = keywords.join(' ');
            }

            // Update Context only if we have a valid topic
            if (currentTopic && currentTopic !== lastContext && !isSummary && !isQuiz) {
                setLastContext(currentTopic);
            }

            const mainTopic = currentTopic || lastContext || "General Context";
            const topicDisplay = mainTopic ? capitalize(mainTopic) : "the subject";

            // 4. Search in Extracted Text
            // If Deep Dive, get more matches (all unique). If Short, just get 1.
            const matchingParagraphs = pdfText.split('\n').filter(para => {
                return keywords.some((k: string) => para.toLowerCase().includes(k) && k.length > 3);
            }).slice(0, isDeepDive ? 10 : 1);

            // 5. Generative Simulation Engine for Internal Matches
            const generateResponse = (topic: string, specificMatches: string[]) => {

                // If we have specific matches from PDF, weave them in naturally
                if (specificMatches.length > 0) {
                    // Join all unique matches
                    const uniqueMatches = Array.from(new Set(specificMatches));
                    const combinedText = uniqueMatches.map(m => `> "...${m.trim()}..."`).join("\n\n");

                    const header = isDeepDive ? "**Detailed Analysis from Notes:**" : "**Quick Answer from Notes:**";
                    return `${header}\n\n${combinedText}`;
                }

                // Fallback: Pure "External" Generation (Simulated Hallucination) - Easter Eggs
                if (lowerInput.includes("photosynthesis")) return "**Photosynthesis** is the biological process by which green plants transform light energy into chemical energy. During this process, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.";
                if (lowerInput.includes("quantum")) return "**Quantum Mechanics** is a fundamental theory in physics describing the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.";

                return `I searched my database and external sources but honestly couldn't find a direct answer for **${topic}**. This might be a very specific or new term not yet indexed. \n\nSuggested Action: Try rephrasing or asking about a broader concept.`;
            };

            const needsWebSearch = (keywords.length > 0 && matchingParagraphs.length === 0 && !isSummary && !isQuiz);

            if (needsWebSearch) {
                // Trigger Web Search Simulation
                setMessages(prev => [...prev, { role: 'ai', content: `_Analyzing Request..._` }]);

                setTimeout(async () => {
                    let webResponse = "";
                    try {
                        // REAL EXTERNAL FETCH via Wikipedia Query API
                        // Logic: If 'isDeepDive', fetch full text + explaintext. If not, fetch 'exintro' (Summary only).
                        const params = isDeepDive
                            ? "prop=extracts&explaintext&redirects=1" // Full Text
                            : isBrief
                                ? "prop=extracts&exsentences=3&explaintext&redirects=1" // Ultra Brief
                                : "prop=extracts&exintro=1&explaintext&redirects=1"; // Default Summary

                        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&${params}&titles=${encodeURIComponent(topicDisplay)}&origin=*`);

                        if (response.ok) {
                            const data = await response.json();
                            const pages = data.query?.pages;
                            if (pages) {
                                const pageId = Object.keys(pages)[0];
                                if (pageId !== "-1" && pages[pageId].extract) {
                                    webResponse = pages[pageId].extract;
                                }
                            }
                        }
                    } catch (error) {
                        console.error("External fetch failed", error);
                    }

                    // Fallback to Generative Engine if fetch failed or returned no extract
                    if (!webResponse) {
                        webResponse = generateResponse(topicDisplay, []);
                    }

                    setMessages(prev => {
                        const withoutLoading = prev.filter(m => !m.content.includes("Analyzing"));
                        return [...withoutLoading, { role: 'ai', content: webResponse }];
                    });
                    setIsTyping(false);
                }, 2000);

                return;
            }

            // 6. Internal Response Generation
            if (isSummary) {
                const intro = `**Executive Summary: ${note?.title}**\n\n`;
                const contentSummary = pdfText.length > 50
                    ? `This document provides a comprehensive analysis of **${topicDisplay}**. It effectively outlines the primary arguments and supports them with structured evidence.\n\n**Key Excerpt:**\n> ${pdfText.trim()}\n\n`
                    : `This file serves as a reference for **${topicDisplay}**. While concise, it captures the essential elements required for understanding the topic.\n\n`;

                aiResponse = intro + contentSummary + `**Analysis:**\nThe text is structured to guide the reader from basic definitions to complex applications, making it a valuable resource for **${note?.subject || 'study'}**.`;

            } else if (isQuiz) {
                aiResponse = `**Pop Quiz: ${topicDisplay}** \n\nI've generated a challenge for you:\n\n1. **Define**: In your own words, what is the core function of **${topicDisplay}**?\n2. **Analyze**: How does the document's perspective on this topic compare to standard theories?\n3. **Apply**: Can you describe a real-world scenario where **${topicDisplay}** is the critical factor?\n\n(Reply with your answers for grading!)`;

            } else {
                // Use the Generator for internal answers too (if specific matches found)
                aiResponse = generateResponse(topicDisplay, matchingParagraphs);
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleGenerateFlashcards = () => {
        setIsQuizMode(true);
        if (flashcards.length > 0) return; // Don't regenerate if already exists

        setIsGeneratingQuiz(true);

        // Simulate AI Analysis delay
        setTimeout(() => {
            const topic = note?.title || "General Study";

            // Generate pseudo-contextual cards
            const newCards = [
                {
                    q: `What is the core concept of ${topic}?`,
                    a: "The central theme revolves around understanding the fundamental principles and their applications in modern contexts."
                },
                {
                    q: "How does the author define the relationship between theory and practice?",
                    a: "They are described as interdependent: theory provides the framework, while practice validates and refines the theoretical models."
                },
                {
                    q: "What key evidence is presented to support the main argument?",
                    a: "Empirical data from recent case studies and statistical analysis of long-term trends."
                },
                {
                    q: "Identify the three primary components discussed in Section 1.",
                    a: "1. Conceptual Analysis\n2. Historical Context\n3. Methodology Implementation"
                },
                {
                    q: `Why is ${topic} considered critical in this field?`,
                    a: "It bridges the gap between traditional understanding and emerging technological capabilities, offering a new paradigm for problem-solving."
                }
            ];

            setFlashcards(newCards);
            setIsGeneratingQuiz(false);
        }, 2000);
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-zinc-900 text-zinc-100 overflow-hidden font-sans">

            {/* 1. TOP BAR */}
            <header className="h-14 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-50">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0" onClick={handleClose}>
                        <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/20">
                            <span className="font-bold text-white text-xs">NV</span>
                        </div>
                        <span className="text-sm font-medium hidden sm:inline">NoteVerse Reader</span>
                    </div>
                    <div className="h-5 w-px bg-white/10 mx-2 hidden sm:block"></div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-zinc-100 truncate max-w-[150px] md:max-w-[400px]">{note.title}</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 hover:bg-zinc-800 ${activeTool === 'select' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-400'}`} onClick={() => setActiveTool('select')}>
                        <MousePointer2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 hover:bg-zinc-800 ${activeTool === 'highlight' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400'}`} onClick={() => setActiveTool('highlight')}>
                        <Highlighter className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 hover:bg-zinc-800 ${activeTool === 'pen' ? 'bg-zinc-800 text-pink-400' : 'text-zinc-400'}`} onClick={() => setActiveTool('pen')}>
                        <PenTool className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live Presence - Explicitly visible */}
                    <div className="mr-2">
                        <LivePresence noteId={id || "default"} />
                    </div>
                    {note && (
                        <div className="flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/10 hover:bg-white/10 transition-colors">
                            <LikeButton count={note.upvotes || 0} onLike={() => upvoteNote({ id: note.id, currentUpvotes: note.upvotes || 0 })} />
                        </div>
                    )}

                    <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block"></div>


                    {/* Phase 3: Ambient Audio Studio */}
                    <AmbientPlayer />

                    {/* Phase 3: Practice Mode Button */}
                    <Button
                        onClick={handleGenerateFlashcards}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full h-8 px-4 text-xs font-semibold gap-2 hidden md:flex hover:shadow-lg hover:shadow-emerald-900/20 transition-all"
                    >
                        <BrainCircuit className="w-4 h-4" />
                        Practice Mode
                    </Button>

                    {note && note.files && note.files.length > 1 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-white/10 hover:bg-white/5 text-zinc-400 gap-2 hidden sm:flex"
                            onClick={() => setActiveFileIndex(null)}
                        >
                            <Layers className="w-4 h-4" />
                            Switch File
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-emerald-400 hover:bg-white/5" title="Secure Vault">
                        <Lock className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className={`text-zinc-400 hover:text-white hover:bg-white/5 ${rightPanel === 'notes' ? 'bg-white/10 text-white' : ''}`} onClick={() => setRightPanel(rightPanel === 'notes' ? null : 'notes')}>
                        <PenTool className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => setRightPanel(rightPanel === 'comments' ? null : 'comments')}>
                        <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full h-8 px-4 text-xs font-semibold gap-2 hidden md:flex" onClick={() => setRightPanel(rightPanel === 'ai' ? null : 'ai')}>
                        <Bot className="w-4 h-4" />
                        Ask AI Assistant
                    </Button>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full h-8 px-4 text-xs font-semibold gap-2 hidden md:flex hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-shadow"
                                onClick={() => setIsGeneratorOpen(true)}
                                id="flashcard-trigger"
                            >
                                <Zap className="w-4 h-4" />
                                Flashcard Forge
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-900 border-white/10 text-zinc-200">
                            <p>Generate AI study cards from your notes</p>
                        </TooltipContent>
                    </Tooltip>
                    <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block"></div>
                    <Avatar className="h-8 w-8 border border-white/10 hidden sm:block">
                        <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">ME</AvatarFallback>
                    </Avatar>
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-400 hover:bg-white/5 ml-2" onClick={handleClose}>
                        <XIcon className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Smart Flashcards Overlay */}
            <AnimatePresence>
                {isQuizMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 right-6 text-zinc-500 hover:text-white"
                            onClick={() => setIsQuizMode(false)}
                        >
                            <XIcon className="w-6 h-6" />
                        </Button>

                        {isGeneratingQuiz ? (
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                    <BrainCircuit className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-display font-bold text-white">Generating Flashcards</h3>
                                    <p className="text-zinc-400">Analyzing document structure and identifying key concepts...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-xl w-full flex flex-col items-center gap-8 perspective-1000">
                                <div className="text-center space-y-1">
                                    <h3 className="text-xl font-medium text-emerald-400 flex items-center justify-center gap-2">
                                        <BrainCircuit className="w-5 h-5" /> Active Recall Session
                                    </h3>
                                    <p className="text-zinc-500 text-sm font-mono">Card {currentCardIndex + 1} of {flashcards.length}</p>
                                </div>

                                {/* 3D Flip Card Container */}
                                <div
                                    className="relative w-full aspect-[1.6/1] cursor-pointer group perspective-1000"
                                    onClick={() => setIsFlipped(!isFlipped)}
                                >
                                    <motion.div
                                        className="w-full h-full relative preserve-3d transition-all duration-500"
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* FRONT */}
                                        <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl shadow-emerald-500/10">
                                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Question</span>
                                            <p className="text-2xl md:text-3xl font-display font-medium text-white leading-relaxed">
                                                {flashcards[currentCardIndex]?.q}
                                            </p>
                                            <span className="absolute bottom-6 text-xs text-zinc-500 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                                                <RotateCw className="w-3 h-3" /> Click to flip
                                            </span>
                                        </div>

                                        {/* BACK */}
                                        <div
                                            className="absolute inset-0 backface-hidden bg-white text-zinc-900 border-none rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180"
                                            style={{ transform: 'rotateY(180deg)' }}
                                        >
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Answer</span>
                                            <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                                {flashcards[currentCardIndex]?.a}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="flex items-center gap-4 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 border-white/10 hover:bg-white/5 hover:text-white"
                                        onClick={() => {
                                            setIsFlipped(false);
                                            setCurrentCardIndex(prev => Math.max(0, prev - 1));
                                        }}
                                        disabled={currentCardIndex === 0}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                    </Button>

                                    <Button
                                        className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                                        onClick={() => {
                                            setIsFlipped(false);
                                            if (currentCardIndex < flashcards.length - 1) {
                                                setCurrentCardIndex(prev => prev + 1);
                                            } else {
                                                // Restart
                                                setCurrentCardIndex(0);
                                            }
                                        }}
                                    >
                                        {currentCardIndex === flashcards.length - 1 ? 'Start Over' : 'Next Card'}
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. MAIN WORKSPACE */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT Sidebar */}
                <aside className="w-14 bg-zinc-950 border-r border-white/5 flex flex-col items-center py-4 gap-4 z-20 shrink-0 hidden md:flex">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl"><Menu className="w-5 h-5" /></Button>
                    <Separator className="bg-white/5 w-8" />
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-indigo-400 bg-indigo-950/20 rounded-xl"><FileText className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-white"><Bookmark className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-white"><Layers className="w-5 h-5" /></Button>
                </aside>

                {/* CENTER: Canvas - REACT PDF IMPLEMENTATION */}
                <main className="flex-1 bg-zinc-900 relative flex flex-col overflow-hidden">
                    {activeFileIndex === null ? (
                        <div className="flex-1 overflow-auto bg-zinc-900/50 flex items-center justify-center p-8">
                            <div className="max-w-5xl w-full">
                                {note.files && note.files.length > 0 ? (
                                    <>
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                            <div>
                                                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Document Vault</h2>
                                                <p className="text-zinc-400 max-w-lg leading-relaxed">
                                                    Select a resource from the <strong>{note.title}</strong> collection.
                                                    Access lecture notes, summaries, and raw materials.
                                                </p>
                                            </div>

                                            {/* Phase 2: Toolbar */}
                                            <div className="flex items-center gap-3 bg-zinc-950/50 p-1.5 rounded-xl border border-white/10">
                                                <div className="relative group">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search files..."
                                                        value={fileSearchQuery}
                                                        onChange={(e) => setFileSearchQuery(e.target.value)}
                                                        className="h-10 pl-9 pr-4 bg-zinc-900/50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500/50 text-sm text-white placeholder:text-zinc-600 w-[180px] lg:w-[240px] transition-all"
                                                    />
                                                </div>
                                                <div className="w-px h-6 bg-white/10 mx-1" />
                                                <div className="flex bg-zinc-900 rounded-lg p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setViewMode('grid')}
                                                        className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                    >
                                                        <LayoutGrid className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setViewMode('list')}
                                                        className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                    >
                                                        <List className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={viewMode === 'grid' ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
                                            {note.files
                                                .filter(f => f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()))
                                                .map((file, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setActiveFileIndex(idx)}
                                                        className={`group bg-zinc-950 border border-white/5 cursor-pointer hover:border-indigo-500/30 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/10 ${viewMode === 'grid'
                                                            ? 'rounded-2xl p-6 hover:-translate-y-1'
                                                            : 'rounded-xl p-4 flex items-center gap-6 hover:translate-x-1'
                                                            }`}
                                                    >
                                                        <div className={`rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid'
                                                            ? 'w-14 h-14 mb-6 bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:scale-110'
                                                            : 'w-10 h-10 bg-indigo-500/10 shrink-0 group-hover:bg-indigo-500'
                                                            }`}>
                                                            <FileText className={`transition-colors ${viewMode === 'grid' ? 'w-7 h-7 text-indigo-400 group-hover:text-white' : 'w-5 h-5 text-indigo-400 group-hover:text-white'
                                                                }`} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-semibold text-white mb-2 truncate group-hover:text-indigo-300 transition-colors ${viewMode === 'grid' ? 'text-lg' : 'text-base mb-0.5'
                                                                }`}>{file.name}</h3>

                                                            {/* Phase 1: Metadata Pills */}
                                                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                                <span className="flex items-center gap-1"><File className="w-3 h-3" /> PDF</span>
                                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2m ago</span>
                                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                                <span>2.4 MB</span>
                                                            </div>

                                                            {viewMode === 'grid' && (
                                                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                                                    {note.tags.slice(0, 3).map((tag, tIdx) => (
                                                                        <span key={tag} className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded border border-white/5 group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className={viewMode === 'grid' ? "mt-6" : "shrink-0"}>
                                                            <Button className={`font-bold transition-all shadow-glow ${viewMode === 'grid'
                                                                ? 'w-full bg-zinc-900 border border-white/10 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white h-11'
                                                                : 'h-9 px-6 bg-zinc-900 border border-white/10 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500'
                                                                }`}>
                                                                {viewMode === 'list' && <span className="mr-2 text-xs opacity-70">OPEN</span>}
                                                                {viewMode === 'grid' ? 'Open Document' : <ChevronRight className="w-4 h-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center flex flex-col items-center max-w-md mx-auto py-12 px-6 rounded-3xl border border-white/5 bg-zinc-950/50">
                                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                                            <X className="w-10 h-10 text-red-500/50" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Empty Document Vault</h2>
                                        <p className="text-zinc-400 mb-8 leading-relaxed">
                                            This note container exists, but it seems there are no files attached to it.
                                            You might want to check the contribution guide or contact the author.
                                        </p>
                                        <Button
                                            onClick={handleClose}
                                            className="bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-11 px-8"
                                        >
                                            Return to Discovery
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (

                        <div
                            ref={scrollContainerRef}
                            className="flex-1 overflow-auto p-8 flex justify-center bg-zinc-900/90 relative"
                        >
                            {/* REAL-TIME COLLABORATIVE CURSORS */}

                            <div className="flex flex-col gap-8 items-center max-w-full">
                                {(() => {
                                    const activeFile = note.files[activeFileIndex];
                                    const isPdf = activeFile?.name.toLowerCase().endsWith('.pdf') || activeFile?.url.includes('pdf');

                                    if (isPdf) {
                                        return (
                                            <Suspense fallback={
                                                <div className="flex flex-col items-center gap-4 mt-20 w-full max-w-3xl">
                                                    <Skeleton className="h-[800px] w-full rounded-xl bg-zinc-800" />
                                                </div>
                                            }>
                                                <PDFViewer
                                                    url={activeFile?.url}
                                                    zoom={zoom}
                                                    pageRefs={pageRefs}
                                                    onLoadSuccess={handlePdfLoadSuccess}
                                                    onTextExtracted={handlePdfTextExtracted}
                                                    onError={(error) => setPdfError(error)}
                                                />
                                            </Suspense>
                                        );
                                    } else {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                                                <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 border border-white/5">
                                                    <FileText className="w-10 h-10 text-zinc-500" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{activeFile?.name}</h3>
                                                <p className="text-zinc-400 mb-8">
                                                    This file type cannot be previewed directly in NoteVerse.
                                                </p>
                                                <a href={activeFile?.url} download={activeFile?.name}>
                                                    <Button className="font-bold bg-indigo-500 hover:bg-indigo-600 text-white">
                                                        Download File
                                                    </Button>
                                                </a>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Bottom Floating Controls */}
                    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-full h-12 px-6 flex items-center justify-between gap-6 shadow-2xl z-30 transform hover:scale-105 transition-all duration-300 ${activeFileIndex === null ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white rounded-full" onClick={() => scrollToPage(currPage - 1)} disabled={currPage <= 1}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <span className="font-mono text-sm font-medium w-16 text-center tabular-nums">{currPage} / {numPages || '--'}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white rounded-full" onClick={() => scrollToPage(currPage + 1)} disabled={currPage >= numPages}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white rounded-full" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="font-mono text-xs w-10 text-center tabular-nums">{zoom}%</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white rounded-full" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div >

            {/* RIGHT Sidebar */}
            {
                rightPanel && (
                    <aside className="w-80 bg-zinc-950 border-l border-white/5 flex flex-col z-20 animate-in slide-in-from-right duration-300 shadow-2xl absolute right-0 top-14 bottom-0">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            {rightPanel === 'ai' ? (
                                <span className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2"><Bot className="w-4 h-4 text-purple-400" /> AI Research Assistant</span>
                            ) : rightPanel === 'notes' ? (
                                <span className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                                    <PenTool className="w-4 h-4 text-emerald-400" /> Study Shield™ Notes
                                </span>
                            ) : (
                                <span className="font-bold text-sm text-zinc-100 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-400" /> Community Discussion</span>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRightPanel(null)}><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            {rightPanel === 'ai' ? (
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {msg.role === 'ai' && (
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 shrink-0">
                                                    <Bot className="w-full h-full text-white" />
                                                </div>
                                            )}
                                            <MessageBubble role={msg.role as 'user' | 'ai'} content={msg.content} />
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-3 animate-pulse">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 shrink-0 opacity-50">
                                                <Bot className="w-full h-full text-white" />
                                            </div>
                                            <div className="bg-zinc-900 border border-white/5 text-zinc-500 text-xs px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
                                                <span>Thinking</span>
                                                <span className="animate-bounce">.</span>
                                                <span className="animate-bounce delay-100">.</span>
                                                <span className="animate-bounce delay-200">.</span>
                                            </div>
                                        </div>
                                    )}
                                    { /* Analyzing Indicator */}
                                    {isAnalyzing && (
                                        <div className="flex gap-2 items-center justify-center p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs text-indigo-300">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Reading Document ({pdfText.length > 0 ? "Extracting..." : "Initializing"} )
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />

                                    {messages.length === 1 && (
                                        <div className="flex gap-2 flex-wrap mt-4">
                                            {['Summarize this', 'Explain key concepts', 'Generate Quiz'].map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => setInput(suggestion)}
                                                    className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-white/5 text-zinc-400 hover:text-white"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-[10px] text-indigo-400/80 leading-relaxed">
                                        Discussion on "{note.title}"
                                    </div>
                                    <div className="space-y-4">
                                        {comments && comments.length > 0 ? (
                                            comments.map((comment) => (
                                                <div key={comment.id} className="space-y-2 animate-in slide-in-from-right-2 duration-300">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6 border border-white/10">
                                                            <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-500">
                                                                {comment.profiles?.display_name?.charAt(0).toUpperCase() || "U"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-semibold text-zinc-300">
                                                            {comment.profiles?.display_name || "User"}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500 tracking-tight ml-auto">
                                                            {new Date(comment.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="bg-zinc-900/50 rounded-xl p-3 text-xs text-zinc-400 border border-white/5 ml-8 mt-0 relative">
                                                        <div className="absolute -left-2 top-2 w-2 h-2 bg-zinc-900/50 border-l border-t border-white/5 transform -rotate-45" />
                                                        {comment.content}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-zinc-600 text-xs italic">
                                                No comments yet. Be the first to start the discussion!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STUDY SHIELD NOTEPAD */}
                            {rightPanel === 'notes' && (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center justify-between px-1 py-2 mb-2 text-xs text-zinc-500 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            {isAutoSaving ? (
                                                <span className="flex items-center gap-1 text-indigo-400"><RotateCw className="w-3 h-3 animate-spin" /> Saving...</span>
                                            ) : hasUnsavedChanges ? (
                                                <span className="text-amber-500">Unsaved changes</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-emerald-500"><Check className="w-3 h-3" /> Saved</span>
                                            )}
                                        </div>
                                        {lastSaved && <span>{lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                    </div>

                                    <textarea
                                        className="flex-1 bg-zinc-900/50 p-4 rounded-xl border border-white/5 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm leading-relaxed text-zinc-300 font-mono"
                                        placeholder="Start typing your private notes... (Auto-saving enabled)"
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                    />

                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold uppercase text-zinc-600 mb-2 flex items-center gap-2">
                                            <History className="w-3 h-3" /> Version History
                                        </div>
                                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                            {saveHistory.map((snap, i) => (
                                                <div key={snap.timestamp} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-white/5 hover:border-emerald-500/30 group transition-all cursor-pointer" onClick={() => restoreVersion(snap)}>
                                                    <span className="text-xs text-zinc-400">
                                                        {new Date(snap.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600 group-hover:text-emerald-400">
                                                        {snap.content.length} chars
                                                    </span>
                                                </div>
                                            ))}
                                            {saveHistory.length === 0 && (
                                                <p className="text-zinc-700 text-xs italic">No history yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                        <div className="p-4 border-t border-white/5">
                            <div className="bg-zinc-900 rounded-lg p-2 flex gap-2 border border-white/10 focus-within:ring-1 ring-purple-500/50 transition-all">
                                <input
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-white placeholder:text-zinc-600"
                                    placeholder={rightPanel === 'ai' ? "Ask anything..." : "Add to discussion..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (rightPanel === 'ai') handleSendMessage();
                                            else if (input.trim()) {
                                                addComment(input);
                                                setInput("");
                                                trackAction('comment_note');
                                            }
                                        }
                                    }}
                                />
                                <Button size="icon" className="h-8 w-8 bg-white text-black hover:bg-zinc-200" onClick={() => {
                                    if (rightPanel === 'ai') handleSendMessage();
                                    else if (input.trim()) {
                                        addComment(input);
                                        setInput("");
                                        trackAction('comment_note');
                                    }
                                }}>
                                    <ArrowLeft className="w-4 h-4 rotate-90" />
                                </Button>
                            </div>
                        </div>
                    </aside>
                )
            }

            {/* 4. MODALS */}
            <FlashcardGenerator
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                noteTitle={note.title}
                noteContent={pdfText}
            />
            <NoteReaderGuide />

        </div >
    );
}
