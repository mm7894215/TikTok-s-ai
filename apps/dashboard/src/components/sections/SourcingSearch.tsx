import { useEffect, useState } from "react";
import { ArrowUpRight, Image } from "lucide-react";
import type { ProductCandidate } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { supabase } from "../../lib/supabaseClient";

export function SourcingSearch() {
  const [videoId, setVideoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductCandidate[]>([]);

  useEffect(() => {
    const loadDefault = async () => {
      const { data } = await supabase
        .from("product_candidates")
        .select("id, source, url, price, currency, moq, rating, estimated_gross_margin, video_id")
        .order("estimated_gross_margin", { ascending: false })
        .limit(4);

      if (data?.length) {
        setResults(
          data.map((item) => ({
            id: item.id,
            source: item.source,
            url: item.url,
            price: item.price,
            currency: item.currency,
            moq: item.moq ?? undefined,
            rating: item.rating ?? undefined,
            estimatedGrossMargin: item.estimated_gross_margin ?? undefined
          }))
        );
      }
    };

    void loadDefault();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_candidates")
        .select("id, source, url, price, currency, moq, rating, estimated_gross_margin")
        .ilike("video_id", `%${videoId}%`)
        .limit(5);

      if (error) {
        throw error;
      }

      const mapped = data?.map((item) => ({
        id: item.id,
        source: item.source,
        url: item.url,
        price: item.price,
        currency: item.currency,
        moq: item.moq ?? undefined,
        rating: item.rating ?? undefined,
        estimatedGrossMargin: item.estimated_gross_margin ?? undefined
      }));

      if (mapped?.length) {
        setResults(mapped);
      }
    } catch (error_) {
      console.error("search-by-image failed", error_);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>搜同款 · 供应链反查</CardTitle>
        <CardDescription>输入视频 ID 或直接点击扩展中的「搜同款」，调用 Supabase 存储的图搜结果。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="输入视频 ID，示例：7234567890"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading} className="sm:w-44">
            <Image size={16} className="mr-2" /> 搜同款
          </Button>
        </div>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {results.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{item.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.currency} {item.price} · MOQ {item.moq ?? "-"} · 评分 {item.rating ?? "-"}
                    </p>
                  </div>
                  {item.estimatedGrossMargin ? (
                    <span className="text-xs font-semibold text-emerald-600">
                      毛利 {item.estimatedGrossMargin}%
                    </span>
                  ) : null}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
                >
                  查看货源 <ArrowUpRight size={12} className="ml-1" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
