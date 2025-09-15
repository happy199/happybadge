#!/bin/bash

echo "🚀 Déploiement de HappyBadge..."

# Vérifier que nous sommes sur la branche main
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Vous devez être sur la branche main pour déployer"
    exit 1
fi

# Vérifier que le working directory est propre
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Le working directory n'est pas propre. Veuillez commiter vos changements."
    exit 1
fi

# Vérifier que les variables d'environnement sont définies
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN n'est pas défini"
    exit 1
fi

if [ -z "$VERCEL_ORG_ID" ]; then
    echo "❌ VERCEL_ORG_ID n'est pas défini"
    exit 1
fi

if [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "❌ VERCEL_PROJECT_ID n'est pas défini"
    exit 1
fi

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Construire l'application
echo "🔨 Construction de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction"
    exit 1
fi

# Déployer sur Vercel
echo "🌐 Déploiement sur Vercel..."
vercel --prod --token $VERCEL_TOKEN --scope $VERCEL_ORG_ID

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

echo "✅ Déploiement réussi !"
echo "🌐 Application disponible sur : https://happybadge.vercel.app"

