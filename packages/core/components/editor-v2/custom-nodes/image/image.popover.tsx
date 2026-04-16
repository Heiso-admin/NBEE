"use client";

import { useEffect, useRef, useState } from "react";
import {
  Crop,
  ImagePlus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEditorRef } from "platejs/react";
import type { TElement } from "platejs";

import { Button } from "@heiso/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@heiso/core/components/ui/dialog";
import { Input } from "@heiso/core/components/ui/input";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";
import type { Photo } from "@heiso/core/components/editor-v2/types";

type Mode = "menu" | "search" | "crop" | "upload" | null;

export function ImagePopover({
  element,
  alt,
  onChange,
  children,
}: {
  element: TElement;
  alt: string;
  onChange: (next: Partial<{ url: string }>) => void;
  children: React.ReactNode;
}) {
  const editor = useEditorRef();
  const { simulators } = useEditorShellContext();
  const [mode, setMode] = useState<Mode>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [query, setQuery] = useState("");
  const [cropSize, setCropSize] = useState({ w: 1200, h: 800 });
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const removeImage = () => {
    editor.tf.removeNodes({ match: (n) => n === element });
  };

  const handleAiRegen = async () => {
    setLoading(true);
    try {
      const { url } = await simulators.coverGenerate({ title: alt || "image" });
      onChange({ url });
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const handleOpenSearch = async () => {
    setMode("search");
    setLoading(true);
    try {
      const { photos } = await simulators.searchPhotos({ query: query || alt || "technology" });
      setPhotos(photos);
    } finally {
      setLoading(false);
    }
  };

  const handlePickPhoto = (p: Photo) => {
    onChange({ url: p.src });
    setMode(null);
    setMenuOpen(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ url });
    setMode(null);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    removeImage();
    setMenuOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onClickCapture={() => !menuOpen && setMenuOpen(true)}
    >
      {children}

      {menuOpen && (
        <div
          contentEditable={false}
          className="-top-3 -translate-y-full absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-popover px-1.5 py-1 text-popover-foreground shadow-md"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon_sm"
            title="AI 重新生成"
            disabled={loading}
            onClick={handleAiRegen}
          >
            <Sparkles className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon_sm"
            title="搜尋圖庫"
            disabled={loading}
            onClick={handleOpenSearch}
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon_sm"
            title="裁切（模擬）"
            onClick={() => setMode("crop")}
          >
            <Crop className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon_sm"
            title="上傳"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon_sm"
            title="刪除"
            onClick={handleDelete}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Search Modal */}
      <Dialog open={mode === "search"} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>搜尋圖庫</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="關鍵字"
            />
            <Button onClick={handleOpenSearch} disabled={loading}>
              搜尋
            </Button>
          </div>
          <div className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePickPhoto(p)}
                className="overflow-hidden rounded border-2 border-transparent transition hover:border-primary"
              >
                <img src={p.thumb} alt={p.alt} className="block aspect-[3/2] w-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Crop Modal (simulator) */}
      <Dialog open={mode === "crop"} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>裁切（模擬）</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">調整尺寸（不會真的改原圖）</div>
            <div className="flex items-center gap-2">
              <span className="w-10 text-xs">寬</span>
              <Input
                type="number"
                value={cropSize.w}
                onChange={(e) => setCropSize((s) => ({ ...s, w: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-10 text-xs">高</span>
              <Input
                type="number"
                value={cropSize.h}
                onChange={(e) => setCropSize((s) => ({ ...s, h: Number(e.target.value) }))}
              />
            </div>
            <Button className="w-full" onClick={() => setMode(null)}>
              完成（模擬）
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePlus className="hidden" />
    </div>
  );
}
