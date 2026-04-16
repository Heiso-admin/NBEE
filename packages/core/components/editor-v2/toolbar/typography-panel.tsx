"use client";

import { useState } from "react";
import { Type } from "lucide-react";

import { Button } from "@heiso/core/components/ui/button";
import { Input } from "@heiso/core/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heiso/core/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@heiso/core/components/ui/select";
import { Slider } from "@heiso/core/components/ui/slider";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";
import { DEFAULT_TYPOGRAPHY, type Typography } from "@heiso/core/components/editor-v2/types";
import { cn } from "@heiso/core/lib/utils";

const WEIGHT_OPTIONS = [
  { value: 500, label: "Medium" },
  { value: 700, label: "Bold" },
  { value: 900, label: "Black" },
] as const;

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center gap-2">{children}</div>
    </div>
  );
}

export function TypographyPanel() {
  const { state, dispatch } = useEditorShellContext();
  const [open, setOpen] = useState(false);
  const t = state.typography;

  const update = (patch: Partial<Typography>) => {
    dispatch({ type: "SET_TYPOGRAPHY", payload: { ...t, ...patch } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon_sm"
          title="排版設定"
          className={cn(open && "bg-accent")}
        >
          <Type className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4 p-4">
        <div className="text-sm font-semibold">排版設定</div>

        <div className="space-y-3">
          <Row label="H1">
            <Slider
              min={24}
              max={56}
              step={1}
              value={[t.h1Size]}
              onValueChange={([v]) => update({ h1Size: v })}
              className="flex-1"
            />
            <span className="w-10 text-right text-xs tabular-nums">{t.h1Size}px</span>
            <Select
              value={String(t.h1Weight)}
              onValueChange={(v) => update({ h1Weight: Number(v) as 500 | 700 | 900 })}
            >
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEIGHT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>

          <Row label="H2">
            <Slider
              min={16}
              max={40}
              step={1}
              value={[t.h2Size]}
              onValueChange={([v]) => update({ h2Size: v })}
              className="flex-1"
            />
            <span className="w-10 text-right text-xs tabular-nums">{t.h2Size}px</span>
            <Select
              value={String(t.h2Weight)}
              onValueChange={(v) => update({ h2Weight: Number(v) as 500 | 700 | 900 })}
            >
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEIGHT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </div>

        <div className="border-t pt-3">
          <Row label="P">
            <Slider
              min={12}
              max={24}
              step={1}
              value={[t.pSize]}
              onValueChange={([v]) => update({ pSize: v })}
              className="flex-1"
            />
            <span className="w-10 text-right text-xs tabular-nums">{t.pSize}px</span>
          </Row>
          <div className="mt-3">
            <Row label="行高">
              <Slider
                min={1.2}
                max={2.5}
                step={0.1}
                value={[t.pHeight]}
                onValueChange={([v]) => update({ pHeight: v })}
                className="flex-1"
              />
              <span className="w-10 text-right text-xs tabular-nums">{t.pHeight.toFixed(1)}</span>
            </Row>
          </div>
        </div>

        <div className="border-t pt-3">
          <Row label="主題色">
            <Input
              type="color"
              value={t.accent}
              onChange={(e) => update({ accent: e.target.value })}
              className="h-8 w-12 cursor-pointer p-1"
            />
            <Input
              value={t.accent}
              onChange={(e) => update({ accent: e.target.value })}
              className="h-8 flex-1 font-mono text-xs"
              maxLength={9}
            />
          </Row>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "SET_TYPOGRAPHY", payload: DEFAULT_TYPOGRAPHY })}
          className="w-full rounded-md border bg-muted py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          恢復預設
        </button>
      </PopoverContent>
    </Popover>
  );
}
