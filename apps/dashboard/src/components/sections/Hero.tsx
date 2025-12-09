import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";

export function Hero() {
  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 text-white shadow-lg">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
          TikTok Shop 情报雷达
        </span>
        <span className="text-white/80">实时监控 · 选品决策 · 供应链反查</span>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            用 Supabase + Vite + shadcn/ui，快速落地跨境选品与投放分析
          </h1>
          <p className="text-white/85 text-lg">
            接入浏览器扩展上传的情报数据，结合趋势雷达、评论意图与供货渠道，帮团队每天发现可落地的爆款机会。
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90">
            立即体验
          </Button>
          <Button variant="secondary" size="lg" className="bg-indigo-500 text-white">
            <span className="mr-2">查看 API</span>
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
