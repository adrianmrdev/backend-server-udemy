var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//============================
// Middleware: Verify token
//============================
exports.verifyToken = function(req, res, next) {

    var token= req.query.token;

    jwt.verify( token, SEED, ( err, decoded ) => {

        if ( err ){
            return res.status(401).json({
                ok: false,
                message: "Unauthorized: Token not valid",
                errors: err
            });
        }

        req.user = decoded.user;

        next();

    });

}


//============================
// Middleware: Verify admin
//============================
exports.verifyAdminRole = function(req, res, next) {

    var user = req.user;

    if ( user.role === 'ADMIN_ROLE' ){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: "Unauthorized: You have to be ADMIN",
            errors: { message: "You are not administrator, can't do that" }
        });
    }

}

//======================================
// Middleware: Verify admin or same user
//======================================
exports.verifyAdminRoleOrSameUser = function(req, res, next) {

    var user = req.user;
    var id = req.params.id;

    if ( user.role === 'ADMIN_ROLE' || user._id === id){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: "Unauthorized: You have to be ADMIN or be the same user",
            errors: { message: "You are not administrator or same user, can't do that" }
        });
    }

}