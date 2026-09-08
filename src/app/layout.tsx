import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Jua } from "next/font/google";
import "./globals.css";
import { StudentProvider } from "@/lib/student-context";
import { BOOK } from "@/content/book";

/** 제목용 둥근 한글 서체. 캔디랜드 특유의 말랑한 인상을 만든다. */
const jua = Jua({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jua",
  display: "swap",
});

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `독서 미션 · ${BOOK.title}`, template: `%s · 독서 미션` },
  description: "교실 곳곳의 QR을 찍고 세 가지 독서 미션을 완료해요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F7A8C4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${jua.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <StudentProvider>{children}</StudentProvider>
      </body>
    </html>
  );
}
