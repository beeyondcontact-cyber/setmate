# 03 · Serato : dossier `_Serato_`, `.crate`, `database V2`, sauvegardes

Consultation : 05/11/2026. Texte brut via l'API du centre d'aide Serato.

---

## S-11 · Emplacement et contenu du dossier `_Serato_` (avec marquage « legacy »)
- **Question étudiée** : où est `_Serato_`, et quels fichiers sont lus par les versions actuelles ?
- **Source primaire** : article « What is in the _Serato_ folder? ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/204022904-What-is-in-the-Serato-folder
- **Date de consultation** : 05/11/2026
- **Version concernée** : Pro et Lite, « avant 4.0.0 » pour les éléments marqués [LEGACY] (article mis à jour le 19/11/2025)
- **Résultat vérifié** : Windows : `C:\Users\[Your Username]\Music\_Serato_` ; macOS : `Mac > Users > [Your Username] > Music > _Serato_` ; « Serato creates a _Serato_ folder on the root level of any external drive from which you've added music. » Éléments marqués [LEGACY] (créés seulement par les versions avant 4.0.0) : `Auto Import`, `Collapsed.pref`, `Crates`, `database V2`, `Imported`, `Neworder.pref`, `RelocateLostFiles.log`. Pour `Crates` : « current versions primarily use the Subcrates folder. » `Subcrates` : « Primary storage for crate and subcrate files in current Serato versions. » `Smartcrates` : définitions de caisses intelligentes.
- **Limites et contradictions** : **correction de la matrice** : le dossier `_Serato_/Subcrates` et les chemins Windows/Mac sont désormais **officiels** (ils étaient niveau C via Vibo). Mais la phrase « `database V2` [LEGACY] » signale qu'en 4.0.0 la base ne vit plus (ou plus seulement) dans `database V2` ; l'article ne dit pas où elle est ni si `Subcrates` y est encore la source de vérité. Pas de mention de la 5.0.
- **Impact sur SetMate** : l'hypothèse « écrire `Subcrates/*.crate` suffit » n'est établie pour aucune version ≥ 4.0 : le fichier peut exister sans être lu comme source de vérité. L'écriture de `database V2` par `exportUsb` est à désactiver pour ≥ 4.0.
- **Recommandation** : lecture seule de `_Serato_` pour le diagnostic ; pas d'écriture pour ≥ 4.0 ; test d'ouverture sur copie en 5.0 (L-001).
- **Statut** : **confirmé** (emplacements, mentions legacy) ; compatibilité de `Subcrates` en 4/5 **non vérifié**

## S-12 · Spécification interne de `.crate` et de `database V2`
- **Question étudiée** : existe-t-il une spécification officielle (balises, types, encodage, chemins) ?
- **Source primaire** : aucune. Les articles d'aide lus listent les fichiers sans décrire leur format.
- **URL exacte** : sans objet. Source communautaire consultée : https://github.com/Holzhaus/serato-tags (page d'accueil) ; son document sur la base : https://github.com/Holzhaus/serato-tags/blob/main/docs/serato_database.md renvoie 404.
- **Date de consultation** : 05/11/2026
- **Version concernée** : non précisée
- **Résultat vérifié** : le dépôt `serato-tags` (niveau **communauté**, ingénierie inverse) documente les étiquettes GEOB à l'intérieur des fichiers audio (`Serato Markers2`, `Serato BeatGrid`, etc.), pas les fichiers `.crate`/`database V2`. Licence : scripts MIT, reste CC BY-SA 4.0. Le texte de `fileformats.md` lu confirme : MP3/AIFF en ID3v2.4 GEOB, FLAC en `VORBIS_COMMENT`, MP4 en atomes `com.serato.dj`, AAC en XML dans `_Serato_/Metadata`.
- **Limites et contradictions** : tout détail sur l'encodage (UTF-16), les chemins relatifs à la racine du lecteur ou les balises `otrk`/`ptrk` est ici **recopié de la mémoire du projet**, non revu aujourd'hui.
- **Impact sur SetMate** : confirme L-001 : aucune spécification officielle disponible ; l'aller-retour octet par octet de T-12 reste la seule preuve, sur 2 fichiers de Serato 3.
- **Recommandation** : ne pas écrire de `.crate`/`database V2` en production ; garder en lecture pour la 3.x ; privilégier M3U8 et partage (la décision L-001 « si indisponible »).
- **Statut** : **non vérifié** (aucune spécification officielle ; documents communautaires partiels)

## S-13 · Nouvelle bibliothèque de Serato 4 : ce que dit l'éditeur
- **Question étudiée** : la 4.0 change-t-elle la structure de bibliothèque ?
- **Source primaire** : articles d'aide « What is in the _Serato_ folder? » (S-11) et « Navigating and Managing your Library ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/14359483189135-Navigating-and-Managing-your-Library
- **Date de consultation** : 05/11/2026
- **Version concernée** : 4.0 et plus (article mis à jour le 18/11/2025)
- **Résultat vérifié** : l'article « Navigating » parle de fonctions « From Serato DJ 4.0 onwards » (clic droit, émojis de notes) ; il ne décrit pas la structure de base et ne parle ni d'import M3U ni de Protect Library (relayée par l'outil). Seul indice officiel de changement de base : les [LEGACY] de S-11.
- **Limites et contradictions** : Lexicon et Crate Cleaner (analyses indépendantes, citées par `07`) parlent d'une base différente ; non relus aujourd'hui.
- **Impact sur SetMate** : le changement de base est une inférence, pas un fait documenté.
- **Recommandation** : requête R-C03 (notes de version 4.0.x dans l'archive et manuel).
- **Statut** : **probable**

## S-14 · Sauvegardes automatiques de la bibliothèque
- **Question étudiée** : que sauvegarde Serato, où, quand ? (utile pour le retour arrière)
- **Source primaire** : article « Library Auto-Backup ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/227561667-Library-Auto-Backup
- **Date de consultation** : 05/11/2026
- **Version concernée** : « 3.3.5 and below » pour la rétention des Export Backups ; le reste sans version (article mis à jour le 18/11/2025)
- **Résultat vérifié** (relayée par l'outil de lecture) : à la fermeture, une sauvegarde copie le dossier `Subcrates`, `database V2` et `neworder.pref` dans un dossier « Export Backups » ; une seule sauvegarde conservée (≤ 3.3.5). Sauvegardes de bibliothèque automatiques : 15 minutes après l'ouverture, toutes les 24 h, et à chaque changement de structure de la base, dans `Serato/Library/Backups`. Restauration manuelle (copier la sauvegarde, supprimer l'ancienne base).
- **Limites et contradictions** : applicabilité à la 4/5 non précisée ; contenu non relu en texte brut.
- **Impact sur SetMate** : renforce la règle « ne jamais écrire dans la bibliothèque active » : la restauration est manuelle et écrase les changements récents.
- **Recommandation** : rappeler à l'utilisateur de laisser Serato faire sa sauvegarde, et de ne rien modifier pendant qu'il est ouvert.
- **Statut** : **probable**

## S-15 · Où sont les historiques de lecture de Serato (ambiguïté)
- **Question étudiée** : où sont enregistrées les sessions d'historique et les exports ?
- **Source primaire** : articles « Backing up and moving your library to a new computer » et « History ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/202305054-Backing-up-and-moving-your-library-to-a-new-computer ; https://support.serato.com/hc/en-us/articles/223455687-History
- **Date de consultation** : 05/11/2026
- **Version concernée** : sans numéro ; 202305054 mis à jour le 13/07/2026
- **Résultat vérifié** : « Your Serato "Library" folder (Located in "Application Support > Serato on macOS, or AppData > Local > Serato on Windows) This contains history sessions, preferences, and crate order, among other things. » L'article « History » : exports dans « the History Export folder contained in your Serato folder ».
- **Limites et contradictions** : « your Serato folder » peut être `_Serato_` (Music) ou le dossier `Library` : à lever sur une machine réelle. Pour la 4.0, l'article « KNOWN ISSUE: History Not Importing in Serato DJ 4.0 » (https://support.serato.com/hc/en-us/articles/14363243851919) cite l'import d'historique (échec par manque de 5 Go d'espace ou base corrompue) et ne nomme pas de dossier.
- **Impact sur SetMate** : l'import d'historique doit accepter un fichier exporté choisi par l'utilisateur ; ne pas coder un chemin en dur.
- **Recommandation** : sélection manuelle du fichier exporté ; ajouter l'emplacement réel à la fiche après observation.
- **Statut** : **confirmé** (Library = sessions d'historique) ; emplacement exact de `History Export` **non vérifié**
