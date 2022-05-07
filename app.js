require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors')



//////////////////////////
// Database Connection
//////////////////////////
const DATABASE_URL = process.env.DATABASE_URL;
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};


///// Establish /////

mongoose.connect(DATABASE_URL, CONFIG);

mongoose.connection
    .on('open', () => console.log('We are in the building'))
    .on('close', () => console.log('Mongo Has left the building'))
    .on('error', (error) => console.log(error))




//////////////////////////
// User Model 
////////////////////////// 
const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String
})

const User = model("User", userSchema);


const app = express();
app.use(cors())
const PORT = 3001

//Middleware
app.use(express.json());


//////////////////// UPDATE / PUT ////////////////////
app.put('/user/:id', (req, res) => {
    const id = req.params.id
    if(! mongoose.isValidObjectId(id)) { // validates if id is good 
        res.status(400).send('Bad User id')
        return
    }
    const name = req.body.name
    const email = req.body.email
    if (! name || ! email) {
        res.status(400).send('missing name or email'); // if missing name or email respond with error message <--
        return
    }
     User.findByIdAndUpdate(id, {name,email}, {returnDocument:'after'})
        .then((user) => {
            res.status(200).send(user)
        })
        .catch((error) => {
            res.status(500).json({error})
        })
})

// TODO: add check if user exist before creating new user 

//////////////////// CREATE USER ////////////////////
app.post('/user', async (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    if (! name || ! email || ! password) {
        res.status(400).send('missing name,email, or password');
        return
    }
    const user = await User.create({name,email,password})
    res.send(user)
})

//////// USER LOGIN PAGE
app.post('/user/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if( ! email || ! password) {
        res.status(404).send('Login Failed') // spits error if information is missing 
        return
    } 
    const user = await User.findOne( {email, password}).exec(); // finds one document the "user"
    if( ! user ){
        res.status(404).send('Login Failed') // return error if user info doesnt match
    }
    res.send(user); // returns the user 
});
  ///// DELETE USER
  app.delete('/user/:id', async (req, res) => {
    const _id = req.params.id
    if(! mongoose.isValidObjectId(_id)) {  // checks if its a valid ID
        res.status(400).send('Bad User id') // if its not, send back error message 
        return
    }
    const user = await User.deleteOne({_id})
    res.send(user)
  })

///// SNEAKERS ///// 
const sneakerSchema = new Schema({ // created sneaker schema
    userId: mongoose.ObjectId, 
    name: String,// schema must has name and image
    image: String,
})

const Sneaker = model("Sneakers", sneakerSchema);

///// CREATE SNEAKERS
app.post('/sneakers', async (req, res) => {
    const userId = req.body.userId // add user id to sneaker request
    const name = req.body.name
    const image = req.body.image
    if (! mongoose.isValidObjectId(userId) || ! name || ! image ) { // returns error if any of the varibles are missing 
        res.status(400).send('missing name or image or invalid user ID ');
        return // return stops code from continuing to run if error is thrown
    }
    const user = await User.findById(userId).exec()
    if( ! user ){
        res.status(400).send('User ID not found') // return error if user id isnt found
        return
    }
    const sneaker = await Sneaker.create({userId,name,image})
    res.send(sneaker)
})
///// READ / GET sneaker list for a user id  
app.get('/sneakers/user/:userId', async (req, res) => {
    const userId = req.params.userId 
    if( ! mongoose.isValidObjectId(userId)) {  // checks if Id is valid
        res.status(400).send('Invalid User ID')
        return
    }
    const user = await User.findById(userId).exec() // check if Id belongs to specific user 
    if( ! user ){
        res.status(400).send('User Not Found')
        return
    }
    const sneakers = await Sneaker.find({ userId }) // creates sneaker for specific user 
    res.send(sneakers)

})
// READ / GET by sneaker id  
app.get('/sneaker/:id', async (req, res) => {
    const _id = req.params.id
    if( ! mongoose.isValidObjectId(_id)) {  // check if sneaker id is a valid id 
        res.status(400).send('Invalid Sneaker ID')
        return
    }
    const sneaker = await Sneaker.findById(_id).exec()
    if( ! sneaker ){
        res.status(400).send('Sneaker Not Found')
        return
    }
    res.send(sneaker)
})

///// UPDATE SNEAKER
app.put('/sneaker/:id', (req, res) => {
    const id = req.params.id
    if(! mongoose.isValidObjectId(id)) {
        res.status(400).send('Bad User id')
        return
    }
    const name = req.body.name
    const image = req.body.image
    if (! name || ! image) {
        res.status(400).send('missing name or image');
        return
    }
     Sneaker.findByIdAndUpdate(id, {name,image}, {returnDocument:'after'})
        .then((sneaker) => {
            res.status(200).send(sneaker)
        })
        .catch((error) => {
            res.status(500).json({error})
        })
})

///// DELETE SNEAKER ************************
  app.delete('/sneaker/:id', async (req, res) => {
    const _id = req.params.id
    if(! mongoose.isValidObjectId(_id)) {  // checks if sneaker ID its a valid ID
        res.status(400).send('Bad Sneaker Id') // if its not, send back error message <--
        return // if error is thrown this return stops the app from trying to run the next function
    }
    const sneaker = await Sneaker.deleteOne({_id})
    res.send(sneaker) // return if sneaker was deleted 
  })



app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`) // calling PORT from line 44
  })

