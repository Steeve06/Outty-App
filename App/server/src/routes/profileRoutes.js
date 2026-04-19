const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile, deleteProfile } = require('../services/profileServices')


//using /:uid as dynamic parameter to create profile
router.post('/:uid', async (req, res) =>{
    if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is empty' });
    }
    try{
        const profile = await createProfile(req.params.uid, req.body);
        res.status(201).json(profile);
    }catch (error) {
        console.log(error);
        res.status(409).json({error: error.message});
    }
})

//using /:uid as dynamic parameter to read profile
router.get('/:uid', async (req, res) => {
    try{
        const profile = await getProfile(req.params.uid);
        res.status(200).json(profile);
    }catch (error) {
        console.log(error);
        res.status(404).json({error: error.message});
    }
});

//using /:uid as dynamic parameter to edit profile
router.patch('/:uid', async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is empty' });
    }
    try{
        const profile = await updateProfile(req.params.uid, req.body);
        res.status(200).json(profile);
    }catch (error) {
        console.log(error);
        res.status(404).json({error: error.message});
    }
});

//using /:uid as dynamic parameter to delete profile
router.delete('/:uid', async(req, res) => {
    try{
        const profile = await deleteProfile(req.params.uid);
        res.status(200).json(profile);
    }catch (error) {
        console.log(error);
        res.status(404).json({error: error.message});
    }
});

module.exports = router;