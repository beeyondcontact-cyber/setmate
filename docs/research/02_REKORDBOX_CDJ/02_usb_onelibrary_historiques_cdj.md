# 02 · rekordbox / CDJ : clé USB, Device Library, OneLibrary, historiques, générations de CDJ

Consultation : 05/11/2026. Les deux guides PDF officiels (USB Export Guide, OneLibrary Compatible USB Device Export Guide) ont été téléchargés et leur texte extrait localement ; la couche de texte est décalée par la police (chaque caractère majuscule/chiffre est déplacé d'un cran fixe) et a été décodée à la main. Les parties graphiques (schémas, tableaux de compatibilité, noms de modèles écrits en police japonaise) n'ont pas pu être lues : elles sont indiquées « illisible ».

---

## R-06 · Device Library et OneLibrary : deux bibliothèques sur une clé
- **Question étudiée** : que contient une clé exportée par rekordbox et quelles bibliothèques les lecteurs lisent-ils ?
- **Source primaire** : « USB Export Guide » (PDF, version 2025-10-07 d'après le nom du fichier).
- **URL exacte** : https://cdn.rekordbox.com/files/20251021171528/USB_export_guide_en_251007.pdf
- **Date de consultation** : 05/11/2026
- **Version concernée** : rekordbox for Mac/Windows ver. 7 (guide d'octobre 2025)
- **Résultat vérifié** : à l'export, rekordbox crée sur la clé une base appelée **Device Library** (playlists, informations de cue, etc.) ; AlphaTheta a créé une nouvelle base, **OneLibrary**, pour remplacer l'ancienne (« Formerly Device Library Plus »). Les deux coexistent sur la clé ; « the type of library used depends on the DJ equipment model ». Playlists et historiques créés sur un matériel compatible OneLibrary sont enregistrés dans OneLibrary ; sur un matériel compatible Device Library, dans la Device Library. « The histories or playlists created on OneLibrary compatible DJ equipment will not be displayed on Device Library compatible DJ equipment, and vice versa. » Conversion Device Library > OneLibrary possible depuis le menu contextuel ; « A OneLibrary cannot be converted to Device Library. » Attention : « If a OneLibrary exists on the USB storage device, converting the Device Library will overwrite the existing OneLibrary. » Synchroniser : [Update Collection] (cues et grilles modifiés sur le matériel), [Import Playlist], [Export Playlist] (« will create the playlist on both OneLibrary and Device Library »).
- **Limites et contradictions** : le guide ne cite pas de noms de fichiers sur la clé ; le tableau « quel matériel lit quelle bibliothèque » est un graphique non lisible ici.
- **Impact sur SetMate** : toute écriture directe sur une clé devrait toucher deux bibliothèques cohérentes selon le matériel, avec risque d'écrasement irréversible. Argument de plus pour ne jamais écrire dans la clé et passer par l'export de rekordbox.
- **Recommandation** : documenter le chemin « XML ou M3U8 > rekordbox > Export Playlist vers la clé » ; avertir : ne pas convertir une clé ayant déjà une OneLibrary sans sauvegarde.
- **Statut** : **confirmé**

## R-07 · Procédure officielle OneLibrary et formats de clé acceptés
- **Question étudiée** : quelle version, quels systèmes de fichiers, quelle procédure ?
- **Source primaire** : « OneLibrary Compatible USB Device Export Guide ».
- **URL exacte** : https://cdn.rekordbox.com/files/20260317132052/OneLibrary-Compatible-USB-Device-Export-.pdf
- **Date de consultation** : 05/11/2026
- **Version concernée** : rekordbox 7.2.11 ou plus récent (« If you are on an earlier version, please update first »)
- **Résultat vérifié** : lecteurs « OneLibrary » cités : CDJ-3000X, XDJ-AZ, OPUS-QUAD (guide) ; lecteurs anciens (« legacy ») : CDJ-3000, XDJ-AX… (liste partiellement illisible). Conseil réglages : [Import the play history automatically] = ON et [Delete from the device after importing the play history] = OFF. Étape de mise en concordance : clic droit sur « OneLibrary » > « Convert from Device Library ». Formats de clé : Windows : FAT32, exFAT ; Mac : FAT32, exFAT, HFS+ (Mac seulement) ; exFAT n'est pris en charge que par CDJ-3000X, CDJ-3000, XDJ-AZ, OPUS-QUAD, OMNIS-DUO, XDJ-XZ, XDJ-RX3. « Formatting will erase all data ».
- **Limites et contradictions** : le manuel 7.2.18 dit (section périphériques) que les systèmes NTFS et HFS ne sont pas pris en charge par rekordbox (« Use FAT32 for Windows and a FAT32 or HFS+ formatted device for Mac ») et renvoie à une FAQ pour exFAT : cohérent, mais deux sources, deux niveaux de détail. Liste exFAT : décodée, un modèle peut être mal lu.
- **Impact sur SetMate** : le chemin Windows de Sabri : clé en FAT32 ou exFAT (exFAT seulement pour les modèles listés).
- **Recommandation** : avertissement dans l'appli : « la clé doit être formatée par rekordbox/Windows en FAT32 (exFAT sur CDJ récents) ».
- **Statut** : **confirmé** (guide officiel, décodage des listes à recontrôler visuellement)

## R-08 · Historiques de lecture d'une clé USB
- **Question étudiée** : où et comment l'historique d'une soirée est enregistré et récupéré ?
- **Source primaire** : manuel rekordbox 7.2.18 + guides R-06/R-07.
- **URL exacte** : https://cdn.rekordbox.com/files/20260807093645/rekordbox7.2.18_manual_EN.pdf
- **Date de consultation** : 05/11/2026
- **Version concernée** : 7.2.18
- **Résultat vérifié** : « Connect the USB storage device used for your DJ performance to the computer. A play history of tracks in the device is automatically saved on rekordbox. The history is displayed in the [Histories] folder with its saved date. » Import manuel : [Devices] dans le Media Browser > dossier [Histories] de la clé > clic droit > [Import History]. Réglages [DJ System] > [Device] > [History] : import automatique, suppression de la clé après import (p. 239). « Tracks in the play histories can only be exported from [Collection] of your rekordbox. Tracks exported from another rekordbox or tracks deleted from your rekordbox cannot be saved in the play histories. Such tracks are excluded. » Dans rekordbox : [Histories] (PERFORMANCE : « HISTORY yyyy-mm-dd » pour une lecture d'au moins 1 minute ; LINK EXPORT : « LINK HISTORY yyyy-mm-dd »), avec clic droit pour copier vers une playlist.
- **Limites et contradictions** : le format du fichier d'historique sur la clé (XML ? base ?) n'est **pas** décrit par ces documents. Les historiques OneLibrary et Device Library sont séparés (R-06).
- **Impact sur SetMate** : pour un DJ sans ordinateur, le chemin documenté = rekordbox importe l'historique, puis l'exporte (le manuel ne le dit pas : à vérifier, probablement via l'export de playlist en `.txt`/`.m3u8` d'une playlist copiée depuis l'historique, d'après la phrase « copier vers une playlist »).
- **Recommandation** : lire le débrief depuis un `.m3u8`/`.txt` exporté de rekordbox plutôt que de lire la clé ; clé en lecture seule (L-008 réduite à ce chemin).
- **Statut** : **confirmé** (flux rekordbox) ; format sur disque **non vérifié**

## R-09 · Différences entre générations de CDJ
- **Question étudiée** : quels matériels sont pris en charge, et quelles différences touchent la préparation de clé ?
- **Source primaire** : pages rekordbox « USB Export », « OneLibrary FAQ », « Compatible DJ units » et page AlphaTheta OneLibrary.
- **URL exacte** : https://rekordbox.com/en/support/usb-export/ ; https://rekordbox.com/en/support/faq/onelibrary-7/ ; https://rekordbox.com/en/support/link/ ; https://alphatheta.com/en/onelibrary/
- **Date de consultation** : 05/11/2026
- **Version concernée** : rekordbox ver. 7
- **Résultat vérifié** : page USB Export : lecteurs listés : CDJ-3000X, CDJ-1500X, CDJ-3000, CDJ-TOUR1, CDJ-2000NXS2, CDJ-2000NXS, CDJ-900NXS, CDJ-850, CDJ-350, XDJ-1000MK2, XDJ-1000, XDJ-700 ; tout-en-un : OPUS-QUAD, OMNIS-DUO, XDJ-AZ, XDJ-AN, XDJ-XZ, XDJ-RX3, XDJ-RX2, XDJ-RX, XDJ-RR, XDJ-R1 (relayée par l'outil de lecture). La FAQ OneLibrary cite CDJ-3000X, CDJ-1500X, OPUS-QUAD, OMNIS-DUO, XDJ-AZ, XDJ-AN comme utilisant OneLibrary avec les mêmes étapes d'export. La page AlphaTheta cite aussi OneLibrary dans djay Pro, TRAKTOR Pro 4 (« à venir ») et VirtualDJ. Le guide d'export (R-07) distingue CDJ-3000 / XDJ-AX (« legacy ») des CDJ-3000X (OneLibrary).
- **Limites et contradictions** : **le tableau de compatibilité par modèle (Device Library / OneLibrary) n'a pas pu être lu** : le texte extrait est aplati. Les différences entre CDJ-2000NXS2 et CDJ-3000 (formats audio, taille de clé, fonctionnalités, exFAT) ne sont documentées dans aucune page lue au-delà de R-07. Pas de page « XDJ-AX » vérifiée.
- **Impact sur SetMate** : ne jamais écrire « compatible CDJ-xxx » ; indiquer « préparer une clé pour : [modèle] » et renvoyer à rekordbox.
- **Recommandation** : requête R-C08 (tableau de la page USB Export, lue à l'écran).
- **Statut** : **probable** (listes de modèles) ; matrice par modèle **non vérifié**

## R-10 · Méthodes officielles de synchronisation
- **Question étudiée** : quelles voies officielles rekordbox <-> clé <-> autres logiciels ?
- **Source primaire** : guides R-06/R-07 et manuel 7.2.18.
- **URL exacte** : voir R-06, R-07 ; guide Cloud Library Sync : https://cdn.rekordbox.com/files/20251202174725/rekordbox7.2.8_cloud_library_sync_operation_guide_EN.pdf (non lu)
- **Date de consultation** : 05/11/2026
- **Version concernée** : 7.2.x
- **Résultat vérifié** : [Export Playlist] vers la clé ; [Import Playlist] et [Update Collection] depuis la clé ; import XML / M3U8 / PLS ; export XML / TXT / M3U8 ; PRO DJ LINK (liens réseau, hors périmètre) ; Cloud Library Sync (guide non lu).
- **Limites et contradictions** : Cloud Library Sync nécessite un compte et un abonnement (non vérifié ici). Le XML ne synchronise pas : il se lit et se glisse (R-02).
- **Impact sur SetMate** : toutes les voies officielles passent par le logiciel rekordbox ; aucune API ni SDK public n'a été trouvée sur les pages lues.
- **Recommandation** : SetMate produit des fichiers d'échange (XML/M3U8) ; rekordbox fait l'export vers la clé.
- **Statut** : **confirmé** (voies listées) ; Cloud Library Sync **non vérifié**
