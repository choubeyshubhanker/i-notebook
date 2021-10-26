const express = require('express');
const User = require('../models/User')
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Shubhisagoodb$oy"


//Route 1: Create a user using: POST "/api/auth/createuser". No login required
router.post('/createuser',[
    body('email', 'Enter a Valid Email').isEmail(),
    body('name', 'Enter valid Name').isLength({ min: 3 }),
    body('password','Password must be atleast 5 characters').isLength({ min: 5 })
    ], async (req,res)=>{
        let success=false;
        // If there are errors, return bad request and the errors
        try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({success, errors: errors.array() });
        }
        // Check Email exist already
        let user = await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({success,error:"Sorry this email alrady exists"})
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash( req.body.password,salt);
        // Create new user
         user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
          });
          const data= {
              user:{
                  id:user.id
              }
          }
         const authtoken= jwt.sign(data,JWT_SECRET);
          
         success = true;
        res.json({success,authtoken});
    } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
    }
})
// Route 2:Authenticat a user using: POST "/api/auth/login". No login required

router.post('/login',[
    body('email', 'Enter valid Email').isEmail(),
    body('password','Password cannot be vlank').exists()
    ], async (req,res)=>{
       let success=false;
        //If there are errors, return bad errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const {email, password} = req.body;
        try{
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({error: "Please Try to login with correct credentials"});
            }
            const passwordCompare = await bcrypt.compare(password,user.password);
            if(!passwordCompare){
                success=false
                return res.status(400).json({success,error: "Please Try to login with correct credentials"});
            }
            const data= {
                user:{
                    id:user.id
                }
            }
            const authtoken= jwt.sign(data,JWT_SECRET);
            success = true
            res.json({success,authtoken});
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
    }
    });

    // Route 3:Get logged in user details: POST "/api/auth/getuser".Login required
    router.post('/getuser',fetchuser, async (req,res)=>{
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
}
});

module.exports = router;