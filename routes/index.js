const express = require('express')
const multer = require('multer');
const upload = multer();
const sgMail = require('../services/sendgrid')
const router = express.Router()
const { validationResult } = require('express-validator'); 
const { validateEmailRequest } = require('../middlewares/validation');

router.post('/api/mail', upload.array('attachments'), validateEmailRequest, async(req, res)=>{
//console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer.toString('base64'),
        type: file.mimetype,
        disposition: 'attachment',
      }));
      const msg = {
        to: req.body.to,
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
    
   res.status(201).send({success: true});
})
router.get('/api/info', (req, res) => {
    console.log('anda');
    return res.status(200).send({status:'ok'})
})
module.exports = router;
