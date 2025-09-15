# HappyBadge - Plateforme SaaS de Génération de Badges Événementiels

## 🎯 Description

HappyBadge est une plateforme SaaS permettant aux organisateurs d'événements de créer facilement des générateurs de badges personnalisés "J'y serai" pour leurs participants. La solution intègre la gestion d'événements, la billetterie et les analytics dans une seule plateforme.

## ✨ Fonctionnalités Principales

### Version Gratuite (MVP)
- ✅ Système d'authentification utilisateur
- ✅ Création et gestion d'événements basiques
- ✅ Générateur de badges avec 5 templates prédéfinis
- ✅ Upload photo + génération automatique badge
- ✅ Téléchargement badge PNG 1080x1080
- ✅ Page publique événement avec formulaire génération
- ✅ Analytics basiques (vues, badges générés)
- ✅ Limitation version gratuite (1 événement, 100 badges/mois)

### Version Payante (Pro)
- 🔄 Gestion abonnements et paiements (Stripe)
- 🔄 Événements illimités
- 🔄 Templates personnalisables + upload designs
- 🔄 Collecte données étendues
- 🔄 Billetterie intégrée
- 🔄 Analytics avancés + export CSV
- 🔄 Intégration emailing basique
- 🔄 Personnalisation branding

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Shadcn-ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Paiements**: Stripe
- **Email**: Resend
- **Déploiement**: Vercel

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+ 
- Compte Supabase
- Compte Stripe (pour les paiements)
- Compte Resend (pour les emails)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd happybadge
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
Copiez le fichier `env.example` vers `.env.local` et remplissez les valeurs :

```bash
cp env.example .env.local
```

Variables requises :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email
RESEND_API_KEY=your_resend_api_key
```

### 4. Configuration Supabase

#### Créer les tables
Exécutez les requêtes SQL suivantes dans votre dashboard Supabase :

```sql
-- Table des utilisateurs
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location TEXT NOT NULL,
  logo_url TEXT,
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  custom_data JSONB,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_email TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  template_id TEXT NOT NULL,
  generated_image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des templates de badges
CREATE TABLE badge_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  type TEXT DEFAULT 'default',
  config JSONB NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des analytics
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_participants_event_id ON participants(event_id);
CREATE INDEX idx_badges_event_id ON badges(event_id);
CREATE INDEX idx_analytics_event_id ON analytics(event_id);
```

#### Configurer les politiques RLS (Row Level Security)
```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les événements
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les événements publics (lecture seule)
CREATE POLICY "Public can view active events" ON events
  FOR SELECT USING (status = 'active');

-- Politiques pour les participants
CREATE POLICY "Anyone can create participants" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Event owners can view participants" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = participants.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Politiques pour les badges
CREATE POLICY "Anyone can create badges" ON badges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Event owners can view badges" ON badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = badges.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Politiques pour les analytics
CREATE POLICY "Anyone can create analytics" ON analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Event owners can view analytics" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = analytics.event_id 
      AND events.user_id = auth.uid()
    )
  );
```

### 5. Lancer le projet
```bash
npm run dev
```

Le projet sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js App Router
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Dashboard organisateur
│   ├── event/[slug]/      # Pages publiques d'événements
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── ui/               # Composants UI de base (Shadcn-ui)
│   └── providers/        # Providers React (Auth, etc.)
├── hooks/                # Hooks React personnalisés
├── lib/                  # Utilitaires et configuration
│   ├── database.types.ts # Types TypeScript pour Supabase
│   ├── supabase.ts       # Configuration Supabase
│   └── utils.ts          # Fonctions utilitaires
└── types/                # Types TypeScript globaux
```

## 🎨 Templates de Badges

Le système inclut 5 templates prédéfinis :
1. **Classique** - Design épuré avec logo événement
2. **Moderne** - Style contemporain avec gradients
3. **Élégant** - Design sophistiqué pour événements corporate
4. **Festif** - Style coloré pour festivals et événements fun
5. **Minimaliste** - Design simple et efficace

## 📊 Analytics Disponibles

### Version Gratuite
- Nombre de vues de la page événement
- Nombre de badges générés
- Statistiques de base par événement

### Version Payante
- Analytics détaillés par participant
- Export CSV des données
- Graphiques de performance
- Suivi des conversions
- Métriques de partage sur réseaux sociaux

## 🔒 Sécurité et Conformité

- **RGPD** : Conformité complète avec gestion des données personnelles
- **Authentification** : Système sécurisé avec Supabase Auth
- **Paiements** : Stripe pour la sécurité des transactions
- **RLS** : Row Level Security sur toutes les tables Supabase
- **Validation** : Validation côté client et serveur

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Autres plateformes
Le projet peut être déployé sur toute plateforme supportant Next.js :
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📈 Roadmap

### Phase 1 - MVP (Mois 1-3) ✅
- [x] Architecture technique de base
- [x] Interface organisateur simplifiée
- [x] Générateur de badges avec templates fixes
- [x] Page publique de génération
- [x] Analytics basiques

### Phase 2 - Version Commerciale (Mois 4-6) 🔄
- [ ] Système d'abonnements et paiements
- [ ] Templates personnalisables
- [ ] Billetterie intégrée
- [ ] Analytics avancés
- [ ] Système d'emailing

### Phase 3 - Scale & Intégrations (Mois 7-12) 📋
- [ ] Multi-billetterie avec codes promo
- [ ] API publique
- [ ] White-label complet
- [ ] Gestion multi-organisateurs
- [ ] Intégrations CRM

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@happybadge.fr
- 💬 Discord : [Serveur Discord](https://discord.gg/happybadge)
- 📖 Documentation : [docs.happybadge.fr](https://docs.happybadge.fr)

---

**HappyBadge** - Simplifiez la création de badges événementiels ! 🎉

