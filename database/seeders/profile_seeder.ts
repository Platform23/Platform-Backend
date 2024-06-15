import Profile from '#models/profile'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Profile.createMany([
      {
        name: 'Utilisateur / Utilisatrice (Étudiant.e ; Chercheur.e ; Artisan.e ; Enseignant.e ; Chercheur.e ; Expert.e…)',
      },
      { name: 'Volontaire / Bénévole' },
      { name: 'Réparateur.trice' },
      { name: 'Fabmanager ou coordinateur.trice' },
      { name: 'Community manager / Animateur.trice de communauté' },
      { name: 'Logisticien.ne' },
      { name: "Développeur.euse d'interfaces ou d'environnements numériques" },
      { name: 'Designer/ Programmeur.euse' },
      { name: 'Concepteur.trice de produits technologiques' },
    ])
  }
}
