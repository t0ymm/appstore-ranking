"use client";

import type { RankingType, SortField, SortOrder } from "@/types";
import { CATEGORIES } from "@/types";

interface FilterControlsProps {
  type: RankingType;
  onTypeChange: (type: RankingType) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  date: string;
  dates: string[];
  onDateChange: (date: string) => void;
}

export function FilterControls({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  sortBy,
  sortOrder,
  onSortChange,
  date,
  dates,
  onDateChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* 無料/有料切り替え */}
      <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <button
          onClick={() => onTypeChange("free")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            type === "free"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          無料
        </button>
        <button
          onClick={() => onTypeChange("paid")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            type === "paid"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          有料
        </button>
      </div>

      {/* 日付選択 */}
      <select
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
      >
        {dates.length === 0 ? (
          <option value="">日付なし</option>
        ) : (
          dates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))
        )}
      </select>

      {/* カテゴリ選択 */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
      >
        <option value="">すべてのカテゴリ</option>
        {Object.entries(CATEGORIES).map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>

      {/* 並び替え */}
      <select
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => {
          const [field, order] = e.target.value.split("-") as [SortField, SortOrder];
          onSortChange(field, order);
        }}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
      >
        <option value="rank-asc">順位（昇順）</option>
        <option value="rank-desc">順位（降順）</option>
        <option value="rating-desc">評価（高い順）</option>
        <option value="rating-asc">評価（低い順）</option>
        <option value="review_count-desc">レビュー数（多い順）</option>
        <option value="review_count-asc">レビュー数（少ない順）</option>
      </select>
    </div>
  );
}
