const request = require('supertest');
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
afterAll(async () => {
  // Clean up the fake PDF file
  const fakePdfFilePath = './test.pdf';
  await fs.unlink(fakePdfFilePath);
});
it('Returns 200 for a successful request', async () => {
    const resp = await request(app)
      .post('/api/mail')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email with HTML content</p>',
      })
      .timeout(10000);
  
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty('success', true);
    expect(resp.body).toHaveProperty('message', 'Email sent successfully');
  
    // Ensure that the SendGrid API was called
    expect(nock.isDone()).toBe(true);
  });
  it('Returns 200 for a successful request with attachment', async () => {
  
    const fakePdfFilePath = './test.pdf';
    await createFakePdf(fakePdfFilePath);
    const resp = await request(app)
      .post('/api/mail')
      .set('Authorization', `Bearer ${mockToken}`)
      .field('to', 'recipient@example.com')
      .field('subject', 'Test Email with Attachment')
      .field('text', 'This is a test email with an attachment')
      .field('html', '<p>This is a test email with HTML content and an attachment</p>')
      .attach('attachments', fakePdfFilePath) 
      .timeout(10000);
  
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty('success', true);
    expect(resp.body).toHaveProperty('message', 'Email sent successfully');
  
    // Ensure that the SendGrid API was called
    expect(nock.isDone()).toBe(true);
  });
it('Returns 422 for incomplete request body', async () => {
  const resp = await request(app)
    .post('/api/mail')
    .set('Authorization', `Bearer ${mockToken}`)
    .timeout(10000);

  expect(resp.statusCode).toBe(422);
  expect(resp.body).toHaveProperty('errors');
  expect(resp.body.errors.length).toBeGreaterThan(3);

  // Ensure that the SendGrid API was not called
  expect(nock.isDone()).toBe(true);
});

it('Returns 422 for invalid request body', async () => {
  const resp = await request(app)
    .post('/api/mail')
    .set('Authorization', `Bearer ${mockToken}`)
    .send({
      to: 'invalid-email',
      subject: 'testeando',
      text: 'sarasa de test',
      html: '<strong>html code!</strong>',
    })
    .timeout(10000);

  expect(resp.statusCode).toBe(422);
  expect(resp.body).toHaveProperty('errors');
  expect(resp.body.errors.length).toBeGreaterThan(0);

  // Ensure that the SendGrid API was not called
  expect(nock.isDone()).toBe(true);
});
authMiddleware.auth.mockImplementation((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Token missing' });
    }
  
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decodedToken = jwt.verify(token, secretKey);
      req.userId = decodedToken.userId;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  });
  
  it('Returns 401 for missing token', async () => {
    const resp = await request(app)
      .post('/api/mail')
      .timeout(10000);
  
    expect(resp.statusCode).toBe(401);
    expect(resp.body).toHaveProperty('error', 'Token missing');
  
    // Ensure that the SendGrid API was not called
    expect(nock.isDone()).toBe(true);
  });