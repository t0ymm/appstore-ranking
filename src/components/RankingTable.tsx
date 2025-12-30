"use client";

import type { RankingItem } from "@/types";
import Image from "next/image";

interface RankingTableProps {
  entries: RankingItem[];
  isLoading: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-gray-400 text-xs">-</span>;
  return (
    <span className="text-yellow-500 text-sm">
      ★{rating.toFixed(1)}
    </span>
  );
}

export function RankingTable({ entries, isLoading }: RankingTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 px-4">
        データがありません。「データ取得」ボタンで取得してください。
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={entry.appStoreUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          {/* 順位 */}
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-sm">
            {entry.rank}
          </div>

          {/* アイコン */}
          {entry.appIconUrl ? (
            <Image
              src={entry.appIconUrl}
              alt={entry.appName}
              width={48}
              height={48}
              className="rounded-xl flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
          )}

          {/* アプリ情報 */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
              {entry.appName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {entry.developerName}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {entry.primaryGenre || "-"}
              </span>
              <StarRating rating={entry.rating} />
              <span className="text-xs text-gray-400">
                ({formatNumber(entry.reviewCount)})
              </span>
            </div>
          </div>

          {/* 価格 */}
          <div className="flex-shrink-0 text-right">
            {entry.price === 0 ? (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                無料
              </span>
            ) : (
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                ¥{entry.price}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
