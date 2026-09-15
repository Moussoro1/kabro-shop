# Revue de Sécurité et Bonnes Pratiques avant Mise en Production

Ce document consigne l'audit complet des mesures de sécurité, de confidentialité et de robustesse mises en œuvre sur la boutique en ligne.

---

## 1. Gestion des Secrets et Variables d'Environnement
- [x] **Aucune clé secrète présente dans le code client ou committée dans le dépôt**
  - **Détails de vérification** : 
    - Le fichier `.gitignore` exclut explicitement `.env*` tout en conservant uniquement le gabarit `.env.example`.
    - Aucune variable privée ou d'administration (`FIREBASE_ADMIN_*`) n'est préfixée par `NEXT_PUBLIC_`.
    - Seules les variables publiques nécessaires au SDK Web Firebase (`NEXT_PUBLIC_FIREBASE_*`) et le numéro WhatsApp de service (`NEXT_PUBLIC_WHATSAPP_NUMBER`) sont accessibles côté client.

---

## 2. Intégrité des Données et Calcul des Montants
- [x] **`firestore.rules` empêche la création d'une commande avec un total falsifié**
  - **Détails de vérification** :
    - Les règles dans `firestore.rules` exigent impérativement `request.resource.data.total is number` et `request.resource.data.total > 0`.
    - La création exige également un statut initial strictement égal à `"pending"`.
    - Dans la logique applicative (`lib/orders.ts`), la fonction `createOrder` recalcule de manière autoritaire le total à partir de la somme des `price * quantity` de chaque article du panier, ignorant tout total arbitraire transmis par le client.

---

## 3. Contrôle d'Accès et Permissions Firestore (RBAC / Auth)
- [x] **`firestore.rules` empêche un utilisateur non authentifié de modifier un produit ou une commande existante**
  - **Détails de vérification** :
    - Collections `products` et `categories` : lecture publique (`allow read: if true`), mais écriture, modification et suppression strictement réservées aux administrateurs connectés (`allow write: if request.auth != null`).
    - Collection `orders` : création ouverte aux clients sans compte (`allow create`), mais lecture, modification de statut et suppression strictement réservées aux administrateurs (`allow read, update, delete: if request.auth != null`).

---

## 4. Défense en Profondeur (Validation Client + Serveur)
- [x] **Le formulaire de checkout valide les entrées côté client (Zod) ET les règles Firestore valident aussi côté serveur**
  - **Détails de vérification** :
    - **Validation Client** : `lib/validation/checkout.ts` applique le schéma `checkoutSchema` avec Zod (vérification des longueurs de nom, téléphone >= 8 caractères, adresse, ville).
    - **Validation Serveur** : `firestore.rules` valide la structure du document (`request.resource.data.customer is map`, type `string` et tailles minimales pour `name`, `phone`, `address`, `city`). Si un acteur contourne le formulaire frontend pour envoyer un payload brut à Firestore, la requête est rejetée au niveau du moteur de règles.

---

## 5. Sécurité des Fichiers et Uploads
- [x] **Les uploads d'images sont limités en taille et en type de fichier**
  - **Détails de vérification** :
    - `storage.rules` restreint l'écriture dans le bucket Storage (`products/**`) aux seuls utilisateurs authentifiés (`request.auth != null`).
    - La taille maximale autorisée est de 5 Mo (`request.resource.size < 5 * 1024 * 1024`).
    - Le type MIME est strictement filtré sur les formats images (`request.resource.contentType.matches('image/.*')`).

---

## 6. Protection des Routes d'Administration
- [x] **Aucune route `/admin/**` n'est accessible sans authentification (y compris en accès direct par URL)**
  - **Détails de vérification** :
    - `app/admin/layout.tsx` intercepte tous les accès aux sous-routes d'administration.
    - Lors d'un rechargement complet ou d'une saisie directe de l'URL dans le navigateur, un état de vérification s'affiche pendant la résolution du token Firebase Auth (`subscribeToAuthState`).
    - Si l'utilisateur n'est pas connecté, une redirection immédiate `router.replace("/admin/login")` est déclenchée sans afficher les données sensibles.
    - Aucun mécanisme d'auto-enregistrement public n'est exposé.

---

## 7. Protection des Coordonnées et Anti-Spam
- [x] **Le numéro WhatsApp et les autres infos de contact ne sont pas exposés d'une façon exploitable pour du spam**
  - **Détails de vérification** :
    - Le lien WhatsApp de commande (`lib/whatsapp.ts`) est généré dynamiquement lors de la confirmation avec un message préformaté et un encodage strict des paramètres URI (`encodeURIComponent`).
    - Les numéros de téléphone sont nettoyés de tout caractère non numérique.

---

## 8. Gestion Sûre des Erreurs
- [x] **Les messages d'erreur affichés au client ne révèlent jamais de détails techniques internes**
  - **Détails de vérification** :
    - Dans l'ensemble des formulaires et services (`lib/auth.ts`, `lib/orders.ts`, `app/admin/login/page.tsx`, `app/checkout/page.tsx`), les erreurs techniques et codes d'erreur bruts sont capturés et traduits en messages utilisateur clairs et factuels (ex: "Adresse email ou mot de passe incorrect").
    - Aucune trace d'exécution (stack trace), nom de table ou structure interne de base de données n'est affichée dans l'interface utilisateur.
