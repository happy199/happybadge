#!/bin/bash

echo "🎉 Configuration de HappyBadge..."
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ avant de continuer."
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ requise. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées"

# Copier le fichier d'environnement
if [ ! -f ".env.local" ]; then
    echo "📝 Création du fichier .env.local..."
    cp env.example .env.local
    echo "✅ Fichier .env.local créé"
    echo "⚠️  N'oubliez pas de configurer vos variables d'environnement dans .env.local"
else
    echo "✅ Fichier .env.local existe déjà"
fi

# Vérifier les types TypeScript
echo "🔍 Vérification des types TypeScript..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Des erreurs TypeScript ont été détectées"
else
    echo "✅ Types TypeScript vérifiés"
fi

echo ""
echo "🚀 Configuration terminée !"
echo ""
echo "Prochaines étapes :"
echo "1. Configurez vos variables d'environnement dans .env.local"
echo "2. Configurez votre base de données Supabase (voir README.md)"
echo "3. Lancez le projet avec : npm run dev"
echo ""
echo "📖 Documentation complète : README.md"
echo "🌐 Application : http://localhost:3000"
echo ""
echo "Bon développement ! 🎨"

