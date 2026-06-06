-- Supabase schema for Quran Academy backend
-- Full schema aligned with the proposed design.

create extension if not exists "pgcrypto";

-- Profiles (users)
create table if not exists profiles (
  id uuid primary key,
  email text not null unique,
  first_name text,
  last_name text,
  full_name text,
  role text not null check (role in ('super_admin','admin','teacher','student')) default 'student',
  phone text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Teachers, Students and Parents reference profiles (1:1)
create table if not exists teachers (
  id uuid primary key references profiles(id) on delete cascade,
  bio text,
  ijazah text,
  specialization text,
  hourly_rate numeric,
  status text,
  created_at timestamptz default now()
);

create table if not exists students (
  id uuid primary key references profiles(id) on delete cascade,
  age integer,
  gender text,
  level text,
  enrollment_date timestamptz default now()
);

create table if not exists parents (
  id uuid primary key references profiles(id) on delete cascade
);

create table if not exists parent_students (
  parent_id uuid references profiles(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  primary key (parent_id, student_id)
);

-- Courses and enrollment
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  teacher_id uuid references profiles(id),
  level text,
  category text,
  status text,
  max_students integer,
  created_at timestamptz default now()
);

create table if not exists course_students (
  course_id uuid references courses(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (course_id, student_id)
);

-- Sessions (course meetings)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  teacher_id uuid references profiles(id),
  title text,
  meeting_link text,
  meeting_provider text,
  start_time timestamptz,
  end_time timestamptz,
  status text,
  created_at timestamptz default now()
);

-- Attendance
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status text not null check (status in ('present','absent','late')),
  notes text,
  recorded_at timestamptz default now()
);

-- Assignments and submissions
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  file_url text,
  notes text,
  submitted_at timestamptz default now(),
  grade numeric,
  feedback text
);

-- Evaluations
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  teacher_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  memorization_score integer,
  tajweed_score integer,
  behavior_score integer,
  notes text,
  created_at timestamptz default now()
);

-- Invoices / payments
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  amount numeric,
  currency text default 'USD',
  status text check (status in ('paid','unpaid','overdue')),
  due_date timestamptz,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Contact messages (public)
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Audit logs (Super Admin activity logs)
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  action text not null,
  resource text not null,
  resource_id uuid,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table courses enable row level security;
alter table course_students enable row level security;
alter table sessions enable row level security;
alter table attendance enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table evaluations enable row level security;
alter table invoices enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- Helper: allow authenticated users to insert their profile row
create policy "Profiles: insert for authenticated" on profiles
  for insert using (auth.uid() IS NOT NULL) with check (auth.uid() IS NOT NULL);

create policy "Profiles: select own or admin/super_admin" on profiles
  for select using (
    auth.uid() = id 
    OR (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
  );

create policy "Profiles: update own or admin/super_admin" on profiles
  for update using (
    auth.uid() = id 
    OR (select role from profiles where id = auth.uid()) = 'super_admin'
    OR (
      (select role from profiles where id = auth.uid()) = 'admin'
      AND role NOT IN ('super_admin', 'admin') 
      AND (select role from profiles where id = id) NOT IN ('super_admin', 'admin')
    )
  )
  with check (
    auth.uid() = id 
    OR (select role from profiles where id = auth.uid()) = 'super_admin'
    OR (
      (select role from profiles where id = auth.uid()) = 'admin'
      AND role NOT IN ('super_admin', 'admin')
      AND (select role from profiles where id = id) NOT IN ('super_admin', 'admin')
    )
  );

create policy "Profiles: delete by super_admin" on profiles
  for delete using (
    (select role from profiles where id = auth.uid()) = 'super_admin'
  );

-- Courses: admins/super_admins can do anything; teachers can manage their courses; students can select if enrolled
create policy "Courses: select" on courses
  for select using (
    (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
    OR teacher_id = auth.uid()
    OR exists (select 1 from course_students cs where cs.course_id = courses.id and cs.student_id = auth.uid())
  );

create policy "Courses: insert by teacher or admin/super_admin" on courses
  for insert using (
    (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
    OR (select role from profiles where id = auth.uid()) = 'teacher'
  );

create policy "Courses: update/delete by teacher or admin/super_admin" on courses
  for update, delete using (
    (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
    OR teacher_id = auth.uid()
  );

-- Sessions: similar to courses
create policy "Sessions: select" on sessions
  for select using (
    (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
    OR teacher_id = auth.uid()
    OR exists (select 1 from course_students cs where cs.course_id = sessions.course_id and cs.student_id = auth.uid())
  );

create policy "Sessions: insert/update/delete" on sessions
  for insert, update, delete using (
    (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
    OR teacher_id = auth.uid()
  );

-- Attendance: teachers/admins/super_admins for records; students for own
create policy "Attendance: select" on attendance
  for select using (
    (select role from profiles where id = auth.uid()) in ('admin', 'super_admin', 'teacher')
    OR student_id = auth.uid()
  );

create policy "Attendance: insert/update by teacher or admin/super_admin" on attendance
  for insert, update using (
    (select role from profiles where id = auth.uid()) in ('admin', 'super_admin', 'teacher')
  );

-- Submissions: students can create their submission; teachers/admin/super_admin can view
create policy "Submissions: insert by student" on submissions
  for insert using (auth.uid() = student_id);

create policy "Submissions: select by owner/teacher/admin/super_admin" on submissions
  for select using (
    auth.uid() = student_id
    OR (select role from profiles where id = auth.uid()) in ('admin', 'super_admin', 'teacher')
  );

-- Notifications: users can see their notifications; admins/super_admins can manage
create policy "Notifications: select/insert/update by owner or admin/super_admin" on notifications
  for all using (
    user_id = auth.uid() 
    OR (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
  );

-- Invoices: student sees own, admin/super_admin can manage
create policy "Invoices: select" on invoices
  for select using (
    student_id = auth.uid() 
    OR (select role from profiles where id = auth.uid()) in ('admin', 'super_admin')
  );

-- Audit logs: select by super_admin only; insert by authenticated users/system
create policy "Audit logs: select by super_admin" on audit_logs
  for select using (
    (select role from profiles where id = auth.uid()) = 'super_admin'
  );

create policy "Audit logs: insert by authenticated" on audit_logs
  for insert with check (
    auth.uid() IS NOT NULL
  );

-- End of schema
