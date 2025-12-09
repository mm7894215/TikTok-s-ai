export interface TrendItem {
  id: string;
  label: string;
  velocity: number;
  acceleration: number;
  type: "sound" | "tag" | "video";
}

export interface VideoMetric {
  id: string;
  title: string;
  author: string;
  country: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  viralVelocity: number;
  commercialScore: number;
  hashtags: string[];
}

export interface ProductCandidate {
  id: string;
  source: string;
  url: string;
  price: number;
  currency: string;
  moq?: number;
  rating?: number;
  estimatedGrossMargin?: number;
}
