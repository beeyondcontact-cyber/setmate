# 03 · rekordbox : formats binaires (export.pdb, ANLZ, OneLibrary) et conditions

Consultation : 05/11/2026. Sources de niveau **communauté** quand elles viennent de projets d'ingénierie inverse : jamais « confirmé ».

---

## R-11 · `export.pdb` (Device Library)
- **Question étudiée** : ce fichier est-il documenté, et peut-on l'écrire sans risque ?
- **Source primaire** : aucune officielle. Source communautaire : analyse d'ingénierie inverse de Deep Symmetry.
- **URL exacte** : https://djl-analysis.deepsymmetry.org/rekordbox-export-analysis/exports.html
- **Date de consultation** : 05/11/2026
- **Version concernée** : Device Library (avant OneLibrary) ; versions non précisées
- **Résultat vérifié** (communauté) : base relationnelle en pages de taille fixe, en-tête avec pointeurs de tables, lignes avec index à rebours ; tables pistes, genres, artistes, albums, labels, tonalités, couleurs, playlists, entrées de playlist, pochettes ; chemin `/PIONEER/rekordbox/export.pdb` ; les lecteurs récents utilisent aussi `exportExt.pdb` ; chaînes « DeviceSQL » sans octet terminateur. Le document dit en toutes lettres que beaucoup de champs sont partiellement compris (« we do not know », « this is speculation ») et ne donne **aucune consigne d'écriture**.
- **Limites et contradictions** : projet tiers, sans lien avec l'éditeur ; antérieur à OneLibrary (non traité) ; un champ de transaction peut prendre la valeur `0x1fff` après échec d'écriture.
- **Impact sur SetMate** : une écriture directe pourrait produire une clé illisible pour le CDJ au moment de la scène, sans moyen de vérifier avant d'être sur place.
- **Recommandation** : n'écrire jamais `export.pdb` ; lecture éventuelle (diagnostic) seulement.
- **Statut** : **probable** (structure, niveau communauté) ; fiabilité pour l'écriture **hypothèse défavorable**

## R-12 · Fichiers d'analyse ANLZ (`.DAT`, `.EXT`, `.2EX`)
- **Question étudiée** : que contiennent-ils et sont-ils nécessaires à la clé ?
- **Source primaire** : aucune officielle. Source communautaire : Deep Symmetry.
- **URL exacte** : https://djl-analysis.deepsymmetry.org/rekordbox-export-analysis/anlz.html
- **Date de consultation** : 05/11/2026
- **Version concernée** : jusqu'à CDJ-3000 environ (le `.2EX` est décrit « ajouté avec le CDJ-3000 »)
- **Résultat vérifié** (communauté) : `.DAT` (base, anciens lecteurs), `.EXT` (formes d'onde couleur et détails), `.2EX` (3 bandes) ; sections `PQTZ` (grille), `PCOB`/`PCO2` (cues), `PPTH` (chemin UTF-16 du fichier audio), formes d'onde `PWAV`/`PWV2…PWV7`, `PSSI` (structure des phrases, avec masquage XOR dans rekordbox 6) ; nombres en gros-boutiste (« l'inverse de export.pdb »). Le texte avoue des champs inconnus, des incohérences internes et un calcul de la forme d'onde 3 bandes inexact.
- **Limites et contradictions** : contradiction interne sur l'emplacement des données `PWV7` (`.EXT` vs `.2EX`) ; ne couvre pas OneLibrary.
- **Impact sur SetMate** : l'analyse (grille, cues, ondes) est produite par rekordbox ; un fichier XML sans analyse oblige rekordbox à analyser.
- **Recommandation** : ne pas fabriquer d'ANLZ ; confier l'analyse à rekordbox (option [Auto Analysis], voir R-04).
- **Statut** : **probable** (niveau communauté)

## R-13 · OneLibrary : format publié ou non ?
- **Question étudiée** : existe-t-il une spécification publique, un SDK ou une licence pour des tiers ?
- **Source primaire** : page AlphaTheta OneLibrary et FAQ rekordbox.
- **URL exacte** : https://alphatheta.com/en/onelibrary/ ; https://rekordbox.com/en/support/faq/onelibrary-7/
- **Date de consultation** : 05/11/2026
- **Version concernée** : OneLibrary / rekordbox 7
- **Résultat vérifié** : la page décrit « A new common standard » et une « unified library format », annonce la compatibilité de djay Pro, VirtualDJ, TRAKTOR Pro 4 (« à venir ») ; elle ne mentionne ni SDK, ni licence, ni contact développeur (relayée par l'outil de lecture). La FAQ ne cite aucun nom de fichier.
- **Limites et contradictions** : « aucune spécification trouvée sur les pages lues » (et non « format non publié » : on ne peut pas exclure un document hors des pages lues, comme la page développeurs, lue seulement pour l'XML). Le fait que des logiciels tiers l'écrivent suggère qu'une documentation ou une licence existe quelque part.
- **Impact sur SetMate** : même conclusion que pour `export.pdb` : pas d'écriture directe.
- **Recommandation** : requête R-C09 (page développeurs AlphaTheta / contact) ; s'en tenir à l'XML et au M3U8.
- **Statut** : **non vérifié**

## R-14 · Licence et conditions (XML, nom « rekordbox », ingénierie inverse)
- **Question étudiée** : l'usage de l'XML et de formats de clé dans un produit vendu est-il permis ?
- **Source primaire** : contrat de licence utilisateur final rekordbox (EULA), version du 04/03/2025.
- **URL exacte** : https://rekordbox.com/en/license-agreement/
- **Date de consultation** : 05/11/2026
- **Version concernée** : EULA mis à jour le 04/03/2025
- **Résultat vérifié** (relayée par l'outil de lecture) : la clause 2.2(g) interdit de modifier, rétroconcevoir, désassembler ou décompiler le programme (exception là où la loi l'autorise, après notification écrite) et de créer un logiciel « substantiellement similaire dans son expression » ; 2.2(b) interdit de contourner une technologie ; 4.1(b) vise la gestion des droits numériques ; 4.2 réserve les droits, dont les marques. Le texte ne parle ni de XML ni de l'interopérabilité.
- **Limites et contradictions** : la page développeurs dit seulement comment importer un XML ; les conditions d'emploi du format XML par des tiers n'apparaissent pas. Les conditions de marque (page « Trademarks ») n'ont pas été lues. Ceci n'est pas un avis juridique.
- **Impact sur SetMate** : l'ingénierie inverse de formats binaires par SetMate serait risquée ; l'usage du XML documenté par l'éditeur est la voie la moins exposée. Éviter « rekordbox » dans le nom du produit.
- **Recommandation** : juriste avant toute vente (règle de Sabri) ; mention « compatible avec le format XML rekordbox », sans logo.
- **Statut** : **confirmé** (texte des clauses lues) ; conséquences juridiques **non vérifié**
