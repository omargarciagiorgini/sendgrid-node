const request = require('supertest');
const nodemailerMock = require('nodemailer-mock');
const nock = require('nock');
const jwt = require('jsonwebtoken');
const app = require('../app'); 

const authMiddleware = require('../middlewares/auth');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
require('dotenv').config();

jest.mock('../middlewares/auth');

async function createFakePdf(filePath) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 30;
  
    page.drawText('Fake PDF for Testing', { x: 50, y: height - 4 * fontSize, fontSize });
  
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(filePath, pdfBytes);
  
    console.log(`Fake PDF created at: ${filePath}`);
  }
  
const secretKey = process.env.TOKEN_SECRET

const mockToken = jwt.sign({ userId: 'mockUserId' }, secretKey);

authMiddleware.auth.mockImplementation((req, res, next) => {
  req.userId = 'mockUserId';
  next();
});
jest.mock('../services/smtp', () => ({
    __esModule: true,
    enviarCorreo: jest.fn().mockReturnValue({ Respuesta: true, Mensaje: 'Correo enviado correctamente.' }),
  }));
afterAll(async () => {
    // Clean up the fake PDF file
    const fakePdfFilePath = './test.pdf';
    await fs.unlink(fakePdfFilePath);
  });
describe('POST /api/mail', () => {
  it('should send an email successfully', async () => {
    const fakePdfFilePath = './test.pdf';
    await createFakePdf(fakePdfFilePath);

    const response = await request(app)
      .post('/api/mail')
      .set('Authorization', `Bearer ${mockToken}`)
      .field('to', 'recipient@example.com')
      .field('subject', 'Test Email with Attachment')
      .field('text', 'This is a test email with an attachment')
      .field('html', '<p>This is a test email with HTML content and an attachment</p>')
      .attach('attachments', fakePdfFilePath) 
      .timeout(10000);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Email sent successfully' });

    // Check that the email was sent (not mandatory but can be useful)
    expect(nodemailerMock.mock.sentMail()).toHaveLength(1);
  });

  it('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/mail')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        // Missing required fields to trigger validation error
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toBeDefined();
  });

  it('should handle email sending failure', async () => {
    // Mock the enviarCorreo function to simulate a failure
//    jest.mock('../services/smtp.js', () => jest.fn().mockReturnValue({ Respuesta: false, Mensaje: 'Error message' }));

    const response = await request(app)
      .post('/api/mail')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ success: false, message: 'Error message' });

    // Restore the mock
    jest.resetModules();
  });
});
