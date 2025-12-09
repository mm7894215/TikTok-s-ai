import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface TrendRow {
  entity_id: string;
  velocity: number;
  acceleration: number;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function TrendSpark() {
  const [rows, setRows] = useState<TrendRow[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('trend_signals')
      .select('entity_id, velocity, acceleration')
      .order('velocity', { ascending: false })
      .limit(5)
      .then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <div className="card" style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>热度雷达 · Top Hashtag / BGM</div>
      <div className="text-subtle" style={{ fontSize: 13 }}>来自 Supabase trend_signals 表的实时结果</div>
      <div className="divider" />
      {rows.length === 0 && <div className="text-subtle">等待数据写入…</div>}
      {rows.map((row) => (
        <div key={row.entity_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>#{row.entity_id}</div>
          <span className="badge">速度 {row.velocity ?? 0}</span>
          <span className="badge">加速度 {row.acceleration ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
