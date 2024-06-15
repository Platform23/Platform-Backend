import Experience from '#models/experience'
import ExperiencePolicy from '#policies/experience_policy'
import { createExperienceValidator, updateExperienceValidator } from '#validators/experience'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

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
        message: 'Error while fetching user experiences.',
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
        startDate: DateTime.fromJSDate(payload.startDate),
        endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : null,
      })

      return response.status(201).json({ data: experience })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.internalServerError({
        message: 'An error occurred while creating experience.',
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
        return response.status(404).json({ message: 'Experience not found.' })
      }

      if (await bouncer.with(ExperiencePolicy).denies('edit', experience)) {
        return response.forbidden('Access denied')
      }

      await experience
        .merge({
          title: payload.title,
          organization: payload.organization,
          startDate: payload.startDate
            ? DateTime.fromJSDate(payload.startDate)
            : experience.startDate,
          endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : experience.endDate,
        })
        .save()

      return response.status(200).json({ data: experience })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({ messages: error.messages })
      }

      return response.internalServerError({
        message: 'An error occurred while updating experience.',
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
        return response.status(404).json({ message: 'Experience not found.' })
      }

      if (await bouncer.with(ExperiencePolicy).denies('delete', experience)) {
        return response.forbidden('Access denied')
      }

      await experience.delete()

      return response.status(204).json({ message: 'Experience deleted successfully.' })
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred while deleting experience.',
      })
    }
  }
}
