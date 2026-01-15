import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Heart, FileText, Image, BookOpen, ThumbsUp, MessageSquare, Sparkles, BrainCircuit, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, Download, Eye, Tag, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/hooks/useActivity";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function FeatureCard({ children, className, hover = true, glass = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all duration-300",
        glass ? "glass-card" : "bg-card border-border",
        hover && "hover-lift hover:border-primary/30",
        className
      )}
    >
      {children}
    </div>
  );
}

interface NoteCardProps {
  id: string;
  title: string;
  subject: string;
  author: string;
  university?: string;
  country?: string;
  upvotes: number;
  views: number;
  downloads?: number;
  tags?: string[];
  isVerified?: boolean;
  readingTime?: string;
  className?: string;
  searchQuery?: string; // New prop for highlighting
}

// Helper to highlight text
const HighlightText = ({ text, highlight }: { text: string; highlight?: string }) => {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-inherit rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export function NoteCard({
  id,
  title,
  subject,
  author,
  university,
  country,
  upvotes,
  views,
  downloads = 0,
  tags,
  isVerified,
  readingTime,
  className,
  searchQuery
}: NoteCardProps) {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full h-full perspective-1000 group min-h-[220px]", // Minimum height to accommodate flip content
        className
      )}
      onClick={(e) => {
        // If flipped, don't navigate when clicking on the back content (unless specifically clicking a link)
        // But main card click navigates if not selecting text etc.
        // For simplicity, we block nav if flipped unless clicking the 'Unlock' button
        if (!isFlipped) navigate(`/notes/${id}`);
      }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
          <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col hover-lift hover:border-primary/30 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-start justify-between gap-4 mb-4 relative">
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  <HighlightText text={title} highlight={searchQuery} />
                </h3>
                <p className="text-sm text-primary font-medium">
                  <HighlightText text={subject} highlight={searchQuery} />
                </p>
              </div>
              <div className="flex flex-col items-end text-xs text-muted-foreground">
                <LikeButton count={upvotes} />
                <span className="mt-1">👁️ {views}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 relative">
              <span>by {author}</span>
              {university && (
                <>
                  <span>•</span>
                  <span>{university}</span>
                </>
              )}
              {country && (
                <>
                  <span>•</span>
                  <span>{country}</span>
                </>
              )}
            </div>

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 relative">
                {tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
                {isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500" aria-label="Verified Content" />
                )}
                {readingTime && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                    <Clock className="w-3 h-3" />
                    {readingTime}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold border border-border">
                {author.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-medium text-xs leading-none mb-1">{author}</span>
                <span className="text-[10px] opacity-70 line-clamp-1">{university || "Community Contributor"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Study Mode
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <LikeButton count={upvotes} />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


export interface CircleCardProps {
  name: string;
  description?: string;
  subjectArea: string;
  memberCount: number;
  postCount: number;
  isFeatured?: boolean;
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}

export function CircleCard({
  name,
  description,
  subjectArea,
  memberCount,
  postCount,
  isFeatured,
  className,
  children
}: CircleCardProps) {
  return (
    <div className={cn(
      "rounded-2xl border bg-card p-6 transition-all duration-300 hover-lift cursor-pointer flex flex-col h-full group overflow-hidden relative",
      isFeatured ? "border-accent shadow-accent-glow ring-1 ring-accent/20" : "border-border hover:border-primary/30",
      className
    )}>
      {isFeatured && (
        <div className="absolute top-0 right-0 p-3">
          <div className="bg-accent/10 p-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-accent animate-pulse-slow" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-5 flex-1 relative">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500",
          isFeatured ? "bg-gradient-accent text-white" : "bg-gradient-secondary text-white"
        )}>
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-xl truncate group-hover:text-primary transition-colors">{name}</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {subjectArea}
            </span>
            {isFeatured && (
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                Trending
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-[11px] font-semibold text-muted-foreground/70 tracking-tight">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>{memberCount.toLocaleString()} PEERS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{postCount.toLocaleString()} POSTS</span>
            </div>
          </div>
        </div>
      </div>
      {children && <div className="mt-6 pt-6 border-t border-border/50">{children}</div>}
    </div>
  );
}

interface ThoughtCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  content: string;
  author: string;
  category: string;
  clarityVotes: number;
  originalityVotes: number;
  tags?: string[];
  isFeatured?: boolean;
}

export function ThoughtCard({
  title,
  content,
  author,
  category,
  clarityVotes,
  originalityVotes,
  tags,
  isFeatured,
  className,
  children,
  onClick,
  ...props
}: ThoughtCardProps) {
  const categoryIcons: Record<string, string> = {
    question: "❓",
    idea: "💡",
    discussion: "💬",
    research: "🔬",
    other: "📝"
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 transition-all duration-300 hover-lift cursor-pointer flex flex-col h-full",
        isFeatured ? "border-accent shadow-accent-glow" : "border-border hover:border-primary/30",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start gap-3 mb-3 flex-1">
        <span className="text-2xl">{categoryIcons[category] || "📝"}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
            {isFeatured && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground shrink-0">
                Featured
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{content}</p>
          {content.length > 100 && (
            <span className="text-xs text-primary font-medium mt-1 inline-block hover:underline">
              See more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">by {author}</span>
        <div className="flex items-center gap-3 text-xs">
          <span title="Clarity">✨ {clarityVotes}</span>
          <span title="Originality">🎯 {originalityVotes}</span>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {children && <div className="mt-4 pt-4 border-t border-border">{children}</div>}
    </div>
  );
}

export function LikeButton({ count, onLike }: { count: number; onLike?: () => void }) {
  const [liked, setLiked] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);
  const { trackAction } = useActivity();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (liked) {
      setDisplayCount(c => c - 1);
      setLiked(false);
    } else {
      setDisplayCount(c => c + 1);
      setLiked(true);
      trackAction('upvote_note');
      if (onLike) onLike();
    }
  };

  return (
    <button
      onClick={handleLike}
      className="group flex items-center gap-1.5 transition-all text-muted-foreground hover:text-red-500"
    >
      <Heart
        className={cn(
          "w-3.5 h-3.5 transition-all duration-300",
          liked ? "fill-red-500 text-red-500 scale-125" : "group-hover:scale-110"
        )}
      />
      <span className={cn("text-xs font-medium tabular-nums", liked && "text-red-500")}>
        {displayCount}
      </span>
    </button>
  );
}

export interface PeerNote {
  id: string;
  title: string;
  subject: string;
  topic: string;
  level: string;
  author: string;
  type: "pdf" | "image" | "text";
  upvotes: number;
  comments: number;
  createdAt: string;
  preview?: string;
  files?: { name: string; url: string }[];
}

const typeIcons = {
  pdf: FileText,
  image: Image,
  text: BookOpen,
};

export function PeerNoteCard({ note, onUpvote }: { note: PeerNote; onUpvote?: () => void }) {
  const navigate = useNavigate();
  const TypeIcon = typeIcons[note.type] || FileText;

  return (
    <div
      onClick={() => navigate(`/notes/${note.id}`)}
      className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

      <div className="flex items-start gap-4 p-1">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
            <TypeIcon className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-background shadow-sm flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
              {note.author.charAt(0)}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 dark:text-indigo-400">
              {note.subject}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-[10px] text-muted-foreground font-medium">{note.level}</span>
          </div>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {note.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {note.preview || `Comprehensive notes on ${note.topic}. Shared by ${note.author} for the community.`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">Shared by</span>
            <span className="text-xs font-semibold">{note.author}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Use LikeButton component for consistent upvote behavior */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 group-hover:bg-primary/5 border border-transparent group-hover:border-primary/10 transition-all" onClick={(e) => e.stopPropagation()}>
            <LikeButton count={note.upvotes} onLike={onUpvote} />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 group-hover:bg-secondary/5 border border-transparent group-hover:border-secondary/10 transition-all">
            <MessageSquare className="w-3.5 h-3.5 text-secondary-foreground" />
            <span className="text-xs font-bold tabular-nums">{note.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
