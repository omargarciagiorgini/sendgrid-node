const request = require('supertest');
const app = require('../app'); 
require('dotenv').config();

it('Returns a JWT token for a successful login', async () => {
  const resp = await request(app)
    .post('/api/login') 
    .send({
      username: process.env.USER_LOGIN,
      password: process.env.PASSWORD_LOGIN,
    })
    .timeout(10000);

  expect(resp.statusCode).toBe(200);
  expect(resp.body).toHaveProperty('token');
  expect(resp.body.token).toBeDefined();
});

it('Returns 401 for unsuccessful login', async () => {
  const resp = await request(app)
    .post('/api/login') 
    .send({
      username: 'invaliduser',
      password: 'invalidpassword',
    })
    .timeout(10000);

  expect(resp.statusCode).toBe(401);
  expect(resp.body).toHaveProperty('error', 'Invalid username or password');
});
