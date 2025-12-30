export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ranking_snapshots: {
        Row: {
          id: string;
          fetch_date: string;
          ranking_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          fetch_date: string;
          ranking_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          fetch_date?: string;
          ranking_type?: string;
          created_at?: string;
        };
      };
      ranking_entries: {
        Row: {
          id: string;
          snapshot_id: string;
          rank: number;
          app_id: string;
          app_name: string;
          app_icon_url: string | null;
          developer_name: string | null;
          price: number;
          currency: string;
          rating: number | null;
          review_count: number;
          app_store_url: string | null;
          primary_genre: string | null;
          primary_genre_id: string | null;
          genres: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          snapshot_id: string;
          rank: number;
          app_id: string;
          app_name: string;
          app_icon_url?: string | null;
          developer_name?: string | null;
          price?: number;
          currency?: string;
          rating?: number | null;
          review_count?: number;
          app_store_url?: string | null;
          primary_genre?: string | null;
          primary_genre_id?: string | null;
          genres?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          snapshot_id?: string;
          rank?: number;
          app_id?: string;
          app_name?: string;
          app_icon_url?: string | null;
          developer_name?: string | null;
          price?: number;
          currency?: string;
          rating?: number | null;
          review_count?: number;
          app_store_url?: string | null;
          primary_genre?: string | null;
          primary_genre_id?: string | null;
          genres?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}

export type RankingSnapshot = Database["public"]["Tables"]["ranking_snapshots"]["Row"];
export type RankingEntry = Database["public"]["Tables"]["ranking_entries"]["Row"];
