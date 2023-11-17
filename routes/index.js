const express = require('express')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()
const { validationResult } = require('express-validator'); 
const { validateEmailRequest } = require('../middlewares/validation');
const { auth } = require('../middlewares/auth');
const { login } = require('../controller/authController');
require('dotenv').config();

const enviarCorreo = require('../services/smtp'); // Replace with the actual module name

router.post('/api/mail', auth, upload.array('attachments', 5), validateEmailRequest, async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
    const cc = req.body.cc || '';
    const ccArray = cc.split(',');
  
    const attachments = req.files && req.files.map(file => ({
      filename: file.originalname,
      content: file.buffer.toString('base64'),
      type: file.mimetype,
      disposition: 'attachment',
    }));
  
    const correoOptions = {
      pAsunto: req.body.subject,
      pCuerpo: req.body.html,
      pCorreos: req.body.to,
      ccArray,
      attachments,
    };
  
    try {
      const result = await enviarCorreo(correoOptions);
      console.log(result);
      if (!result.Respuesta) {
        return res.status(500).json({ success: false, message: result.Mensaje });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  });

router.post('/api/login', login);

router.get('/api/info', (req, res) => {
    console.log('anda');
    return res.status(200).send({status:'ok'})
})
module.exports = router;
