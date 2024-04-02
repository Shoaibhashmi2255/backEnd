const {User} = require('../models/user');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const userList = await User.find();

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
});


router.post('/', async (req,res,next) => {
    let user = new User({
        Name: req.body.Name,
        email: req.body.email,
        passwordHash: req.body.password,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });

    user = await user.save();

    if(!user){
        res.status(404).json({success:false, message : 'User not created!!'})
    };

    res.status(200).send(user);
})

module.exports =router;