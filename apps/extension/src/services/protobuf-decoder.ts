export interface NormalizedVideo {
  id: string;
  authorId: string;
  publishTime: number;
  country?: string;
  caption?: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  musicId?: string;
  hashtags: string[];
  isAd: boolean;
  shop?: {
    productId?: string;
    price?: number;
    currency?: string;
  };
}

const defaultFieldMapping = {
  id: ['aweme_id', 'id'],
  authorId: ['author.id', 'author_uid'],
  publishTime: ['create_time'],
  caption: ['desc', 'share_info.share_title'],
  stats: {
    views: ['statistics.play_count', 'statistics.views'],
    likes: ['statistics.digg_count', 'statistics.likes'],
    comments: ['statistics.comment_count', 'statistics.comments'],
    shares: ['statistics.share_count', 'statistics.shares'],
    saves: ['statistics.collect_count', 'statistics.saves']
  },
  isAd: ['is_ads', 'is_ad']
};

export function decodeFeedResponse(buffer: ArrayBuffer): NormalizedVideo[] {
  try {
    const textDecoder = new TextDecoder();
    const json = JSON.parse(textDecoder.decode(buffer));
    if (Array.isArray(json?.itemList)) {
      return json.itemList.map(mapRawToNormalized);
    }
  } catch (err) {
    console.warn('decodeFeedResponse fallback', err);
  }
  return [];
}

export function decodeLiveResponse(buffer: ArrayBuffer): NormalizedVideo[] {
  return decodeFeedResponse(buffer);
}

function mapRawToNormalized(raw: any): NormalizedVideo {
  const get = (obj: any, path: string) => path.split('.').reduce((acc, key) => acc?.[key], obj);
  const pickFirst = (paths: string[]) => {
    for (const p of paths) {
      const v = get(raw, p);
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };

  return {
    id: pickFirst(defaultFieldMapping.id) ?? crypto.randomUUID(),
    authorId: pickFirst(defaultFieldMapping.authorId) ?? 'unknown',
    publishTime: Number(pickFirst(defaultFieldMapping.publishTime) ?? Date.now() / 1000),
    caption: pickFirst(defaultFieldMapping.caption),
    stats: {
      views: Number(pickFirst(defaultFieldMapping.stats.views) ?? 0),
      likes: Number(pickFirst(defaultFieldMapping.stats.likes) ?? 0),
      comments: Number(pickFirst(defaultFieldMapping.stats.comments) ?? 0),
      shares: Number(pickFirst(defaultFieldMapping.stats.shares) ?? 0),
      saves: Number(pickFirst(defaultFieldMapping.stats.saves) ?? 0)
    },
    hashtags: raw?.textExtra?.map((i: any) => i?.hashtagName).filter(Boolean) ?? [],
    isAd: Boolean(pickFirst(defaultFieldMapping.isAd)),
    musicId: raw?.music?.id,
    shop: raw?.commerceInfo?.productId
      ? { productId: raw.commerceInfo.productId }
      : undefined
  };
}
