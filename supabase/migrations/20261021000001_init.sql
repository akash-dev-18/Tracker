-- Docket — initial schema
-- Run this once in the Supabase SQL editor, or apply with the Supabase CLI.

create extension if not exists pg_trgm;

-- ── Enums ────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.question_difficulty as enum ('easy', 'medium', 'hard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.question_status as enum ('todo', 'attempted', 'solved', 'needs_revision');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.review_rating as enum ('again', 'hard', 'good', 'easy');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_status as enum (
    'wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted', 'withdrawn'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.work_mode as enum ('onsite', 'hybrid', 'remote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.priority_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum ('idea', 'active', 'paused', 'done', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.task_status as enum ('todo', 'doing', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.resource_type as enum ('article', 'video', 'course', 'book', 'docs', 'other');
exception when duplicate_object then null; end $$;

-- ── Utilities ────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Profiles ─────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  daily_goal integer not null default 3 check (daily_goal between 1 and 50),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Topics (one level of subtopics) ──────────────────────────────────────────

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  parent_id uuid references public.topics (id) on delete cascade,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists topics_user_idx on public.topics (user_id);
create index if not exists topics_parent_idx on public.topics (parent_id);
create unique index if not exists topics_user_parent_name_idx
  on public.topics (user_id, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

-- ── DSA questions ────────────────────────────────────────────────────────────

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  url text,
  platform text,
  difficulty public.question_difficulty,
  status public.question_status not null default 'todo',
  topic_id uuid references public.topics (id) on delete set null,
  notes text,
  code text,
  language text,
  tags text[] not null default '{}',
  starred boolean not null default false,
  solved_at date,
  next_review_at date,
  review_interval integer not null default 0 check (review_interval >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questions_user_status_idx on public.questions (user_id, status);
create index if not exists questions_user_topic_idx on public.questions (user_id, topic_id);
create index if not exists questions_review_idx on public.questions (user_id, next_review_at)
  where next_review_at is not null;
create index if not exists questions_created_idx on public.questions (user_id, created_at desc);
create index if not exists questions_tags_idx on public.questions using gin (tags);
create index if not exists questions_title_trgm_idx on public.questions using gin (title gin_trgm_ops);

-- ── Revision history ─────────────────────────────────────────────────────────

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  rating public.review_rating not null,
  reviewed_at timestamptz not null default now(),
  interval_before integer not null default 0,
  interval_after integer not null default 0
);

create index if not exists reviews_user_date_idx on public.reviews (user_id, reviewed_at desc);
create index if not exists reviews_question_idx on public.reviews (question_id, reviewed_at desc);

-- ── Jobs ─────────────────────────────────────────────────────────────────────

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null check (char_length(trim(company)) > 0),
  role text not null check (char_length(trim(role)) > 0),
  url text,
  status public.job_status not null default 'wishlist',
  location text,
  work_mode public.work_mode,
  salary_range text,
  source text,
  applied_at date,
  follow_up_at date,
  resume_version text,
  contact_name text,
  contact_email text,
  priority public.priority_level not null default 'medium',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_user_status_idx on public.jobs (user_id, status);
create index if not exists jobs_follow_up_idx on public.jobs (user_id, follow_up_at)
  where follow_up_at is not null;
create index if not exists jobs_created_idx on public.jobs (user_id, created_at desc);

create table if not exists public.job_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  type text not null default 'note',
  note text,
  happened_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists job_events_job_idx on public.job_events (job_id, happened_at desc);
create index if not exists job_events_user_idx on public.job_events (user_id);

-- ── Projects ─────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  summary text,
  repo_url text,
  live_url text,
  status public.project_status not null default 'idea',
  tech text[] not null default '{}',
  priority public.priority_level not null default 'medium',
  started_at date,
  target_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_status_idx on public.projects (user_id, status);
create index if not exists projects_created_idx on public.projects (user_id, created_at desc);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  status public.task_status not null default 'todo',
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_tasks_project_idx on public.project_tasks (project_id, sort_order);
create index if not exists project_tasks_user_idx on public.project_tasks (user_id);

-- ── Library ──────────────────────────────────────────────────────────────────

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  url text,
  type public.resource_type not null default 'article',
  tags text[] not null default '{}',
  notes text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_user_idx on public.resources (user_id, created_at desc);
create index if not exists resources_tags_idx on public.resources using gin (tags);

-- ── Study log ────────────────────────────────────────────────────────────────

create table if not exists public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default current_date,
  minutes integer not null default 0 check (minutes >= 0),
  questions_solved integer not null default 0 check (questions_solved >= 0),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists study_logs_user_date_idx on public.study_logs (user_id, log_date desc);

-- ── Updated-at triggers ──────────────────────────────────────────────────────

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists topics_updated_at on public.topics;
create trigger topics_updated_at before update on public.topics
  for each row execute function public.set_updated_at();

drop trigger if exists questions_updated_at on public.questions;
create trigger questions_updated_at before update on public.questions
  for each row execute function public.set_updated_at();

drop trigger if exists jobs_updated_at on public.jobs;
create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists project_tasks_updated_at on public.project_tasks;
create trigger project_tasks_updated_at before update on public.project_tasks
  for each row execute function public.set_updated_at();

drop trigger if exists resources_updated_at on public.resources;
create trigger resources_updated_at before update on public.resources
  for each row execute function public.set_updated_at();

-- ── Default topic tree ───────────────────────────────────────────────────────
-- Provisioned per user so every account starts with a usable structure.

create or replace function public.seed_default_topics(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.topics (user_id, name, sort_order)
  values
    (uid, 'Arrays', 1),
    (uid, 'Strings', 2),
    (uid, 'Hashing', 3),
    (uid, 'Linked Lists', 4),
    (uid, 'Stacks & Queues', 5),
    (uid, 'Binary Search', 6),
    (uid, 'Trees', 7),
    (uid, 'Heaps', 8),
    (uid, 'Graphs', 9),
    (uid, 'Recursion', 10),
    (uid, 'Backtracking', 11),
    (uid, 'Dynamic Programming', 12),
    (uid, 'Greedy', 13),
    (uid, 'Tries', 14),
    (uid, 'Intervals', 15),
    (uid, 'Bit Manipulation', 16),
    (uid, 'Math', 17),
    (uid, 'Sorting', 18),
    (uid, 'Design', 19)
  on conflict do nothing;

  insert into public.topics (user_id, name, parent_id, sort_order)
  select uid, child.name, parent.id, child.sort_order
  from (
    values
      ('Two Pointers', 'Arrays', 1),
      ('Sliding Window', 'Arrays', 2),
      ('Prefix Sum', 'Arrays', 3),
      ('Palindromes', 'Strings', 1),
      ('Anagrams', 'Strings', 2),
      ('Parsing', 'Strings', 3),
      ('Hash Map', 'Hashing', 1),
      ('Hash Set', 'Hashing', 2),
      ('Frequency Count', 'Hashing', 3),
      ('Singly Linked', 'Linked Lists', 1),
      ('Doubly Linked', 'Linked Lists', 2),
      ('Fast & Slow', 'Linked Lists', 3),
      ('Monotonic Stack', 'Stacks & Queues', 1),
      ('Deque', 'Stacks & Queues', 2),
      ('Parentheses', 'Stacks & Queues', 3),
      ('Search Space', 'Binary Search', 1),
      ('Rotated Arrays', 'Binary Search', 2),
      ('Answer Search', 'Binary Search', 3),
      ('Traversals', 'Trees', 1),
      ('Binary Search Tree', 'Trees', 2),
      ('Lowest Common Ancestor', 'Trees', 3),
      ('Top K', 'Heaps', 1),
      ('Two Heaps', 'Heaps', 2),
      ('Priority Queue', 'Heaps', 3),
      ('BFS', 'Graphs', 1),
      ('DFS', 'Graphs', 2),
      ('Topological Sort', 'Graphs', 3),
      ('Union Find', 'Graphs', 4),
      ('Shortest Path', 'Graphs', 5),
      ('Divide & Conquer', 'Recursion', 1),
      ('Memoization', 'Recursion', 2),
      ('Subsets', 'Backtracking', 1),
      ('Permutations', 'Backtracking', 2),
      ('Combination Sum', 'Backtracking', 3),
      ('1D', 'Dynamic Programming', 1),
      ('2D', 'Dynamic Programming', 2),
      ('Knapsack', 'Dynamic Programming', 3),
      ('LIS', 'Dynamic Programming', 4),
      ('Strings', 'Dynamic Programming', 5),
      ('Intervals', 'Greedy', 1),
      ('Scheduling', 'Greedy', 2),
      ('Jump Games', 'Greedy', 3),
      ('Prefix Tree', 'Tries', 1),
      ('Word Search', 'Tries', 2),
      ('Merge', 'Intervals', 1),
      ('Scheduling', 'Intervals', 2),
      ('Basics', 'Bit Manipulation', 1),
      ('XOR', 'Bit Manipulation', 2),
      ('Number Theory', 'Math', 1),
      ('Modular Arithmetic', 'Math', 2),
      ('Geometry', 'Math', 3),
      ('Comparison Sort', 'Sorting', 1),
      ('Counting Sort', 'Sorting', 2),
      ('Cache Design', 'Design', 1),
      ('Rate Limiter', 'Design', 2)
  ) as child (name, parent_name, sort_order)
  join public.topics parent
    on parent.user_id = uid
   and parent.parent_id is null
   and lower(parent.name) = lower(child.parent_name)
  where not exists (
    select 1
    from public.topics existing
    where existing.user_id = uid
      and existing.parent_id = parent.id
      and lower(existing.name) = lower(child.name)
  );
end;
$$;

-- ── New user provisioning ────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display text;
begin
  display := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'there'
  );

  insert into public.profiles (id, display_name)
  values (new.id, display)
  on conflict (id) do nothing;

  perform public.seed_default_topics(new.id);

  return new;
end;
$$;

revoke all on function public.seed_default_topics(uuid) from public;
revoke all on function public.seed_default_topics(uuid) from anon;
revoke all on function public.seed_default_topics(uuid) from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.reviews enable row level security;
alter table public.jobs enable row level security;
alter table public.job_events enable row level security;
alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.resources enable row level security;
alter table public.study_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "topics_owner_all" on public.topics;
create policy "topics_owner_all" on public.topics
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "questions_owner_all" on public.questions;
create policy "questions_owner_all" on public.questions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "reviews_owner_all" on public.reviews;
create policy "reviews_owner_all" on public.reviews
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "jobs_owner_all" on public.jobs;
create policy "jobs_owner_all" on public.jobs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "job_events_owner_all" on public.job_events;
create policy "job_events_owner_all" on public.job_events
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "projects_owner_all" on public.projects;
create policy "projects_owner_all" on public.projects
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "project_tasks_owner_all" on public.project_tasks;
create policy "project_tasks_owner_all" on public.project_tasks
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "resources_owner_all" on public.resources;
create policy "resources_owner_all" on public.resources
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "study_logs_owner_all" on public.study_logs;
create policy "study_logs_owner_all" on public.study_logs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── Grants ───────────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on all tables in schema public from anon;
