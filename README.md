# RécolteCheck

Application mobile React Native (Expo) pour la gestion des parcelles et le suivi des récoltes, avec authentification et synchronisation cloud via Firebase.

## Objectif

RécolteCheck permet à un agriculteur de :

- gérer son profil,
- enregistrer ses parcelles,
- suivre ses récoltes par zone,
- consulter des indicateurs clés de production.

## Stack technique

- React Native + Expo Router
- TypeScript
- Firebase Authentication
- Cloud Firestore

## Installation

1. Cloner le dépôt

2. Installer les dépendances

```bash
npm install
```

3. Créer un fichier `.env` à la racine en partant de `.env.example`

4. Lancer l'application

```bash
npm run start
```

5. Tester sur :

- Android : `npm run android`
- iOS : `npm run ios`

## Variables d'environnement Firebase

Exemple dans `.env.example` :

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Architecture de l'application

### Navigation

- Groupe `(auth)` : connexion / inscription.
- Groupe `(tabs)` : espace privé de l'agriculteur.

### Structure principale

- `app/(auth)` : écrans d'authentification.
- `app/(tabs)/index.tsx` : tableau de bord (KPIs).
- `app/(tabs)/parcelles.tsx` : CRUD des parcelles.
- `app/(tabs)/recoltes.tsx` : CRUD des récoltes.
- `app/(tabs)/profil.tsx` : profil agriculteur.
- `context/auth-context.tsx` : gestion centralisée de session.
- `lib/firebase.ts` : initialisation Firebase.

### Principes qualité

- Nommage explicite des fonctions/variables.
- Validation des entrées côté client avant écriture.
- Gestion d'erreurs avec messages utilisateur.
- DRY : logique d'auth centralisée dans un contexte.
- SRP : chaque écran est focalisé sur une responsabilité métier.

## Schéma Firestore proposé

Collection racine : `farmers`

- `farmers/{uid}`
  - `fullName`, `email`, `phone`, `location`, `role`, `createdAt`, `updatedAt`
  - sous-collection `parcels`
    - `name`, `areaHectares`, `cropName`, `harvestPeriod`, `notes`, `createdAt`
  - sous-collection `harvests`
    - `parcelId`, `zoneName`, `weightKg`, `harvestedAt`, `notes`, `createdAt`

## Dépendances externes et rôle

- `expo-router` : routage par fichiers.
- `firebase` : auth + base de données cloud.
- `@react-native-async-storage/async-storage` : persistance locale de session Firebase.

## Démonstration (25 min)

Checklist suggérée :

1. Authentification agriculteur (inscription + connexion)
2. Création de parcelles
3. Enregistrement de récoltes par zone
4. Mise à jour profil
5. Tableau de bord avec total de production

## Planification Jira (proposition)

- Epic 1 : Authentification et profil agriculteur
- Epic 2 : Gestion des parcelles
- Epic 3 : Gestion des récoltes
- Epic 4 : Dashboard et qualité logicielle
- Epic 5 : Documentation et préparation soutenance

## Livrables couverts

- Code modulaire TypeScript
- Documentation d'architecture
- Guide d'installation/configuration
- Dépendances et rôles
- Compatible Android/iOS via Expo

## Notes Firebase

- Activer Email/Password dans Firebase Authentication.
- Configurer les règles Firestore pour isoler les données par `request.auth.uid`.
