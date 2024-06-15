import Competence from '#models/competence'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Competence.createMany([
      {
        name: "Savoir utiliser les technologies numériques pour la gestion de l'information et des médias",
      },
      { name: 'Savoir utiliser les technologies numériques pour communiquer et collaborer' },
      { name: 'Faire preuse de pensée computationnelle et critique' },
      {
        name: 'Utiliser les technologies numériques pour favoriser son insertion et son développement professionnel',
      },
      { name: 'Mobiliser ses habiletés technologiques et numériques pour innover et créer' },
      { name: 'Savoir gérer et piloter des projets avec une communauté de professionnel.le.s' },
      { name: 'Accompagner – Former et apprendre avec les autres' },
    ])
  }
}
