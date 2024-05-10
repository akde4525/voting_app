const express = require('express');
const router = express.Router();

const User = require('../models/user')

const { jwtAuthMiddleware, generateToken } = require('../jwt');


// POST route to add a person
router.post('/signup',async (req, res) => {
    try {
        const data = req.body // Assume the request body contains the person data

        // Create a new user document using the mongoose model
        const newUser = new User(data);

        // save the new user to the database
        const response = await newUser.save();
        console.log('data saved.');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));

        const token = generateToken(payload);
        console.log("Token is : ",token);

        res.status(200).json({ response: response, token: token });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error.'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try {
        // Extract username and password from request body
        const {  aadharCardNumber, password } = req.body;

        // Find the user by  aadharCardNumber
        const user = await User.findOne({ aadharCardNumber:  aadharCardNumber});

        // If user doesn't exist or password doesn't match, return error
        if( !user || !(await user.comparePassword(password))) {
            return res.status(401).json({error: 'Invalid username or password.'});
        }

        // Generate Token
        const payload = {
            id : user.id
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error' });
    }
});

// Profile Route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;

        const userId = userData.id;
        const user = await personModel.findById(userId);

        res.status(200).json({user});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error' });
    }
});



router.put('/profile/password', jwtAuthMiddleware, async(req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token.
        const {currentPassword, newPassword} = req.body; // Extract current and new passwords from the request body

        // Find the user by userID
        const user = await User.findById(userId);

        
        // If password doesn't match, return error
        if( !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({error: 'Invalid username or password.'});
        }

        // Update the user's password.
        user.password = newPassword;
        await user.save();

        console.log("Password Updated.");
        res.status(200).json({message: "Password Updated."});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error.'});
    }
})




module.exports = router;