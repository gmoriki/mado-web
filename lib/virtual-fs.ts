export type FileCategory = "markdown" | "text" | "binary";

export interface VirtualFile {
  path: string;
  content: string;
  type: FileCategory;
}

export interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  file?: VirtualFile;
}

const MARKDOWN_EXTS = new Set([".md", ".markdown"]);
const TEXT_EXTS = new Set([
  ".txt", ".json", ".yaml", ".yml", ".toml", ".csv", ".xml",
  ".html", ".css", ".js", ".ts", ".jsx", ".tsx",
  ".py", ".sh", ".env", ".cfg", ".ini", ".log",
  ".rs", ".go", ".rb", ".php", ".swift", ".kt",
]);

export function categorizeFile(filename: string): FileCategory {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (MARKDOWN_EXTS.has(ext)) return "markdown";
  if (TEXT_EXTS.has(ext)) return "text";
  return "binary";
}

export function buildTree(files: VirtualFile[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", isDir: true, children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      if (isLast) {
        current.children.push({
          name: part,
          path: currentPath,
          isDir: false,
          children: [],
          file,
        });
      } else {
        let dir = current.children.find((c) => c.isDir && c.name === part);
        if (!dir) {
          dir = { name: part, path: currentPath, isDir: true, children: [] };
          current.children.push(dir);
        }
        current = dir;
      }
    }
  }

  // Sort: directories first, then alphabetical
  function sortTree(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.isDir) sortTree(node.children);
    }
  }

  sortTree(root.children);
  return root.children;
}
