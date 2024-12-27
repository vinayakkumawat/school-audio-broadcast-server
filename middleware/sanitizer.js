import sanitizeHtml from 'sanitize-html';

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedIframeHostnames: []
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], sanitizeOptions);
      }
    }
  }
  next();
};