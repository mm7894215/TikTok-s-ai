import { ArrowUpRight, Flame } from "lucide-react";
import type { VideoMetric } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface Props {
  videos: VideoMetric[];
  loading?: boolean;
}

export function VideoTable({ videos, loading }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>潜在爆款视频</CardTitle>
        <Badge variant="warning" className="gap-1">
          <Flame size={14} /> 近 24 小时
        </Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 pr-4 font-medium">视频</th>
              <th className="py-2 pr-4 font-medium">互动</th>
              <th className="py-2 pr-4 font-medium">Viral Velocity</th>
              <th className="py-2 pr-4 font-medium">商业分</th>
              <th className="py-2 font-medium">标签</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1, 2, 3, 4].map((key) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="mt-2 h-4 w-32" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-2 h-4 w-40" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="py-3">
                      <Skeleton className="h-5 w-32" />
                    </td>
                  </tr>
                ))
              : videos.map((video) => (
                  <tr key={video.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{video.title}</span>
                          <a
                            className="inline-flex items-center text-xs text-primary hover:underline"
                            href={`https://www.tiktok.com/@${video.author}/video/${video.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            查看 <ArrowUpRight size={12} className="ml-1" />
                          </a>
                        </div>
                        <p className="text-xs text-muted-foreground">{video.author} · {video.country}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-muted-foreground">{video.views.toLocaleString()} 播放</p>
                      <p className="text-xs text-muted-foreground">{video.likes.toLocaleString()} 赞 · {video.comments.toLocaleString()} 评 · {video.shares.toLocaleString()} 转</p>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-emerald-600">
                      {video.viralVelocity.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 font-semibold">{video.commercialScore.toFixed(1)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {video.hashtags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
