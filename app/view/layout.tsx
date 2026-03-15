import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "文書を表示",
  description: "Markdownを美しく整形して閲覧。表・コード・図もきれいに表示。",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
