-- =============================================
-- SSC CGL AI — Full Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL)
-- =============================================

-- 0. Helper: auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 1. user_profile
-- =============================================
CREATE TABLE user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL UNIQUE,
  display_name TEXT,
  exam TEXT NOT NULL DEFAULT 'SSC CGL',
  attempt_year SMALLINT NOT NULL DEFAULT 2026,
  daily_hours SMALLINT NOT NULL DEFAULT 4,
  strong_subjects TEXT[] DEFAULT '{}',
  weak_subjects TEXT[] DEFAULT '{}',
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_phone ON user_profile(phone);

CREATE TRIGGER trg_profile_updated
  BEFORE UPDATE ON user_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 2. user_stats (hot table — precomputed)
-- =============================================
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES user_profile(id) ON DELETE CASCADE,
  total_mocks_taken INTEGER NOT NULL DEFAULT 0,
  avg_score NUMERIC(5,2) DEFAULT 0,
  best_score NUMERIC(5,2) DEFAULT 0,
  last_mock_score NUMERIC(5,2),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  active_days_this_week SMALLINT NOT NULL DEFAULT 0,
  topics_covered INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  consistency_percentile SMALLINT DEFAULT 0,
  performance_percentile SMALLINT DEFAULT 0,
  section_averages JSONB DEFAULT '{"qa":0,"gir":0,"eng":0,"gk":0}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stats_consistency ON user_stats(consistency_percentile DESC);
CREATE INDEX idx_stats_performance ON user_stats(performance_percentile DESC);
CREATE INDEX idx_stats_avg_score ON user_stats(avg_score DESC);
CREATE INDEX idx_stats_last_active ON user_stats(last_active_date DESC);

CREATE TRIGGER trg_stats_updated
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 3. diagnostic_attempts
-- =============================================
CREATE TABLE diagnostic_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  paper_id TEXT NOT NULL,
  paper_title TEXT NOT NULL,
  total_score NUMERIC(5,2) NOT NULL,
  max_marks SMALLINT NOT NULL DEFAULT 200,
  correct INTEGER NOT NULL DEFAULT 0,
  wrong INTEGER NOT NULL DEFAULT 0,
  unattempted INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  section_scores JSONB NOT NULL DEFAULT '{}',
  cognitive_breakdown JSONB DEFAULT '{}',
  weak_topics TEXT[] DEFAULT '{}',
  answers JSONB DEFAULT '{}',
  hints_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_diag_user_date ON diagnostic_attempts(user_id, created_at DESC);
CREATE INDEX idx_diag_paper ON diagnostic_attempts(paper_id);

-- =============================================
-- 4. study_plans
-- =============================================
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  generation_num SMALLINT NOT NULL DEFAULT 1,
  items JSONB NOT NULL DEFAULT '[]',
  completed_count SMALLINT NOT NULL DEFAULT 0,
  total_count SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_plan_user_date_gen
  ON study_plans(user_id, plan_date, generation_num);
CREATE INDEX idx_plan_user_recent ON study_plans(user_id, plan_date DESC);

-- =============================================
-- 5. subscriptions
-- =============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled', 'past_due')),
  amount_paise INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  payment_gateway TEXT DEFAULT 'razorpay',
  gateway_subscription_id TEXT,
  gateway_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sub_user_status ON subscriptions(user_id, status)
  WHERE status = 'active';
CREATE INDEX idx_sub_expires ON subscriptions(expires_at)
  WHERE status = 'active';

CREATE TRIGGER trg_sub_updated
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 6. ai_analysis_results
-- =============================================
CREATE TABLE ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES diagnostic_attempts(id) ON DELETE SET NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analysis_user ON ai_analysis_results(user_id, created_at DESC);

-- =============================================
-- 7. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- user_profile policies
CREATE POLICY "Users read own profile"
  ON user_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users create own profile"
  ON user_profile FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON user_profile FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_stats policies (read-only for users, writes via service_role)
CREATE POLICY "Users read own stats"
  ON user_stats FOR SELECT USING (auth.uid() = user_id);

-- diagnostic_attempts policies (insert + read, no update/delete)
CREATE POLICY "Users read own attempts"
  ON diagnostic_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own attempts"
  ON diagnostic_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- study_plans policies
CREATE POLICY "Users read own plans"
  ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own plans"
  ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own plans"
  ON study_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- subscriptions policies (read-only for users)
CREATE POLICY "Users read own subs"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ai_analysis_results policies
CREATE POLICY "Users read own analyses"
  ON ai_analysis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own analyses"
  ON ai_analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 8. push_subscriptions (Web Push)
-- =============================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_user ON push_subscriptions(user_id) WHERE active = true;
CREATE INDEX idx_push_active ON push_subscriptions(active) WHERE active = true;

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own push subs"
  ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create push subs"
  ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own push subs"
  ON push_subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
