"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "./markdown-renderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 6 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "preview")}>
      <TabsList className="mb-2 h-8">
        <TabsTrigger value="write" className="text-xs">Write</TabsTrigger>
        <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write" className="mt-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Add description (Markdown supported)"}
          rows={rows}
          className="resize-none font-mono text-sm"
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-0">
        <div className="min-h-24 rounded-md border border-input bg-background p-3">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
