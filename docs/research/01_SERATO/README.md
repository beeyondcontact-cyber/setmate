# 01 · Serato : index des fiches (consultation du 05/11/2026)

## Index
| Fichier | Fiches | Sujet |
|---|---|---|
| `01_import_m3u_et_exports.md` | S-01 à S-06 | Import M3U (5.0, 4.0), exports d'historique, iOS, formats audio |
| `02_protect_library.md` | S-07 à S-10 | Protect Library (3.3.5, 4.0, 5.0, écritures externes) |
| `03_dossier_serato_et_formats_internes.md` | S-11 à S-15 | `_Serato_`, `.crate`/`database V2`, Serato 4, sauvegardes, historiques |
| `04_chemins_et_transfert_non_destructif.md` | S-16 à S-18 | Chemins Windows, copie de caisses, déplacement de bibliothèque |

## Résumé en 10 lignes
1. 5.0.0 : notes officielles « Added the ability to import .M3U files. » : la méthode (menu, encodage, chemins) n'est décrite nulle part dans le centre d'aide trouvé.
2. 4.0 : import M3U signalé absent, uniquement par la communauté (fil du forum officiel, relais non vérifiable d'un modérateur).
3. « Protect Library » : officiel jusqu'à la 3.3.5 (verrouille suppressions, tags et noms de caisse dans l'interface) ; l'article « Crates 4.0 » la mentionne encore : contradiction non résolue.
4. 5.0.0 : « Added Protect Library feature. » sans description ; rien ne dit qu'elle empêche un logiciel extérieur d'écrire sur le disque (non vérifié).
5. Officiel : `_Serato_` dans Music (Windows et Mac) et à la racine de chaque disque ; `Subcrates` est le stockage courant ; `database V2` et `Crates` sont marqués « legacy » (avant 4.0.0).
6. Aucune spécification officielle de `.crate` / `database V2` : on n'écrit pas ces fichiers en production.
7. Historique : exports TXT, CSV, M3U et Serato Playlists dans un dossier « History Export » (emplacement ambigu) ; colonnes et encodage inconnus.
8. iOS : import de fichiers par l'application Fichiers (iCloud, Dropbox, Drive) et transfert de caisse depuis l'ordinateur : correction de `08`.
9. Chemins : un `_Serato_` par disque ; lettres de lecteur, UNC et chemins > 260 caractères : aucune source Serato.
10. Méthode non destructive officielle : actions dans l'interface (Files, copier/déplacer, Relocate Lost Files), sauvegardes `Export Backups` / `Library/Backups`.

## Comptage des fiches par statut (18)
- Confirmé (7) : S-01, S-04, S-05, S-07, S-11, S-15, S-18
- Probable (5) : S-02, S-06, S-13, S-14, S-17
- Hypothèse (0)
- Non vérifié (6) : S-03, S-08, S-09, S-10, S-12, S-16

## Corrections apportées aux documents existants
- `08` L-005 / matrice cas 16 : « Fichiers et iCloud non mentionnés » est périmé (S-05).
- Matrice §3 : le dossier `_Serato_/Subcrates` et les chemins sont désormais **officiels** (S-11), niveau B.
- `07` : le sens de « Protect Library ≤ 3.3.5 » est confirmé par texte brut (S-07), mais l'article « Crates 4.0 » la cite encore (S-08).

## Ce qui reste inconnu
- Procédure d'import M3U de la 5.0 ; encodage, BOM, CRLF/LF, chemins relatifs/absolus.
- Effet de Protect Library en 5.0 ; existence de l'option en 4.x ; effet sur les écritures extérieures.
- Structure de la bibliothèque 4.x/5.0 ; lecture de `Subcrates` par la 5.0.
- Format réel (colonnes, encodage) des exports d'historique ; emplacement exact de `History Export`.
- Chemins UNC, lettres de lecteur modifiées, chemins > 260 caractères.
- M3U / `.crate` sur iOS ; Mac.
- Source bloquée : `support.serato.com` en HTML (403) ; contournement par l'API JSON publique du centre d'aide ; page de la base `serato_database.md` (404).
