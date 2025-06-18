import { Client, Caption } from 'youtubei';

export interface TranscriptResult {
  content: string | Array<{
    text: string;
    offset: number;
    duration: number;
    lang: string;
  }>;
  lang: string;
  availableLangs: string[];
}

export async function getYoutubeTranscript({
  url,
  videoId,
  lang = 'en',
  text = false,
  chunkSize,
}: {
  url?: string;
  videoId?: string;
  lang?: string;
  text?: boolean;
  chunkSize?: number;
}): Promise<TranscriptResult> {
  let youtubeId = videoId;
  if (!youtubeId && url) {
    const urlRegex = /^(http(s)?:\/\/)?((w){3}\.)?youtu(be|\.be)?(\.com)?\/.+/;
    if (urlRegex.test(url)) {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') {
        youtubeId = u.pathname.slice(1);
      } else {
        const v = u.searchParams.get('v');
        if (!v) throw new Error('유효한 YouTube videoId가 URL에 없습니다.');
        youtubeId = v;
      }
    } else {
      throw new Error('유효한 YouTube URL 형식이 아닙니다.');
    }
  }
  if (!youtubeId) throw new Error('videoId 또는 url 파라미터가 필요합니다.');

  const youtube = new Client();
  const videoInfo = await youtube.getVideo(youtubeId);
  if (!videoInfo) throw new Error('동영상 정보를 가져올 수 없습니다.');
  const availableCaptionLanguages = videoInfo.captions?.languages || [];
  if (!videoInfo.captions || availableCaptionLanguages.length === 0) {
    throw new Error('해당 영상에 자막이 없습니다.');
  }
  let targetLangCode: string | undefined = undefined;
  if (availableCaptionLanguages.some((l) => l.code === lang)) {
    targetLangCode = lang;
  } else if (availableCaptionLanguages.some((l) => l.code === 'en')) {
    targetLangCode = 'en';
  } else {
    targetLangCode = availableCaptionLanguages[0].code;
  }
  const captions: Caption[] | undefined = await videoInfo.captions.get(targetLangCode);
  if (!captions || captions.length === 0) throw new Error('자막 추출에 실패했습니다.');

  if (text) {
    let transcript = captions.map((c) => c.text).join(' ');
    transcript = transcript.trim().replace(/\s+/g, ' ').replace(/,/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ');
    return {
      content: transcript,
      lang: targetLangCode!,
      availableLangs: availableCaptionLanguages.map((l) => l.code),
    };
  } else {
    // chunkSize 옵션 적용
    let content: TranscriptResult['content'];
    if (chunkSize) {
      // chunkSize 만큼 텍스트를 잘라서 반환
      const chunks: Array<{ text: string; offset: number; duration: number; lang: string }> = [];
      let buffer = '';
      let start = 0;
      let duration = 0;
      for (const cap of captions) {
        if (buffer.length + cap.text.length > chunkSize && buffer.length > 0) {
          chunks.push({ text: buffer, offset: start, duration, lang: targetLangCode! });
          buffer = '';
          start = cap.start;
          duration = 0;
        }
        if (buffer.length === 0) start = cap.start;
        buffer += (buffer ? ' ' : '') + cap.text;
        duration += cap.duration;
      }
      if (buffer.length > 0) {
        chunks.push({ text: buffer, offset: start, duration, lang: targetLangCode! });
      }
      content = chunks;
    } else {
      content = captions.map((cap) => ({
        text: cap.text,
        offset: cap.start,
        duration: cap.duration,
        lang: targetLangCode!,
      }));
    }
    return {
      content,
      lang: targetLangCode!,
      availableLangs: availableCaptionLanguages.map((l) => l.code),
    };
  }
} 