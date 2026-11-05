# 01 · rekordbox : format XML, import/export de playlists, « Bridge »

Consultation : 05/11/2026. Manuel lu en texte brut : `rekordbox7.2.18_manual_EN.pdf` (téléchargé depuis le CDN officiel, ~9,8 Mo, converti en texte localement ; « ce manuel décrit rekordbox ver. 7.0 ou plus »). Page « Download » : version courante affichée **7.2.19 (Windows), 24/09/2026** ; dernier manuel listé : 7.2.18. Les numéros de page ci-dessous sont ceux du manuel.

---

## R-01 · Format XML officiel (`rekordbox.xml`)
- **Question étudiée** : quelle est la structure documentée du XML d'échange de playlists ?
- **Source primaire** : document officiel « XML file format for playlists sharing » (PDF, 1 page), lié depuis la page développeurs.
- **URL exacte** : https://cdn.rekordbox.com/files/20200410160904/xml_format_list.pdf (liée depuis https://rekordbox.com/en/support/developer/)
- **Date de consultation** : 05/11/2026
- **Version concernée** : non indiquée dans le document (métadonnées du PDF : 2011 ; mise en ligne CDN datée 10/04/2020 d'après l'URL). Il ne faut donc pas écrire « format rekordbox 7 ».
- **Résultat vérifié** : éléments `DJ_PLAYLISTS` (attribut `Version`), `PRODUCT` (`Name`, `Version`, `Company`), `COLLECTION` (`Entries`), `TRACK` avec attributs `TrackID`, `Name`, `Artist`, `Composer`, `Album`, `Grouping`, `Genre`, `Kind`, `Size`, `TotalTime`, `DiscNumber`, `TrackNumber`, `Year`, `AverageBpm`, `DateModified`, `DateAdded`, `BitRate`, `SampleRate`, `Comments`, `PlayCount`, `LastPlayed`, `Rating`, `Location`, `Remixer`, `Tonality`, `Label`, `Mix`, `Colour` ; sous `TRACK` : `TEMPO` (`Inizio`, `Bpm`, `Metro`, `Battito`) et `POSITION_MARK` (`Name`, `Type`, `Start`, `End`, `Num`) ; `PLAYLISTS` > `NODE` (`Type` 0 = dossier / 1 = playlist, `Name`, `Count`/`Entries`, `KeyType` 0 = TrackID / 1 = Location) > `TRACK` (`Key`). Notes du document : « Location is essential for each track » ; les pistes absentes de toute playlist sont inutiles ; toutes les chaînes en UTF-8 avec entités XML encodées ; nombres indépendants de la locale (point décimal, pas d'espace) ; `Location` est un URI, média attendu sous `file://localhost/` ; durées en secondes, tailles en octets, dates `yyyy-mm-dd`, couleur en RGB (dans le texte, noms rekordbox Rose/Orange/Turquoise/Violet…).
- **Limites et contradictions** : le PDF a une couche de texte encodée par la police : les noms d'éléments se lisent bien, mais l'alignement des types de données (colonne de droite) a été reconstitué par décodage et n'a pas pu être contrôlé à l'image (visualisation de pages non disponible sur cette machine). Le document ne parle ni des lettres de lecteur, ni des chemins UNC, ni de la longueur.
- **Impact sur SetMate** : c'est le seul format d'échange rekordbox **documenté par l'éditeur**. Un XML minimal (COLLECTION avec `Location` + PLAYLISTS par `TrackID`) est faisable sans toucher à aucune base propriétaire.
- **Recommandation** : implémenter un export `rekordbox.xml` minimal comme voie rekordbox principale ; valider d'abord par un import réel dans rekordbox 7 (R-C05).
- **Statut** : **confirmé** (noms et règles générales) ; types de données exacts **probable**

## R-02 · L'XML est une bibliothèque lue puis glissée dans rekordbox (pas une écriture directe sur clé)
- **Question étudiée** : que fait rekordbox d'un fichier XML importé ?
- **Source primaire** : manuel rekordbox 7.2.18 et page développeurs.
- **URL exacte** : https://cdn.rekordbox.com/files/20260807093645/rekordbox7.2.18_manual_EN.pdf ; https://rekordbox.com/en/support/developer/
- **Date de consultation** : 05/11/2026
- **Version concernée** : rekordbox 7.0 et plus (manuel 7.2.18)
- **Résultat vérifié** : page développeurs : « You can now display your rekordbox playlists in the [Bridge] pane by importing playlist information from an XML file. » ; « Multiple playlists or playlist folders with the same name can't exist in the same level of a directory. » Manuel : les fichiers importés au format XML s'affichent dans l'arbre « rekordbox xml » ; on règle [Preferences] > [Advanced] > [Database] > [rekordbox xml] > [Imported Library] ; pour ajouter des pistes : glisser les fichiers de « rekordbox xml > All Tracks » vers [Collection] ; pour les playlists : « Importing from rekordbox xml » (p. 46) : double-cliquer [rekordbox xml] > [Playlists], puis glisser la playlist sous [Playlists].
- **Limites et contradictions** : **contradiction de vocabulaire** : la page développeurs parle d'un volet « Bridge » et de « Preferences > Bridge > Imported Library » (formulation lue sur la page, relayée par l'outil de lecture) ; le manuel 7.2.18 ne contient pas le mot « bridge » (recherche texte : 0 occurrence) et utilise « rekordbox xml » dans [Advanced] > [Database]. Hypothèse (probable) : « Bridge » est l'ancien nom (v5) de ce volet ; non démontré.
- **Impact sur SetMate** : l'XML n'écrit rien sur une clé USB : l'utilisateur doit **importer** dans rekordbox (glisser), puis exporter vers la clé avec rekordbox lui-même. Le texte de l'appli doit décrire ces étapes avec les noms du manuel 7 (« rekordbox xml »).
- **Recommandation** : notice en images « Réglages > Avancé > Base de données > rekordbox xml > Bibliothèque importée », puis « glisser la playlist sous Playlists ».
- **Statut** : **confirmé** (flux d'import dans le manuel 7.2.18) ; équivalence « Bridge » = ancien nom **probable**

## R-03 · Exporter la collection en XML depuis rekordbox
- **Question étudiée** : rekordbox peut-il écrire ce XML (pour tester, lire ou vérifier) ?
- **Source primaire** : manuel rekordbox 7.2.18, menu [File].
- **URL exacte** : https://cdn.rekordbox.com/files/20260807093645/rekordbox7.2.18_manual_EN.pdf
- **Date de consultation** : 05/11/2026
- **Version concernée** : 7.2.18
- **Résultat vérifié** : « [Export Collection in xml format] Export all playlist information in the rekordbox library (databases such as [Collection], [Playlists], etc.) and all track information in these playlists as one file with the xml format. » (p. 253). Option [Export BeatGrid information] pour inclure les grilles. « If using Cloud Library Sync, tracks in the other computer or mobile device are not supported for exporting. »
- **Limites et contradictions** : ne fournit pas d'exemple de fichier ; l'exemple le plus sûr est un export fait par rekordbox sur une copie de test.
- **Impact sur SetMate** : permet de comparer notre XML à un XML écrit par rekordbox (preuve d'interopérabilité sans écriture de base propriétaire).
- **Recommandation** : demander à Sabri un export XML de 3 morceaux fictifs comme gabarit ; l'ajouter aux données de test.
- **Statut** : **confirmé**

## R-04 · Import et export de playlists M3U / M3U8 / PLS / TXT (correction de L-007)
- **Question étudiée** : un M3U8 suffit-il comme voie de repli vers rekordbox ?
- **Source primaire** : manuel rekordbox 7.2.18.
- **URL exacte** : https://cdn.rekordbox.com/files/20260807093645/rekordbox7.2.18_manual_EN.pdf
- **Date de consultation** : 05/11/2026
- **Version concernée** : 7.2.18
- **Résultat vérifié** : « Playlist file formats M3U (.m3u), M3u8 (.m3u8), and PLS (.pls) can be imported. » via [File] > [Import] > [Import Playlist] (p. 40) : la playlist est ajoutée sous [Playlists] ; si [Auto Analysis] est activé, l'analyse des morceaux démarre. À l'export : clic droit sur la playlist > [Export a playlist to a file] > « (*.txt) » ou « for music apps (*.m3u8) ».
- **Limites et contradictions** : encodage attendu, chemins absolus ou relatifs, fins de ligne et lettres de lecteur ne sont pas décrits. **Correction** : `08` (L-007) écrit « renvoi vers M3U8 » comme solution de repli sans source ; le manuel confirme que le M3U8 est importable dans rekordbox. Cela n'est pas une garantie que les chemins SetMate seront retrouvés.
- **Impact sur SetMate** : le M3U8 est une voie documentée vers rekordbox, plus simple que l'XML pour les listes plates.
- **Recommandation** : offrir « M3U8 pour rekordbox » (liste plate) et « rekordbox.xml » (dossiers, cues) ; tester avec accents et chemins longs.
- **Statut** : **confirmé** (formats importables) ; détails de chemins/encodage **non vérifié**

## R-05 · « Bridge » : fonctionnement
- **Question étudiée** : qu'est-ce que Bridge et comment fonctionne-t-il dans rekordbox 7 ?
- **Source primaire** : seule occurrence officielle lue : page développeurs (voir R-02). Aucune page « Bridge » dédiée trouvée dans la liste de manuels de la page Download.
- **URL exacte** : https://rekordbox.com/en/support/developer/
- **Date de consultation** : 05/11/2026
- **Version concernée** : non précisée
- **Résultat vérifié** : l'importation XML s'effectue via un réglage nommé Bridge (selon la page développeurs). Rien d'autre.
- **Limites et contradictions** : le manuel 7.2.18 ne l'emploie pas (R-02). Ne pas confondre avec d'autres « bridges » (ponts de connexion de logiciels tiers).
- **Impact sur SetMate** : aucun impact fonctionnel : on s'appuie sur le nom « rekordbox xml » du manuel 7.
- **Recommandation** : ne pas utiliser le mot « Bridge » dans les notices pour rekordbox 7 ; mentionner « (anciennement Bridge) » seulement si R-C06 le confirme.
- **Statut** : **non vérifié**
