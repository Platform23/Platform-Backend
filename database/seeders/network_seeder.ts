import Network from '#models/network'
import Subject from '#models/subject'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { randomUUID } from 'node:crypto'

export default class extends BaseSeeder {
  async run() {
    const networksData = [
      {
        userId: 1,
        uuid: randomUUID(),
        name: 'Fablabs',
        description: 'Ateliers de fabrication équipés de machines-outils à commande numérique',
        subjects: [{ name: 'Subject A' }, { name: 'Subject B' }, { name: 'Subject C' }],
      },
      {
        userId: 1,
        uuid: randomUUID(),
        name: 'Hackerspaces',
        description:
          "Atelier collaboratif dédié aux projets utilisant l'électronique, la programmation, l'impression 3D etc.",
        subjects: [{ name: 'Subject D' }, { name: 'Subject E' }, { name: 'Subject F' }],
      },
      {
        userId: 1,
        uuid: randomUUID(),
        name: "Communautés d'artisans",
        description:
          'Communauté d’artisan.e.s et d’artistes qui partagent des espaces de travail et des ressources pour la création artistique.',
        subjects: [{ name: 'Subject G' }, { name: 'Subject H' }, { name: 'Subject I' }],
      },
      {
        userId: 1,
        uuid: randomUUID(),
        name: 'Informatique',
        description:
          "Réseaux d'ateliers citoyens d'accès à la fabrication numérique et à l'accompagnement sur les nouvelles technologies.",
        subjects: [{ name: 'Subject J' }, { name: 'Subject K' }, { name: 'Subject L' }],
      },
      {
        userId: 1,
        uuid: randomUUID(),
        name: 'Makerspaces',
        description:
          'Atelier collaboratif dédié au prototypage, à la fabrication numérique et à des projets collaboratifs entre particuliers et entrepreneurs.',
        subjects: [{ name: 'Subject M' }, { name: 'Subject N' }, { name: 'Subject O' }],
      },
      {
        userId: 1,
        uuid: randomUUID(),
        name: 'Intelligence Artificielle',
        description:
          "La communauté IA explore et promeut les technologies d'intelligence artificielle en abordant des sujets tels que l'apprentissage automatique, la vision par ordinateur, etc...",
        subjects: [{ name: 'Subject P' }, { name: 'Subject Q' }, { name: 'Subject R' }],
      },
      {
        userId: 1,
        uuid: randomUUID(),
        name: 'Technique et Professionnelle',
        description: 'Centre de formation technique et professionnelle.',
        subjects: [{ name: 'Subject S' }, { name: 'Subject T' }, { name: 'Subject V' }],
      },
    ]

    for (const networkData of networksData) {
      const { subjects, ...networkPayload } = networkData

      // Create the network
      const network = await Network.create(networkPayload)

      // Attach subjects to the network
      for (const subjectData of subjects) {
        let subject = await Subject.firstOrCreate({ name: subjectData.name })
        await network.related('subjects').attach([subject.id])
      }
    }
  }
}
