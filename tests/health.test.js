import supertest from 'supertest'
import server, { app } from '../app'

const request = supertest(app);

beforeAll(async () => {
  await server;
})

afterAll(async (done) => {
  await server.close();
  await new Promise(resolve => setTimeout(() => resolve(), 500)); 
  done()
})

describe('Health Check', () => {
  it('should return status of 200', async () => {
    const res = await request.get('/health')

    expect.assertions(1)
    expect(res.status).toBe(200)
  })
})
