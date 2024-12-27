export class ValidationError extends Error {
  constructor(details) {
    super('Validation Error');
    this.type = 'validation';
    this.details = details;
  }
}

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.type = 'auth';
  }
}