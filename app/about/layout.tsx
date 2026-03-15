import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "使い方",
  description: "Markdownの閲覧・共有を誰にとってもかんたんに。AI出力の表示、暗号化共有、ドキュメント一括閲覧。",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
