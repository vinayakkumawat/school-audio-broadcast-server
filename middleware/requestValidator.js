import { ValidationError } from '../utils/errors.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};