/* eslint-disable prettier/prettier */
import Community from '#models/community'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Community.createMany([
      {name: 'Fablabs'},
      {name: 'Makerspaces'},
      {name: 'Communautés de réparateurs'},
      {name: 'Hackerspaces'},
      {name: 'Technoshops'},
      {name: 'Repair cafés'},
      {name: 'Living labs'}
    ])
  }
}
