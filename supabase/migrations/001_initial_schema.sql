-- ランキング取得履歴
CREATE TABLE ranking_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fetch_date DATE NOT NULL,
  ranking_type VARCHAR(20) NOT NULL, -- 'free' or 'paid'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fetch_date, ranking_type)
);

-- ランキングエントリ
CREATE TABLE ranking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID REFERENCES ranking_snapshots(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  app_id VARCHAR(20) NOT NULL,
  app_name VARCHAR(255) NOT NULL,
  app_icon_url TEXT,
  developer_name VARCHAR(255),
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'JPY',
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  app_store_url TEXT,
  primary_genre VARCHAR(100),
  primary_genre_id VARCHAR(10),
  genres JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_snapshots_date_type ON ranking_snapshots(fetch_date, ranking_type);
CREATE INDEX idx_entries_snapshot ON ranking_entries(snapshot_id);
CREATE INDEX idx_entries_rank ON ranking_entries(rank);
CREATE INDEX idx_entries_genre ON ranking_entries(primary_genre_id);

-- RLSポリシー（読み取り専用）
ALTER TABLE ranking_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on snapshots" ON ranking_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on entries" ON ranking_entries
  FOR SELECT USING (true);
