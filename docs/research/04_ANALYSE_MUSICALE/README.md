# 04 · Analyse musicale

Consultation du 05/11/2026. Voir `08` (L-018) et `06` (T-10) de l'audit.

## Index
- `FICHES_ANALYSE_MUSICALE.md` : 10 fiches (M-01 à M-10).
- `PROTOCOLE_MESURE.md` : protocole de mesure objective proposé.
- Requêtes manquantes : `..\REQUETES_CHROME.md`.

## Résumé en 10 lignes
1. La seule mesure du projet porte sur 12 sons de synthèse (BPM 12/12, tonalité 10/12) : elle ne dit rien de la précision réelle.
2. Mesures usuelles du tempo : Accuracy1 (4 %), Accuracy2 (avec erreurs d'octave), P-score (8 %, `mir_eval`).
3. À 128 BPM, 4 % valent environ 5 BPM : le critère ±1 du projet est plus exigeant et plus utile au DJ.
4. Sur GiantSteps Tempo (musique électronique), le rapport `tempo_eval` donne Accuracy1 de 0,27 à 0,80 selon l'algorithme (référence 1.0) : repère de prudence.
5. Tonalité : poids `mir_eval` 1 / 0,5 / 0,3 / 0,2 (exact, quinte, relatif, parallèle) ; la page MIREX n'a pas pu être lue.
6. Jeux de données : GiantSteps (604 et 664 extraits Beatport) sans licence déclarée ; FMA et MTG-Jamendo sans BPM/tonalité ; Ballroom non accessible.
7. Aucune source lue sur les phrases, l'énergie, ni un protocole standard d'évaluation des transitions.
8. essentia.js 0.1.3 est sous AGPL-3.0, wasm de 2 Mo : intégration au fichier unique incertaine, licence à faire trancher par un juriste.
9. Avec 100 morceaux, « 90 % de réussite » a une borne basse d'environ 83 % : le seuil d'AC-12 est à reformuler.
10. Aucun jeu n'a été téléchargé, aucune bibliothèque exécutée.

## Ce qui reste inconnu
Article ISMIR 2018 complet, page MIREX (certificat expiré), jeux Ballroom/GTZAN/SMC/Hainsworth/SALAMI, README du jeu GiantSteps MTG Key, texte de l'article 13 de l'AGPL, précision réelle d'Essentia sur des morceaux de club, validation de l'énergie, protocole de test d'écoute des transitions.
