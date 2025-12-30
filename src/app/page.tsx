"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { RankingTable } from "@/components/RankingTable";
import { FilterControls } from "@/components/FilterControls";
import type { RankingItem, RankingType, SortField, SortOrder, DeveloperType } from "@/types";
import { isCompanyDeveloper } from "@/types";

export default function Home() {
  const [entries, setEntries] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [type, setType] = useState<RankingType>("free");
  const [category, setCategory] = useState("");
  const [developerType, setDeveloperType] = useState<DeveloperType>("all");
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

  // 配信者タイプでフィルタリング
  const filteredEntries = entries.filter((entry) => {
    if (developerType === "all") return true;
    const isCompany = isCompanyDeveloper(entry.developerName);
    return developerType === "company" ? isCompany : !isCompany;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <Image
              src="/logo.png"
              alt="App Store ランキングチェッカー"
              width={120}
              height={80}
              priority
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
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
          developerType={developerType}
          onDeveloperTypeChange={setDeveloperType}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          date={date}
          dates={dates}
          onDateChange={setDate}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden w-full">
          <RankingTable entries={filteredEntries} isLoading={isLoading} />
        </div>

        {!isLoading && filteredEntries.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-right">
            {filteredEntries.length} 件のアプリ
          </div>
        )}
      </main>

      <footer className="mt-auto py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        <button
          onClick={handleFetchData}
          disabled={isFetching}
          className="hover:text-gray-600 dark:hover:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isFetching ? "取得中..." : "データを更新"}
        </button>
      </footer>
    </div>
  );
}
