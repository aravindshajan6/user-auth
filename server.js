const express = require('express');
const app = express(); //instance creation
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); //environment variables
const session = require('express-session'); //session generation
const cookieParser = require('cookie-parser'); //access cookie
const jwt = require('jsonwebtoken'); //token Gen.

app.use(bodyParser.urlencoded({extended: true})); //read urlencoded data
app.use(cookieParser()); //access cookies
dotenv.config({path:'./config/config.env'}) //adding path for env

app.use(express.static('public'));
//for session Gen.
// app.use(session({
//     secret: "My_scret",
//     name:'my new site',
//     resave:false,
//     saveUninitialized:true,
// }))

const users = [  //static DB
    {username: 'sam', password :'123'},
    {username: 'ram', password :'123'}
];

//signup 
app.get('/signup', ( req, res) => {
    
    res.sendFile(__dirname + '/signup.html');
})

app.post('/signup', (req, res) => {
    // console.log(users);
    const {username, password} = req.body;
    console.log('Susername : '+username, ',Spassword : '+password);
    //get signup username & password
    const Susername = username, Spassword = password;
    const userObj = {username:Susername, password:Spassword};
    users.push(userObj); //push to array
    console.log(users);
    res.sendFile(__dirname + '/login.html')
})

//login
app.get('/', ( req, res) => {
    const {token} = req.cookies;

        if(token){
            jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, result){
                if(err){
                    res.sendFile(__dirname + '/login.html');
                }else if(!err){
                 res.redirect('/profile');
                }
            }); 
        }else{
            res.sendFile(__dirname + '/login.html');
        }
    

})

app.post('/', ( req, res) => {
    const {username, password} = req.body;
    console.log('username : '+username, ',password : '+password);
    //check for matching user
    const user = users.find((data) =>data.username === username && data.password === password)
    if(!user){ //if no match
        console.log('User not found !');
        res.redirect('/')
    }else if(user){ //if match found
         //create payload for sign()
        const data = {
            username,
            date:Date(),
        }

        //token generation
        //sign() takes 3 arguments
        const token = jwt.sign(data, process.env.JWT_SECRET_KEY, ({expiresIn:'10min'}));
        // console.log(token);

        console.log('User found !');
        //send token to cookie
        res.cookie('token', token).redirect('/profile');

    }


})

//profile
app.get('/profile', (req, res) => {
    //destructure token from cookie
    const {token} = req.cookies;
    console.log(token);

        if(token){
         //verify tokens
            jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, result){
                if(err){
                    res.sendFile(__dirname + '/login.html');
                }else if(!err){
                res.sendFile(__dirname + '/profile.html');
                }
            }); 
        }else{
            res.sendFile(__dirname + '/login.html');
    }
})




app.listen( process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});