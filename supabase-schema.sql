-- HappyBadge Database Schema
-- Exécuter ces requêtes dans l'éditeur SQL de Supabase

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (étend la table auth.users de Supabase)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT NOT NULL,
  logo_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  settings JSONB DEFAULT '{}',
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants
CREATE TABLE public.participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  custom_data JSONB DEFAULT '{}',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges
CREATE TABLE public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  participant_email TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  template_id TEXT NOT NULL,
  generated_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des templates de badges
CREATE TABLE public.badge_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  type TEXT DEFAULT 'default' CHECK (type IN ('default', 'premium', 'custom')),
  config JSONB NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des analytics
CREATE TABLE public.analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('page_view', 'badge_generated', 'badge_downloaded', 'participant_registered')),
  data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_participants_event_id ON public.participants(event_id);
CREATE INDEX idx_badges_event_id ON public.badges(event_id);
CREATE INDEX idx_analytics_event_id ON public.analytics(event_id);
CREATE INDEX idx_analytics_type ON public.analytics(type);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs : ils ne peuvent voir que leur propre profil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour les événements : les utilisateurs ne peuvent voir que leurs événements
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- Politique pour les participants : accès public en lecture pour les événements actifs
CREATE POLICY "Public can view participants for active events" ON public.participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = participants.event_id 
      AND events.status = 'active'
    )
  );

-- Politique pour les badges : accès public en lecture pour les événements actifs
CREATE POLICY "Public can view badges for active events" ON public.badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = badges.event_id 
      AND events.status = 'active'
    )
  );

-- Politique pour les analytics : les utilisateurs peuvent voir les analytics de leurs événements
CREATE POLICY "Users can view analytics for own events" ON public.analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = analytics.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Insérer des templates de badges par défaut
INSERT INTO public.badge_templates (name, preview_url, type, config, is_premium) VALUES
('Classique', '/templates/classic-preview.png', 'default', '{"background": "#3B82F6", "textColor": "#FFFFFF", "fontSize": 24}', false),
('Moderne', '/templates/modern-preview.png', 'default', '{"background": "#10B981", "textColor": "#FFFFFF", "fontSize": 22}', false),
('Élégant', '/templates/elegant-preview.png', 'default', '{"background": "#8B5CF6", "textColor": "#FFFFFF", "fontSize": 26}', false),
('Vibrant', '/templates/vibrant-preview.png', 'default', '{"background": "#F59E0B", "textColor": "#FFFFFF", "fontSize": 20}', false),
('Minimaliste', '/templates/minimal-preview.png', 'default', '{"background": "#6B7280", "textColor": "#FFFFFF", "fontSize": 18}', false);

-- Fonction pour créer un utilisateur automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
