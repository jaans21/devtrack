"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useBoardStore, type BoardIssue } from "@/store/board-store";
import { KanbanColumn } from "./kanban-column";
import { IssueCard } from "./issue-card";
import { moveIssue } from "@/lib/actions/issues";
import { KANBAN_COLUMNS } from "@/lib/utils/colors";
import { getMidpointPosition } from "@/lib/utils/issue-number";
import { toast } from "sonner";
import type { IssueStatus } from "@prisma/client";

interface KanbanBoardProps {
  initialColumns: Record<IssueStatus, BoardIssue[]>;
  projectId: string;
}

export function KanbanBoard({ initialColumns, projectId }: KanbanBoardProps) {
  const { columns, setColumns, moveCard, saveSnapshot, rollback } = useBoardStore();
  const [activeIssue, setActiveIssue] = useState<BoardIssue | null>(null);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns, setColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragStart({ active }: DragStartEvent) {
    const id = active.id as string;
    for (const col of Object.values(columns)) {
      const found = col.find((c) => c.id === id);
      if (found) { setActiveIssue(found); break; }
    }
    saveSnapshot();
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    const targetStatus = (
      KANBAN_COLUMNS.includes(overId as IssueStatus)
        ? overId
        : Object.keys(columns).find((s) =>
            columns[s as IssueStatus].some((c) => c.id === overId)
          )
    ) as IssueStatus | undefined;

    if (!targetStatus) return;

    const targetCol = columns[targetStatus];
    const overIndex = targetCol.findIndex((c) => c.id === overId);
    const insertIndex = overIndex === -1 ? targetCol.length : overIndex;

    moveCard(activeId, targetStatus, insertIndex);
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveIssue(null);
    if (!over) { rollback(); return; }

    const activeId = active.id as string;
    const overId = over.id as string;

    const targetStatus = (
      KANBAN_COLUMNS.includes(overId as IssueStatus)
        ? overId
        : Object.keys(columns).find((s) =>
            columns[s as IssueStatus].some((c) => c.id === overId)
          )
    ) as IssueStatus | undefined;

    if (!targetStatus) { rollback(); return; }

    const targetCol = columns[targetStatus];
    const idx = targetCol.findIndex((c) => c.id === activeId);
    const prevPos = targetCol[idx - 1]?.position;
    const nextPos = targetCol[idx + 1]?.position;
    const newPosition = getMidpointPosition(prevPos, nextPos);

    const result = await moveIssue({ id: activeId, status: targetStatus, position: newPosition });
    if (!result.success) {
      toast.error(result.error);
      rollback();
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-6">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            issues={columns[status] ?? []}
            projectId={projectId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeIssue && <IssueCard issue={activeIssue} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
