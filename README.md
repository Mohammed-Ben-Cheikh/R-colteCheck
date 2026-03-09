# 🌾 RécolteCheck

Application mobile pour agriculteurs permettant de gérer les parcelles agricoles et suivre la production des récoltes de manière simple et centralisée.

> Remplace les cahiers papier et les notes informelles par une solution numérique qui améliore l'organisation, la traçabilité et la prise de décision.

---

## 📱 Fonctionnalités

### Authentification

- Inscription / Connexion par e-mail et mot de passe (Firebase Auth)
- Session persistante (reconnexion automatique)
- Déconnexion sécurisée

### Profil agriculteur

- Affichage et modification du profil (nom, téléphone, exploitation, localisation)

### Gestion des parcelles

- Créer, modifier, supprimer une parcelle
- Détails : nom, superficie, culture, date de plantation, période de récolte, notes
- Liste de toutes les parcelles de l'agriculteur

### Suivi des récoltes

- Enregistrer une récolte liée à une parcelle
- Informations : date, culture, poids (kg ou tonnes), notes
- Historique complet par parcelle
- Suppression d'enregistrements

### Tableau de bord

- Résumé : nombre de parcelles, nombre de récoltes, poids total
- Récoltes récentes
- Actions rapides

---

## 🏗 Architecture

```
R-colteCheck/
├── app/                        # Expo Router – file-based navigation
│   ├── _layout.tsx             # Root layout + AuthProvider + redirect logic
│   ├── (auth)/                 # Auth screens group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Dashboard
│   │   ├── parcels.tsx         # Parcels list
│   │   └── profile.tsx         # Profile
│   ├── parcel/
│   │   ├── add.tsx             # Add parcel form
│   │   ├── [id].tsx            # Parcel details
│   │   └── edit/[id].tsx       # Edit parcel form
│   └── harvest/
│       ├── add/[parcelId].tsx  # Add harvest form
│       └── [parcelId].tsx      # Harvest history
│
├── src/                        # Application source code
│   ├── components/             # Reusable UI components
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── StatCard.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ConfirmDialog.tsx
│   ├── constants/
│   │   └── theme.ts            # Colors, spacing, fonts, shadows
│   ├── context/
│   │   └── AuthContext.tsx      # Auth state + Firebase Auth actions
│   ├── firebase/
│   │   └── config.ts           # Firebase initialization
│   ├── services/               # Firestore CRUD operations
│   │   ├── userService.ts
│   │   ├── parcelService.ts
│   │   └── harvestService.ts
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── utils/
│       ├── validation.ts       # Form validation helpers
│       ├── formatters.ts       # Date/weight formatting
│       └── errors.ts           # Firebase error messages (French)
│
├── assets/                     # Images, icons, splash
├── package.json
├── tsconfig.json
└── app.json
```

### Principes appliqués

- **DRY** – Composants et services réutilisables
- **SRP** – Chaque fichier a une responsabilité unique
- **Architecture modulaire** – Séparation claire des couches
- **Conventions de nommage** – camelCase, fichiers descriptifs

---

## 🗄 Structure Firestore

```
users/
  {userId}/
    uid: string
    name: string
    email: string
    phone: string
    farmName: string
    location: string
    createdAt: string (ISO)
    updatedAt: string (ISO)

parcels/
  {parcelId}/
    userId: string          ← lien vers l'agriculteur
    name: string
    surface: number         ← en hectares
    cropType: string
    plantingDate: string    ← ISO date
    harvestPeriod: string
    notes: string
    createdAt: string
    updatedAt: string

harvests/
  {harvestId}/
    parcelId: string        ← lien vers la parcelle
    userId: string          ← lien vers l'agriculteur
    date: string            ← ISO date
    crop: string
    weight: number
    unit: "kg" | "tonnes"
    notes: string
    createdAt: string
    updatedAt: string
```

**Règles de sécurité Firestore recommandées :**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /parcels/{parcelId} {
      allow read, write: if request.auth != null
        && resource == null || resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
    match /harvests/{harvestId} {
      allow read, write: if request.auth != null
        && resource == null || resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🚀 Installation et lancement

### Prérequis

- Node.js ≥ 18
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Un projet Firebase configuré
- Android Studio (émulateur Android) ou Xcode (simulateur iOS)
- Ou l'application **Expo Go** sur votre téléphone

### 1. Cloner le projet

```bash
git clone https://github.com/Mohammed-Ben-Cheikh/R-colteCheck.git
cd R-colteCheck
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez **Authentication** → méthode **Email/Password**
3. Créez une base **Cloud Firestore**
4. Copiez vos identifiants dans `src/firebase/config.ts` :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  projectId: "VOTRE_PROJET",
  storageBucket: "VOTRE_PROJET.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID",
};
```

### 4. Créer les index Firestore

Les requêtes Firestore avec `where` + `orderBy` nécessitent des index composites.
Firebase vous affichera un lien dans la console pour les créer automatiquement au premier appel.

### 5. Lancer l'application

```bash
npx expo start
```

Puis :

- Appuyez sur `a` pour ouvrir sur Android
- Appuyez sur `i` pour ouvrir sur iOS
- Scannez le QR code avec Expo Go

---

## 📦 Dépendances principales

| Package                                     | Rôle                              |
| ------------------------------------------- | --------------------------------- |
| `expo`                                      | Framework React Native            |
| `expo-router`                               | Navigation basée sur les fichiers |
| `firebase`                                  | Auth + Firestore                  |
| `@react-native-async-storage/async-storage` | Persistance de session            |
| `@react-native-community/datetimepicker`    | Sélecteur de dates natif          |
| `@expo/vector-icons` (Ionicons)             | Icônes                            |
| `react-native-reanimated`                   | Animations                        |
| `react-native-screens`                      | Navigation optimisée              |
| `react-native-safe-area-context`            | Zones sûres (notch, etc.)         |

---

## 📄 Licence

Ce projet est sous licence MIT.
