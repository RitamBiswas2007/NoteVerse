import { BackButton } from "@/components/ui/BackButton";
import { AlertTriangle, BookOpen, Users, FileText } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton className="mb-6" />
        
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-display font-bold">Disclaimer</h1>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-semibold">Educational Purpose Only</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                NoteVerse is designed exclusively for educational purposes. The platform serves as a 
                collaborative space for students to share and access study materials, notes, and 
                educational discussions. It is not intended to replace official academic resources, 
                textbooks, or professional educational guidance.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-semibold">Student-Generated Content</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All content shared on this platform is created and uploaded by students and community 
                members. While we encourage accuracy and quality, the content may not always be 
                verified, reviewed, or endorsed by academic professionals. Users should exercise 
                their own judgment when using shared materials and cross-reference information 
                with authoritative sources.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-semibold">Not Official Academic Material</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Notes, documents, and discussions shared on NoteVerse should not be treated as 
                official academic material. They are supplementary resources meant to aid learning 
                and should not substitute for official course materials, lectures, or guidance 
                from your educational institution. Always consult your professors, instructors, 
                or official academic resources for authoritative information.
              </p>
            </section>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                By using NoteVerse, you acknowledge and agree to these terms. We encourage 
                responsible sharing and usage of educational content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
