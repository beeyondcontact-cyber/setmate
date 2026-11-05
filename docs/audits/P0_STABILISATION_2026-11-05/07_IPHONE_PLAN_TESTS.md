# 07 · Plan de test sur un vrai iPhone

Pour Sabri. Une action à la fois. Aucun de ces tests n'a été fait : tout est **À TESTER SUR APPAREIL**.
Source des cas : `docs/research/03_IPHONE_SAFARI/MATRICE_TESTS_APPAREIL_REEL.md` (identifiants M-xx).

## Avant de commencer (bloquant)

La version corrigée (1.9.3-p0) **n'est pas en ligne**. Rien n'a été poussé ni déployé.
Il faut donc décider d'abord comment la mettre sur ton iPhone. Ce plan ne le fait pas à ta place.

Deux façons de lire ce plan :
- **Sur la version en ligne (1.9.1)** : les parcours servent de mesure de départ. Les tests B, C et D devraient montrer les défauts connus (A-03, A-04, A-06).
- **Sur la version corrigée (1.9.3-p0)** : les parcours vérifient les correctifs P0. Il faut une adresse d'essai. À décider avec Sabri.

Règle : ne jamais retoucher la colonne « Attendu » après le test. Un écart est un résultat.

## Fiche à remplir une fois

| Champ | Valeur |
|---|---|
| Modèle d'iPhone | Réglages > Général > Informations > Nom du modèle |
| Version d'iOS | même écran (l'audit indiquait 18.7 au 30/10/2026) |
| Version de SetMate | écran Réglages de l'appli |
| Installée sur l'écran d'accueil | oui / non |
| Date et heure | |
| Batterie, mode économie d'énergie, espace libre | |

Preuve : une capture de cet écran.

## Avant tout test sur tes vraies données

1. Dans SetMate, écran Réglages : exporter la sauvegarde (le libellé exact du bouton n'est pas relevé ici).
2. Feuille de partage : Enregistrer dans Fichiers (iCloud Drive).
3. Faire la sauvegarde chiffrée du projet sur le PC (tu tapes ton mot de passe).

Sans ces trois actions, ne fais pas les parcours B, C, D.

---

## Parcours A · Installation et premier lancement (M-01, M-02, M-03)

1. Safari : ouvrir l'adresse de SetMate. Partager > Sur l'écran d'accueil.
2. Ouvrir l'icône. Réglages > Diagnostic > Envoyer le rapport.
3. Enregistrer le rapport.

Attendu (écrit d'avance) : icône créée, ouverture sans barre Safari, 0 erreur en boîte noire [source + hypothèse].
Preuve : capture de l'écran d'accueil, capture de l'appli, fichier du rapport.
Résultat : RÉUSSI / ÉCHEC / PARTIEL.

## Parcours B · Persistance après fermeture (M-04, M-05)

Correctif concerné : P0-01 (écriture vérifiée, écriture forcée à la fermeture).

1. Créer une playlist « TEST-IDB ».
2. Balayer l'appli pour la fermer, tout de suite (moins d'une seconde).
3. Rouvrir. Chercher « TEST-IDB ».

Refaire 5 fois avec un autre nom à chaque fois.

Attendu : la playlist est là 5 fois sur 5 [seuil du projet AC-04 : 0 perte].
Sur la version 1.9.1, une perte est possible et connue (A-06).
Preuve : captures avant et après, tableau des 5 essais.
Résultat : RÉUSSI / ÉCHEC / PARTIEL.

## Parcours C · Restauration d'une vraie sauvegarde (M-07, M-08)

Correctif concerné : P0-02. C'est le **premier essai avec ta vraie sauvegarde**. Jamais fait.

Pourquoi c'est important : la validation a été testée avec des sauvegardes fabriquées. Un champ réel inattendu pourrait la faire refuser à tort.

1. Réglages > Restaurer. Choisir le fichier exporté juste avant.
2. Lire l'aperçu (version, nombre de sons, playlists, soirées). Ne rien valider si un chiffre est faux.
3. Valider. Vérifier les listes. Si ça ne va pas : bouton Annuler du message.

Attendu : l'aperçu montre les bons chiffres, l'état est identique avant et après, Annuler remet l'état précédent [hypothèse].
Si la restauration est **refusée** : noter le message exact. C'est un résultat utile, pas une panne de ton côté.
Preuve : capture de l'aperçu, capture du message, listes avant et après.
Résultat : RÉUSSI / ÉCHEC / PARTIEL.

Variante, fichier abîmé :
1. Dans Fichiers, dupliquer la sauvegarde et couper la fin du texte.
2. Tenter de la restaurer.
3. Vérifier que rien n'a changé.

Attendu : message « Restauration impossible », données intactes [seuil AC-05]. Sur 1.9.1 l'échec est connu (A-04).

## Parcours D · Pannes de stockage réelles (P0-01)

Correctif concerné : P0-01. Les pannes n'ont été **que simulées** (quota, transaction annulée). Le comportement iOS réel est inconnu.

À décider par Sabri avant de faire quoi que ce soit : je ne provoque pas de disque plein sur ton téléphone principal.

Version prudente, sans risque pour tes données :
1. Safari, onglet privé : ouvrir SetMate.
2. Créer une playlist.
3. Lire ce que SetMate affiche (message de stockage, bouton « Modifications non enregistrées »).

Attendu : soit la playlist est enregistrée, soit un message clair dit que ce n'est pas le cas [hypothèse]. Pas de faux « fait » silencieux.
Preuve : captures du message ; le diagnostic.

Version avec disque presque plein : seulement avec un autre iPhone ou après ton accord explicite. Noter l'espace libre avant et après.

## Parcours E · Écran verrouillé (M-13, M-14, M-12)

1. Lancer `startLockTest` (test écran verrouillé de l'appli).
2. Verrouiller l'écran. Poser l'iPhone 60 minutes.
3. Déverrouiller. Lire le journal EVT.

Attendu : 60 minutes sans coupure [seuil AC-07]. Résultat incertain : ne pas supposer.
Preuve : journal EVT complet, heure de début et de fin.
Sous-test (M-14) : réveiller l'écran sans déverrouiller, appuyer Pause puis Lecture. Attendu : titre affiché, commandes actives [source MDN, non prouvé sur iOS].

## Parcours F · Écran allumé, Wake Lock (M-22)

Le **mode soirée n'existe pas** dans le code (AC-09 non rempli). Ce test porte sur la fonction « écran allumé » du diagnostic, si elle est présente.

1. Activer le mode écran allumé (ou le test du diagnostic).
2. Régler l'auto-verrouillage de l'iPhone sur 30 secondes.
3. Ne pas toucher l'iPhone pendant 5 minutes.

Attendu : l'écran reste allumé [source : appli installée, iOS 18.4 ou plus].
Preuve : photo ou courte vidéo à 5 minutes.

## Parcours G · Micro (M-10, M-11)

1. Lancer la dictée ou l'enregistrement. Accepter l'autorisation.
2. Parler 10 secondes.
3. Changer 3 fois d'écran dans l'appli, puis relancer le micro.

Attendu : une seule invite, texte ou enregistrement présent, pas de nouvelle invite [source 13.4 + hypothèse].
Preuve : capture de l'invite et du résultat.

## Parcours H · Hors ligne (M-18, M-19)

1. Ouvrir l'appli une fois en ligne.
2. Mode avion, forcer la fermeture.
3. Rouvrir et chronométrer.

Attendu : démarrage en moins de 3 secondes, données visibles [seuil AC-10].
Preuve : chrono + capture du mode avion.

## Parcours I · Export M3U8 (M-23)

Disponible dans la version 1.9.3-p0 (bouton « Exporter M3U8 »). L'appli dit « Compatibilité réelle non testée » : c'est vrai.

1. Écran Préparer : « Exporter M3U8 ».
2. Feuille de partage : Enregistrer dans Fichiers.
3. Ouvrir le fichier.

Attendu : fichier `.m3u8` lisible, bon nom, lignes `#EXTM3U` puis `#EXTINF`, ordre du set respecté [hypothèse].
Deux cas possibles et légitimes : un fichier est créé, ou la fenêtre dit « Aucun son avec un fichier local ». Noter lequel. En mode démo, aucun fichier n'est écrit (chemins inventés).
Hors de portée ici : Serato qui importe ce fichier (voir `04_SERATO_VALIDATION.md` §7).
Preuve : capture de Fichiers + contenu du fichier.

## Parcours optionnels, plus tard

- Données après 7, 14, 28 jours sans ouvrir l'appli (M-09).
- Analyse de fichiers de 3, 10, 50, 120 Mo (M-20, M-21) : risque de plantage mémoire.
- Interruptions : appel, Siri, autre appli audio (M-15 à M-17).
- Effet d'une mise à jour d'iOS (M-27).

## Tableau de résultats

| Parcours | Matrice | Résultat | Preuve jointe |
|---|---|---|---|
| A Installation | M-01 à M-03 | | |
| B Persistance | M-04, M-05 | | |
| C Restauration | M-07, M-08 | | |
| D Stockage | (P0-01) | | |
| E Écran verrouillé | M-12 à M-14 | | |
| F Écran allumé | M-22 | | |
| G Micro | M-10, M-11 | | |
| H Hors ligne | M-18, M-19 | | |
| I Export M3U8 | M-23 | | |

Après les tests : toute ligne ÉCHEC devient une entrée du registre d'erreurs, avec un garde-fou et une règle. Puis lancer la sauvegarde chiffrée.
Ne pas écraser la matrice d'origine : écrire les résultats dans un nouveau fichier daté.
