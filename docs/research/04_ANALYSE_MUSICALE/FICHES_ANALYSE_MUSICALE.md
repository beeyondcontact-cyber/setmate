# Fiches analyse musicale (SetMate 1.9.1)

Consultation : 05/11/2026. Mêmes avertissements que `03_IPHONE_SAFARI\FICHES_IPHONE_SAFARI.md` : pages lues par **résumé d'outil** (à reconfirmer), aucune exécution de bibliothèque, aucun jeu de données téléchargé.

## Cadre : ce que SetMate a vraiment mesuré
Seule mesure du projet (T-10, 05/11/2026) : **12 sons de synthèse** fabriqués, WAV 16 bits lus à la main, hors `decodeAudioData` : BPM juste (±1) 12/12 ; tonalité exacte 10/12 ; énergie = 1 sur les 12 ; confiance de tonalité de 0 à 0,36. **Ces chiffres ne disent rien de la précision sur de vrais morceaux** (mixage, voix, percussions irrégulières, MP3). Aucun vrai morceau, aucun MP3 mesuré.

## Correction à l'audit
`08` (L-018) écrit que les jeux publics annotés sont « à vérifier ». C'est fait ici pour trois jeux (fiche M-07). Le commentaire « 11 sur 12 » reste sans source (inchangé).

---

## M-01 · Estimation du tempo (BPM)
- **Question étudiée** : quelles méthodes publiées et quelles bibliothèques estiment le BPM, avec quels paramètres par défaut ?
- **Source primaire** : documentation Essentia : `RhythmExtractor2013`, `PercivalBpmEstimator`.
- **URL exacte** : https://essentia.upf.edu/reference/std_RhythmExtractor2013.html ; https://essentia.upf.edu/reference/std_PercivalBpmEstimator.html
- **Date de consultation** : 05/11/2026.
- **Version concernée** : Essentia (version de la page non indiquée pour RhythmExtractor ; la page KeyExtractor indique « 2.1-beta6-dev »).
- **Résultat vérifié** : (résumé outil) `RhythmExtractor2013` : sorties `bpm`, `ticks` (positions des temps en secondes), `confidence`, `estimates`, `bpmIntervals` ; `method` = `multifeature` (défaut) ou `degara` (confiance toujours 0) ; `minTempo` 40 (plage 40 à 180), `maxTempo` 208 (plage 60 à 250) ; la page exige un signal à **44 100 Hz** « to work correctly ». `PercivalBpmEstimator` : fondé sur Percival et Tzanetakis (2014), IEEE/ACM TASLP 22(12), 1765-1776 ; `minBPM` 50, `maxBPM` 210, `sampleRate` 44100.
- **Limites et contradictions** : la page `RhythmExtractor2013` **ne parle ni de précision ni d'erreurs d'octave** (rien à en tirer). Aucune performance chiffrée de ces algorithmes sur des jeux DJ n'a été lue ici (voir tempo_eval en M-02 pour Percival 2014 sur GiantSteps).
- **Impact sur SetMate** : la plage de recherche (40 à 208) autorise 70 et 140 pour un morceau à 140 : le choix de l'octave est le point critique (M-02). L'obligation de 44,1 kHz impose un rééchantillonnage en entrée (`decodeAudioData` rend le taux du contexte).
- **Recommandation** : n'afficher le BPM que comme « estimation » avec un indice de confiance ; mesurer (protocole `PROTOCOLE_MESURE.md`).
- **Statut** : confirmé (description des algorithmes) ; non vérifié (précision réelle de l'implémentation de SetMate).

## M-02 · Demi-tempo / double-tempo (erreurs d'octave)
- **Question étudiée** : comment mesure-t-on et que révèlent les erreurs « moitié/double » ?
- **Source primaire** : rapport `tempo_eval` (analyse indépendante, auteur Hendrik Schreiber) ; résultat de recherche sur Schreiber et Müller, ISMIR 2018.
- **URL exacte** : https://tempoeval.github.io/tempo_eval_report/giantsteps_tempo.html ; article ISMIR 2018 : https://ismir2018.ismir.net/doc/pdfs/220_Paper.pdf (**non lu**, trouvé par recherche)
- **Date de consultation** : 05/11/2026 (page sans date visible).
- **Version concernée** : GiantSteps Tempo, références 1.0 (664 pistes) et 2.0 (661 pistes avec tempo).
- **Résultat vérifié** : (résumé outil) Accuracy1 et Accuracy2 utilisent une tolérance de **4 %** ; les métriques de type MIREX (P-Score, One Correct, Both Correct) utilisent **8 %**. Définition (résultat de recherche, non lue dans l'article) : Accuracy1 = part des estimations dans la tolérance ; Accuracy2 = idem en acceptant aussi les facteurs 2, 3, 1/2, 1/3. Exemples du tableau, Accuracy1 / Accuracy2, référence 1.0 : `percival2014/stem` 0,5151 / 0,8855 ; `schreiber2014/default` 0,5663 / 0,8690 ; `boeck2015/tempodetector2016_default` 0,5798 / 0,8630 ; `davies2009/mirex_qm_tempotracker` 0,2666 / 0,4639 ; meilleur de la page `sun2021/default` 0,8042 / 0,9096. Avec la référence 2.0 (annotations corrigées), les valeurs montent (ex. `percival2014/stem` 0,5703 / 0,9607).
- **Limites et contradictions** : le tableau a transité par un résumé ; les 3 premiers chiffres d'un algorithme donné dépendent de la version de la référence (1.0 ou 2.0), donc **ne pas citer un chiffre sans la version**. Les résultats de la recherche (« 77,0 % Accuracy1 pour NI Traktor Pro 2, 90,2 % Accuracy2 pour CrossDJ ») viennent de résumés de recherche : **non vérifiés**. Le jeu est de la musique de danse électronique : à ne pas extrapoler à tous les genres. 4 % de 128 BPM valent environ **5 BPM** : trop large pour caler deux platines (DJ visent ±1).
- **Impact sur SetMate** : l'écart entre Accuracy1 et Accuracy2 sur GiantSteps (environ 0,3 à 0,4 pour plusieurs algorithmes) montre que les erreurs d'octave pèsent beaucoup sur de la musique de DJ. SetMate n'a aucune mesure d'octave sur du réel.
- **Recommandation** : rapporter Accuracy1, Accuracy2 **et** le critère ±1 BPM du projet (AC-12) ; proposer à l'utilisateur « ×2 / ÷2 » en un geste et mémoriser son choix.
- **Statut** : confirmé (existence des métriques, tolérances du rapport) ; non vérifié (détails de l'article ISMIR 2018).

## M-03 · Détection des temps, des premiers temps et des phrases
- **Question étudiée** : comment évalue-t-on la détection des temps (beats) et que sait-on des phrases (8/16/32 temps) ?
- **Source primaire** : documentation `mir_eval.beat` ; dépôt Harmonix Set ; Essentia `RhythmExtractor2013` (sorties `ticks`).
- **URL exacte** : https://mir-eval.readthedocs.io/latest/api/beat.html ; https://github.com/urinieto/harmonixset
- **Date de consultation** : 05/11/2026.
- **Version concernée** : `mir_eval` « latest » (version non indiquée sur la page).
- **Résultat vérifié** : (résumé outil) F-measure avec fenêtre de **0,07 s** ; Cemgil (sigma 0,04) ; Goto (seuil 0,35) ; P-score (0,2 fois l'intervalle médian) ; CMLc/CMLt/AMLc/AMLt (seuils de phase et période 0,175) ; gain d'information (41 classes). Harmonix Set : 912 morceaux pop occidentaux, annotations de **temps, premiers temps, segmentation fonctionnelle** (JAMS).
- **Limites et contradictions** : **aucune source lue sur la détection de phrases** (regroupements de 8/16/32 temps) ni sur les premiers temps dans les musiques de danse : non vérifié. Harmonix est de la pop, pas de l'électronique de club ; l'audio n'est pas inclus.
- **Impact sur SetMate** : la grille de temps (beatgrid) et les phrases sont indispensables aux transitions (M-06) mais ne sont mesurées par aucun test du projet.
- **Recommandation** : mesure de la grille sur un petit corpus annoté à la main (F-measure à 70 ms) avant toute promesse de « calage auto ».
- **Statut** : confirmé (métriques) ; non vérifié (phrases, downbeats en DJ).

## M-04 · Estimation de tonalité
- **Question étudiée** : quelles méthodes et quel score pour la tonalité ?
- **Source primaire** : documentation `mir_eval.key` ; documentation Essentia `KeyExtractor` ; Faraldo et al., ECIR 2016 (résumé de recherche).
- **URL exacte** : https://mir-eval.readthedocs.io/latest/api/key.html ; https://essentia.upf.edu/reference/std_KeyExtractor.html ; DOI 10.1007/978-3-319-30671-1_25 (page éditeur **non lue**)
- **Date de consultation** : 05/11/2026.
- **Version concernée** : `mir_eval` « latest » ; Essentia « 2.1-beta6-dev » (page KeyExtractor).
- **Résultat vérifié** : (résumé outil) `mir_eval.key.weighted_score` : **1,0** même tonalité et mode ; **0,5** quinte juste au-dessus de la référence ; **0,3** relatif majeur/mineur ; **0,2** parallèle ; 0 sinon (option pour accepter aussi la quinte en dessous). Étiquette honnête : ce sont **les poids de `mir_eval`**, pas le texte de la page MIREX (la page MIREX n'a pas pu être lue, certificat expiré). `KeyExtractor` : calcule des HPCP puis un algorithme `Key` ; paramètres par défaut `profileType` **`bgate`**, `sampleRate` 44100, `frameSize` 4096, `hpcpSize` 12 ; 16 profils acceptés (dont `edma`, `edmm`, `krumhansl`, `temperley`, `faraldo`). Faraldo, Gómez, Jordà, Herrera, ECIR 2016 : nouveaux profils de tonalité pour la musique de danse électronique, améliorations rapportées sur des jeux pop et EDM (résumé de recherche, sans chiffres).
- **Limites et contradictions** : la page `KeyExtractor` ne décrit pas les profils : **ne pas affirmer** que `edma` ou un autre est le profil de Faraldo. Les résultats chiffrés de précision n'ont pas été lus. Le code Camelot (5A, 8B) est une notation : on convertit vers tonique+mode avant de scorer.
- **Impact sur SetMate** : T-10 compte « tonalité exacte » (10/12). Sur du réel, les erreurs de quinte et de relatif sont fréquentes dans la littérature MIR (affirmation générale, non sourcée ici) : il faut un score pondéré **et** le taux « exact ».
- **Recommandation** : reporter exact, pondéré (poids `mir_eval`) et « voisin Camelot » (±1 ou même numéro A/B), séparément.
- **Statut** : confirmé (poids `mir_eval`, paramètres Essentia) ; probable (apport des profils EDM) ; non vérifié (précision chiffrée).

## M-05 · Descripteurs d'énergie
- **Question étudiée** : comment un niveau d'énergie de morceau (1 à 10) est-il défini et validé dans la littérature ?
- **Source primaire** : aucune lue.
- **URL exacte** : aucune.
- **Date de consultation** : 05/11/2026.
- **Version concernée** : sans objet.
- **Résultat vérifié** : rien. Observation du projet : énergie = 1 sur les 12 sons de synthèse (T-10), donc le descripteur ne discrimine pas sur ce corpus.
- **Limites et contradictions** : « énergie » n'est pas une grandeur standard ; la notion DJ (niveau perçu 1-10) n'a pas de vérité terrain publique connue de moi (non vérifié).
- **Impact sur SetMate** : le chiffre d'énergie affiché n'a aucune validation ; risque de promesse trompeuse.
- **Recommandation** : n'afficher l'énergie que si elle est corrélée à une note de DJ sur ≥ 100 morceaux (voir `PROTOCOLE_MESURE.md`) ; sinon la nommer « indice de niveau sonore ».
- **Statut** : non vérifié.

## M-06 · Évaluation de transitions
- **Question étudiée** : existe-t-il un protocole standard pour juger la qualité d'une transition de DJ ?
- **Source primaire** : Chen et al., « Automatic DJ Transitions with Differentiable Audio Effects and Generative Adversarial Networks », arXiv:2110.06525 (soumis le 13/10/2021, v2 du 17/02/2022, ICASSP 2022).
- **URL exacte** : https://arxiv.org/abs/2110.06525
- **Date de consultation** : 05/11/2026.
- **Version concernée** : arXiv v2.
- **Résultat vérifié** : l'**abstract** (page lue) annonce une méthode GAN avec égaliseurs et fondus différentiables et « a listening test » : résultat « compétitif ». La **conception du test d'écoute** (marquage de l'instant de transition puis échelle de Likert sur préférence et fluidité, lignes de base : somme, fondu linéaire, mix humain) vient d'un résumé de recherche et **n'est pas lue dans l'article** : non vérifiée.
- **Limites et contradictions** : cet article évalue des transitions *générées*, pas la compatibilité de deux morceaux choisis par un humain. **Aucun protocole standardisé** de qualité de transition n'a été trouvé. Les autres éléments de la recherche (mémoire de master, commentaires de relecture d'une soumission) ne sont pas retenus comme sources.
- **Impact sur SetMate** : la « compatibilité » de transition (BPM, tonalité, énergie) est une heuristique non validée.
- **Recommandation (proposition)** : valider avec des DJ par note 1 à 5 « enchaînement jouable ? » sur des paires, avec une paire témoin au hasard et une paire jugée bonne par un DJ.
- **Statut** : non vérifié (protocole) ; confirmé (existence de l'article et de son abstract).

## M-07 · Jeux de données publics de référence
- **Question étudiée** : quels jeux ont une vérité terrain BPM/tonalité/temps et quelle licence ?
- **Source primaire** : pages des dépôts (GiantSteps, FMA, Harmonix, MTG-Jamendo) ; API GitHub pour le champ « licence ».
- **URL exacte** : voir tableau.
- **Date de consultation** : 05/11/2026.
- **Version concernée** : voir tableau.
- **Résultat vérifié** (résumé outil ; `license: null` côté GitHub = **aucune licence déclarée, pas « libre d'usage »**) :

| Jeu | Taille | Annotations | Licence réelle lue | Usage autorisé | URL |
|---|---|---|---|---|---|
| GiantSteps Tempo | 664 extraits de 2 min (Beatport) ; réf. 2.0 : 661 pistes avec tempo | BPM issus de corrections de forum (v1), crowdsourcing (v2, Schreiber et Müller 2018) | Aucune licence déclarée (API : `null`) | **Indéterminé.** Le dépôt ne fournit que des liens et scripts de téléchargement vers les extraits Beatport | https://github.com/GiantSteps/giantsteps-tempo-dataset |
| GiantSteps Key | 604 extraits de 2 min (Beatport) | Tonalité issue de corrections de forum | Aucune licence déclarée (API : `null`) | **Indéterminé** (même remarque) | https://github.com/GiantSteps/giantsteps-key-dataset |
| GiantSteps MTG Key | non vérifié (README non lu) | non vérifié | Aucune licence déclarée (API : `null`) | **Indéterminé** | https://github.com/GiantSteps/giantsteps-mtg-key-dataset |
| FMA (Free Music Archive) | fma_small 8 000 pistes de 30 s (7,2 Gio) à fma_full 106 574 pistes (879 Gio) | Genres, métadonnées, descripteurs ; **BPM/tonalité non mentionnés** | Code MIT ; métadonnées CC BY 4.0 ; audio « sous la licence choisie par l'artiste » | Recherche ; vérifier la licence de chaque piste | https://github.com/mdeff/fma |
| Harmonix Set | 912 morceaux pop | Temps, premiers temps, segmentation | Dépôt MIT ; téléchargement des spectrogrammes soumis à une licence à accepter | Audio non inclus (URL YouTube) ; **droits d'usage de l'audio non résolus** | https://github.com/urinieto/harmonixset |
| MTG-Jamendo | plus de 55 000 pistes complètes | 195 tags (genre, instrument, ambiance) ; **pas de BPM ni tonalité** | Audio : CC variable par piste ; métadonnées CC BY-NC-SA 4.0 ; code Apache 2.0 | « Solely non-commercial research and academic use » | https://mtg.github.io/mtg-jamendo-dataset/ |
| Ballroom | **non vérifié** (page non accessible : HTTP 403) | non vérifié | non vérifié | non vérifié | https://www.upf.edu/web/mtg/ballroom (403) |

- **Limites et contradictions** : jeux importants non lus (Ballroom, GTZAN-Tempo/Key, SMC, Hainsworth, Isophonics, SALAMI, McGill Billboard) : **non vérifiés**, ne pas les citer. Les extraits GiantSteps proviennent de Beatport : l'absence de licence sur les annotations ne vaut pas droit d'utiliser les extraits audio.
- **Impact sur SetMate** : GiantSteps est le plus proche du terrain DJ (musique électronique) mais son statut d'usage est flou. Le projet ne doit pas intégrer de fichiers de ces jeux dans le dépôt public.
- **Recommandation** : (1) évaluer en local, sans redistribuer ; (2) constituer un corpus de morceaux de Sabri annotés par lui (usage privé) ; (3) demander l'avis d'un juriste avant toute publication de résultats incluant des extraits ; (4) lire la licence de chaque jeu avant téléchargement (règle du projet).
- **Statut** : confirmé (tailles et licences lues, sauf cases « non vérifié »).

## M-08 · Validation avec des DJ
- **Question étudiée** : comment valider l'utilité auprès de DJ réels ?
- **Source primaire** : `07` §3.5 de l'audit cite NN/g (« interview sample size ») ; non relue ici.
- **URL exacte** : https://www.nngroup.com/articles/interview-sample-size/ (citée par l'audit, **non relue**)
- **Date de consultation** : non consultée (05/11/2026).
- **Version concernée** : sans objet.
- **Résultat vérifié** : rien relu. Le plan d'entretiens existe côté projet (`PLAN_ENTRETIENS_DJ.md`, cité par l'audit).
- **Limites et contradictions** : toute méthode ci-dessous est une **proposition**.
- **Impact sur SetMate** : le « DJ valide » du projet vient de 3 avis et d'un retour (T-09 §6) : trop peu pour une conclusion statistique.
- **Recommandation (proposition)** : deux volets séparés. (a) Exactitude : 2 DJ annotent indépendamment BPM, tonalité, point de mix sur le corpus ; mesurer leur accord entre eux avant de juger l'outil. (b) Utilité : tâche chronométrée « préparer un set de 10 titres » avec et sans SetMate, puis note 1 à 5 par transition. Rémunération/consentement : à cadrer avec un juriste (non traité ici).
- **Statut** : hypothèse.

## M-09 · Essentia et essentia.js : licence et intégration
- **Question étudiée** : peut-on embarquer Essentia/essentia.js dans une appli web à fichier unique ?
- **Source primaire** : page de licences d'Essentia ; dépôt `MTG/essentia.js` ; registre npm ; listing unpkg ; texte AGPL v3 (non lu : HTTP 429).
- **URL exacte** : https://essentia.upf.edu/licensing_information.html ; https://github.com/MTG/essentia.js ; https://registry.npmjs.org/essentia.js/latest ; https://unpkg.com/essentia.js@latest/dist/?meta ; https://www.gnu.org/licenses/agpl-3.0.html
- **Date de consultation** : 05/11/2026.
- **Version concernée** : essentia.js **0.1.3** (npm « latest »), licence AGPL-3.0 ; date de publication déduite d'un horodatage de chemin temporaire : environ **juin 2021** (déduit, non affiché).
- **Résultat vérifié** : (résumé outil) licences d'Essentia : « open licence, Affero GPLv3, for non-commercial applications » et licence commerciale sur contact avec le MTG (UPF) ; modèles pré-entraînés CC BY-NC-SA 4.0 ou licence propriétaire sur demande. L'API GitHub donne AGPL-3.0 pour essentia.js (dernier push 10/12/2025). Taille de la distribution 0.1.3 : `essentia-wasm.web.wasm` **1 987 689 octets**, `essentia-wasm.web.js` 220 465, `essentia.js-core.min.js` 42 959, `essentia-wasm.umd.js` 2 562 470 ; archive décompressée environ 10,1 Mo. Le README indique un fonctionnement « on your web browser or Node.js » (temps réel et hors ligne) et ne cite pas les Web Workers.
- **Limites et contradictions** : (1) **la page de licences dit « AGPLv3 for non-commercial applications »**, ce qui s'accorde mal avec le texte de l'AGPL elle-même (qui n'interdit pas l'usage commercial) : la formulation est à clarifier par le MTG, ne pas l'interpréter seul. (2) Le texte de l'article 13 de l'AGPL (interaction réseau) **n'a pas pu être lu** : non vérifié. (3) La page ne parle pas de JavaScript ni de service web. (4) Sur le dernier push, l'API indique une date de mise à jour postérieure à la date réelle possible : données API peu fiables. (5) L'ancienneté (juin 2021) suggère un projet peu mis à jour : à confirmer sur la liste des versions.
- **Impact sur SetMate** : (a) le wasm de 2 Mo est lourd pour un fichier unique ; l'embarquer en base64 augmente la taille d'environ un tiers (calcul usuel, non sourcé ici) ; faisabilité = **hypothèse**. (b) Une licence copyleft sur un dépôt public sans licence (P-07) et la règle de Sabri « pas de code source sans contrat » sont en tension : si SetMate embarque essentia.js, l'obligation de proposer le code source aux utilisateurs doit être étudiée. **Ceci n'est pas un avis juridique ; à soumettre à un juriste ou au MTG avant toute vente.** (c) Essentia attend du 44,1 kHz (M-01) : rééchantillonnage nécessaire.
- **Recommandation** : ne pas intégrer Essentia dans le produit livré tant que la licence n'est pas tranchée. En attendant, s'en servir **hors produit** comme étalon de comparaison (script de test, non distribué).
- **Statut** : confirmé (licence AGPL-3.0 d'essentia.js, tailles) ; non vérifié (art. 13, conditions commerciales, faisabilité mono-fichier) ; hypothèse (impact juridique).

## M-10 · Écart entre sons de synthèse et vrais morceaux
- **Question étudiée** : peut-on comparer le 12/12 du projet aux scores publiés ?
- **Source primaire** : T-10 (audit `06`) ; page `tempo_eval` GiantSteps.
- **URL exacte** : https://tempoeval.github.io/tempo_eval_report/giantsteps_tempo.html
- **Date de consultation** : 05/11/2026.
- **Version concernée** : SetMate 1.9.1 ; GiantSteps Tempo références 1.0/2.0.
- **Résultat vérifié** : sur GiantSteps, Accuracy1 (4 %) des algorithmes listés va d'environ 0,27 à 0,80 (référence 1.0) et 0,35 à 0,90 (référence 2.0). SetMate : 12/12 sur 12 sons synthétiques (critère ±1 BPM).
- **Limites et contradictions** : critères différents (±1 BPM contre 4 %), corpus différents, nature différente (sons synthétiques propres contre extraits de morceaux réels). **La comparaison n'est pas valide** : seule une mesure de SetMate sur ces mêmes extraits le serait.
- **Impact sur SetMate** : s'attendre à une précision réelle nettement inférieure à 12/12 ; la fourchette publiée sert de **repère de prudence**, pas de prédiction.
- **Recommandation** : exécuter `smAnalyze` sur GiantSteps Tempo (v2) en local, avec les trois métriques.
- **Statut** : probable (écart attendu) ; non vérifié (valeur chiffrée pour SetMate).

---

## Synthèse des statuts
| Statut | Fiches |
|---|---|
| Confirmé (partiel) | M-01, M-02, M-03 (métriques), M-04 (poids et paramètres), M-07, M-09 (licence et tailles) |
| Probable | M-10 |
| Hypothèse | M-08 |
| Non vérifié | M-05 ; M-06 (protocole) ; phrases (M-03) ; détails de M-09 |
