-- Seed data for Quran Academy
-- Replace passwords/tokens with real values when importing into production.

-- Profiles
insert into profiles (id, email, full_name, role, phone)
values
  ('00000000-0000-0000-0000-000000000001','admin@example.com','Admin User','admin','+10000000001'),
  ('00000000-0000-0000-0000-000000000002','teacher@example.com','Teacher One','teacher','+10000000002'),
  ('00000000-0000-0000-0000-000000000003','student@example.com','Student One','student','+10000000003'),
  ('00000000-0000-0000-0000-000000000004','parent@example.com','Parent One','parent','+10000000004')
on conflict do nothing;

-- Teacher profile
insert into teachers (id, bio, ijazah, specialization, hourly_rate, status)
values
  ('00000000-0000-0000-0000-000000000002','Experienced Quran teacher','Ijazah Data','Tajweed',50,'active')
on conflict do nothing;

-- Student profile
insert into students (id, age, gender, level)
values
  ('00000000-0000-0000-0000-000000000003',10,'male','beginner')
on conflict do nothing;

-- Parent link
insert into parent_students (parent_id, student_id)
values
  ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000003')
on conflict do nothing;

-- Course
insert into courses (id, title, description, teacher_id, level, category, status, max_students)
values
  ('10000000-0000-0000-0000-000000000001','Quran Memorization','Memorize selected surahs','00000000-0000-0000-0000-000000000002','all','Quran','active',20)
on conflict do nothing;

-- Enroll student in course
insert into course_students (course_id, student_id)
values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003')
on conflict do nothing;

-- Session
insert into sessions (id, course_id, teacher_id, title, meeting_link, meeting_provider, start_time, end_time, status)
values
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Session 1','https://meet.example/abc','zoom', now() + interval '1 day', now() + interval '1 day' + interval '1 hour','scheduled')
on conflict do nothing;

-- Assignment
insert into assignments (id, course_id, title, description, due_date, created_by)
values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Memorization Homework','Recite page 1-5', now() + interval '7 days','00000000-0000-0000-0000-000000000002')
on conflict do nothing;

-- Submission
insert into submissions (id, assignment_id, student_id, file_url, notes, submitted_at, grade)
values
  ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','https://storage.example/submission1.mp3','First attempt', now(), null)
on conflict do nothing;

-- Invoice
insert into invoices (id, student_id, amount, currency, status, due_date)
values
  ('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003',100,'USD','unpaid', now() + interval '30 days')
on conflict do nothing;

-- Notification example
insert into notifications (id, user_id, title, message)
values
  ('60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','Welcome','Welcome to the Quran Academy')
on conflict do nothing;

-- End seed
