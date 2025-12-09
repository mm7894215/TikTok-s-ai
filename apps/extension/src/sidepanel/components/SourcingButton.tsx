import { useState } from 'react';

interface Props {
  videoId?: string;
}

const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sourcing-search`;
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function SourcingButton({ videoId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    if (!apiUrl || !apiKey) {
      setMessage('缺少 Supabase 配置');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const video = document.querySelector('video');
      let imageBase64: string | undefined;
      if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          imageBase64 = canvas.toDataURL('image/jpeg');
        }
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey
        },
        body: JSON.stringify({ videoId, imageBase64 })
      });
      const data = await res.json();
      setMessage(`返回 ${data?.candidates?.length ?? 0} 条货源`);
    } catch (err) {
      setMessage('调用失败，请检查 Supabase 函数');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
      <button className={`button primary`} onClick={handleClick} disabled={loading}>
        {loading ? '处理中…' : '搜同款'}
      </button>
      {message && (
        <span className="text-subtle" style={{ fontSize: 12 }}>
          {message}
        </span>
      )}
    </div>
  );
}
