const express = require('express')
const router = express.Router()
const User = require('../models/users')
const multer = require('multer')
const fs = require('fs')

//image upload
let storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '_' + Date.now() + "_" + file.originalname)
    }
})

const upload = multer({
    storage: storage
}).single('image');

//post an user
router.post('/add', upload, async(req,res)=> {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    })
    try {
        await user.save()
        req.session.message = {
            type: 'success',
            message: 'user added'
        }
        res.redirect('/')
    } catch (error) {
        res.status(400).json({message: error.message, type: 'danger'})
    }
    
})


router.get('/', async(req, res)=>{
    try {
        const users = await User.find()
        res.render('index', {
            title: 'Home Page',
            users: users
        })
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

router.get('/add', (req,res)=>{
    res.render('add_users', {title: "Add Users"})
})

//edit

router.get('/edit/:id', async(req, res)=>{
    try {
        const id = req.params.id
        let user = await User.findById(id)
        if(user===null) res.redirect('/')
        res.render('edit_user', {
            title: "Edit User",
            user: user
        })
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

//update user

router.post('/update/:id', upload, async(req,res)=>{
    const id = req.params.id
    let new_img = ''

    try {
        if(req.file){
            new_img = req.file.filename
            fs.unlinkSync("./uploads/" + req.body.old_image)
        } else {
            new_img = req.body.old_image
        }
        await User.findByIdAndUpdate(id,{
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_img
        })
        req.session.message = {
            type: 'success',
            message: "User updated"
        }
        res.redirect('/')
    } catch (error) {
        console.log(error)

        res.status(400).json({message: error.message})
    }

})


//delete user

router.get('/delete/:id', async(req, res)=>{
    const id = req.params.id
    try {
    let user = await User.findByIdAndDelete(id)
    if(user.image !== '') fs.unlinkSync('./uploads/' + user.image)  
    req.session.message = {
        type: 'success',
        message: "User updated"
    }
    res.redirect('/')
    } catch (error) {
        console.log(error)
        res.status(400).json({message: error.message})
    }
})

module.exports = router