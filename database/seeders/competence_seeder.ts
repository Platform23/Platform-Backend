import Competence from '#models/competence'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Competence.createMany([
      { name: 'Traiter de l’information et des médias.' },
      { name: 'Maîtriser des outils et des techniques numériques.' },
      { name: 'Communautés de réparateurs' },
      { name: 'Communiquer et collaborer numériquement.' },
      { name: 'Utiliser des outils numériques pour la recherche.' },
      { name: 'Promouvoir l’inclusion et la diversité via le numérique.' },
      { name: 'Utiliser le numérique pour le développement professionnel.' },
    ])
  }
}
