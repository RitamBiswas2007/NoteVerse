import { useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight, FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- Data Structure ---
type Note = {
  id: string;
  title: string;
  type: "PDF" | "Markdown";
  date: string;
};

type Chapter = {
  id: string;
  title: string;
  notes: Note[];
};

type Subject = {
  id: string;
  title: string;
  color: string;
  chapters: Chapter[];
};

const SUBJECT_DATA: Subject[] = [
  {
    id: "math",
    title: "Mathematics",
    color: "from-blue-500 to-indigo-600",
    chapters: [
      {
        id: "calc",
        title: "Calculus I",
        notes: [
          { id: "n1", title: "Limits & Continuity", type: "PDF", date: "2 days ago" },
          { id: "n2", title: "Derivatives Cheat Sheet", type: "Markdown", date: "1 week ago" },
        ],
      },
      {
        id: "alg",
        title: "Linear Algebra",
        notes: [
          { id: "n3", title: "Vector Spaces Intro", type: "PDF", date: "3 days ago" },
        ],
      },
    ],
  },
  {
    id: "cs",
    title: "Computer Science",
    color: "from-emerald-500 to-teal-600",
    chapters: [
      {
        id: "dsa",
        title: "Data Structures",
        notes: [
          { id: "n4", title: "Binary Trees Visualized", type: "PDF", date: "Yesterday" },
          { id: "n5", title: "Graph Algorithms", type: "Markdown", date: "5 days ago" },
        ],
      },
      {
        id: "os",
        title: "Operating Systems",
        notes: [
          { id: "n6", title: "Process Scheduling", type: "PDF", date: "1 week ago" },
        ],
      },
    ],
  },
  {
    id: "phys",
    title: "Physics",
    color: "from-orange-500 to-red-600",
    chapters: [
      {
        id: "mech",
        title: "Classical Mechanics",
        notes: [
          { id: "n7", title: "Newton's Laws Applied", type: "PDF", date: "2 days ago" },
        ],
      },
      {
        id: "qm",
        title: "Quantum Physics",
        notes: [
          { id: "n8", title: "Schrödinger Equation", type: "Markdown", date: "Just now" },
        ],
      },
    ],
  },
];

// --- Component ---
interface NoteVerseExplorerProps {
  onClose: () => void;
}

export function NoteVerseExplorer({ onClose }: NoteVerseExplorerProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Helper to handle back navigation
  const handleBack = () => {
    if (selectedChapter) {
      setSelectedChapter(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="hover:bg-primary/20 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-display font-bold">
            {selectedChapter 
              ? selectedChapter.title 
              : selectedSubject 
                ? selectedSubject.title 
                : "Explore Subjects"}
          </h2>
          <p className="text-muted-foreground">
             {selectedChapter 
              ? `${selectedSubject?.title} / ${selectedChapter.title}`
              : selectedSubject 
                ? "Select a chapter to view notes" 
                : "Choose a subject to start learning"}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        {/* VIEW: Subjects List */}
        {!selectedSubject && SUBJECT_DATA.map((subject) => (
          <div
            key={subject.id}
            onClick={() => setSelectedSubject(subject)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40 p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-10 transition-opacity group-hover:opacity-20`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${subject.color} text-white shadow-lg`}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-lg font-bold">{subject.title}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translation-x-1" />
            </div>
            <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
              <span>{subject.chapters.length} Chapters</span>
              <span>•</span>
              <span>{subject.chapters.reduce((acc, c) => acc + c.notes.length, 0)} Notes</span>
            </div>
          </div>
        ))}

        {/* VIEW: Chapter List */}
        {selectedSubject && !selectedChapter && selectedSubject.chapters.map((chapter) => (
          <div
            key={chapter.id}
            onClick={() => setSelectedChapter(chapter)}
            className="group cursor-pointer rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-lg">{chapter.title}</h3>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{chapter.notes.length} resources available</p>
          </div>
        ))}

        {/* VIEW: Notes List */}
        {selectedChapter && selectedChapter.notes.map((note) => (
          <div
            key={note.id}
            className="group flex flex-col justify-between rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-primary/30"
          >
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-lg leading-tight group-hover:text-primary transition-colors">
                {note.title}
              </h4>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                <span className="bg-white/10 px-2 py-0.5 rounded">{note.type}</span>
                <span>•</span>
                <span>{note.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
