import { AppHeader } from "@/components/app-header";
import { HomeHub } from "@/components/home-hub";
import { StudentGate } from "@/components/student-gate";

export default function HomePage() {
  return (
    <>
      <AppHeader adminEntry />
      <StudentGate>
        <HomeHub />
      </StudentGate>
    </>
  );
}
