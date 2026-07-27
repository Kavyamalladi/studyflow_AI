import { BarChart3, TrendingUp, Zap, Clock, Target } from 'lucide-react';
import { useStudyStore } from '@/store/study.store';
import { Card, Progress } from '@/components/ui';

export function AnalyticsView() {
  const currentSession = useStudyStore((state) => state.currentSession);

  if (!currentSession) return null;

  const TOPIC_MASTERY = [
    { topic: 'Core Definitions & Foundations', score: 85, color: 'bg-emerald-500' },
    { topic: 'Algorithmic Operations & Logic', score: 62, color: 'bg-indigo-500' },
    { topic: 'Edge Cases & System Constraints', score: 40, color: 'bg-amber-500' },
    { topic: 'Exam & Interview Applications', score: 75, color: 'bg-purple-500' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-left">
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <BarChart3 className="size-5 text-indigo-500" />
        <h2 className="text-lg font-extrabold text-foreground">
          Study Analytics & Retention Intelligence
        </h2>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Estimated Retention</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-foreground">78%</p>
          <p className="text-[11px] text-emerald-500 font-medium">+12% from last study session</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Target Recall Interval</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground">24 Hours</p>
          <p className="text-[11px] text-muted-foreground">Spaced repetition interval</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Study Velocity</span>
            <Zap className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">1.8x</p>
          <p className="text-[11px] text-muted-foreground">Above average comprehension</p>
        </Card>
      </div>

      {/* Topic Mastery Diagnostics */}
      <Card className="p-6 space-y-4 border-border/80 shadow-soft">
        <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          <Target className="size-4 text-primary" />
          Topic Mastery Breakdown
        </h3>

        <div className="space-y-3">
          {TOPIC_MASTERY.map((item) => (
            <div key={item.topic} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-foreground">{item.topic}</span>
                <span className="text-muted-foreground font-mono">{item.score}%</span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
