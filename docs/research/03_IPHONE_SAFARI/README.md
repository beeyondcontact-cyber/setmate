# 03 · iPhone / Safari / PWA

Consultation du 05/11/2026. Voir aussi `07`, `08` (L-016, L-017, L-020, L-022, L-023) et `11` de l'audit.

## Index
- `FICHES_IPHONE_SAFARI.md` : 14 fiches (I-01 à I-14).
- `MATRICE_TESTS_APPAREIL_REEL.md` : 27 tests à faire sur un iPhone réel, tous « non testé ».
- Requêtes manquantes : `..\REQUETES_CHROME.md`.

## Résumé en 10 lignes
1. L'installation sur iPhone est manuelle (pas d'invite) ; iOS 26 ouvre par défaut tout site ajouté comme web app.
2. Quota de stockage : jusqu'à 60 % du disque par origine (Safari 17+), identique installée ou non.
3. L'éviction existe (inactivité, pression) ; la règle « 7 jours » est documentée pour Safari non installé (2020, MDN).
4. L'exemption des applis installées est « attendue » par WebKit (2020) mais **ne garantit pas** la conservation : sauvegarde obligatoire.
5. Un bogue IndexedDB « connexion perdue » existe depuis 2019 et était encore signalé en octobre 2025.
6. Le micro fonctionne en appli installée depuis iOS 13.4 ; des invites répétées ont été signalées.
7. Audio en arrière-plan : correctif cité en iOS 15.4 (commentaires) ; l'écran verrouillé de SetMate reste non prouvé.
8. Interruptions (appel, Siri) : aucun texte officiel ; un bogue ouvert décrit un contexte bloqué en « interrupted ».
9. File System Access (sélecteurs de fichiers/dossiers) est absent de Safari et de Safari iOS selon le jeu de données MDN.
10. Wake Lock marche en appli installée depuis iOS 18.4 ; l'iPhone de Sabri est en 18.7.

## Ce qui reste inconnu
Formats et mémoire de `decodeAudioData`, `OfflineAudioContext` dans un Worker, performances, hors ligne réel, mise à jour du service worker, comportement sur iOS 18.7/26.x, étapes de l'aide Apple, `<input type="file">`, bogues 215884 et 225298 non lus. Voir les requêtes R-iOS-01 à R-iOS-08.

## Limites générales
Pages lues par résumé d'outil ; BCD sans numéro de commit ; `"mirror"` = dérivé de Safari bureau ; aucun test d'appareil.
