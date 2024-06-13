import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  private async seed(Seeder: { default: typeof BaseSeeder }) {
    await new Seeder.default(this.client).run()
  }

  async run() {
    await this.seed(await import('#database/seeders/competence_seeder'))
    await this.seed(await import('#database/seeders/profile_seeder'))
    await this.seed(await import('#database/seeders/community_seeder'))
  }
}
