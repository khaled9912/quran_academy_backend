-- Supabase schema for Quran Academy backend

create table profiles (
  id uuid primary key,
  email text not null unique,
  role text not null check (role in ('student', 'teacher', 'admin')),
  full_name text,
  created_at timestamptz default now()
);

create table teachers (
  id serial primary key,
  name text not null,
  email text not null unique,
  subject text,
  created_at timestamptz default now()
);

create table courses (
  id serial primary key,
  title text not null,
  description text,
  teacher text,
  schedule text,
  default_capacity int default 25,
  created_at timestamptz default now()
);

create table sessions (
  id serial primary key,
  course_title text,
  teacher text,
  day text not null,
  time text not null,
  end_time text,
  room text,
  capacity int default 25,
  live_link text,
  created_at timestamptz default now()
);

create table enrollments (
  id serial primary key,
  student_id uuid references profiles(id),
  student_name text,
  course_id int references courses(id),
  course_title text,
  status text not null default 'active',
  enrolled_at timestamptz default now()
);

create table attendance (
  id serial primary key,
  enrollment_id int references enrollments(id),
  session_id int references sessions(id),
  status text not null check (status in ('present', 'absent', 'pending')) default 'pending',
  joined_link_clicked boolean default false,
  recorded_at timestamptz default now()
);

create table contact_messages (
  id serial primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);
