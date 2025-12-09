import { useEffect, useState } from "react";
import { Hero } from "./components/sections/Hero";
import { SourcingSearch } from "./components/sections/SourcingSearch";
import { TrendBoard } from "./components/sections/TrendBoard";
import { VideoTable } from "./components/sections/VideoTable";
import type { TrendItem, VideoMetric } from "./types";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [trendItems, setTrendItems] = useState<TrendItem[]>([]);
  const [videos, setVideos] = useState<VideoMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: trendData } = await supabase
          .from("trend_signals")
          .select("id, entity_type, entity_id, velocity, acceleration")
          .order("velocity", { ascending: false })
          .limit(6);

        const mappedTrends = trendData?.map((item) => ({
          id: item.id,
          label: item.entity_id,
          velocity: Number(item.velocity ?? 0),
          acceleration: Number(item.acceleration ?? 0),
          type: item.entity_type === "sound" ? "sound" : "tag"
        }));

        setTrendItems(
          mappedTrends?.length
            ? mappedTrends
            : [
                { id: "sound-1", label: "Get It Right", velocity: 12.5, acceleration: 3.1, type: "sound" },
                { id: "tag-1", label: "#summeroutfit", velocity: 10.2, acceleration: 2.4, type: "tag" },
                { id: "sound-2", label: "Happy Vibes", velocity: 8.9, acceleration: 1.8, type: "sound" }
              ]
        );

        const { data: videoRows } = await supabase
          .from("video_overview")
          .select("id, title, author_id, country, views, likes, comments, shares, hashtags, views_per_hour, commercial_score")
          .order("views_per_hour", { ascending: false, nullsFirst: false })
          .limit(10);

        const mappedVideos = videoRows?.map((row) => ({
          id: row.id,
          title: row.title ?? "",
          author: row.author_id ?? "",
          country: row.country ?? "",
          views: Number(row.views ?? 0),
          likes: Number(row.likes ?? 0),
          comments: Number(row.comments ?? 0),
          shares: Number(row.shares ?? 0),
          viralVelocity: Number(row.views_per_hour ?? 0),
          commercialScore: Number(row.commercial_score ?? 0) * 10,
          hashtags: (row.hashtags as string[] | null) ?? []
        }));

        setVideos(
          mappedVideos?.length
            ? mappedVideos
            : [
                {
                  id: "7234567890",
                  title: "可拆卸收纳化妆包",
                  author: "beauty_lab",
                  country: "US",
                  views: 389000,
                  likes: 18000,
                  comments: 3200,
                  shares: 2400,
                  viralVelocity: 2.35,
                  commercialScore: 8.7,
                  hashtags: ["makeup", "organizer", "travel"]
                },
                {
                  id: "7234567891",
                  title: "迷你筋膜枪评测",
                  author: "fitgear",
                  country: "UK",
                  views: 210000,
                  likes: 9200,
                  comments: 1300,
                  shares: 900,
                  viralVelocity: 1.62,
                  commercialScore: 7.9,
                  hashtags: ["fitness", "recovery", "gift"]
                }
              ]
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <Hero />
        <div className="grid gap-4 md:grid-cols-2">
          <TrendBoard
            title="热门 BGM / 话题"
            description="按照速度与加速度排序的热榜，实时对接 Supabase trend_signals 表"
            items={trendItems}
          />
          <SourcingSearch />
        </div>
        <VideoTable videos={videos} loading={loading} />
      </div>
    </div>
  );
}
