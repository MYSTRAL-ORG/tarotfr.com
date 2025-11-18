'use client';

import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-slate-900">
            Règles du Tarot à 4
          </h1>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Objectif du jeu</h2>
              <p className="text-slate-700 leading-relaxed">
                Le Tarot se joue à 4 joueurs. Un joueur, appelé le <strong>preneur</strong> ou <strong>attaquant</strong>,
                s'oppose aux trois autres joueurs, les <strong>défenseurs</strong>. L'objectif du preneur est de marquer
                un nombre de points suffisant avec les plis qu'il remporte, en fonction du nombre d'oudlers (bouts) qu'il possède.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Composition du jeu</h2>
              <div className="space-y-3 text-slate-700">
                <p>Le jeu de Tarot comprend <strong>78 cartes</strong> :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>56 cartes réparties en 4 couleurs</strong> : Pique, Cœur, Carreau, Trèfle
                    <ul className="list-circle list-inside ml-6 mt-1">
                      <li>14 cartes par couleur : As, 2, 3, 4, 5, 6, 7, 8, 9, 10, Valet, Cavalier, Dame, Roi</li>
                    </ul>
                  </li>
                  <li><strong>21 atouts</strong> numérotés de 1 à 21 (l'atout 1 est aussi appelé le Petit)</li>
                  <li><strong>L'Excuse</strong> : une carte spéciale sans numéro</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Distribution</h2>
              <p className="text-slate-700 leading-relaxed">
                Le donneur distribue <strong>18 cartes à chaque joueur</strong>, 3 par 3, et constitue un
                <strong> chien</strong> de <strong>6 cartes</strong> qu'il pose face cachée au centre de la table.
                Le chien ne doit contenir ni roi, ni atout, ni Excuse.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Les enchères</h2>
              <div className="space-y-3 text-slate-700">
                <p>À tour de rôle, chaque joueur peut :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Passer</strong> : renoncer à prendre</li>
                  <li><strong>Prendre (Petite)</strong> : contrat de base</li>
                  <li><strong>Garde</strong> : contrat plus fort (multiplicateur x2)</li>
                  <li><strong>Garde sans le chien</strong> : le preneur joue sans voir ni prendre le chien (x4)</li>
                  <li><strong>Garde contre le chien</strong> : le chien est donné aux défenseurs (x6)</li>
                </ul>
                <p className="mt-3">
                  Le joueur qui fait l'enchère la plus haute devient le <strong>preneur</strong> et s'oppose
                  aux trois autres joueurs (les défenseurs).
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Le chien</h2>
              <p className="text-slate-700 leading-relaxed">
                Si le contrat est une <strong>Petite</strong> ou une <strong>Garde</strong>, le preneur retourne
                le chien pour que tous puissent le voir, puis l'incorpore dans son jeu. Il doit ensuite écarter
                6 cartes face cachée qui compteront pour lui en fin de partie. Il ne peut écarter ni roi, ni atout
                (sauf s'il n'a pas le choix), ni l'Excuse.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Le jeu de la carte</h2>
              <div className="space-y-3 text-slate-700">
                <p>Le joueur à droite du donneur commence. Ensuite, le gagnant du pli précédent entame.</p>
                <p><strong>Règles à suivre :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Il faut toujours <strong>fournir la couleur demandée</strong></li>
                  <li>Si on ne peut pas, on doit <strong>couper avec un atout</strong></li>
                  <li>Si on coupe, on doit <strong>surcouper</strong> (jouer un atout plus fort) si possible</li>
                  <li>Si on ne peut ni fournir ni couper, on peut jouer n'importe quelle carte</li>
                  <li><strong>L'Excuse</strong> ne peut jamais remporter un pli mais permet de garder la main</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Valeur des cartes</h2>
              <div className="space-y-3 text-slate-700">
                <p>Les cartes ont les valeurs suivantes :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Les oudlers (bouts)</strong> : Excuse, Petit (1), 21 = 4,5 points chacun</li>
                  <li><strong>Roi</strong> = 4,5 points</li>
                  <li><strong>Dame</strong> = 3,5 points</li>
                  <li><strong>Cavalier</strong> = 2,5 points</li>
                  <li><strong>Valet</strong> = 1,5 points</li>
                  <li><strong>Autres cartes</strong> = 0,5 point</li>
                </ul>
                <p className="mt-3">
                  Total : <strong>91 points</strong> dans le jeu. On compte par paquets de 2 cartes
                  (on additionne les valeurs et on retire 1).
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Comptage des points</h2>
              <div className="space-y-3 text-slate-700">
                <p>
                  Le preneur doit réaliser un nombre de points minimum qui dépend du nombre
                  d'oudlers qu'il possède dans ses plis :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Avec 3 oudlers</strong> : 36 points minimum</li>
                  <li><strong>Avec 2 oudlers</strong> : 41 points minimum</li>
                  <li><strong>Avec 1 oudler</strong> : 51 points minimum</li>
                  <li><strong>Sans oudler</strong> : 56 points minimum</li>
                </ul>
                <p className="mt-3">
                  Si le preneur atteint son contrat, il gagne. Sinon, il perd.
                  Les points sont calculés en fonction de l'écart avec le contrat et du type de contrat.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Scores</h2>
              <div className="space-y-3 text-slate-700">
                <p>Le score de base est : <strong>25 + écart</strong></p>
                <p>Ce score est multiplié par :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Petite</strong> : x1</li>
                  <li><strong>Garde</strong> : x2</li>
                  <li><strong>Garde sans</strong> : x4</li>
                  <li><strong>Garde contre</strong> : x6</li>
                </ul>
                <p className="mt-3">
                  Le preneur gagne ou perd ce score multiplié par 3 (car il joue contre 3 adversaires).
                  Chaque défenseur gagne ou perd ce score.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
