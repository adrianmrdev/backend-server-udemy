var express = require("express");
var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

//============================
// Search by collection
//============================

app.get('/collection/:table/:search', (req, res) => {

    var table =req.params.table;
    var search = req.params.search;
    var regex = new RegExp( search, 'i');

    var promise;

    switch( table ){
        case 'users':
            promise = searchUsers( search, regex);
        break;

        case 'hospitals':
            promise = searchHospitals( search, regex);
        break;

        case 'doctors':
            promise = searchDoctors( search, regex);
        break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'Types allowed are: users, hospitals, doctors',
                error: { message: 'Types not allowed' }
            })
    }

    promise.then( data => {
        res.status(200).json({
            ok: true,
            [table]: data
        })
    })

});

//============================
// Search in all collections
//============================

app.get('/all/:search', ( req, res, next ) => {

    var search = req.params.search;
    var regex = new RegExp( search, 'i');

    Promise.all([ 
        searchHospitals( search, regex),
        searchDoctors( search, regex ),
        searchUsers(search, regex)])
        .then( resp => {
            res.status(200).json({
                ok: true,
                hospitals: resp[0],
                doctors: resp[1],
                users: resp[2]
            })
        })

});

function searchHospitals( search, regex ){

    return new Promise( (resolve, reject) => {
        Hospital.find({ name: regex })
                .populate('user', 'name email img')
                .exec((err, hospitals) => {
        
            if( err ){
                reject('Error loading hospitals', err);
            }else{
                resolve(hospitals)
            }
    
        });
    });

}

function searchDoctors( search, regex ){

    return new Promise( (resolve, reject) => {
        Doctor.find({ name: regex })
              .populate('user', 'name email img')
              .populate('hospital')
              .exec((err, doctors) => {
        
            if( err ){
                reject('Error loading doctors', err);
            }else{
                resolve(doctors)
            }
    
        });
    });
}

function searchUsers( search, regex ){

    return new Promise( (resolve, reject) => {
        User.find({}, 'name email role img')
            .or([ {'name': regex}, {'email': regex}])
            .exec( (err, users) => {
                if(err){
                    reject('Error loading users', err)
                }else{
                    resolve(users)
                }
            })
    });
}

module.exports = app;