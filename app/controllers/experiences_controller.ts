import Experience from '#models/experience'
import ExperiencePolicy from '#policies/experience_policy'
import { createExperienceValidator, updateExperienceValidator } from '#validators/experience'
import type { HttpContext } from '@adonisjs/core/http'

export default class ExperiencesController {
  /**
   * Display a list of experiences of an user
   */
  async index({ params, response }: HttpContext) {
    try {
      const experiences = await Experience.findManyBy('userId', params.id)

      return response.status(200).json({ data: experiences })
    } catch (error) {
      return response.internalServerError({
        message: 'Erreur lors de la récupération des expériences utilisateur.',
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createExperienceValidator)
      const experience = await Experience.create({
        userId: auth.user!.id,
        title: payload.title,
        organization: payload.organization,
        startDate: payload.startDate,
        endDate: payload.endDate,
      })

      return response.status(201).json({ data: experience })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.internalServerError({
        message: "Une erreur s'est produite lors de la création de l'expérience.",
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateExperienceValidator)
      const experience = await Experience.find(params.id)

      if (!experience) {
        return response.status(404).json({ message: 'Expérience introuvable.' })
      }

      if (await bouncer.with(ExperiencePolicy).denies('edit', experience)) {
        return response.forbidden('Accès refusé')
      }

      await experience
        .merge({
          title: payload.title,
          organization: payload.organization,
          startDate: payload.startDate,
          endDate: payload.endDate,
        })
        .save()

      return response.status(200).json({ data: experience })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.internalServerError({
        message: "Une erreur s'est produite lors de la mise à jour de l'expérience.",
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, params, response }: HttpContext) {
    try {
      const experience = await Experience.find(params.id)

      if (!experience) {
        return response.status(404).json({ message: 'Accès refuséExpérience introuvable.' })
      }

      if (await bouncer.with(ExperiencePolicy).denies('delete', experience)) {
        return response.forbidden('Accès refusé')
      }

      await experience.delete()

      return response.status(204).json({ message: 'Expérience supprimée avec succès.' })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de la suppression de l'expérience.",
      })
    }
  }
}
