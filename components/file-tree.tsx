"use client";

import { useState } from "react";
import type { TreeNode } from "@/lib/virtual-fs";

interface FileTreeProps {
  nodes: TreeNode[];
  activeFile: string | null;
  onSelect: (path: string) => void;
}

export function FileTree({ nodes, activeFile, onSelect }: FileTreeProps) {
  return (
    <nav className="space-y-0.5 text-sm">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          activeFile={activeFile}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </nav>
  );
}

function FileTreeNode({
  node,
  activeFile,
  onSelect,
  depth,
}: {
  node: TreeNode;
  activeFile: string | null;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {expanded && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                activeFile={activeFile}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isBinary = node.file?.type === "binary";
  const isActive = activeFile === node.path;

  return (
    <button
      onClick={() => !isBinary && onSelect(node.path)}
      disabled={isBinary}
      className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors ${
        isBinary
          ? "text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
          : isActive
            ? "bg-[var(--primary)] text-white"
            : "text-[var(--foreground)] hover:bg-[var(--muted)]"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="truncate">{node.name}</span>
    </button>
  );
}
