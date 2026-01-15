
import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Share2, Info } from 'lucide-react';

interface Node {
    id: string;
    name: string;
    group: string;
    val: number;
}

interface Link {
    source: string;
    target: string;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}


interface IdeaConstellationProps {
    thoughts: any[];
    onThoughtClick?: (thought: any) => void;
}

export function IdeaConstellation({ thoughts, onThoughtClick }: IdeaConstellationProps) {
    const fgRef = useRef<any>();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

    useEffect(() => {
        // Transform thoughts into graph data
        const nodes: Node[] = [];
        const links: Link[] = [];
        // const tagsMap = new Map<string, string[]>(); // Unused

        thoughts.forEach((t) => {
            // Add Thought Node
            nodes.push({
                id: t.id,
                name: t.title,
                group: 'thought',
                val: 10
            });

            // Map tags
            t.tags.forEach((tag: string) => {
                const normalizedTag = tag.toLowerCase().trim();

                // Add Tag Node if not exists
                if (!nodes.find(n => n.id === `tag-${normalizedTag}`)) {
                    nodes.push({
                        id: `tag-${normalizedTag}`,
                        name: normalizedTag,
                        group: 'tag',
                        val: 5
                    });
                }

                // Link Thought -> Tag
                links.push({
                    source: t.id,
                    target: `tag-${normalizedTag}`
                });
            });
        });

        setGraphData({ nodes, links });
    }, [thoughts]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        // Initial zoom
        setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.d3Force('charge').strength(-100);
                fgRef.current.zoomToFit(400);
            }
        }, 500);

        return () => window.removeEventListener('resize', updateDimensions);
    }, [isFullscreen]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().then(() => {
                setIsFullscreen(true);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#020617' : '#f8fafc'; // slate-950 or slate-50
    const textColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
    const linkColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';

    return (
        <div
            ref={containerRef}
            className={`relative rounded-2xl overflow-hidden border border-border/50 shadow-inner bg-slate-50 dark:bg-slate-950 transition-all duration-500 ${isFullscreen ? 'w-full h-screen fixed inset-0 z-50 rounded-none' : 'w-full h-[500px]'}`}
        >
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-background/80 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 text-primary">
                        <Share2 className="w-4 h-4" /> Concept Graph
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                        Visualizing how ideas connect across the university ecosystem.
                        <br />
                        <span className="text-[10px] opacity-70">
                            • Large nodes = Thoughts
                            <br />
                            • Small nodes = Tags
                        </span>
                    </p>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full bg-background/80 backdrop-blur" onClick={() => fgRef.current.zoomToFit(400)}>
                    <Info className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full bg-background/80 backdrop-blur" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
            </div>

            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                backgroundColor={bgColor}
                nodeLabel="name"
                nodeColor={(node: any) => node.group === 'tag' ? '#64748b' : '#4f46e5'} // Slate-500 for tags, Indigo-600 for thoughts
                linkColor={() => linkColor}
                nodeRelSize={6}
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                d3VelocityDecay={0.3}
                onNodeClick={(node: any) => {
                    if (node.group === 'thought') {
                        // Find the original thought object
                        const originalThought = thoughts.find(t => t.id === node.id);
                        if (originalThought && onThoughtClick) {
                            onThoughtClick(originalThought);
                        }

                        fgRef.current.centerAt(node.x, node.y, 1000);
                        fgRef.current.zoom(4, 2000);
                    }
                }}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    // const textWidth = ctx.measureText(label).width; // Unused
                    // const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding // Unused

                    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
                    if (node.group === 'thought') {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.group === 'thought' ? '#4f46e5' : '#64748b';
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 2, 0, 2 * Math.PI, false);
                        ctx.fillStyle = '#94a3b8';
                        ctx.fill();
                    }

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = textColor;
                    // Only show labels when zoomed in or hovering
                    if (node.group === 'thought' || globalScale > 1.5) {
                        ctx.fillText(label, node.x, node.y + 8);
                    }
                }}
            />
        </div>
    );
}
