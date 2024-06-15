/* eslint-disable prettier/prettier */
import Community from '#models/community'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Community.createMany([
      { name: 'Fablabs' },
      { name: 'Makerspaces' },
      { name: 'Réparateurs' },
      { name: 'Hackerspaces' },
      { name: 'Living labs' },
      { name: 'Communautés open source hardware' },
      { name: "Écoles de hackers et d'ateliers techniques" },
      { name: 'Bibliothèques makerspaces' },
    ])
  }
}
