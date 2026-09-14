# Kabro shop 🛍️

Boutique e-commerce moderne conçue avec **Next.js (App Router)**, **React**, **TypeScript** et **Tailwind CSS**. Elle propose une expérience d'achat fluide adaptée au commerce local et régional avec **Paiement à la Livraison (Cash on Delivery / COD)** et **Confirmation instantanée par WhatsApp**.

---

## 🌟 Fonctionnalités Principales

### 🛒 Expérience Client
- **Catalogue & Recherche** : Navigation rapide parmi les produits avec filtres par catégorie (Mode & Wax, Cosmétiques, Décoration, etc.).
- **Fiches Produits Détaillées** : Visuels haute résolution, badges de stock et description complète.
- **Panier Ticket de Marché** : Gestion dynamique des quantités, persistance sécurisée sans hydration mismatch (`useSyncExternalStore`), calcul en temps réel en FCFA.
- **Commande en 2 étapes (COD)** : Bon de commande clair sans saisie de carte bancaire exigée. Paiement en espèces uniquement à la réception.
- **Confirmation WhatsApp** : Génération en un clic d'un lien WhatsApp pré-rempli avec le numéro de commande et le détail des articles pour valider l'expédition avec le commerçant.

### 🔐 Espace Administrateur (`/admin`)
- **Tableau de bord & Commandes** : Suivi des commandes reçues (En attente, Confirmée, En livraison, Livrée, Annulée).
- **Gestion du Catalogue** : Ajout, modification et mise à jour des stocks produits.
- **Authentification Sécurisée** : Connexion via Firebase Authentication.

### 🛡️ Robustesse & Qualité de Code
- **Validation Zod** : Validation rigoureuse des formulaires client et admin.
- **Architecture Hybride** : Persistance Firestore en ligne avec bascule automatique sur stockage local si Firebase n'est pas configuré.
- **22 Tests Unitaires Automatisés** : Tests complets avec Vitest et Testing Library couvrant le panier, les commandes, la validation et les liens WhatsApp.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 15+](https://nextjs.org/) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/) (Mode strict)
- **Style** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Formulaires & Schémas** : [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Base de Données & Auth** : [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK)
- **Tests** : [Vitest](https://vitest.dev/) & [@testing-library/react](https://testing-library.com/)

---

## 🚀 Démarrage Rapide en Local

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18.18+ ou 20+)
- `npm` ou `pnpm` ou `yarn`

### 2. Cloner le dépôt
```bash
git clone https://github.com/Moussoro1/kabro-shop.git
cd kabro-shop
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine à partir du modèle fourni :
```bash
cp .env.example .env.local
```

Renseignez les variables nécessaires :
```env
# Numéro WhatsApp de réception des commandes (avec indicatif pays, sans le signe +)
# Exemple : 221771234567 pour le Sénégal ou 2250712345678 pour la Côte d'Ivoire
NEXT_PUBLIC_WHATSAPP_NUMBER=221770000000

# Configuration Firebase Client (Optionnel en mode démo / Recommandé en production)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Côté serveur pour validation sécurisée)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

> **Note :** Si les clés Firebase ne sont pas définies, l'application utilise automatiquement le catalogue d'exemple et le stockage local (`localStorage`), ce qui permet de tester immédiatement toutes les fonctionnalités sans configuration préalable.

### 5. Lancer le serveur de développement
```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests & Qualité

Pour exécuter la suite complète des 22 tests unitaires :
```bash
npm test
```

Pour vérifier le linter ESLint :
```bash
npm run lint
```

Pour vérifier la compilation de production :
```bash
npm run build
```

---

## 📦 Déploiement

### Déploiement sur Vercel (Recommandé)

1. Connectez votre compte Vercel à votre dépôt GitHub : [vercel.com](https://vercel.com).
2. Importez le projet `kabro-shop`.
3. Dans **Settings → Environment Variables**, ajoutez les variables listées dans `.env.example`.
4. Cliquez sur **Deploy**.

Consultez le guide détaillé dans [`DEPLOYMENT.md`](./DEPLOYMENT.md) pour les instructions complètes de déploiement et de configuration des règles de sécurité Firebase.

---

## 📄 Licence
Ce projet est mis à disposition sous licence MIT.
