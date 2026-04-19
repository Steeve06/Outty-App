// profileRoutes.tests.js (Consolidated standard for both)
import supertest from 'supertest';
import app from '../../index.js';
import {
  createProfile, 
  getProfile
} from '../services/profileServices.js';

jest.mock('../services/profileServices.js');
const request = supertest(app);

describe('Profile API Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/profile/:uid', () => {
    it('should return a 201 after successful profile creation', async () => {
      createProfile.mockResolvedValue('profile created');
      const res = await request
        .post('/api/profile/231')
        .send({ name: 'Andre Mocto' });
      
      expect(res.status).toBe(201);
      expect(res.body).toBe('profile created');
    });

    it('should return a 400 if request body is empty', async () => {
      const res = await request
        .post('/api/profile/231')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Request body is empty');
    });
  });

  describe('GET /api/profile/:uid', () => {
    it('should return a 200 if the profile exists', async () => {
      const mockData = { uid: '231', name: 'Andre Mocto' };
      getProfile.mockResolvedValue(mockData);
      
      const res = await request.get('/api/profile/231');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockData);
    });

    it('should return a 404 error if profile does not exist', async () => {
      getProfile.mockRejectedValue(new Error('Profile not found'));
      const res = await request.get('/api/profile/20');
      
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });
  });
});
