var express = require("express");
var bcrypt = require('bcryptjs');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var User = require('../models/user');

//============================
// Obtain all users
//============================

app.get('/', ( req, res, next ) => {

    var from = req.query.from || 0;
    from = Number(from)

    User.find({  }, 'name email img role google')
        .skip(from)
        .limit(5)
        .exec(
            (err, users) => {

            if ( err ){
                return res.status(500).json({
                    ok: false,
                    message: "Error loading users",
                    errors: err
                });
            }

            User.count({}, (err, numElems) => {
                res.status(200).json({
                    ok: true,
                    users: users,
                    total: numElems
                })
            });

            
        });

});

//============================
// Update user
//============================

app.put('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminRoleOrSameUser], ( req, res) => {

    var id = req.params.id;
    var body = req.body;

    User.findById( id, (err, user) => {

        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error getting user",
                errors: err
            });
        }

        if ( !user ){
            return res.status(400).json({
                ok: false,
                message: "User with id" + id + "does not exists",
                errors: { message: 'User with that id does not exists'}
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save( (err, userUpdated) => {

            if ( err ){
                return res.status(400).json({
                    ok: false,
                    message: "Error updating user",
                    errors: err
                });
            }
    
            userUpdated.password = ':)';

            res.status(200).json({
                ok: true,
                user: userUpdated
            })

        });

    });

});

//============================
// Create new user
//============================

app.post('/',(req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save( ( err, userSaved ) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                message: "Error saving user",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userSaved,
            userToken: req.user
        })

    });

});


//============================
// Delete user
//============================

app.delete('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminRole], (req, res) => {

    var id=req.params.id;

    User.findByIdAndRemove(id, ( err, userRemoved ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error deleting user",
                errors: err
            });
        }

        if ( !userRemoved ){
            return res.status(400).json({
                ok: false,
                message: "User with id" + id + "does not exists",
                errors: { message: 'User with that id does not exists'}
            });
        }

        res.status(200).json({
            ok: true,
            user: userRemoved
        })
    });
});

module.exports = app;