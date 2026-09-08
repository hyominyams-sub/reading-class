export const CLASS_ROSTER = [
  { number: 1, name: "강서현" },
  { number: 2, name: "김수현" },
  { number: 3, name: "김동욱" },
  { number: 4, name: "김채아" },
  { number: 5, name: "김태이" },
  { number: 6, name: "김태현" },
  { number: 7, name: "박설민" },
  { number: 9, name: "오다윤" },
  { number: 10, name: "윤재현" },
  { number: 11, name: "이다원" },
  { number: 12, name: "이성현" },
  { number: 13, name: "장건후" },
  { number: 14, name: "장수안" },
  { number: 16, name: "조연우" },
] as const;

export type ClassStudent = (typeof CLASS_ROSTER)[number];

export function isClassStudentName(name: string): boolean {
  return CLASS_ROSTER.some((student) => student.name === name);
}
