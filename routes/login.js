var express = require("express");
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var User = require('../models/user')

//============================
// Normal Authentication
//============================

app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {

        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error searching user",
                errors: err
            });
        }

        if ( !userDB ){
            return res.status(400).json({
                ok: false,
                message: "User with email" + body.email + "does not exists",
                errors: { message: 'User with that email does not exists'}
            });
        }

        if ( !bcrypt.compareSync( body.password, userDB.password)){
            return res.status(400).json({
                ok: false,
                message: "Incorrect user password",
                errors: { message: "Incorrect user password"}
            });
        }

        // Create token
        userDB.password = ':)';
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 })

        res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB._id
        })
    })
});


//============================
// Google Authentication
//============================

async function verify( token ) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  
    });

    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    } 
  }

app.post('/google', async(req,res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e=>{
            return res.status(403).json({
                ok: false,
                message: "Invalid token",
            });
        });

    User.findOne( { email: googleUser.email }, (err, userDB) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error searching user",
                errors: err
            });
        }

        if ( userDB ) {

            if ( userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: "Should use normal authentication"
                });
            } else {
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                })
            }

        } else {
            // User does not exists... should create

            var user= new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save( (err, userDB) => {
                if ( err ){
                    return res.status(500).json({
                        ok: false,
                        message: "Error saving user",
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                })
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     message: "OK",
    //     googleUser: googleUser
    // })
});

module.exports = app;