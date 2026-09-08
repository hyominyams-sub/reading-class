import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 홈 디렉터리의 다른 package-lock.json을 프로젝트 루트로 오인하지 않도록 고정
  turbopack: { root: process.cwd() },
  // 개발 서버를 같은 와이파이의 태블릿에서 열 때(HMR 등 dev 자산 요청) 허용할 출처
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
};

export default nextConfig;
