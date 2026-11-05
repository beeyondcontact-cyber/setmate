# 10 · Transmission à ChatGPT (SetMate 1.9.3-p0)

Établi le 05/11/2026. Ce texte se lit seul. Tu n'as pas vu les conversations. Il complète `AUDIT_TRANSMISSION_DJ_CHATGPT/14_BRIEF_RECHERCHE_CHATGPT.md` (écrit pour la version 1.9.1) : ici, l'état après la branche de correctifs.

## 1. Le projet en 5 lignes

SetMate est une application web d'aide aux DJ, en un seul fichier HTML, installable sur iPhone. Elle est écrite par Claude Code pour Sabri (DJ amateur, visuel, francophone) et une DJ amie. Sabri décide. Production : version 1.9.1 sur GitHub Pages (`main`, commit `382b661`), sans test avant mise en ligne. Travail récent : branche `fix/setmate-p0-stabilisation` (dernier commit `c2c7a99`, version 1.9.3-p0), **non fusionnée, non en ligne, non poussée**. Rien n'a été validé sur un iPhone réel ni dans un Serato réel.

## 2. Ce qui a été corrigé, avec le statut honnête

« CORRIGÉ ET TESTÉ » veut dire : preuve reproductible par test automatique. Pour P0-01 à P0-03, ce sont des **simulations** (moteur Chrome et moteur WebKit de bureau, pannes de stockage simulées, Deezer et iTunes fabriqués).

| Correctif | Commit | Statut | Limite |
|---|---|---|---|
| P0-01 Persistance : une écriture n'est réussie qu'après fin de transaction et relecture ; indicateur « non enregistré » ; écriture forcée à `pagehide` | `db03547` | CORRIGÉ ET TESTÉ (simulation) ; fermeture réelle iPhone À TESTER SUR APPAREIL | pannes de stockage réelles non provoquées |
| P0-02 Restauration : validation avant application, aperçu, copie `backup_prev`, application en une transaction | `a9a64ec` | CORRIGÉ ET TESTÉ (sauvegardes fabriquées et démo) | jamais essayée avec la vraie sauvegarde de Sabri ; `load()` ne revalide pas au démarrage |
| P0-03 Injection : `safeUrl`, plus d'URL dans du code, identifiants contrôlés | `4d8be71` | CORRIGÉ ET TESTÉ pour les entrées externes traitées | 104 `onclick` à données non réécrits (338 expressions « à revoir » dans l'outil d'audit, rapporté) ; JSONP et CSP ouverts |
| P0-04 Serato : plus aucune écriture dans `database V2`, crates ou `_Serato_` ; export M3U8 prioritaire | `5fdc6e6` | CORRIGÉ ET TESTÉ (faux disque en mémoire, comparaison octet par octet avec une référence) | **Serato réel : NON TESTÉ**. Compatibilité d'import affichée « non testée » |
| P0-05 CI GitHub : permissions minimales, actions figées sur SHA, contrôles de déploiement et du workflow | `78b7395`, `ee6adbc` | IMPLÉMENTÉ NON VALIDÉ | le workflow n'a **jamais tourné chez GitHub** |
| Contrôle de sabotage durci | `5fdc6e6`, `ee6adbc` | CORRIGÉ ET TESTÉ (25 sur 25, rapporté) | gestionnaires de signaux non testés |

Anomalies de l'audit précédent traitées : A-01 à A-06 et A-17 (avec les réserves ci-dessus). Partielles : A-08, A-16, A-19, A-20, A-23. Les 13 autres sont ouvertes. Détail : `08_ANOMALIES_RESTANTES.md`.

Résultats rapportés (non relancés pour ce document) : 198 tests réussis, 0 échoué, 38 non exécutés volontairement ; 25 sabotages détectés sur 25.

## 3. Ce qui reste (résumé)

- Jamais testé en réel : iPhone, Serato (3, 4, 5), clé USB, CDJ, Mac, rekordbox.
- JSONP Deezer : du code distant s'exécute dans l'appli ; pas de CSP.
- Textes de confidentialité contredits par les appels réseau.
- Pas de protection de `main` ; dépôts publics sans licence ; garde-fous de publication seulement dans Claude Code.
- Crate « Nouveautés » supprimée ; M3U non écrit en démo (décisions de Sabri à confirmer).
- Fonctions du cahier absentes : mode soirée, lecteur plein écran, rekordbox, enregistrement audio, etc.
- Précision d'analyse audio non mesurée sur de vrais morceaux.
- Licence AGPL d'essentia.js non tranchée.

## 4. Questions précises à étudier

Pour chaque question : fiche concernée dans `docs/research/` et lacune. Le fichier `docs/research/REQUETES_CHROME.md` contient les requêtes détaillées (identifiants R-C et R-iOS).

| Ordre | Question | Fiches / requêtes |
|---|---|---|
| 1 | Quelle est la **procédure officielle d'import M3U/M3U8 dans Serato DJ Pro 5.0** (menu, glisser-déposer, encodage, BOM, fins de ligne, chemins relatifs ou absolus, lettres de lecteur) ? | S-01, S-03 ; R-C01 |
| 2 | Que fait **Protect Library en 5.0** ? Existe-t-elle en 4.x ? Protège-t-elle d'une écriture disque externe ? Pourquoi « Crates 4.0 » la cite-t-il encore ? | S-07 à S-10 ; R-C02 |
| 3 | Notes de version de Serato 4.0.x : l'import M3U a-t-il été retiré ? Que dit l'éditeur de la nouvelle bibliothèque ? | S-02, S-13 ; R-C03 |
| 4 | **Écran verrouillé et arrière-plan audio** sur iOS 18.x et 26.x pour une web app installée : version exacte, enchaînement de morceaux. | I-08 ; R-iOS-01 |
| 5 | **Éviction du stockage** : la règle des 7 jours s'applique-t-elle aux applis installées dans les versions récentes ? | I-03 ; R-iOS-02 |
| 6 | `decodeAudioData` sur Safari iOS : formats (MP3, M4A, FLAC, AIFF, WAV) et limites de mémoire ; `OfflineAudioContext` dans un Worker. | I-07 ; R-iOS-03 |
| 7 | Interruptions audio (appel, Siri, autre appli) : texte officiel et bogue 273511. | I-09 ; R-iOS-04 |
| 8 | Comportement de Serato avec des chemins Windows : lettre de lecteur, UNC, plus de 260 caractères, OneDrive en ligne seulement. | S-16 ; R-C07 |
| 9 | rekordbox 7 : encodage et chemins acceptés par l'import M3U8 ; XML minimal accepté ; rôle exact de « Bridge » ; tableau Device Library / OneLibrary par modèle. | R-04, R-05, R-09 ; R-C05, R-C06, R-C08 |
| 10 | Licence d'essentia.js : texte de l'article 13 de l'AGPL, sens de « non commercial », licence commerciale. Pas d'avis juridique. | M-09 ; R-AM-02 |
| 11 | Définitions MIREX du P-score et des poids de tonalité ; article ISMIR 2018 sur l'Accuracy1/2 et les erreurs d'octave. | M-02, M-04 ; R-AM-01, R-AM-04 |
| 12 | Jeux de données de référence BPM et tonalité : tailles, licences, conditions d'usage. | M-07 ; R-AM-03 |
| 13 | Conditions de Deezer (JSONP, extraits, quotas) et possibilité d'un appel `fetch` avec CORS. | L-013, L-015 de l'audit ; non vérifié |
| 14 | Format réel des exports d'historique Serato, Apple Music, Spotify. | S-04, S-15 ; R-C04 ; L-006, L-012 |

Les sources déjà consultées et leur fiabilité sont dans `07_RECHERCHES_ET_SOURCES.md` de l'audit et dans `06_RECHERCHES_INTEGREES.md` ici. Ne les refais pas sans information nouvelle. Cherche ce qui manque.

## 5. Format de rendu attendu

Un bloc par question ou par requête (R-xxx) :

```
Référence : R-xxx ou numéro de question
Réponse courte (1 à 3 phrases) :
Sources : pour chacune -> URL exacte ; date de consultation (JJ/MM/AAAA) ; produit et VERSION concernés ;
          niveau (officiel / publication / analyse indépendante / communauté) ; citation courte (25 mots maximum) entre guillemets
Contradictions entre sources :
Ce qui reste inconnu :
Conséquence pour SetMate (une phrase, sans décider) :
Confiance : élevée / moyenne / faible, avec la raison
```

En tête de réponse : un tableau à 3 colonnes (référence, résultat en un mot : trouvé / partiel / introuvable, niveau de la meilleure source).

## 6. Règles

1. **Aucune supposition.** Écris « introuvable » ou « non vérifié » quand c'est le cas.
2. **Version et date pour chaque fait.** Un fait sans version est inutilisable.
3. Sources officielles d'abord. Une source de forum est étiquetée « communauté ».
4. Distingue trois choses : ce que dit la source, ce que tu en déduis, ce que tu proposes.
5. **Aucun contournement d'accès.** Si une page exige un compte ou un paiement, ou bloque les robots, note-le et passe.
6. Cite, ne copie pas de longs passages.
7. Si deux de nos fichiers se contredisent, signale-le sans trancher.
8. Un chiffre sans méthode (pourcentage, prix) est rejeté.
9. Écris en français, phrases courtes.

## 7. Ce que tu ne dois pas faire

- Ne te connecte à aucun compte (Serato, Apple, Spotify, Deezer, GitHub, Google). N'en crée pas.
- N'achète rien, n'installe rien, ne télécharge ni logiciel ni jeu de données.
- Ne prends aucune décision à la place de Sabri : prix, achat de compte, dépôt public ou privé, fusion, publication, protection de branche.
- Ne propose pas de contourner une protection, un DRM ou des conditions d'utilisation.
- Pas d'avis juridique : cite les textes officiels et recommande un juriste.
- N'écris pas que SetMate « fonctionne » ou « est compatible » avec Serato, rekordbox ou iPhone : aucune compatibilité n'est prouvée tant qu'un test réel n'est pas archivé.
- Ne demande ni mot de passe, ni adresse e-mail, ni donnée personnelle de Sabri ou de la DJ.
- Ne touche à aucun fichier du dépôt et ne prétends pas avoir exécuté un test que tu n'as pas exécuté.

## 8. Fichiers à lire, dans l'ordre

1. `00_ETAT_INITIAL.md`
2. `08_ANOMALIES_RESTANTES.md`
3. `06_RECHERCHES_INTEGREES.md`
4. `docs/research/REQUETES_CHROME.md`
5. `04_SERATO_VALIDATION.md` (§7 : ce qui reste non testé sur un vrai Serato)
6. `07_IPHONE_PLAN_TESTS.md`
7. En référence : `01` à `03`, `05`, `09`, et le dossier `AUDIT_TRANSMISSION_DJ_CHATGPT` (fichiers 00, 05, 06, 11, 14).

Chemin de base : `docs/audits/P0_STABILISATION_2026-11-05/` dans le worktree `travail_p0_worktree`.
