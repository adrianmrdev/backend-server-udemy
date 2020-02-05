var express = require("express");
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var User = require('../models/user')

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

module.exports = app;