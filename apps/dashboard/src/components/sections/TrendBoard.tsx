import { TrendingUp } from "lucide-react";
import type { TrendItem } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface Props {
  title: string;
  description: string;
  items: TrendItem[];
}

export function TrendBoard({ title, description, items }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant="success" className="gap-2">
          <TrendingUp size={14} /> 实时刷新
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{item.label}</span>
                <Badge variant="outline" className="capitalize">
                  {item.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">速度 {item.velocity.toFixed(2)} · 加速度 {item.acceleration.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-600">↑ {item.velocity.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">近 3h</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
