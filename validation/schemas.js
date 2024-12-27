import Joi from 'joi';

export const schemas = {
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    username: Joi.string().min(3),
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6)
  }),

  createUser: Joi.object({
    username: Joi.string().required().min(3)
  }),

  updateUser: Joi.object({
    username: Joi.string().required().min(3)
  }),

  audio: Joi.object({
    userId: Joi.string().required(),
    url: Joi.string().required().uri(),
    queue: Joi.number().valid(1, 2, 3)
  })
};