import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { TeacherView } from "@/components/teacher/teacher-view";

export const metadata: Metadata = { title: "교사용 관리" };

export default function TeacherPage() {
  return (
    <>
      <AppHeader />
      <TeacherView />
    </>
  );
}
