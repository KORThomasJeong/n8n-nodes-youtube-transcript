# Node.js 18 LTS 기반 이미지 사용
FROM node:18-slim

# 작업 디렉토리 생성 및 이동
WORKDIR /app

# 의존성 설치를 위해 package.json, pnpm-lock.yaml 복사
COPY package.json ./
COPY pnpm-lock.yaml ./

# pnpm 설치
RUN npm install -g pnpm

# devDependencies까지 설치
RUN pnpm install

# 소스 코드 복사
COPY . .

# 빌드
RUN pnpm build

# 3000 포트 오픈
EXPOSE 3000

# 환경변수는 docker run 시점에 주입
# API 서버 실행
CMD ["pnpm", "start:api"] 