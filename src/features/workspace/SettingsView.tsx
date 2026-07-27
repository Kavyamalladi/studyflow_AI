import { useState } from 'react';
import { Settings, Save, Bell, Calendar, Database } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export function SettingsView() {
  const [algorithm, setAlgorithm] = useState('leitner');
  const [dailyTarget, setDailyTarget] = useState('20');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-left">
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <Settings className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-extrabold text-foreground">
          Workspace Settings & Preferences
        </h2>
      </div>

      <Card className="p-6 space-y-5 border-border/80 shadow-soft">
        <div className="space-y-4">
          {/* Spaced Repetition Algorithm */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-2">
              <Database className="size-4 text-primary" /> Spaced Repetition Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="rounded-xl border border-border/60 bg-secondary/40 p-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="leitner">Leitner 5-Box System (Recommended)</option>
              <option value="sm2">SuperMemo SM-2 Algorithm</option>
              <option value="fsrs">Free Spaced Repetition Scheduler (FSRS)</option>
            </select>
          </div>

          {/* Daily Goal Target */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-emerald-500" /> Daily Card Target
            </label>
            <input
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              className="rounded-xl border border-border/60 bg-secondary/40 p-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-2">
                <Bell className="size-4 text-amber-500" /> Daily Review Reminders
              </label>
              <p className="text-[11px] text-muted-foreground">
                Receive browser notifications when flashcards are due for review.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button onClick={() => alert('Settings saved successfully!')} className="gap-2 font-bold rounded-xl">
            <Save className="size-4" /> Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}
