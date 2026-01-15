import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function UploadQuizModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState(""); // comma separated
    const [correctIndex, setCorrectIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!questionText.trim() || !options.trim()) {
            toast.error("Please fill all fields");
            return;
        }
        const opts = options.split(",").map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2) {
            toast.error("Provide at least two options");
            return;
        }
        if (correctIndex < 0 || correctIndex >= opts.length) {
            toast.error("Correct option index out of range");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from("quiz_questions").insert({
                question_text: questionText,
                options: opts,
                correct_option_index: correctIndex,
                quiz_date: new Date().toISOString().split("T")[0],
            });
            if (error) throw error;
            toast.success("Quiz question uploaded!");
            // reset fields
            setQuestionText("");
            setOptions("");
            setCorrectIndex(0);
            onClose();
        } catch (err: any) {
            console.error("Quiz Upload Error:", err);

            // Smart Error Handling for common Supabase issues
            if (err.message?.includes("schema cache") || err.message?.includes("relation") || err.message?.includes("does not exist")) {
                toast.error("Database Error: Table not found. Please run the 'FIX_QUIZ_TABLES_AND_CACHE.sql' script in Supabase.");
            } else if (err.code === "42501" || err.message?.includes("policy")) {
                toast.error("Permission Denied: RLS Policy missing. Run the SQL fix script.");
            } else {
                toast.error(err.message || "Failed to upload quiz question");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload Quiz Question</DialogTitle>
                    <DialogDescription>Enter a question, options (comma separated) and the correct option index (0‑based).</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Question text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
                    <Input placeholder="Options (comma separated)" value={options} onChange={(e) => setOptions(e.target.value)} />
                    <Input
                        type="number"
                        placeholder="Correct option index"
                        value={correctIndex}
                        onChange={(e) => setCorrectIndex(parseInt(e.target.value, 10) || 0)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}> {loading ? "Uploading…" : "Upload"} </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
