"use client";

import { useEffect } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timer-store";
import { startTimer, stopTimer } from "@/lib/actions/time-entries";
import { toast } from "sonner";
import { formatDurationSeconds } from "@/lib/utils/format";

interface TimerWidgetProps {
  issueId: string;
}

export function TimerWidget({ issueId }: TimerWidgetProps) {
  const { activeEntryId, activeIssueId, elapsed, setActiveTimer, clearTimer, tick } = useTimerStore();

  const isActiveHere = activeIssueId === issueId;

  useEffect(() => {
    if (!isActiveHere) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActiveHere, tick]);

  async function handleStart() {
    const result = await startTimer({ issueId });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setActiveTimer(result.data.id, issueId, result.data.startedAt);
  }

  async function handleStop() {
    if (!activeEntryId) return;
    const result = await stopTimer({ entryId: activeEntryId });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    clearTimer();
    toast.success(`Logged ${formatDurationSeconds(result.data.duration ?? 0)}`);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
      {isActiveHere ? (
        <>
          <span className="font-mono text-sm text-green-500">{formatDurationSeconds(elapsed)}</span>
          <Button size="sm" variant="outline" onClick={handleStop} className="h-7 gap-1">
            <Square className="h-3 w-3" />
            Stop
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm text-muted-foreground">
            {activeIssueId ? "Timer running on another issue" : "Track time"}
          </span>
          <Button size="sm" variant="outline" onClick={handleStart} disabled={!!activeIssueId && !isActiveHere} className="h-7 gap-1">
            <Play className="h-3 w-3" />
            Start
          </Button>
        </>
      )}
    </div>
  );
}
