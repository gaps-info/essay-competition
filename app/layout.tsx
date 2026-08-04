import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小論文練習室",
  description: "為兩位選手設計的分章寫作培訓空間",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
