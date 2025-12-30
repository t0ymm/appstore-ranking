"use client";

import { useState, useEffect, useCallback } from "react";
import { RankingTable } from "@/components/RankingTable";
import { FilterControls } from "@/components/FilterControls";
import type { RankingItem, RankingType, SortField, SortOrder } from "@/types";

export default function Home() {
  const [entries, setEntries] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [type, setType] = useState<RankingType>("free");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [date, setDate] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch(`/api/rankings/dates?type=${type}`);
      const data = await res.json();
      setDates(data.dates || []);
      if (data.dates?.length > 0 && !date) {
        setDate(data.dates[0]);
      }
    } catch (err) {
      console.error("Failed to fetch dates:", err);
    }
  }, [type, date]);

  const fetchRankings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        type,
        sortBy,
        sortOrder,
        ...(date && { date }),
        ...(category && { category }),
      });
      const res = await fetch(`/api/rankings?${params}`);
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setEntries(data.entries || []);
      if (data.date && !date) {
        setDate(data.date);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, category, sortBy, sortOrder, date]);

  const handleFetchData = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/rankings/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      await fetchDates();
      await fetchRankings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗しました");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  useEffect(() => {
    if (dates.length > 0) {
      fetchRankings();
    } else {
      setIsLoading(false);
    }
  }, [dates.length, type, category, sortBy, sortOrder, date]);

  const handleSortChange = (newSortBy: SortField, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              App Store ランキングチェッカー
            </h1>
            <button
              onClick={handleFetchData}
              disabled={isFetching}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isFetching ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  取得中...
                </>
              ) : (
                "データ取得"
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <FilterControls
          type={type}
          onTypeChange={setType}
          category={category}
          onCategoryChange={setCategory}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          date={date}
          dates={dates}
          onDateChange={setDate}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <RankingTable entries={entries} isLoading={isLoading} />
        </div>

        {!isLoading && entries.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-right">
            {entries.length} 件のアプリ
          </div>
        )}
      </main>
    </div>
  );
}
