# 02 · Serato : « Protect Library »

Consultation : 05/11/2026. Texte brut lu via l'API du centre d'aide Serato (JSON, `curl`).

Cadre : « Protect Library » est une option de **l'interface de Serato** (les actions faites dans Serato). Aucune des sources lues ne parle d'écritures faites sur le disque par un autre logiciel.

---

## S-07 · Comportement de Protect Library jusqu'à la 3.3.5
- **Question étudiée** : que fait la case « Protect Library » ?
- **Source primaire** : article d'aide « Library + Display ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/223364427-Library-Display
- **Date de consultation** : 05/11/2026
- **Version concernée** : Serato DJ Pro 3.3.5 et antérieures (article mis à jour le 18/11/2025)
- **Résultat vérifié** : « NOTE: This feature is only available in Serato DJ Pro 3.3.5 and below. Enable to lock your library and prevent accidental track or crate deletion. Enabling this setting will also lock all file tags and crate names, so that no text can be changed. »
- **Limites et contradictions** : ne décrit que la protection contre les gestes dans l'interface (suppression, modification de texte). Ne dit rien d'un programme extérieur ni de l'état par défaut.
- **Impact sur SetMate** : en ≤ 3.3.5, une bibliothèque protégée peut faire échouer ou masquer une modification faite via Serato ; pour une écriture directe de fichier `.crate` par SetMate, l'effet n'est pas documenté.
- **Recommandation** : l'appli doit demander « décoche Protect Library » seulement pour les gestes dans Serato (ex. renommer), et ne pas en faire une promesse pour les fichiers écrits par SetMate.
- **Statut** : **confirmé** (≤ 3.3.5)

## S-08 · Mentions de l'option dans l'article « Crates 4.0 » (contradiction apparente)
- **Question étudiée** : l'option existe-t-elle encore en 4.x ?
- **Source primaire** : article d'aide « Crates in Serato DJ Pro & Serato DJ Lite 4.0 ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/227561407-Crates-in-Serato-DJ-Pro-Serato-DJ-Lite-4-0
- **Date de consultation** : 05/11/2026
- **Version concernée** : titre « 4.0 » (article mis à jour le 23/04/2026)
- **Résultat vérifié** : le texte contient : « TIP: The protect library option in the setup screen applies to removing, editing and renaming crates. Check this option to prevent changes to your crates. »
- **Limites et contradictions** : cette phrase est en tension avec S-07 (« only available in 3.3.5 and below »). Soit l'article « 4.0 » reprend un conseil ancien non nettoyé, soit l'option subsiste sous une autre forme. Des utilisateurs du forum disent l'option absente en 4.0 (communauté, non relu ici). On ne peut pas trancher avec les pages lues.
- **Impact sur SetMate** : on ne peut pas affirmer que la 4.x n'a pas de protection de bibliothèque.
- **Recommandation** : vérifier l'écran « Library + Display » d'une vraie 4.x (requête R-C02).
- **Statut** : **non vérifié** (contradiction documentaire)

## S-09 · Protect Library dans Serato DJ Pro 5.0.0
- **Question étudiée** : la 5.0 a-t-elle la même fonction, avec le même effet ?
- **Source primaire** : notes de version 5.0.0.
- **URL exacte** : https://serato.com/dj/pro/downloads
- **Date de consultation** : 05/11/2026
- **Version concernée** : 5.0.0
- **Résultat vérifié** : « Added Protect Library feature. » (relayée par l'outil de lecture). Aucune description.
- **Limites et contradictions** : les articles d'aide lus datent de novembre 2025 (S-07) et avril 2026 (S-08), donc d'avant la 5.0 : ils ne peuvent pas décrire la 5.0. « Ajoutée » en 5.0 suppose qu'elle avait disparu en 4.x : hypothèse cohérente avec S-07, contredite en partie par S-08.
- **Impact sur SetMate** : tout ce que fait Protect Library en 5.0 est inconnu (par défaut ? périmètre ? caisses seulement ?).
- **Recommandation** : traiter l'écriture de crate en 5.0 comme interdite tant que R-C02 n'a pas répondu (conforme à L-003 « si indisponible »).
- **Statut** : **non vérifié** (la ligne de notes est **confirmée**, le comportement est une **hypothèse** : même fonction qu'en 3.x)

## S-10 · Protect Library protège-t-elle contre des écritures disque faites par un autre logiciel ?
- **Question étudiée** : un programme extérieur (SetMate, copie de fichier) peut-il être bloqué par cette option ?
- **Source primaire** : aucune. Ni l'article « Library + Display », ni « Crates 4.0 », ni les notes 5.0.0 n'évoquent un programme extérieur ni un verrou sur les fichiers.
- **URL exacte** : sans objet
- **Date de consultation** : 05/11/2026
- **Version concernée** : toutes
- **Résultat vérifié** : les sources lues décrivent l'effet sur les gestes de l'utilisateur dans l'interface (« prevent accidental track or crate deletion », verrouillage des tags et des noms de caisse). Rien ne dit que l'option verrouille les fichiers sur le disque.
- **Limites et contradictions** : absence de preuve ≠ preuve d'absence. Serato réécrit ses fichiers à l'arrêt (sauvegardes, `database V2` / `Subcrates`) ; qu'il écrase des changements externes n'est pas documenté non plus.
- **Impact sur SetMate** : ne pas compter sur Protect Library comme garantie, dans un sens ou dans l'autre. Le risque réel (corruption, écrasement par Serato à la fermeture) reste à tester.
- **Recommandation** : n'écrire jamais dans la bibliothèque active ; produire des fichiers séparés (M3U8, liste) ; si une écriture est un jour réintroduite, travailler sur une copie et exiger Serato fermé.
- **Statut** : **non vérifié**
