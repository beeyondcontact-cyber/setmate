# Protocole de mesure objective (BPM, tonalité, grille)

Proposition du 05/11/2026. Les métriques et tolérances ci-dessous sont sourcées dans `FICHES_ANALYSE_MUSICALE.md` ; les choix de seuil et la méthode statistique sont des **propositions** (marquées).

## 1. Principe
Comparer la sortie de SetMate à une vérité terrain humaine sur de vrais morceaux. Ne jamais mélanger avec le résultat sur sons de synthèse (T-10 : BPM 12/12, tonalité 10/12), qui reste un test de non-régression de l'algorithme sur des sons propres.

## 2. Corpus
| Corpus | Rôle | Réserve |
|---|---|---|
| GiantSteps Tempo (v2) | repère public, musique électronique | licence non précisée, audio à télécharger ; ne pas redistribuer |
| GiantSteps Key | idem pour la tonalité | idem |
| Morceaux de Sabri annotés par au moins 2 DJ | cas réel d'usage | usage privé seulement ; annotations indépendantes, accord mesuré |
| Fichiers MP3 et M4A réels | vérifier le décodage navigateur | utiliser `decodeAudioData` du navigateur, pas des WAV lus à la main |

Taille minimale proposée : 100 morceaux (seuil déjà posé dans AC-12 et AC-13). Stratifier par genre et par tempo (lent < 90, moyen, rapide > 140) pour exposer les erreurs d'octave.

## 3. Métriques
**Tempo** (rapporter les quatre, séparément) :
1. **±1 BPM** : critère du projet (AC-12), le plus proche du calage de platines.
2. **Accuracy1** : tolérance 4 % (rapport `tempo_eval`). À 128 BPM, 4 % valent environ 5 BPM.
3. **Accuracy2** : Accuracy1 en acceptant les facteurs 2, 3, 1/2, 1/3.
4. **P-score / One Correct / Both Correct** à 8 % (`mir_eval.tempo`, tolérance par défaut 0,08).
Rapporter aussi la part d'erreurs d'octave (Accuracy2 moins Accuracy1).

**Tonalité** (rapporter les trois) :
1. **Exacte** (tonique et mode), le critère du projet (AC-13).
2. **Score pondéré `mir_eval`** : 1,0 exact ; 0,5 quinte ; 0,3 relatif ; 0,2 parallèle. Étiqueter « poids `mir_eval` », la page MIREX n'ayant pas pu être lue.
3. **Voisin Camelot** (proposition) : même numéro (A/B) ou ±1 : utile en mixage harmonique, à ne pas confondre avec une réussite.

**Grille de temps** (si F-044 est évalué) : F-measure `mir_eval.beat` avec fenêtre 0,07 s ; phrases/premiers temps : aucune métrique sourcée lue, à définir après lecture (voir requêtes).

## 4. Statistique (proposition, méthode usuelle, source non lue)
Donner pour chaque taux un intervalle de confiance de Wilson à 95 %. Calcul de l'auditeur : pour 90 réussites sur 100, l'intervalle est d'environ **83 % à 94 %**. Donc **« ≥ 90 % sur 100 morceaux » ne peut pas être démontré avec 100 morceaux** même si 90 sont justes ; il faut soit plus de morceaux, soit formuler le seuil sur la borne basse (par exemple « borne basse ≥ 80 % »). Décision à prendre par Sabri.

## 5. Procédure
1. Figer la version testée (empreinte du fichier `SetMate.html`).
2. Décoder avec `decodeAudioData` ; noter navigateur et appareil.
3. Sortie : un fichier CSV par morceau (id, BPM réel, BPM estimé, tonalité réelle, tonalité estimée, confiance, durée de calcul).
4. Calculer les métriques ci-dessus avec un script indépendant de l'appli ; garder les sorties brutes.
5. Refaire sur iPhone pour un sous-ensemble (voir matrice M-20) : l'iPhone peut décoder différemment.
6. Ne jamais ajuster un seuil ou le code pour « faire passer » la mesure sans l'accord explicite de Sabri (règle du projet).

## 6. Rapport
Pour chaque métrique : valeur, n, intervalle, erreurs les plus fréquentes (octave, quinte, relatif), 10 pires cas écoutés. Séparer clairement : synthèse, GiantSteps, morceaux de Sabri.

## 7. Repère de prudence
Sur GiantSteps Tempo (rapport `tempo_eval`, tableau résumé par outil, page sans date) : Accuracy1 de 0,27 à 0,80 avec la référence 1.0, 0,35 à 0,90 avec la 2.0 selon l'algorithme. **Ce n'est pas un objectif ni un résultat de SetMate.**
