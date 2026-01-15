
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    role: 'user' | 'ai';
    content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
    // Simple bold parsing for AI responses (e.g. **text**)
    const parts = content.split(/(\*\*.*?\*\*)/g);

    return (
        <div
            className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap shadow-sm",
                role === 'user'
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-none ml-auto border border-white/5"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 rounded-tl-none"
            )}
        >
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-white/90">{part.slice(2, -2)}</strong>;
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
}
