import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('Health and auth guard', () => {
  it('GET /health should return 200', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('GET /api/users should return 401 without token', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(401);
  });
});
