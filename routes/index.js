const express = require('express')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const sgMail = require('../services/sendgrid')
const router = express.Router()
const { validationResult } = require('express-validator'); 
const { validateEmailRequest } = require('../middlewares/validation');
const { auth } = require('../middlewares/auth');
const { login } = require('../controller/authController');
router.post('/api/mail',auth, upload.array('attachments', 5), validateEmailRequest, async(req, res)=>{
//console.log(req.body);
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
      const msg = {
        to: req.body.to,
        cc: ccArray,
        from:'omar@avalith.net',
        subject: req.body.subject,
        text: req.body.text,
        html: req.body.html,
        attachments,
      };
    try {
        await sgMail.send(msg);
    } catch (err) {
        return  res.status(err.code).send(err.message)
    }
    
   res.status(200).send({ success: true , message: "Email sent successfully"});
})

router.post('/login', login);

router.get('/api/info', (req, res) => {
    console.log('anda');
    return res.status(200).send({status:'ok'})
})
module.exports = router;
