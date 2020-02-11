var express = require("express");
var app = express();

var fileUpload = require('express-fileupload');
var fs = require('fs');

var User = require('../models/user');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');

// default options
app.use(fileUpload());

app.put('/:type/:id', function(req, res, next) {

  var type = req.params.type;
  var id = req.params.id;

  // Collection types
  var validCollections = [ 'hospitals', 'users', 'doctors' ];

  if( validCollections.indexOf( type ) < 0){
    return res.status(400).json({
        ok: false,
        message: "Collection type not valid",
        errors: { message: 'Valid colections: ' + validCollections.join(', ') }
    });
  }

  if (!req.files) {

    return res.status(400).json({
        ok: false,
        message: "Nothing selected to upload",
        errors: { message: 'You should select one image' }
    });
    
  }

  // Obtain file name
  var file = req.files.img;
  var fileNameTrim = file.name.split('.');
  var ext = fileNameTrim[ fileNameTrim.length - 1 ];

  // Extension filter
  var validExts = [ 'png', 'jpg', 'gif', 'jpeg'];

  if ( validExts.indexOf( ext ) < 0) {
    return res.status(400).json({
        ok: false,
        message: "Invalid file extension",
        errors: { message: 'Valid extensions: ' + validExts.join(', ') }
    });
  }

  // Custom filename
  var filename = `${ id }-${ new Date().getMilliseconds() }.${ ext }`;

  // Move file
  var path = `./uploads/${ type }/${ filename }`;

  file.mv( path, ( err ) => {
    if (err){
        return res.status(500).json({
            ok: false,
            message: "Error moving file",
            errors: { message: 'Error moving file ' + err }
        });
    }

    uploadByType( type, id, filename, res );

  });

});

function uploadByType( type, id, filename, res ){

    if ( type == 'users' ){

        User.findById( id, ( err, user) =>{

            var oldPath = './uploads/users/' + user.img;

            if ( fs.existsSync( oldPath ) ){
                fs.unlinkSync(oldPath);
            }

            user.img = filename;

            user.save( (err, userUpdated ) => {

                userUpdated.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'User img updated!',
                    user: userUpdated
                })

            });

        });

    }else if ( type == 'hospitals' ){
        Hospital.findById( id, ( err, hospital) =>{

            var oldPath = './uploads/hospitals/' + hospital.img;

            if ( fs.existsSync( oldPath ) ){
                fs.unlinkSync(oldPath);
            }

            hospital.img = filename;

            hospital.save( (err, hospitalUpdated ) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Hospital img updated!',
                    hospital: hospitalUpdated
                })

            });

        });
    }else if ( type == 'doctors' ){
        Doctor.findById( id, ( err, doctor) =>{

            var oldPath = './uploads/doctors/' + doctor.img;

            if ( fs.existsSync( oldPath ) ){
                fs.unlinkSync(oldPath);
            }

            doctor.img = filename;

            doctor.save( (err, doctorUpdated ) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Doctor img updated!',
                    doctor: doctorUpdated
                })

            });

        });
    }

}

module.exports = app;