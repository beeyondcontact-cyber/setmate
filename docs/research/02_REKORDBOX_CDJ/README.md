# 02 · rekordbox / CDJ : index des fiches (consultation du 05/11/2026)

## Index
| Fichier | Fiches | Sujet |
|---|---|---|
| `01_xml_et_playlists.md` | R-01 à R-05 | Format XML, flux d'import, export XML, M3U8/PLS, « Bridge » |
| `02_usb_onelibrary_historiques_cdj.md` | R-06 à R-10 | Clé USB, Device Library / OneLibrary, historiques, générations CDJ, synchronisation |
| `03_formats_binaires_et_licence.md` | R-11 à R-14 | `export.pdb`, ANLZ, OneLibrary, EULA |

## Résumé en 10 lignes
1. Le seul format d'échange documenté par l'éditeur est le XML (`DJ_PLAYLISTS`), avec un PDF d'une page (noms d'éléments et d'attributs).
2. Un XML ne s'écrit pas sur une clé : rekordbox le lit (Advanced > Database > rekordbox xml > Imported Library), l'utilisateur glisse les pistes/playlists, puis rekordbox exporte vers la clé.
3. rekordbox 7 importe aussi M3U, M3U8 et PLS (File > Import > Import Playlist) et exporte TXT et M3U8 : le M3U8 est donc une voie documentée (correction de L-007).
4. La page développeurs parle de « Bridge » ; le manuel 7.2.18 n'emploie pas ce mot : divergence de vocabulaire.
5. Une clé exportée peut contenir deux bibliothèques : Device Library (ancienne) et OneLibrary (rekordbox 7.2.11 ou plus pour le guide) ; elles ont des historiques et playlists séparés ; la conversion est à sens unique et écrase une OneLibrary existante.
6. Formats de clé : FAT32, exFAT (modèles précis seulement), HFS+ (Mac) ; NTFS et HFS non pris en charge.
7. Historiques : importés dans rekordbox (automatique ou manuel) depuis la clé ; le format sur disque n'est pas documenté.
8. Générations de CDJ : listes de modèles lues, tableau de compatibilité par modèle illisible ; CDJ-3000X et CDJ-1500X sont OneLibrary ; CDJ-3000 est « legacy ».
9. `export.pdb` et ANLZ : documentés seulement par ingénierie inverse (communauté) ; OneLibrary : aucune spécification trouvée sur les pages lues.
10. EULA 2025 : interdit la rétro-ingénierie du programme ; rien sur l'usage du XML ; avis juridique requis avant toute vente.

## Comptage des fiches par statut (14)
- Confirmé (9) : R-01, R-02, R-03, R-04, R-06, R-07, R-08, R-10, R-14
- Probable (3) : R-09, R-11, R-12
- Hypothèse (0)
- Non vérifié (2) : R-05, R-13

## Ce qui reste inconnu
- Types exacts du XML contrôlés à l'image ; XML minimal accepté par rekordbox 7 (essai réel).
- Rôle exact de « Bridge » aujourd'hui.
- Encodage / chemins acceptés par l'import M3U8 de rekordbox.
- Tableau Device Library / OneLibrary par modèle ; différences CDJ-2000NXS2 / CDJ-3000 / CDJ-3000X.
- Format de l'historique sur la clé ; Cloud Library Sync (guide non lu).
- Existence d'une spécification/licence OneLibrary pour tiers ; conditions d'usage de marque.
- Sources bloquées/limites : PDF illisibles par l'outil de lecture (traités localement avec décodage manuel) ; tableau de la page « USB Export » aplati par l'outil.
