const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const { application } = require('express')
require('dotenv').config()

const PORT = process.env.PORT || 5000
const app = express()

//mongo connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true })
        console.log(`mongodb connected: ${conn.connection.name}`)
    } catch (error) {
        console.log(error.message)
    }
}

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({
    secret: "use a secret key of whatever",
    saveUninitialized: true,
    resave: false
}))
app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next()
})

app.use(express.static('uploads'))

app.set('view engine', 'ejs')


//routes

app.use('', require('./routes/routes'))



app.listen(PORT, ()=> {
    connectDB()
    console.log(`listening on port http://localhost:${PORT}`)
})