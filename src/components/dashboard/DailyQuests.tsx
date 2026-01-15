import { useActivity } from "@/hooks/useActivity";
import { useQuests } from "@/hooks/useQuests";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Gift, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyQuests({ compact = false }: { compact?: boolean }) {
    const { stats } = useActivity();
    const { quests, claimReward } = useQuests();

    const claimedCount = quests.filter(q => q.claimed).length;
    const progress = quests.length > 0 ? (claimedCount / quests.length) * 100 : 0;

    return (
        <div className={cn("p-4 space-y-4 min-w-[320px]", compact ? "p-0 border-0 shadow-none" : "")}>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Gift className="w-4 h-4 text-accent" /> Daily Quests
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                        Complete tasks to earn Karma
                    </CardDescription>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                    {claimedCount}/{quests.length} Claimed
                </span>
            </div>

            <Progress value={progress} className="h-2 bg-accent/10" indicatorClassName="bg-accent" />

            <div className="space-y-3">
                {quests.map((quest) => {
                    const currentCount = stats.actions[quest.actionType] || 0;
                    const canClaim = quest.completed && !quest.claimed;

                    return (
                        <div
                            key={quest.id}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all",
                                quest.claimed
                                    ? "bg-muted/30 border-transparent opacity-60"
                                    : "bg-card border-border hover:border-accent/30"
                            )}
                        >
                            <div className="flex flex-col gap-1">
                                <span className={cn(
                                    "text-sm font-medium",
                                    quest.claimed && "line-through text-muted-foreground"
                                )}>
                                    {quest.label}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                    <span className={cn(quest.completed ? "text-green-500" : "")}>
                                        Progress: {Math.min(currentCount, quest.target)} / {quest.target}
                                    </span>
                                    <span>•</span>
                                    <span className="text-accent font-bold">+{quest.xp} XP</span>
                                </div>
                            </div>

                            <div>
                                {quest.claimed ? (
                                    <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" /> Done
                                    </div>
                                ) : canClaim ? (
                                    <Button
                                        size="sm"
                                        className="h-7 text-xs bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 animate-pulse"
                                        onClick={() => claimReward(quest.id)}
                                    >
                                        Claim
                                    </Button>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center">
                                        <Circle className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {quests.length > 0 && claimedCount === quests.length && (
                <div className="text-center text-xs text-emerald-500 font-bold animate-fade-in pt-1 flex items-center justify-center gap-2">
                    <Trophy className="w-3 h-3" /> All rewards claimed!
                </div>
            )}
        </div>
    );
}
