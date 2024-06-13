import Profile from '#models/profile'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Profile.createMany([
      { name: 'Étudiant.e' },
      { name: 'Chercheur.se' },
      { name: 'Artisan.e' },
      { name: 'Enseignant.e' },
      { name: 'Conseiller.ère pédagogique' },
      { name: 'Réparateur.trice' },
      { name: 'Expert.e externe (technique ou méthodologique)' },
    ])
  }
}
