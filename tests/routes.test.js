const request = require('supertest')
const app = require('../app');

it('Can send emails', async ()=> {
    const resp = await request(app)
    .post('/api/mail')
    .send({
        to: 'omar.garcia.giorgini@gmail.com' , 
        subject: 'testeando',
        text :'sarasa de test',
        html: '<strong>  html code ! </strong>'
    })
    .timeout(10000);

    expect(resp.statusCode).toBe(201)
});