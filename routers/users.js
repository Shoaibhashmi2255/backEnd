const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) =>{
    // if i want to show only specific fields 

    // const userList = await User.find().select('Name email phone');

    // if i don't send password hash  then i will do this
    const userList = await User.find().select('-passwordHash');
    
    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
});

router.get('/:id', async(req,res,next) => {

    
    const user = await User.findById(req.params.id).select('-passwordHash');




    if(!user){
        res.status(500).json({message: 'The User with the given id was not found'});
    }
    res.status(200).send(user);
})


router.post('/', async (req,res,next) =>{
    let user = new User({
        Name: req.body.Name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
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
        return res.status(404).send('user not found!')
    };
    res.send(user);
});


router.put('/:id', async (req,res,next) => {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, 10)
    }else{
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            Name: req.body.Name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,   
        },
        {new : true}
    )
    if(!user){
        res.status(500).json({message:'User not Updated'})
    }
    res.status(200).send(user)

});


router.post('/login' ,async (req, res, next) => {
    const user = await User.findOne({email : req.body.email});
    const secret = process.env.secret;

    if (!user) {
        return res.status(400).json({message :'User not found'})
    };
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId : user.id
            },
            secret,
            {
                expiresIn:'1h'
            }
        )
        return res.status(200).send({user: user.email, token:token})
    }else{
        return res.status(400).send('Password is wrong!!');
    }
})


module.exports =router;