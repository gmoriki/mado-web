import { categorizeFile, type VirtualFile } from "./virtual-fs";

export async function extractFolder(fileList: FileList): Promise<VirtualFile[]> {
  const files: VirtualFile[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const relativePath = file.webkitRelativePath || file.name;

    // Skip hidden files and macOS artifacts
    if (relativePath.includes(".DS_Store")) continue;
    if (relativePath.split("/").some((part) => part.startsWith("."))) continue;

    const type = categorizeFile(relativePath);

    if (type === "binary") {
      files.push({ path: relativePath, content: "", type: "binary" });
    } else {
      const content = await file.text();
      files.push({ path: relativePath, content, type });
    }
  }

  return files;
}
