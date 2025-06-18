# YouTube Transcript API

YouTube 영상의 자막(트랜스크립트)을 추출해주는 REST API 서버입니다. 도커(Docker)로 쉽게 배포 및 운영할 수 있습니다.

## 주요 기능
- YouTube 영상의 자막(트랜스크립트) 추출
- 언어 선택 및 지원 언어 목록 제공
- 텍스트/청크(JSON) 포맷 선택 가능
- API Key 인증 지원

## API 엔드포인트

### GET `/v1/youtube/transcript`

#### 요청 예시
```bash
curl -X GET 'http://localhost:3000/v1/youtube/transcript?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&text=true' \
  -H 'x-api-key: YOUR_API_KEY'
```

#### 쿼리 파라미터
| 이름      | 타입    | 필수 | 설명                                      |
|-----------|---------|------|-------------------------------------------|
| url       | string  | 예*  | YouTube 영상 URL                          |
| videoId   | string  | 예*  | YouTube 영상 ID (url 대신 사용 가능)      |
| lang      | string  | 아니오 | 자막 언어 코드(ISO 639-1, 예: en, ko)     |
| text      | boolean | 아니오 | true면 전체 텍스트, false면 청크(JSON)     |
| chunkSize | number  | 아니오 | 청크 분할 시 최대 글자 수 (text=false일 때)|

*url 또는 videoId 중 하나는 필수

#### 응답 예시 (text=true)
```json
{
  "content": "Never gonna give you up, never gonna let you down...",
  "lang": "en",
  "availableLangs": ["en", "es", "zh-TW"]
}
```

#### 응답 예시 (text=false)
```json
{
  "content": [
    { "text": "Never gonna give you up", "offset": 0, "duration": 2000, "lang": "en" },
    ...
  ],
  "lang": "en",
  "availableLangs": ["en", "es", "zh-TW"]
}
```

## 인증 (API Key)
- 모든 요청은 `x-api-key` 헤더에 API 키를 포함해야 합니다.
- API 키는 `.env` 파일에 설정해야 하며, 서버 실행 전 반드시 `.env` 파일을 만들어야 합니다.

### .env 파일 예시
```
API_KEY=your_api_key_here
```

## 도커(Docker)로 실행하기

1. `.env` 파일을 프로젝트 루트에 생성하고 API_KEY를 입력하세요.
2. 도커 이미지 빌드 및 실행:
   ```bash
   docker compose up --build -d
   ```
3. 정상 동작 확인:
   ```bash
   curl http://localhost:3000/ -H 'x-api-key: your_api_key_here'
   ```

## 로컬 개발 및 테스트

```bash
pnpm install
pnpm build
pnpm test
```

---
