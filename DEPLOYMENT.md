# Guide de Déploiement en Production (Vercel & Firebase)

Ce guide décrit l'ensemble des étapes nécessaires pour déployer la boutique en ligne en production avec **Vercel** (hébergement Next.js) et **Firebase** (Firestore, Storage et Authentification).

---

## 1. Configuration du Projet Firebase de Production

Il est fortement recommandé de créer un projet Firebase distinct dédié à la production, complètement séparé de l'environnement de développement ou de test.

### 1.1 Création et activation des services Firebase
1. Rendez-vous sur la [Console Firebase](https://console.firebase.google.com/) et cliquez sur **Ajouter un projet** (ex: `boutique-marche-prod`).
2. **Cloud Firestore** :
   - Rendez-vous dans **Build → Firestore Database** puis cliquez sur **Créer une base de données**.
   - Choisissez un emplacement géographique proche de votre audience cible (ex: `europe-west1` ou `europe-west3`).
3. **Firebase Storage** :
   - Rendez-vous dans **Build → Storage** puis cliquez sur **Commencer**.
   - Choisissez les paramètres par défaut dans la même région que Firestore.
4. **Firebase Authentication** :
   - Rendez-vous dans **Build → Authentication** puis cliquez sur **Commencer**.
   - Dans l'onglet **Sign-in method**, activez le fournisseur **E-mail / Mot de passe**.
   - Désactivez les options de création de compte anonyme ou publique si vous souhaitez restreindre les accès aux seuls gestionnaires de la boutique.

### 1.2 Déploiement des Règles de Sécurité
Assurez-vous que les fichiers `firestore.rules` et `storage.rules` sont déployés sur votre projet de production via la CLI Firebase :

```bash
# 1. Connexion à la CLI Firebase
firebase login

# 2. Associer le projet de production
firebase use <VOTRE_FIREBASE_PROJECT_ID_PROD>

# 3. Déployer les règles de sécurité Firestore et Storage
firebase deploy --only firestore:rules,storage:rules
```

### 1.3 Création des Comptes Administrateurs
L'application ne proposant volontairement aucun formulaire d'inscription public pour des raisons de sécurité :
1. Allez dans **Firebase Console → Authentication → Users**.
2. Cliquez sur **Ajouter un utilisateur**.
3. Renseignez l'adresse e-mail et un mot de passe fort pour chaque administrateur de la boutique.
4. Ce compte permettra de se connecter directement sur l'interface d'administration `/admin/login`.

### 1.4 Initialisation des Données (Catégories et Produits)
- Vous pouvez créer vos premières catégories et fiches produits directement depuis l'espace d'administration sécurisé (`/admin/products`) une fois le site déployé.
- Alternativement, vous pouvez insérer les premiers documents directement dans les collections `categories` et `products` de Firestore.

---

## 2. Configuration et Déploiement sur Vercel

Vous pouvez déployer le projet sur Vercel selon deux approches :

---

### Méthode A : Déploiement direct avec la CLI Vercel (depuis une archive ZIP ou dossier local)

Cette méthode ne nécessite pas de lier de dépôt Git.

1. **Dézippez le projet** sur votre machine locale et ouvrez un terminal dans le dossier extrait.
2. **Installez la CLI Vercel** (si ce n'est pas déjà fait) :
   ```bash
   npm install -g vercel
   ```
3. **Initialisez le déploiement** :
   ```bash
   vercel
   ```
   - Connectez-vous à votre compte Vercel.
   - Répondez aux questions interactives (conservez les valeurs par défaut proposées pour Next.js).
4. **Ajoutez les variables d'environnement** :
   - Soit en ligne de commande :
     ```bash
     vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
     # Répétez pour chaque variable de votre .env.example
     ```
   - Soit directement depuis le tableau de bord web : **Vercel → Votre Projet → Settings → Environment Variables**.
5. **Déployez en production** :
   ```bash
   vercel --prod
   ```

---

### Méthode B : Déploiement continu via Dépôt Git (GitHub / GitLab / Bitbucket)

1. Rendez-vous sur votre tableau de bord [Vercel](https://vercel.com/).
2. Cliquez sur **Add New... → Project**.
3. Importez le dépôt Git contenant le code de la boutique.
4. Vercel détecte automatiquement le framework **Next.js**.

---

### 2.1 Configuration des Variables d'Environnement
Dans Vercel, accédez à **Project Settings → Environment Variables** et renseignez l'intégralité des variables définies dans `.env.example` :

| Variable | Type | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public (Client) | Clé API Web du projet Firebase (`<TA_CLE_ICI>`) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public (Client) | Domaine d'authentification (`<VOTRE_PROJECT_ID>.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public (Client) | Identifiant du projet Firebase (`<VOTRE_PROJECT_ID>`) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public (Client) | Bucket de stockage (`<VOTRE_PROJECT_ID>.appspot.com` ou `.firebasestorage.app`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public (Client) | Identifiant d'expéditeur de messagerie Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public (Client) | Identifiant de l'application Web Firebase |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public (Client) | Numéro WhatsApp Business de réception des commandes (format international sans `+` ni espaces, ex: `221770000000`) |
| `FIREBASE_ADMIN_PROJECT_ID` | Privé (Serveur) | Identifiant du projet Firebase pour le SDK Admin |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Privé (Serveur) | Email du compte de service Firebase Admin |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Privé (Serveur) | Clé privée RSA du compte de service Firebase Admin |

> ⚠️ **Avertissement crucial pour `FIREBASE_ADMIN_PRIVATE_KEY`** :  
> Lors du copier-coller de la clé privée depuis le fichier JSON de compte de service Google Cloud dans l'interface Vercel, veillez à préserver scrupuleusement les sauts de ligne réels ou les caractères d'échappement `\n` entre `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----`. Si les sauts de ligne sont corrompus, le SDK Admin échouera à initialiser la session.

### 2.3 Domaines Personnalisés & Autorisation Firebase
1. Dans Vercel, configurez votre domaine de production dans **Settings → Domains** (ex: `boutique.mondomaine.com`).
2. **Étape obligatoire dans Firebase** :
   - Rendez-vous sur **Firebase Console → Authentication → Settings → Authorized domains**.
   - Cliquez sur **Add domain** et ajoutez votre domaine de production Vercel (`*.vercel.app` et votre domaine personnalisé). Sans cette étape, l'authentification administrateur échouera avec une erreur d'autorisation de domaine.

### 2.4 Vérification Post-Déploiement (Smoke Tests)
Une fois le déploiement terminé sur Vercel :
1. **Catalogue & Images** : vérifiez que la page d'accueil affiche les produits, que les images distantes (`firebasestorage.googleapis.com`) sont chargées correctement via Next/Image sans erreur 403/500.
2. **Flux de Commande & WhatsApp** : ajoutez un produit au panier, passez la commande sur `/checkout`, vérifiez la page de confirmation et cliquez sur le bouton vert WhatsApp pour vous assurer que le message pré-rempli s'ouvre avec l'identifiant et le détail des articles.
3. **Espace Admin** : accédez à `/admin/login`, connectez-vous avec vos identifiants, vérifiez que la commande test apparaît bien dans la liste des commandes et que le changement de statut (`En attente` → `Confirmée` → `En livraison` → `Livrée`) fonctionne en temps réel.
4. **Protection des routes** : tentez d'accéder directement à l'URL `/admin/orders` dans une fenêtre de navigation privée pour confirmer que la redirection vers `/admin/login` est immédiate.

---

## 3. Checklist Finale de Mise en Production

Avant l'ouverture officielle au public, assurez-vous d'avoir validé l'ensemble des points ci-dessous :

- [x] Build de production sans erreur ni `any` résiduel
- [x] Tests Vitest passés (22/22 tests unitaires validés)
- [ ] Règles Firestore/Storage déployées sur le projet de production (pas seulement testées en local)
- [ ] Variables d'environnement complètes dans Vercel, aucune clé admin exposée côté client
- [ ] Au moins un compte admin créé et testé
- [ ] Domaine ajouté dans Firebase Authentication si domaine personnalisé utilisé
- [ ] Parcours complet testé en production : catalogue → panier → checkout → WhatsApp → apparition dans l'admin → changement de statut
