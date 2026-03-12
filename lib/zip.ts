import JSZip from "jszip";
import { categorizeFile, type VirtualFile } from "./virtual-fs";

export async function extractZip(file: File): Promise<VirtualFile[]> {
  const zip = await JSZip.loadAsync(file);
  const files: VirtualFile[] = [];

  const entries: [string, JSZip.JSZipObject][] = [];
  zip.forEach((relativePath, zipEntry) => {
    entries.push([relativePath, zipEntry]);
  });

  for (const [relativePath, zipEntry] of entries) {
    // Skip directories, macOS artifacts, hidden files
    if (zipEntry.dir) continue;
    if (relativePath.startsWith("__MACOSX")) continue;
    if (relativePath.includes(".DS_Store")) continue;

    const type = categorizeFile(relativePath);

    if (type === "binary") {
      files.push({ path: relativePath, content: "", type: "binary" });
    } else {
      const content = await zipEntry.async("string");
      files.push({ path: relativePath, content, type });
    }
  }

  return files;
}
