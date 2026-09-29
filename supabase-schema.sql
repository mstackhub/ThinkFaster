-- ==============================================================================
-- ThinkFaster Supabase Database Schema, Storage & Initial Seed Data
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(100) PRIMARY KEY,
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
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id VARCHAR(100) REFERENCES public.categories(id) ON DELETE SET NULL,
    category VARCHAR(255),
    project_type VARCHAR(100) DEFAULT 'Web Application',
    short_description TEXT,
    full_description TEXT,
    regular_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'THB',
    badge VARCHAR(50),
    status VARCHAR(50) DEFAULT 'published',
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
    views INTEGER DEFAULT 0,
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
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors on rerun
DROP POLICY IF EXISTS "Enable all access for categories" ON public.categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;
CREATE POLICY "Enable all access for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for projects" ON public.projects;
DROP POLICY IF EXISTS "Published projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Admins have full access to projects" ON public.projects;
CREATE POLICY "Enable all access for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for settings" ON public.settings;
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Enable all access for settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for tracking_events" ON public.tracking_events;
DROP POLICY IF EXISTS "Anyone can insert tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can view tracking events" ON public.tracking_events;
CREATE POLICY "Enable all access for tracking_events" ON public.tracking_events FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Storage Bucket Setup for Project Images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public project-images viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Public project-images insert" ON storage.objects;
DROP POLICY IF EXISTS "Public project-images update" ON storage.objects;
DROP POLICY IF EXISTS "Public project-images delete" ON storage.objects;

CREATE POLICY "Public project-images viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-images');

CREATE POLICY "Public project-images insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Public project-images update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'project-images');

CREATE POLICY "Public project-images delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'project-images');

-- ==============================================================================
-- Seed Data: Categories
-- ==============================================================================
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-001', 'Booking System', 'booking-system', 'ระบบจองคิว จองห้องพัก และนัดหมายบริการออนไลน์', 1, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-002', 'E-Commerce', 'e-commerce', 'ระบบร้านค้าออนไลน์ สั่งซื้อสินค้า ตะกร้าสินค้า และแคตตาล็อก', 2, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-003', 'Restaurant', 'restaurant', 'ระบบร้านอาหาร สั่งอาหารผ่าน QR Code และเมนูดิจิทัล', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-004', 'Service Business', 'service-business', 'เว็บไซต์และระบบสำหรับธุรกิจบริการ ทำความสะอาด ซ่อมบำรุง', 4, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-005', 'Landing Page', 'landing-page', 'หน้าขายสินค้าและบริการหน้าเดียว Conversion สูง โหลดไว', 5, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-006', 'Corporate Website', 'corporate-website', 'เว็บไซต์องค์กร บริษัท ห้างหุ้นส่วน เพิ่มความน่าเชื่อถือ', 6, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-007', 'Portfolio', 'portfolio', 'เว็บไซต์โชว์ผลงาน ดีไซเนอร์ เอเจนซี ช่างภาพ ฟรีแลนซ์', 7, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-008', 'Internal System', 'internal-system', 'ระบบจัดการภายในองค์กร ระบบพนักงาน และแดชบอร์ดข้อมูล', 8, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-009', 'Business Tool', 'business-tool', 'เครื่องมือคำนวณราคา ใบเสนอราคา และแบบฟอร์มธุรกิจ', 9, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-010', 'Property', 'property', 'ระบบอสังหาริมทรัพย์ ฝากขาย-เช่า คอนโด บ้าน ที่ดิน', 10, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-011', 'Automotive', 'automotive', 'เว็บไซต์เต็นท์รถ ซื้อขายรถมือสอง ศูนย์บริการยานยนต์', 11, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-012', 'Healthcare & Beauty', 'healthcare-beauty', 'คลินิกความงาม ทันตกรรม แพทย์แผนไทย และศูนย์สุขภาพ', 12, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES ('cat-013', 'Education', 'education', 'สถาบันกวดวิชา คอร์สเรียนออนไลน์ และการอบรมสัมมนา', 13, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- ==============================================================================
-- Seed Data: Projects
-- ==============================================================================
INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-001', '001', 'ระบบจองคิวและจัดการตารางนัดหมายร้านสปา', 'spa-booking-system', 'cat-001', 'Booking System', 'Web Application',
  'ระบบจองคิวออนไลน์สำหรับร้านสปา ร้านนวด และเสริมความงาม เลือกรอบเวลา พนักงาน และแจ้งเตือนผ่าน LINE อัตโนมัติ', 'ระบบจองคิวร้านสปาและนวดเพื่อสุขภาพที่ออกแบบมาเพื่อลดปัญหานัดหมายซ้อนและยกระดับการให้บริการ ลูกค้าสามารถกดจองคิวได้เองตลอด 24 ชั่วโมงผ่านมือถือ เลือกแพ็กเกจบริการ เลือกระยะเวลานวด และเลือกพนักงานที่ต้องการได้อย่างแม่นยำ พร้อมระบบแจ้งเตือนไปยัง LINE OA ของร้านและลูกค้าทันทีเมื่อมีรายการจองใหม่

ฝั่งแอดมินมีปฏิทินจัดการคิวแบบ Real-time รองรับการเลื่อนนัด กดยืนยันคิว และดูสถิติลูกค้าย้อนหลังได้สะดวกสบาย ติดตั้งง่าย ไม่ต้องลงแอปพลิเคชันเพิ่มเติม', 2990, 1990, 'THB',
  'Recommended', 'published', 'https://spa-booking-demo.vercel.app', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["ระบบปฏิทินเลือกวันและเวลาว่างแบบ Real-time","ระบบเลือกแพ็กเกจสปาและบริการเสริม","ระบบเลือกระบุ therapist / ช่างนวดที่ต้องการ","ระบบแจ้งเตือนนัดหมายไปยัง LINE OA อัตโนมัติ","แดชบอร์ดสรุปยอดนัดหมายรายวันและรายเดือนสำหรับเจ้าของร้าน","รองรับการใช้งาน 100% บนมือถือ แท็บเล็ต และคอมพิวเตอร์"]'::jsonb, '["HTML5","Tailwind CSS","Vanilla JavaScript","Supabase","LINE Messaging API"]'::jsonb, '["ร้านสปาและนวดแผนไทย","คลินิกเสริมความงาม","ร้านทำเล็บและต่อขนตา","ร้านตัดผมและซาลอน","สตูดิโอโยคะ"]'::jsonb, 1, true,
  'ระบบจองคิวร้านสปาและซาลอนออนไลน์ | ThinkFaster', 'ระบบจองคิวร้านสปาและนวดออนไลน์ราคาพิเศษ ฿1,990 พร้อมทดลอง Demo จริง รองรับการแจ้งเตือนผ่าน LINE อัตโนมัติ', 528
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-002', '002', 'ระบบจัดการเมนู (เหมาะกับร้านค้าขนาดเล็ก)', 'mymenu-system', 'cat-003', 'Restaurant', 'Web Application',
  'ระบบเมนูดิจิทัลและจัดการเมนูสำหรับร้านค้าขนาดเล็ก ร้านอาหาร คาเฟ่ ออกแบบเมนูสวยงาม ปรับแต่งได้ตามใจชอบ', 'ระบบจัดการและสร้างเมนูอาหารออนไลน์ (Menu Builder) ที่ออกแบบมาเพื่อร้านค้าและร้านอาหารขนาดเล็กโดยเฉพาะ ปรับแต่งสี ธีม จัดเรียงหมวดหมู่เมนู และแสดงรูปภาพอาหารได้อย่างสวยงาม ลูกค้าเข้าถึงง่ายผ่านมือถือ

ช่วยประหยัดเวลาและงบประมาณในการพิมพ์เล่มเมนูใหม่เมื่อมีการปรับราคาหรือเพิ่มรายการอาหาร รองรับการตั้งค่าธีมและฟอนต์ที่หลากหลาย ใช้งานง่ายผ่านหน้าเว็บ', 3500, 2490, 'THB',
  'Best Seller', 'published', 'https://mymenu-seven.vercel.app/login', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'assets/images/mymenu-preview.png',
  '["assets/images/mymenu-preview.png","https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["สแกน QR Code ประจำโต๊ะ เปิดเมนูได้ทันทีโดยไม่ต้องโหลดแอป","ระบบตะกร้าสั่งอาหาร เลือกท็อปปิ้ง และระบุหมายเหตุพิเศษ","หน้าจอ Kitchen Display สำหรับเชฟในครัว อัปเดตสถานะจานต่อจาน","ระบบจัดการหมวดหมู่อาหาร เปิด-ปิดเมนูที่หมดได้ทันที","รองรับได้ทั้งโหมดชำระเงินที่เคาน์เตอร์ และสแกน QR พร้อมเพย์","รองรับภาษาไทยและภาษาอังกฤษสำหรับร้านที่รับนักท่องเที่ยว"]'::jsonb, '["HTML5","Tailwind CSS","JavaScript","Supabase Realtime"]'::jsonb, '["ร้านอาหารทุกประเภท","คาเฟ่และร้านกาแฟ","ร้านบุฟเฟต์/หมูกระทะ","ร้านนั่งชิลล์ / บาร์","ศูนย์อาหาร"]'::jsonb, 2, true,
  'ระบบเมนูออนไลน์ QR Code สั่งอาหารประจำโต๊ะ | ThinkFaster', 'ระบบเมนูร้านอาหารออนไลน์ สแกน QR สั่งอาหารจากโต๊ะ ลดงานพนักงาน เพิ่มยอดขาย ราคาเริ่มต้น ฿2,490 พร้อมใช้งาน', 1240
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-003', '003', 'เว็บไซต์โชว์รูมและจัดการสต็อกเต็นท์รถมือสอง', 'used-car-dealership-portal', 'cat-011', 'Automotive', 'Website',
  'เว็บไซต์เต็นท์รถมือสอง โชว์รูมรถยนต์ ค้นหาตามยี่ห้อ รุ่น ราคา พร้อมระบบคำนวณค่างวดผ่อน และปุ่มติดต่อเซลส์รวดเร็ว', 'แพลตฟอร์มเว็บไซต์สำหรับโชว์รูมรถยนต์มือสองและศูนย์บริการยานยนต์ ดีไซน์ระดับพรีเมียม ช่วยให้ลูกค้าค้นหารถในฝันได้อย่างสะดวกรวดเร็ว มีตัวกรองแยกตามยี่ห้อ (Toyota, Honda, Benz ฯลฯ) ปีจดทะเบียน เลขไมล์ เกียร์ และช่วงราคา

พร้อมฟีเจอร์คำนวณเงินดาวน์และค่างวดผ่อนชำระแบบ Interactive ลูกค้าสามารถทดลองใส่เงินดาวน์และจำนวนงวดเพื่อดูยอดผ่อนต่อเดือนได้ทันที และกดปุ่มติดต่อฝ่ายขายผ่าน LINE หรือโทรออกได้เพียงคลิกเดียว', 4900, 3290, 'THB',
  'Popular', 'published', 'https://usedcar-dealership-demo.vercel.app', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["แกลเลอรีรูปภาพรถยนต์ความคมชัดสูง รองรับภาพ 360 องศา","ฟิลเตอร์ค้นหารถละเอียด: ยี่ห้อ, รุ่น, ปี, ไมล์, ประเภทเกียร์, ราคา","ระบบคำนวณค่างวดและเงินดาวน์แบบคำนวณสดทันที (Loan Calculator)","Badge สถานะรถ: ''มาใหม่'', ''ลดราคาพิเศษ'', ''จองแล้ว'', ''ขายแล้ว''","ปุ่มนัดดูรถและทดลองขับ เชื่อมต่อเข้า LINE OA ของเซลส์ประจำคัน","แอดมินอัปเดตรถเข้า-ออก เพิ่มรูป ลบสต็อกได้จากมือถือ"]'::jsonb, '["HTML5","Tailwind CSS","JavaScript","Supabase"]'::jsonb, '["เต็นท์รถมือสอง","โชว์รูมรถยนต์นำเข้า","ร้านขายมอเตอร์ไซค์/บิ๊กไบค์","ธุรกิจเช่ารถยนต์"]'::jsonb, 3, true,
  'เว็บไซต์เต็นท์รถมือสองและโชว์รูมยานยนต์ | ThinkFaster', 'เว็บไซต์โชว์รูมรถมือสอง พร้อมระบบคำนวณค่างวดผ่อน และจัดการสต็อกรถ ดีไซน์ทันสมัย โหลดเร็ว ใช้งานง่าย', 845
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-004', '004', 'Landing Page บริษัทรับเหมาก่อสร้าง ออกแบบและรีโนเวท', 'construction-contractor-landing', 'cat-005', 'Landing Page', 'Landing Page',
  'หน้าเว็บ Landing Page ขายงานรับเหมาก่อสร้าง สร้างบ้าน และรีโนเวท ดีไซน์น่าเชื่อถือ โชว์ผลงานพร้อมฟอร์มประเมินราคา', 'Landing Page สไตล์มืออาชีพที่ออกแบบมาเพื่อปิดการขายงานบริการรับเหมาก่อสร้าง ออกแบบสถาปัตยกรรม และตกแต่งภายในโดยเฉพาะ โครงสร้างหน้าเว็บผ่านการคิดค้นมาเพื่อกระตุ้นความมั่นใจของลูกค้าเจ้าของบ้าน

ประกอบไปด้วย Hero Section ที่ทรงพลัง, แกลเลอรีผลงานแยกตามประเภทบ้านและอาคาร, ขั้นตอนการทำงานที่โปร่งใส, รีวิวและ Testimonial จากลูกค้าจริง พร้อมปุ่ม Call To Action กระตุ้นให้ลูกค้าส่งแปลนบ้านเพื่อประเมินราคาเบื้องต้นได้อย่างง่ายดาย', 2500, 1490, 'THB',
  'Special Price', 'published', 'https://construction-landing-demo.vercel.app', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["โครงสร้างหน้าเว็บเน้น Conversion Rate สำหรับปิดการขายงานรับเหมา","แกลเลอรีภาพผลงาน Before & After พร้อมคำบรรยายรายละเอียดโครงการ","แถบสถิติความน่าเชื่อถือ เช่น จำนวนโครงการที่สำเร็จ และใบอนุญาต","ส่วนแสดงขั้นตอนการทำงาน 5 ขั้นตอนสร้างความโปร่งใส","ปุ่มประเมินราคาเบื้องต้น ส่งเข้า LINE OA พร้อมแนบข้อมูลทันที","คะแนน Google PageSpeed สูงกว่า 95+ โหลดไวมาก"]'::jsonb, '["HTML5","Tailwind CSS","Vanilla JavaScript"]'::jsonb, '["บริษัทรับเหมาก่อสร้าง","สถาปนิกและมัณฑนากร","ทีมช่างรีโนเวทบ้าน","บริษัทติดตั้งโซลาร์เซลล์","บริการต่อเติมโรงรถ/ครัว"]'::jsonb, 4, true,
  'Landing Page บริษัทรับเหมาก่อสร้างและรีโนเวท | ThinkFaster', 'หน้าเว็บ Landing Page สำหรับธุรกิจรับเหมาก่อสร้าง ออกแบบสถาปัตยกรรม เพิ่มความน่าเชื่อถือและยอดทักไลน์ ฿1,490', 390
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-005', '005', 'เว็บไซต์ Portfolio & Case Study สำหรับ Creative Agency', 'creative-agency-portfolio', 'cat-007', 'Portfolio', 'Website',
  'เว็บไซต์นำเสนอผลงานระดับสากล สำหรับดีไซน์สตูดิโอ ดิจิทัลเอเจนซี และโปรดักชันเฮาส์ ดีไซน์มินิมอลโมเดิร์น', 'เว็บไซต์โชว์ผลงานและ Case Study ที่สะท้อนตัวตนความเป็นมืออาชีพระดับท็อป ออกแบบด้วยหลักการ Typography ที่ประณีต Grid System ที่ยืดหยุ่น และ Micro-interactions ที่ไหลลื่น

ช่วยให้เอเจนซีสามารถเล่าเรื่องราวความสำเร็จของโปรเจกต์ (Challenge, Solution, Result), แสดงรายชื่อลูกค้าแบรนด์ชั้นนำ, แนะนำทีมงาน และดึงดูดลูกค้าระดับองค์กรที่มองหาพาร์ตเนอร์สร้างสรรค์งาน', 3900, 2790, 'THB',
  'New', 'published', 'https://creative-agency-portfolio-demo.vercel.app', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["ระบบจัดหมวดหมู่ Case Study: Branding, Web Design, Marketing","หน้า Project Detail แบบเล่าเรื่องประกอบภาพและวิดีโออย่างมีชั้นเชิง","ส่วนแสดง Client Logos และรีวิวจากผู้บริหาร","หน้า About แนะนำทีมงาน วิสัยทัศน์ และรางวัลที่เคยได้รับ","Dark / Light Mode โทนสีมินิมอลสไตล์อินเตอร์","รองรับ SEO ขั้นสูง โครงสร้าง Schema Markup พร้อมแชร์ OG Card สวยงาม"]'::jsonb, '["HTML5","Tailwind CSS","JavaScript"]'::jsonb, '["Creative & Marketing Agency","Software House & Dev Studio","ช่างภาพ & โปรดักชันเฮาส์","ดีไซเนอร์ & ฟรีแลนซ์ระดับมืออาชีพ"]'::jsonb, 5, true,
  'เว็บไซต์ Portfolio & Case Study สำหรับ Creative Agency | ThinkFaster', 'เว็บไซต์ Portfolio และสตูดิโอผลงานระดับสากล ดีไซน์สะอาดทันสมัย ดึงดูดลูกค้าระดับองค์กร ราคา ฿2,790', 612
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-006', '006', 'ระบบ Booking นัดหมายแพทย์และคลินิกความงาม', 'medical-clinic-booking-portal', 'cat-012', 'Healthcare & Beauty', 'Web Application',
  'ระบบนัดหมายออนไลน์สำหรับคลินิกเวชกรรม ทันตกรรม และคลินิกผิวพรรณ เลือกรักษาตามแพทย์และสาขา พร้อมระบบเวชระเบียนเบื้องต้น', 'โซลูชันระบบบริหารการนัดหมายคนไข้สำหรับสถานพยาบาล คลินิกทันตกรรม และคลินิกความงาม ยกระดับมาตรฐานการให้บริการด้วยระบบนัดหมายที่แม่นยำ คนไข้สามารถเลือกสาขาที่สะดวก เลือกแพทย์ผู้เชี่ยวชาญ และระบุอาการหรือหัตถการที่ต้องการรับบริการได้ล่วงหน้า

ช่วยลดเวลารอคอยในคลินิก จัดการคิวแพทย์ในแต่ละห้องตรวจได้อย่างมีประสิทธิภาพ และลดอัตราการเบี้ยวนัด (No-show) ด้วยระบบส่งข้อความแจ้งเตือนผ่าน LINE อัตโนมัติก่อนถึงวันนัด 24 ชั่วโมง', 5500, 3890, 'THB',
  'Ready to Use', 'published', 'https://medical-clinic-booking-demo.vercel.app', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["ระบบเลือกสาขา และเลือกแพทย์เฉพาะทางตามห้องตรวจ","ระบบเลือกโปรแกรมรักษา: ทรีตเมนต์, เลเซอร์, จัดฟัน, ฉีดโบท็อกซ์","ปฏิทินแสดงรอบเวลาว่างที่อัปเดตแบบ Real-time ตามตารางเวรแพทย์","ระบบบันทึกประวัติผู้รับบริการและการแพ้ยาเบื้องต้นอย่างปลอดภัย","ระบบแจ้งเตือนเตือนวันนัดหมายล่วงหน้าผ่าน LINE อัตโนมัติ","หน้าจัดการตารางเวรแพทย์และห้องตรวจสำหรับพนักงานเคาน์เตอร์"]'::jsonb, '["HTML5","Tailwind CSS","JavaScript","Supabase PostgreSQL"]'::jsonb, '["คลินิกเวชกรรมและความงาม","คลินิกทันตกรรม","ศูนย์กายภาพบำบัด","คลินิกแพทย์แผนไทย/จีน","โรงพยาบาลสัตว์"]'::jsonb, 6, true,
  'ระบบจองคิวนัดหมายแพทย์และคลินิกความงาม | ThinkFaster', 'ระบบนัดหมายแพทย์และคลินิกความงาม ทันตกรรม จัดการคิวลดเวลาหน้าคลินิก แจ้งเตือนผ่าน LINE อัตโนมัติ ราคา ฿3,890', 475
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-007', '007', 'ระบบร้านค้าปลีก E-Commerce แคตตาล็อกและสั่งซื้อผ่านแชท', 'retail-catalog-chat-commerce', 'cat-002', 'E-Commerce', 'E-Commerce',
  'แคตตาล็อกสินค้าออนไลน์สำหรับแบรนด์และร้านค้าปลีก เลือกลาย สี ไซส์ และสรุปรายการส่งเข้า LINE หรือแชทเพื่อปิดการขาย', 'ระบบแคตตาล็อกและตะกร้าสรุปออเดอร์สำหรับร้านค้าปลีก แฟชั่น และสินค้าไลฟ์สไตล์ ออกแบบมาเพื่อร้านค้าที่ชอบปิดการขายทางแชท ลูกค้าเลือกหยิบสินค้าใส่ตะกร้า เลือกไซส์ สี และจำนวน จากนั้นระบบจะสร้างใบสรุปรายการสั่งซื้อพร้อมยอดเงิน แล้วส่งข้อความเข้าแชท LINE OA ของร้านได้ทันที

ช่วยลดเวลาการตอบคำถามซ้ำๆ ลูกค้าเห็นภาพสินค้าและราคาครบถ้วน ชัดเจน และสั่งซื้อได้อย่างราบรื่น', 2900, 1890, 'THB',
  'Popular', 'published', 'https://retail-catalog-demo.vercel.app', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["ระบบแคตตาล็อกสินค้าพร้อมตัวกรองหมวดหมู่และค้นหา","ตัวเลือกสินค้าหลายรูปแบบ: สี, ไซส์, ขนาดบรรจุ","ตะกร้าสินค้าชั่วคราวและสรุปยอดคำนวณราคาอัตโนมัติ","ระบบส่งต่อสรุปรายการเข้า LINE OA ของร้านค้าในคลิกเดียว","ระบบจัดการสต็อกสินค้าและราคาจากหลังบ้าน"]'::jsonb, '["HTML5","Tailwind CSS","JavaScript","LocalStorage","Supabase"]'::jsonb, '["ร้านค้าเสื้อผ้าและแฟชั่น","ร้านขายของแต่งบ้าน","ร้านขายเครื่องประดับ","ร้านขายอุปกรณ์แคมป์ปิ้ง"]'::jsonb, 7, false,
  'ระบบแคตตาล็อกสินค้าออนไลน์สั่งซื้อผ่านแชท | ThinkFaster', 'แคตตาล็อกสินค้าออนไลน์ สรุปออเดอร์ส่งตรงเข้า LINE ปิดการขายง่าย ไม่ต้องง้อระบบตะกร้าซับซ้อน ราคา ฿1,890', 310
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

INSERT INTO public.projects (
  id, code, name, slug, category_id, category, project_type,
  short_description, full_description, regular_price, sale_price, currency,
  badge, status, demo_url, video_type, video_url, cover_image,
  gallery, features, technologies, suitable_for, sort_order, is_featured,
  seo_title, meta_description, views
) VALUES (
  'proj-008', '008', 'ระบบจัดการทรัพย์และเว็บไซต์ฝากขาย-เช่าอสังหาริมทรัพย์', 'real-estate-property-portal', 'cat-010', 'Property', 'Web Application',
  'ระบบค้นหาคอนโด บ้าน ที่ดิน ฟิลเตอร์ตามทำเล แนวรถไฟฟ้า ราคา พร้อมแบบฟอร์มส่งข้อมูลฝากขายสำหรับเอเจนต์', 'ระบบบริหารจัดการทรัพย์และเว็บไซต์สำหรับนายหน้าและบริษัทอสังหาริมทรัพย์ ลูกค้าสามารถค้นหาบ้านเดี่ยว ทาวน์โฮม และคอนโดมิเนียมตามทำเล แนวรถไฟฟ้า BTS/MRT หรือช่วงราคาที่ต้องการ พร้อมระบบฟอร์มรับฝากขาย/ให้เช่าที่เชื่อมต่อเข้าแอดมินโดยตรง', 4500, NULL, 'THB',
  'Coming Soon', 'coming_soon', '', 'youtube', '', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"]'::jsonb, '["ระบบค้นหาและฟิลเตอร์อสังหาฯ แยกตามทำเล รถไฟฟ้า และประเภททรัพย์","หน้าแสดงรายละเอียดทรัพย์ สิ่งอำนวยความสะดวก และแผนที่","ระบบคำนวณสินเชื่อบ้านเบื้องต้น","ฟอร์มฝากทรัพย์สำหรับเจ้าของบ้านและผู้เช่า"]'::jsonb, '["HTML5","Tailwind CSS","JavaScript","Supabase"]'::jsonb, '["นายหน้าอสังหาริมทรัพย์","บริษัทพัฒนาอสังหาริมทรัพย์","ผู้ปล่อยเช่าคอนโด"]'::jsonb, 8, false,
  'ระบบเว็บอสังหาริมทรัพย์และฝากขายเช่าคอนโด | ThinkFaster', 'เว็บไซต์และระบบจัดการอสังหาริมทรัพย์สำหรับเอเจนต์และผู้ปล่อยเช่า ค้นหาตามรถไฟฟ้า BTS/MRT', 780
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  project_type = EXCLUDED.project_type,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  currency = EXCLUDED.currency,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  demo_url = EXCLUDED.demo_url,
  video_type = EXCLUDED.video_type,
  video_url = EXCLUDED.video_url,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  features = EXCLUDED.features,
  technologies = EXCLUDED.technologies,
  suitable_for = EXCLUDED.suitable_for,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  views = EXCLUDED.views;

-- ==============================================================================
-- Seed Data: Settings
-- ==============================================================================
INSERT INTO public.settings (id, setting_value, updated_at)
VALUES ('main', '{"general":{"site_name":"ThinkFaster","site_tagline":"แหล่งรวมระบบเว็บไซต์และเว็บแอปพลิเคชันสำเร็จรูปพร้อมใช้งาน","site_description":"เลือกดูระบบที่ต้องการ ทดลองใช้งาน Demo จริง และสั่งซื้อเพื่อเริ่มต้นธุรกิจได้ทันที ติดตั้งง่าย ปรับแต่งได้ตามความต้องการ","logo_text":"ThinkFaster","logo_badge":"Store","primary_color":"#2563EB","default_og_image":"https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80","currency":"THB","footer_text":"แพลตฟอร์มศูนย์รวมระบบเว็บไซต์และเว็บแอปพลิเคชันสำเร็จรูป ออกแบบด้วยมาตรฐานระดับสากล ใช้งานง่าย โหลดไว พร้อมต่อยอดธุรกิจของคุณให้เติบโตอย่างมั่นคง","copyright":"© 2026 ThinkFaster. All rights reserved."},"hero":{"title":"เว็บไซต์และระบบพร้อมใช้งาน\nสำหรับธุรกิจของคุณ","subtitle":"เลือกดูระบบที่ต้องการ ทดลองใช้งานจริงผ่าน Demo และสอบถามราคาเพื่อเริ่มใช้งานได้ทันที ไม่ต้องรอสร้างใหม่จากศูนย์","cta_primary_text":"ดูระบบทั้งหมด","cta_primary_url":"projects.html","cta_secondary_text":"ติดต่อสอบถาม","cta_secondary_url":"contact.html","badge_text":"⚡ ระบบสำเร็จรูปพร้อมส่งมอบใน 24-48 ชม."},"contacts":{"line":{"enabled":true,"id":"@thinkfaster","url":"https://line.me/ti/p/@thinkfaster","label":"LINE Official Account"},"messenger":{"enabled":true,"url":"https://m.me/thinkfasterapp","label":"Facebook Messenger"},"phone":{"enabled":true,"number":"0812345678","display":"081-234-5678","label":"โทรศัพท์สายด่วน"},"facebook":{"enabled":true,"url":"https://facebook.com/thinkfasterapp","label":"Facebook Page"},"email":{"enabled":true,"address":"contact@thinkfaster.dev","label":"Email"},"tiktok":{"enabled":false,"url":"https://tiktok.com/@thinkfaster","label":"TikTok"},"business_hours":"จันทร์ - อาทิตย์: 09:00 - 21:00 น."},"order_template":"Code: {{project_code}}\nProject Name: {{project_name}}\nราคา: {{price}} บาท\nDemo: {{demo_url}}\n\nสนใจสั่งซื้อระบบนี้ครับ/ค่ะ","tracking":{"gtm_id":"","ga4_id":"","meta_pixel_id":"","tiktok_pixel_id":"","enable_ga4":false,"enable_meta_pixel":false,"enable_tiktok_pixel":false},"supabase":{"url":"https://pmmuylosdqklzsuczqrv.supabase.co","anon_key":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbXV5bG9zZHFrbHpzdWN6cXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzI5MzQsImV4cCI6MjEwNjI0ODkzNH0.rYjG_2jBn6uABFpcqglxV3Jv56WQiDUhtM-Vl1Bf6tA"}}'::jsonb, now())
ON CONFLICT (id) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();
