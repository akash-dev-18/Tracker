export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "todo" | "attempted" | "solved" | "needs_revision";
export type ReviewRating = "again" | "hard" | "good" | "easy";
export type JobStatus =
  | "wishlist"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted"
  | "withdrawn";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type PriorityLevel = "low" | "medium" | "high";
export type ProjectStatus = "idea" | "active" | "paused" | "done" | "archived";
export type TaskStatus = "todo" | "doing" | "done";
export type ResourceType = "article" | "video" | "course" | "book" | "docs" | "other";

export type Profile = {
  id: string;
  display_name: string | null;
  daily_goal: number;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  user_id: string;
  title: string;
  url: string | null;
  platform: string | null;
  difficulty: QuestionDifficulty | null;
  status: QuestionStatus;
  topic_id: string | null;
  notes: string | null;
  code: string | null;
  language: string | null;
  tags: string[];
  starred: boolean;
  solved_at: string | null;
  next_review_at: string | null;
  review_interval: number;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  question_id: string;
  rating: ReviewRating;
  reviewed_at: string;
  interval_before: number;
  interval_after: number;
};

export type Job = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  url: string | null;
  status: JobStatus;
  location: string | null;
  work_mode: WorkMode | null;
  salary_range: string | null;
  source: string | null;
  applied_at: string | null;
  follow_up_at: string | null;
  resume_version: string | null;
  contact_name: string | null;
  contact_email: string | null;
  priority: PriorityLevel;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type JobEvent = {
  id: string;
  user_id: string;
  job_id: string;
  type: string;
  note: string | null;
  happened_at: string;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  summary: string | null;
  repo_url: string | null;
  live_url: string | null;
  status: ProjectStatus;
  tech: string[];
  priority: PriorityLevel;
  started_at: string | null;
  target_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectTask = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Resource = {
  id: string;
  user_id: string;
  title: string;
  url: string | null;
  type: ResourceType;
  tags: string[];
  notes: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
};

export type StudyLog = {
  id: string;
  user_id: string;
  log_date: string;
  minutes: number;
  questions_solved: number;
  note: string | null;
  created_at: string;
};

type TableDefinitions = {
  profiles: {
    Row: Profile;
    Insert: {
      id: string;
      display_name?: string | null;
      daily_goal?: number;
      timezone?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      display_name?: string | null;
      daily_goal?: number;
      timezone?: string;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  topics: {
    Row: Topic;
    Insert: {
      id?: string;
      user_id: string;
      name: string;
      parent_id?: string | null;
      color?: string | null;
      sort_order?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      name?: string;
      parent_id?: string | null;
      color?: string | null;
      sort_order?: number;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "topics_parent_id_fkey";
        columns: ["parent_id"];
        isOneToOne: false;
        referencedRelation: "topics";
        referencedColumns: ["id"];
      },
    ];
  };
  questions: {
    Row: Question;
    Insert: {
      id?: string;
      user_id: string;
      title: string;
      url?: string | null;
      platform?: string | null;
      difficulty?: QuestionDifficulty | null;
      status?: QuestionStatus;
      topic_id?: string | null;
      notes?: string | null;
      code?: string | null;
      language?: string | null;
      tags?: string[];
      starred?: boolean;
      solved_at?: string | null;
      next_review_at?: string | null;
      review_interval?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      title?: string;
      url?: string | null;
      platform?: string | null;
      difficulty?: QuestionDifficulty | null;
      status?: QuestionStatus;
      topic_id?: string | null;
      notes?: string | null;
      code?: string | null;
      language?: string | null;
      tags?: string[];
      starred?: boolean;
      solved_at?: string | null;
      next_review_at?: string | null;
      review_interval?: number;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "questions_topic_id_fkey";
        columns: ["topic_id"];
        isOneToOne: false;
        referencedRelation: "topics";
        referencedColumns: ["id"];
      },
    ];
  };
  reviews: {
    Row: Review;
    Insert: {
      id?: string;
      user_id: string;
      question_id: string;
      rating: ReviewRating;
      reviewed_at?: string;
      interval_before?: number;
      interval_after?: number;
    };
    Update: {
      id?: string;
      user_id?: string;
      question_id?: string;
      rating?: ReviewRating;
      reviewed_at?: string;
      interval_before?: number;
      interval_after?: number;
    };
    Relationships: [
      {
        foreignKeyName: "reviews_question_id_fkey";
        columns: ["question_id"];
        isOneToOne: false;
        referencedRelation: "questions";
        referencedColumns: ["id"];
      },
    ];
  };
  jobs: {
    Row: Job;
    Insert: {
      id?: string;
      user_id: string;
      company: string;
      role: string;
      url?: string | null;
      status?: JobStatus;
      location?: string | null;
      work_mode?: WorkMode | null;
      salary_range?: string | null;
      source?: string | null;
      applied_at?: string | null;
      follow_up_at?: string | null;
      resume_version?: string | null;
      contact_name?: string | null;
      contact_email?: string | null;
      priority?: PriorityLevel;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      company?: string;
      role?: string;
      url?: string | null;
      status?: JobStatus;
      location?: string | null;
      work_mode?: WorkMode | null;
      salary_range?: string | null;
      source?: string | null;
      applied_at?: string | null;
      follow_up_at?: string | null;
      resume_version?: string | null;
      contact_name?: string | null;
      contact_email?: string | null;
      priority?: PriorityLevel;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  job_events: {
    Row: JobEvent;
    Insert: {
      id?: string;
      user_id: string;
      job_id: string;
      type?: string;
      note?: string | null;
      happened_at?: string;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      job_id?: string;
      type?: string;
      note?: string | null;
      happened_at?: string;
      created_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "job_events_job_id_fkey";
        columns: ["job_id"];
        isOneToOne: false;
        referencedRelation: "jobs";
        referencedColumns: ["id"];
      },
    ];
  };
  projects: {
    Row: Project;
    Insert: {
      id?: string;
      user_id: string;
      name: string;
      summary?: string | null;
      repo_url?: string | null;
      live_url?: string | null;
      status?: ProjectStatus;
      tech?: string[];
      priority?: PriorityLevel;
      started_at?: string | null;
      target_date?: string | null;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      name?: string;
      summary?: string | null;
      repo_url?: string | null;
      live_url?: string | null;
      status?: ProjectStatus;
      tech?: string[];
      priority?: PriorityLevel;
      started_at?: string | null;
      target_date?: string | null;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  project_tasks: {
    Row: ProjectTask;
    Insert: {
      id?: string;
      user_id: string;
      project_id: string;
      title: string;
      status?: TaskStatus;
      due_date?: string | null;
      sort_order?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      project_id?: string;
      title?: string;
      status?: TaskStatus;
      due_date?: string | null;
      sort_order?: number;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "project_tasks_project_id_fkey";
        columns: ["project_id"];
        isOneToOne: false;
        referencedRelation: "projects";
        referencedColumns: ["id"];
      },
    ];
  };
  resources: {
    Row: Resource;
    Insert: {
      id?: string;
      user_id: string;
      title: string;
      url?: string | null;
      type?: ResourceType;
      tags?: string[];
      notes?: string | null;
      is_read?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      title?: string;
      url?: string | null;
      type?: ResourceType;
      tags?: string[];
      notes?: string | null;
      is_read?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  study_logs: {
    Row: StudyLog;
    Insert: {
      id?: string;
      user_id: string;
      log_date?: string;
      minutes?: number;
      questions_solved?: number;
      note?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      log_date?: string;
      minutes?: number;
      questions_solved?: number;
      note?: string | null;
      created_at?: string;
    };
    Relationships: [];
  };
};

export type Database = {
  public: {
    Tables: TableDefinitions;
    Views: Record<string, never>;
    Functions: {
      seed_default_topics: {
        Args: { uid: string };
        Returns: undefined;
      };
    };
    Enums: {
      question_difficulty: QuestionDifficulty;
      question_status: QuestionStatus;
      review_rating: ReviewRating;
      job_status: JobStatus;
      work_mode: WorkMode;
      priority_level: PriorityLevel;
      project_status: ProjectStatus;
      task_status: TaskStatus;
      resource_type: ResourceType;
    };
    CompositeTypes: Record<string, never>;
  };
};
