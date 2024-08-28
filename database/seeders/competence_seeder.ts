import Competence from '#models/competence'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Competence.createMany([
      {
        name: "Gestion de l'information et des médias numériques",
      },
      { name: 'Communication et collaboration numériques' },
      { name: 'Pensée computationnelle et critique' },
      {
        name: 'Insertion et développement professionnel numérique',
      },
      { name: 'Innovation et création numériques' },
      { name: 'Gestion et pilotage de projets collaboratifs' },
      { name: 'Accompagnement et formation' },
    ])
  }
}
