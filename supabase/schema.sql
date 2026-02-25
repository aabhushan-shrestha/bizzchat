-- ============================================================
-- BizChat Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('business', 'customer')),
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUSINESSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  UNIQUE(business_id, customer_id)
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL, -- references profiles OR bot UUID
  content TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER FORM CONFIGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_form_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  fields_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id)
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  address TEXT,
  phone TEXT,
  product_name TEXT,
  form_response_json JSONB,
  invoice_json JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created with an older schema
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS form_response_json JSONB;
-- Make old required columns nullable for flexibility
ALTER TABLE public.orders ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN address DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN product_name DROP NOT NULL;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_form_configs ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can see their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- BUSINESSES: owners can manage, all authenticated can view
DROP POLICY IF EXISTS "Business owners can manage their business" ON public.businesses;
CREATE POLICY "Business owners can manage their business"
  ON public.businesses FOR ALL
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Authenticated users can view businesses" ON public.businesses;
CREATE POLICY "Authenticated users can view businesses"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (true);

-- CONVERSATIONS: business owner or customer can see their own
DROP POLICY IF EXISTS "Conversation participants can view" ON public.conversations;
CREATE POLICY "Conversation participants can view"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = customer_id OR
    auth.uid() IN (
      SELECT owner_id FROM public.businesses WHERE id = business_id
    )
  );

DROP POLICY IF EXISTS "Customers can create conversations" ON public.conversations;
CREATE POLICY "Customers can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (
    auth.uid() = customer_id OR
    auth.uid() IN (
      SELECT owner_id FROM public.businesses WHERE id = business_id
    )
  );

-- MESSAGES: participants can read and write
DROP POLICY IF EXISTS "Conversation participants can view messages" ON public.messages;
CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE customer_id = auth.uid() OR
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Conversation participants can insert messages" ON public.messages;
CREATE POLICY "Conversation participants can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE customer_id = auth.uid() OR
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    )
  );

-- Allow bot messages (sender_id is the bot UUID)
DROP POLICY IF EXISTS "Bot messages can be inserted by business users" ON public.messages;
CREATE POLICY "Bot messages can be inserted by business users"
  ON public.messages FOR INSERT
  WITH CHECK (
    is_bot = true AND
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    )
  );

-- ORDERS: business owner can manage
DROP POLICY IF EXISTS "Business owners can view their orders" ON public.orders;
CREATE POLICY "Business owners can view their orders"
  ON public.orders FOR SELECT
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Business owners can create orders" ON public.orders;
CREATE POLICY "Business owners can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Business owners can update orders" ON public.orders;
CREATE POLICY "Business owners can update orders"
  ON public.orders FOR UPDATE
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

-- ORDERS: customer can view and insert their own
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can create their own orders" ON public.orders;
CREATE POLICY "Customers can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- ORDER FORM CONFIGS: public/authenticated read, business owner manage
DROP POLICY IF EXISTS "Authenticated users can view order form configs" ON public.order_form_configs;
CREATE POLICY "Authenticated users can view order form configs"
  ON public.order_form_configs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Business owners can manage their order form configs" ON public.order_form_configs;
CREATE POLICY "Business owners can manage their order form configs"
  ON public.order_form_configs FOR ALL
  USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

-- ============================================================
-- REALTIME: Enable for messages and conversations
-- ============================================================
BEGIN;
  -- Drop existing publication if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create new publication with required tables
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.messages, 
    public.conversations;
COMMIT;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
