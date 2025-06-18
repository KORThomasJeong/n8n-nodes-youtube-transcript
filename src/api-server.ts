import express from 'express';
import dotenv from 'dotenv';
import { getYoutubeTranscript } from './youtube-transcript';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// 인증 미들웨어
app.use((req, res, next) => {
  const key = req.header('x-api-key');
  if (!API_KEY || key !== API_KEY) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return;
  }
  next();
});

app.get('/v1/youtube/transcript', async (req, res) => {
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

app.get('/', (req, res) => {
  res.send('YouTube Transcript API 서버가 실행 중입니다.');
});

app.listen(PORT, () => {
  console.log(`API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 