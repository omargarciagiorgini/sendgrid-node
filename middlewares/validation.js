const { body } = require('express-validator');

const validateEmailRequest = [
  body('to').isEmail(),
  body('subject').isString().notEmpty(),
  body('text').isString().notEmpty(),
  body('html').optional().isString().custom(value => {
    // Add your HTML validation logic here
    // For example, you might want to ensure it contains valid HTML tags
    // You can use a library like 'cheerio' for more advanced HTML validation
    if (!/<[a-z][\s\S]*>/i.test(value)) {
      throw new Error('Invalid HTML content');
    }
    return true;
  }),
  body('attachments').isArray().optional(),
  body('attachments.*.filename').isString(),
  body('attachments.*.content').isBase64(),
  body('attachments.*.type').custom(value => {
    if (value !== 'application/pdf') {
      throw new Error('Attachment type must be PDF');
    }
    return true;
  }),
  body('attachments.*.disposition').isString(),
];

module.exports = { validateEmailRequest };
