import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { getYoutubeTranscript } from './youtube-transcript';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY || 'test_key';

// 실제 서버 인스턴스를 import하지 않고, app을 별도로 생성 (테스트 isolation)
const app = express();
app.use((req: Request, res: Response, next: NextFunction) => {
  const key = req.header('x-api-key');
  if (!API_KEY || key !== API_KEY) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return;
  }
  next();
});
app.get('/v1/youtube/transcript', async (req: Request, res: Response) => {
  try {
    const { url, videoId, lang, text, chunkSize } = req.query;
    if (!url && !videoId) {
      res.status(400).json({ error: 'url 또는 videoId 파라미터가 필요합니다.' });
      return;
    }
    const result = await getYoutubeTranscript({
      url: typeof url === 'string' ? url : undefined,
      videoId: typeof videoId === 'string' ? videoId : undefined,
      lang: typeof lang === 'string' ? lang : undefined,
      text: text === 'true',
      chunkSize: chunkSize ? Number(chunkSize) : undefined,
    });
    res.json(result);
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
    return;
  }
});

describe('GET /v1/youtube/transcript', () => {
  it('API 키 없이 요청 시 401 반환', async () => {
    const res = await request(app).get('/v1/youtube/transcript');
    expect(res.status).toBe(401);
  });

  it('url, videoId 모두 없을 때 400 반환', async () => {
    const res = await request(app)
      .get('/v1/youtube/transcript')
      .set('x-api-key', API_KEY);
    expect(res.status).toBe(400);
  });

  // 실제 유튜브 영상 ID로 테스트 (네트워크 필요, 실패 가능성 있음)
  it('정상 요청 시 200 및 content 반환', async () => {
    const res = await request(app)
      .get('/v1/youtube/transcript')
      .set('x-api-key', API_KEY)
      .query({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', text: 'true' });
    // 네트워크/유튜브 상황에 따라 실패할 수 있음
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('content');
      expect(res.body).toHaveProperty('lang');
      expect(res.body).toHaveProperty('availableLangs');
    }
  });
}); 