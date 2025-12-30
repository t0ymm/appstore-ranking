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
  if (rating === null) return <span className="text-gray-400">-</span>;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-500">{"★".repeat(fullStars)}</span>
      {hasHalfStar && <span className="text-yellow-500">½</span>}
      <span className="text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
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
      <div className="text-center py-12 text-gray-500">
        データがありません。「データ取得」ボタンで取得してください。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">
              順位
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              アプリ
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-40">
              カテゴリ
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">
              価格
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
              評価
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 w-28">
              レビュー数
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-sm">
                  {entry.rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <a
                  href={entry.appStoreUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  {entry.appIconUrl ? (
                    <Image
                      src={entry.appIconUrl}
                      alt={entry.appName}
                      width={48}
                      height={48}
                      className="rounded-xl"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.appName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.developerName}
                    </div>
                  </div>
                </a>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {entry.primaryGenre || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {entry.price === 0 ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">無料</span>
                ) : (
                  `¥${entry.price}`
                )}
              </td>
              <td className="px-4 py-3">
                <StarRating rating={entry.rating} />
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(entry.reviewCount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
