import { randomBytes } from "node:crypto";

/** 학생 식별자. QR/주소에 그대로 실릴 수 있어 URL 안전 문자만 쓴다. */
export function newId(): string {
  return randomBytes(6).toString("base64url");
}
