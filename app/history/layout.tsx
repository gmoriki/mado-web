import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "履歴",
  description: "閲覧・共有したドキュメントの履歴。",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
