import { useMemo, useRef, useState, useEffect, Suspense, lazy } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Share2, Info, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { SEO } from "@/components/layout/SEO";
import { PageLoader } from "@/components/layout/PageLoader";

// Lazy load ForceGraph2D to avoid build issues and reduce initial bundle size
const ForceGraph2D = lazy(() => import("react-force-graph-2d"));

export default function KnowledgeGraph() {
    const { notes, isLoading } = useNotes();
    const navigate = useNavigate();
    const graphRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        // Slight delay to ensure container is rendered
        const timer = setTimeout(updateDimensions, 500);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timer);
        };
    }, []);

    const graphData = useMemo(() => {
        if (!notes) return { nodes: [], links: [] };

        const nodes: any[] = [];
        const links: any[] = [];
        const tags = new Set<string>();
        const validNotes = notes.filter(n => n.id && n.title);

        validNotes.forEach(note => {
            // Add Note Node
            nodes.push({
                id: note.id,
                name: note.title,
                group: note.subject || "Uncategorized",
                val: 10 + ((note.views || 0) / 100),
                type: 'NOTE'
            });

            // Collect Tags
            (note.tags || []).forEach(tag => {
                const tagId = `tag-${tag}`;
                if (!tags.has(tagId)) {
                    tags.add(tagId);
                    nodes.push({
                        id: tagId,
                        name: tag,
                        group: 'Tag',
                        val: 5,
                        type: 'TAG'
                    });
                }

                // Link Note to Tag
                links.push({
                    source: note.id,
                    target: tagId,
                    value: 1
                });
            });
        });

        return { nodes, links };
    }, [notes]);

    const handleNodeClick = (node: any) => {
        if (node.type === 'NOTE') {
            navigate(`/notes/${node.id}`);
        } else if (node.type === 'TAG') {
            graphRef.current?.centerAt(node.x, node.y, 1000);
            graphRef.current?.zoom(3, 2000);
        }
    };

    const subjects = Array.from(new Set(notes?.map(n => n.subject) || []));

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEO title="Knowledge Graph" description="Visualize connections between your learning notes." />
            <Navbar />

            <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="border-b bg-muted/40 p-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold font-display flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-primary" /> Knowledge Graph
                        </h1>
                        <p className="text-xs text-muted-foreground">Interact with nodes to discover connections.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => graphRef.current?.zoomToFit(400)}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Reset View
                        </Button>
                    </div>
                </div>

                <div className="flex-1 relative bg-slate-50 dark:bg-slate-950" ref={containerRef}>
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-full w-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Loading Graph Engine...</span>
                        </div>
                    }>
                        {dimensions.width > 0 && (
                            <ForceGraph2D
                                ref={graphRef}
                                width={dimensions.width}
                                height={dimensions.height}
                                graphData={graphData}
                                nodeLabel="name"
                                nodeColor={(node: any) => {
                                    if (node.type === 'TAG') return '#94a3b8';
                                    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                                    const idx = subjects.indexOf(node.group) % colors.length;
                                    return colors[idx] || '#6366f1';
                                }}
                                nodeRelSize={6}
                                linkColor={() => '#cbd5e1'}
                                linkWidth={1}
                                onNodeClick={handleNodeClick}
                                enableNodeDrag={true}
                                backgroundColor="rgba(0,0,0,0)"
                            />
                        )}
                    </Suspense>

                    {/* Legend Overlay */}
                    <Card className="absolute bottom-4 left-4 p-4 bg-background/90 backdrop-blur shadow-lg border-primary/10 max-w-xs z-10">
                        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" /> Legend
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-400" />
                                <span>Tags</span>
                            </div>
                            {subjects.slice(0, 5).map((subj, i) => (
                                <div key={subj} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{
                                        backgroundColor: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 6]
                                    }} />
                                    <span className="truncate">{subj}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
