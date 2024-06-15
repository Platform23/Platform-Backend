import Subject from '#models/subject'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Subject.createMany([
      { name: 'Algorithms and Data Structures' },
      { name: 'Artificial Intelligence (AI)' },
      { name: 'Machine Learning' },
      { name: 'Computer Vision' },
      { name: 'Natural Language Processing (NLP)' },
      { name: 'Robotics' },
      { name: 'Database Systems' },
      { name: 'Operating Systems' },
      { name: 'Computer Networks' },
      { name: 'Cybersecurity' },
    ])
  }
}
