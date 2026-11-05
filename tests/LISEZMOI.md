# Tests automatiques de SetMate

Lancer tous les tests (Chrome et moteur de Safari au format iPhone) : `npm test`
Un seul moteur : `npm run test:chrome` ou `npm run test:safari`
Contrôle de sabotage (chaque bug connu doit faire échouer son test) : `node tests/sabotage.js`

Première installation : `npm install` puis `npx playwright install chromium webkit`.

## Ce que ces tests couvrent
Ils reprennent les erreurs du registre (`ERREURS_ET_LECONS.md`) : E-007 (quota Deezer), E-008 (redessins pendant un geste), E-009 (écran Musique sans bibliothèque), E-013 (crate inutilisable, partage d'un set), plus les 12 critères de non-régression, la cohérence version et cache, le parcours File d'attente, À récupérer, Récupérés, et la lecture des exports Apple et Spotify.

## Ce qu'ils ne couvrent PAS
- Un vrai iPhone : le moteur WebKit d'un ordinateur n'est pas Safari sur iPhone (écran verrouillé, partage, presse-papiers, doigt réel).
- Un vrai Serato, rekordbox, Apple Music.
- Deezer : il est simulé, les résultats sont des données fabriquées.
- Les exports Apple et Spotify réels : seuls des formats fabriqués d'après les guides sont testés.

## Règle
Un test qui ne devient jamais rouge ne protège de rien : à chaque nouveau test, ajouter son sabotage dans `tests/sabotage.js`.
