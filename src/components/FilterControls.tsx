"use client";

import type { RankingType, SortField, SortOrder, DeveloperType } from "@/types";
import { CATEGORIES } from "@/types";

interface FilterControlsProps {
  type: RankingType;
  onTypeChange: (type: RankingType) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  developerType: DeveloperType;
  onDeveloperTypeChange: (developerType: DeveloperType) => void;
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
  developerType,
  onDeveloperTypeChange,
  sortBy,
  sortOrder,
  onSortChange,
  date,
  dates,
  onDateChange,
}: FilterControlsProps) {
  return (
    <div className="space-y-3 mb-6 w-full max-w-full">
      {/* 1行目: 無料/有料 + 日付 */}
      <div className="flex gap-2">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 flex-shrink-0">
          <button
            onClick={() => onTypeChange("free")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              type === "free"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            無料
          </button>
          <button
            onClick={() => onTypeChange("paid")}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              type === "paid"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            有料
          </button>
        </div>

        <select
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
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
      </div>

      {/* 2行目: カテゴリ + 配信者 + 並び替え */}
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
        >
          <option value="">全カテゴリ</option>
          {Object.entries(CATEGORIES).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={developerType}
          onChange={(e) => onDeveloperTypeChange(e.target.value as DeveloperType)}
          className="flex-shrink-0 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
        >
          <option value="all">全て</option>
          <option value="company">企業</option>
          <option value="individual">個人</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-") as [SortField, SortOrder];
            onSortChange(field, order);
          }}
          className="flex-shrink-0 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
        >
          <option value="rank-asc">順位↑</option>
          <option value="rank-desc">順位↓</option>
          <option value="rating-desc">評価↓</option>
          <option value="rating-asc">評価↑</option>
          <option value="review_count-desc">レビュー↓</option>
          <option value="review_count-asc">レビュー↑</option>
        </select>
      </div>
    </div>
  );
}
