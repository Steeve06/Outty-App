jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    // add any other firestore methods you use here
  })),
}));

// 1. Mocking the service module
jest.mock('../src/services/profileServices');

const supertest = require('supertest');
const app = require('../index'); 
const request = supertest(app);

// 2. Destructure the mocked functions
const { 
    createProfile, 
    getProfile, 
    updateProfile, 
    deleteProfile 
} = require('../src/services/profileServices');

describe('POST /api/profile/:uid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a 201 after successful profile creation', async () => {
        createProfile.mockResolvedValue({ uid: '231' });
        const res = await request
            .post('/api/profile/231')
            .send({ uid: '231' });
        expect(res.status).toBe(201);
        expect(res.body.uid).toBeDefined();
    });

    it('should return a 400 if request body is empty', async () => {
        // For Jest, if you are mocking a return of an Error object in a resolve:
        updateProfile.mockResolvedValue(new Error('Request is empty'));
        const res = await request
            .post('/api/profile/231')
            .send({});
        expect(res.status).toBe(400);
    });

    it('should return a 409 error if duplicate profile is created', async () => {
        createProfile.mockRejectedValue(new Error('Profile already exists'));
        const res = await request
            .post('/api/profile/231')
            .send({ uid: '231' });
        expect(res.status).toBe(409);
    });
});

describe('GET /api/profile/:uid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a 200 after that profile exists', async () => {
        getProfile.mockResolvedValue({ uid: '231' });
        const res = await request
            .get('/api/profile/231');
        expect(res.status).toBe(200);
    });

    it('should return a 404 error if profile does not exist', async () => {
        getProfile.mockRejectedValue(new Error('Profile does not exist'));
        const res = await request
            .get('/api/profile/20');
        expect(res.status).toBe(404);
    });
});

describe('PATCH /api/profile/:uid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a 200 after that profile has been successfully updated', async () => {
        updateProfile.mockResolvedValue({ uid: '231' });
        const res = await request
            .patch('/api/profile/231')
            .send({ uid: '231' });
        expect(res.status).toBe(200);
        expect(res.body.uid).toBeDefined();
    });

    it('should return a 400 after that profile body is empty or bad request', async () => {
        updateProfile.mockResolvedValue(new Error('Request is empty'));
        const res = await request
            .patch('/api/profile/231')
            .send({});
        expect(res.status).toBe(400);
    });

    it('should return a 404 error if profile does not exist', async () => {
        updateProfile.mockRejectedValue(new Error('Profile does not exist'));
        const res = await request
            .patch('/api/profile/20')
            .send({ uid: '20' });
        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/profile/:uid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a 200 after profile has been successfully deleted', async () => {
        const mockDeletedProfile = { uid: '231' };
        deleteProfile.mockResolvedValue(mockDeletedProfile);

        const res = await request
            .delete('/api/profile/231');

        expect(res.status).toBe(200);
        expect(res.body.uid).toBe('231');
    });
    
    it('should return a 404 error if profile does not exist', async () => {
        deleteProfile.mockRejectedValue(new Error('Profile does not exist'));
        
        const res = await request
            .delete('/api/profile/20');
            
        expect(res.status).toBe(404);
    });
});