# Supabase Setup Guide for FlowTime

Follow these steps to set up the backend for the FlowTime staff management SaaS.

## 1. Create a Supabase Project
1. Go to [database.new](https://database.new) (Supabase Dashboard).
2. Create a new project named **flowtime**.
3. Set a strong database password and store it securely.
4. Choose the region closest to your users (e.g., Central Europe for Belgium).

## 2. Initialize the Database Schema
Open the **SQL Editor** in the Supabase sidebar and paste the following script to create tables, enums, and indexes.

```sql
-- 1. Create Custom Enums
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE status_type AS ENUM ('student', 'volunteer', 'extra');
CREATE TYPE shift_status AS ENUM ('pending', 'validated', 'rejected');

-- 2. Create Tables
-- Profiles table (extending auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'employee' NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  national_number TEXT,
  iban TEXT,
  hourly_rate DECIMAL(10,2),
  status_type status_type DEFAULT 'extra' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Shifts table
CREATE TABLE shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 0 NOT NULL,
  status shift_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Availabilities table
CREATE TABLE availabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE,
  start_time TIME,
  end_time TIME,
  recurring BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Info Pages table
CREATE TABLE info_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER DEFAULT 0 NOT NULL
);

-- Contracts table
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_url TEXT,
  pdf_url TEXT
);

-- 3. Create Indexes for Performance
CREATE INDEX idx_shifts_user_id ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_availabilities_user_id ON availabilities(user_id);
CREATE INDEX idx_contracts_user_id ON contracts(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
```

## 3. Set Up RLS Policies
Paste the following in the **SQL Editor** to secure your data.

```sql
-- Helper function to check if the user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users Policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (is_admin());

-- Shifts Policies
CREATE POLICY "Users can view their own shifts" ON shifts FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can insert their own shifts" ON shifts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all shifts" ON shifts FOR ALL USING (is_admin());

-- Availabilities Policies
CREATE POLICY "Users can manage their own availabilities" ON availabilities FOR ALL USING (user_id = auth.uid() OR is_admin());

-- Info Pages Policies
CREATE POLICY "Everyone can view info pages" ON info_pages FOR SELECT USING (true);
CREATE POLICY "Admins can manage info pages" ON info_pages FOR ALL USING (is_admin());

-- Contracts Policies
CREATE POLICY "Users can view their own contracts" ON contracts FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can manage all contracts" ON contracts FOR ALL USING (is_admin());
```

## 4. Get API Keys
1. Go to **Project Settings** (gear icon) -> **API**.
2. Copy the **Project URL**.
3. Copy the **anon public** key.
4. Copy the **service_role** key (secret!).
5. Paste these into your `.env.local` file in the project root.

---

> [!TIP]
> To automatically create a profile in the `users` table when someone signs up, consider adding a database trigger on the `auth.users` table.
