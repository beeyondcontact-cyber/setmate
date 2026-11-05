# Requêtes à confier à une session Chrome (recherche documentaire)

Section ajoutée le 05/11/2026 par l'agent iPhone/analyse musicale (dossiers 03 et 04). D'autres agents peuvent ajouter leurs sections à la suite : ne rien effacer.

## Règles pour la personne qui exécute
Sites officiels d'abord ; communauté marquée comme telle ; ne se connecter à aucun compte ; aucun téléchargement d'exécutable ni de jeu de données ; « introuvable » est une réponse valable.
Format de retour par requête : **URL exacte ; date de consultation ; version (iOS/Safari/bibliothèque) ; citation courte vérifiable (≤ 25 mots) ; conclusion en 1 à 3 phrases (page vs déduction) ; ce qui reste inconnu.**

## Sources bloquées lors de cette étape
- music-ir.org (wiki MIREX) : « certificate has expired » (avec et sans `www`) ; web.archive.org : refusé par l'outil.
- gnu.org (AGPL v3) : HTTP 429 (deux essais).
- upf.edu (Ballroom) : HTTP 403.
- developer.apple.com (notes de version Safari) et support.apple.com (ajouter à l'écran d'accueil) : contenu utile non reçu.
- github.com/hendriks73/tempo_eval : HTTP 404 (adresse supposée non valide).
- archives.ismir.net/ismir2017/paper/000137.pdf : PDF compressé illisible pour l'outil.

## Priorité 1 (cœur du produit)
**R-iOS-01 · Écran verrouillé et arrière-plan audio, iOS 18.x / 26.x** (L-016)
- Pages : notes de version Safari (developer.apple.com/documentation/safari-release-notes), bugs.webkit.org 198277 et 232909 (lire les deux : chacun se dit doublon de l'autre dans nos résumés).
- Rapporter : version d'iOS où l'audio d'une web app d'écran d'accueil continue écran verrouillé, citation exacte, et si l'enchaînement de morceaux est mentionné.

**R-iOS-02 · Éviction et applis installées, iOS 18.x / 26.x** (L-020)
- Pages : webkit.org/blog/10218 et webkit.org/blog/14403 (relire le texte brut), notes de version Safari 17 à 26, MDN « Storage quotas and eviction criteria ».
- Rapporter : toute phrase sur les applis d'écran d'accueil et l'éviction, avec version ; dire si la règle des 7 jours s'applique ou non aux applis installées dans les versions récentes.

**R-iOS-03 · `decodeAudioData` : formats et mémoire sur Safari iOS** (L-017)
- Pages : MDN `BaseAudioContext.decodeAudioData`, tableau de compatibilité des formats (MDN « Audio codecs »), webkit.org.
- Rapporter : MP3, AAC/M4A, FLAC, AIFF, WAV pris en charge (version) ; limites de mémoire documentées ; `OfflineAudioContext` dans un Worker.

**R-iOS-04 · Interruptions audio (appel, Siri, autre appli)** (L-016)
- Pages : bugs.webkit.org 273511, 205599, 243727 ; spécification W3C Audio Session ; WebKit blog (Safari 16.4).
- Rapporter : texte officiel sur l'état `interrupted` de l'AudioContext et la reprise ; statut des bogues et version corrigée.

**R-AM-01 · Page MIREX : tempo et tonalité** (fiches M-02, M-04)
- Pages : music-ir.org/mirex/wiki/2018:Audio_Tempo_Estimation et 2018:Audio_Key_Detection (ou une autre année), si le certificat est valide dans Chrome.
- Rapporter : définition exacte de P-score, tolérance, poids de la tonalité (1 / 0,5 / 0,3 / 0,2), jeux utilisés.

**R-AM-02 · Article 13 de l'AGPL et licence d'Essentia** (fiche M-09)
- Pages : gnu.org/licenses/agpl-3.0.html (art. 13 et art. 5), essentia.upf.edu/licensing_information.html, mtg.upf.edu (page de licences).
- Rapporter : citation exacte de l'art. 13 ; sens de « for non-commercial applications » ; contact et conditions de la licence commerciale. Pas d'avis juridique.

## Priorité 2
**R-iOS-05 · Fichiers sur Safari iOS** (I-11) : étapes officielles de `<input type="file">`, accès à l'app Fichiers, partage de fichiers (`navigator.share` avec fichiers) ; sens exact de « File System WritableStream API » dans le billet Safari 26 (webkit.org/blog/16993).

**R-iOS-06 · Aide Apple « Ajouter à l'écran d'accueil »** (I-01) : support.apple.com/guide/iphone (étapes iPhone, iOS 26 « Ouvrir comme app Web ») ; captures si possible.

**R-iOS-07 · Bogues micro et dictée** (I-06, I-13) : bugs.webkit.org 215884 (invites répétées en mode autonome), 225298 (reconnaissance vocale) ; statut et version.

**R-iOS-08 · Service worker et hors ligne sur iOS** (I-10) : documentation sur la mise à jour, l'éviction du cache d'un service worker d'appli installée ; web.dev ou webkit.org.

**R-AM-03 · Jeux de données non lus** (M-07) : Ballroom (page MTG/UPF), GTZAN Tempo/Key (Marchand et Peeters), SMC, Hainsworth, SALAMI, McGill Billboard, GiantSteps MTG Key (README et nombre de pistes). Rapporter : taille, annotations, licence exacte, conditions d'usage, accès à l'audio.

**R-AM-04 · Article ISMIR 2018 (Schreiber et Müller)** (M-02) : ismir2018.ismir.net/doc/pdfs/220_Paper.pdf. Rapporter : définitions d'Accuracy1 et 2, résultats sur GiantSteps, part d'erreurs d'octave.

**R-AM-05 · Phrases, premiers temps, énergie** (M-03, M-05) : documentation Essentia (algorithmes de beats, `Danceability`, `Loudness`, `Energy`), publications de segmentation (SALAMI/MIREX structure). Rapporter : définitions sourcées, métriques.

**R-AM-06 · Évaluation des transitions** (M-06) : lire l'article arXiv:2110.06525 (section « listening test ») ; rechercher dans archives.ismir.net un protocole d'évaluation de transitions ou de mix. Rapporter : participants, échelle, lignes de base.

**R-AM-07 · Essentia.js : versions et mises à jour** (M-09) : github.com/MTG/essentia.js/releases et npmjs.com/package/essentia.js (dates de publication). Rapporter : dernière version, date, taille du wasm.

---

## Ajout du 05/11/2026 : Serato, rekordbox et CDJ (dossiers 01_SERATO et 02_REKORDBOX_CDJ)

Contexte : `support.serato.com` renvoie 403 en HTML aux outils automatiques (l'API JSON `support.serato.com/api/v2/help_center/en-us/articles/<id>.json` répond), les PDF rekordbox ne sont pas lisibles par l'outil de lecture, la recherche du centre d'aide est tronquée. Les requêtes ci-dessous demandent une lecture à l'écran dans un vrai navigateur. Pour chacune, rapporter : URL exacte, date, version, citation courte vérifiable (≤ 25 mots), conclusion en 1 à 3 phrases, ce qui reste inconnu.

### Priorité 0
**R-C01 · Procédure d'import M3U de Serato DJ Pro 5.0** (S-03) : manuel 5.0 / centre d'aide / forum officiel 5.0. Chercher « Import », « M3U », « playlist file », menu ou glisser-déposer, encodage (M3U ou M3U8, BOM), chemins relatifs ou absolus, fins de ligne, lettres de lecteur. Rapporter la procédure en étapes numérotées avec captures si elles existent.

**R-C02 · Protect Library : 5.0 et 4.x** (S-08, S-09, S-10) : (a) description officielle de « Protect Library » en 5.0 (réglage, valeur par défaut, ce qui est verrouillé, mention éventuelle de logiciels extérieurs) ; (b) si l'option existe en 4.x : l'article https://support.serato.com/hc/en-us/articles/227561407 (« Crates 4.0 ») la cite, l'article https://support.serato.com/hc/en-us/articles/223364427 dit « only available in 3.3.5 and below ». Rapporter l'écran réel « Setup > Library » d'une 4.x ou 5.0 si accessible.

### Priorité 1
**R-C03 · Notes de version Serato DJ Pro 4.0.x et archive** (S-02, S-13) : https://serato.com/dj/pro/downloads/archive et notes 4.0.0 à 4.0.x. Chercher « M3U », « library », « import », « Subcrates », « database ». Rapporter toute note officielle sur la suppression de l'import M3U ou sur la nouvelle bibliothèque.

**R-C04 · Export d'historique Serato réel** (S-04, S-15) : exporter une vraie session en TXT, CSV et M3U (copie du fichier, sans données personnelles) ; rapporter noms de colonnes, séparateur, encodage, format d'heure, dossier exact « History Export » (`_Serato_` ou `Library` ?). Appareil requis : PC Serato de Sabri.

**R-C05 · XML minimal dans rekordbox 7** (R-01, R-02) : importer un XML fabriqué (3 morceaux fictifs, `Location` en `file://localhost/C:/...`) via Réglages > Avancé > Base de données > rekordbox xml > Bibliothèque importée ; glisser une playlist ; exporter vers une clé de test. Rapporter version de rekordbox, captures, message d'erreur éventuel, comportement avec accents et chemins longs. Appareil requis : rekordbox 7 de Sabri.

**R-C06 · Rôle de « Bridge »** (R-05) : page https://rekordbox.com/en/support/developer/ et manuel rekordbox 5 ou 6 : le volet « Bridge » est-il l'ancien nom de « rekordbox xml » ? Rapporter citation du manuel de la version concernée.

**R-C07 · Chemins Windows dans Serato** (S-16) : comportement de Serato DJ Pro avec un chemin > 260 caractères, un chemin UNC (`\serveur\partage`), une lettre de lecteur modifiée, un OneDrive « en ligne seulement ». Chercher une page officielle ; sinon test sur copie avec 3 fichiers fictifs. Rapporter version, résultat, capture.

**R-C08 · Tableau de compatibilité Device Library / OneLibrary par modèle** (R-09) : lire à l'écran https://rekordbox.com/en/support/usb-export/ (le texte extrait était aplati) ; recopier pour CDJ-2000NXS2, CDJ-900NXS, CDJ-3000, CDJ-3000X, CDJ-1500X, XDJ-1000MK2 : formats de bibliothèque, symboles « applicable / non applicable ». Joindre une capture du tableau.

### Priorité 2
**R-C09 · OneLibrary : spécification ou licence pour les tiers** (R-13) : https://alphatheta.com/en/onelibrary/, page développeurs AlphaTheta, contact éditeur. Rapporter : spécification publique ? SDK ? conditions ? Citation courte.

**R-C10 · Formats de clé et exFAT** (R-07) : FAQ citée par le manuel (« For DJ equipment supported with exFAT, check the FAQ ») ; rapporter la liste exacte des modèles et la date. Relire les noms de modèles dans https://cdn.rekordbox.com/files/20260317132052/OneLibrary-Compatible-USB-Device-Export-.pdf (page « Supported USB formats »).

**R-C11 · Format de l'historique sur la clé** (R-08) : dossier « Histories » d'une clé après une soirée (liste des fichiers et extensions, sans données personnelles) ; page officielle décrivant ce format, s'il existe. Appareil requis : clé exportée + CDJ.

**R-C12 · Guide Cloud Library Sync** (R-10) : https://cdn.rekordbox.com/files/20251202174725/rekordbox7.2.8_cloud_library_sync_operation_guide_EN.pdf ; rapporter prérequis (plan, compte) et limites.

**R-C13 · Conditions d'usage de marque et du format XML** (R-14) : https://alphatheta.com/en/company/trademarks/ et https://alphatheta.com/en/company/terms-of-use/ ; rapporter les règles d'emploi du nom « rekordbox » par un tiers. Ceci n'est pas un avis juridique.
