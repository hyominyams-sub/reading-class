import { IconCheck } from "@/components/candy-icons";
import { cn } from "@/lib/utils";
import { currentMissionResult, MISSION_IDS, type StudentRecord } from "@/lib/types";

export function ProgressDots({
  student,
  size = "md",
  className,
}: {
  student: StudentRecord;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "size-6 text-[11px]" : size === "lg" ? "size-10 text-sm" : "size-8 text-xs";
  const ring = size === "sm" ? "border-2" : "border-[2.5px]";
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label="미션 진행도">
      {MISSION_IDS.map((id) => {
        const done = Boolean(currentMissionResult(student, id));
        return (
          <span
            key={id}
            title={done ? `미션 ${id} 완료` : `미션 ${id} 미완료`}
            className={cn(
              "grid place-items-center rounded-full border-ink font-bold",
              dim,
              ring,
              done ? "bg-candy-mint text-ink" : "bg-card text-muted-foreground",
            )}
          >
            {done ? <IconCheck className="size-[60%]" /> : id}
          </span>
        );
      })}
    </div>
  );
}
