-- ==============================================================================
-- ThinkFaster Supabase Database Schema & Storage Setup
-- Requirements #77 - #86
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    category VARCHAR(255),
    project_type VARCHAR(100) DEFAULT 'Web Application',
    short_description TEXT,
    full_description TEXT,
    regular_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'THB',
    badge VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'coming_soon', 'hidden', 'archived'
    demo_url TEXT,
    video_type VARCHAR(50) DEFAULT 'youtube',
    video_url TEXT,
    cover_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    suitable_for JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    seo_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ
);

-- 4. Settings Table (Key-Value JSONB)
CREATE TABLE IF NOT EXISTS public.settings (
    id VARCHAR(50) PRIMARY KEY,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tracking Events Table (Realtime Analytics Funnel)
CREATE TABLE IF NOT EXISTS public.tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    project_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ==============================================================================
-- Row Level Security (RLS) Policies (Requirement #84, #86)
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Categories RLS:
-- Public can read active categories
CREATE POLICY "Public categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (is_active = true);

-- Authenticated Admin can perform all operations
CREATE POLICY "Admins have full access to categories" 
ON public.categories FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Projects RLS:
-- Public can only view published and coming_soon projects
CREATE POLICY "Published projects are viewable by everyone" 
ON public.projects FOR SELECT 
USING (status IN ('published', 'coming_soon'));

-- Authenticated Admin can do CRUD on all projects
CREATE POLICY "Admins have full access to projects" 
ON public.projects FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Settings RLS:
-- Public can read website settings
CREATE POLICY "Settings are viewable by everyone" 
ON public.settings FOR SELECT 
USING (true);

-- Authenticated Admin can update settings
CREATE POLICY "Admins can update settings" 
ON public.settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Tracking Events RLS:
-- Public can insert tracking events (dataLayer/conversion log)
CREATE POLICY "Anyone can insert tracking events" 
ON public.tracking_events FOR INSERT 
TO public 
WITH CHECK (true);

-- Authenticated Admin can read tracking stats
CREATE POLICY "Admins can view tracking events" 
ON public.tracking_events FOR SELECT 
TO authenticated 
USING (true);

-- ==============================================================================
-- Storage Bucket Setup for Project Images (Requirement #48)
-- ==============================================================================

-- Note: In Supabase Dashboard, create a public bucket named 'project-images'
-- Storage Policies:
-- 1. Public Read:
-- (bucket_id = 'project-images') FOR SELECT USING (true);
-- 2. Authenticated Upload:
-- (bucket_id = 'project-images') FOR INSERT TO authenticated WITH CHECK (true);
-- 3. Authenticated Delete:
-- (bucket_id = 'project-images') FOR DELETE TO authenticated USING (true);
