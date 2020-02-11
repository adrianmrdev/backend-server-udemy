var express = require("express");

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Doctor = require('../models/doctor');

//============================
// Obtain all doctors
//============================

app.get('/', ( req, res, next ) => {

    var from = req.query.from || 0;
    from = Number(from)

    Doctor.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec(
            (err, doctors) => {

            if ( err ){
                return res.status(500).json({
                    ok: false,
                    message: "Error loading doctors",
                    errors: err
                });
            }
            Doctor.count({}, (err, numElems) => {
                res.status(200).json({
                    ok: true,
                    doctors: doctors,
                    total: numElems
                })
            });
        });

});

// ==========================================
// Obtain Hospital by ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Doctor.findById(id)
        .populate('user', 'name img email')
        .populate('hospital')
        .exec((err, doctor) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error searching doctor',
                    errors: err
                });
            }
            if (!doctor) {
                return res.status(400).json({
                    ok: false,
                    message: 'Doctor with id ' + id + 'does not exists',
                    errors: { message: 'Doctor with that ID does not exists' }
                });
            }
            res.status(200).json({
                ok: true,
                doctor: doctor
            });
        })
})

//============================
// Update hospital
//============================

app.put('/:id', mdAuthentication.verifyToken, ( req, res) => {

    var id = req.params.id;
    var body = req.body;

    Doctor.findById( id, (err, doctor) => {

        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error getting doctor",
                errors: err
            });
        }

        if ( !doctor ){
            return res.status(400).json({
                ok: false,
                message: "Doctor with id" + id + "does not exists",
                errors: { message: 'Doctor with that id does not exists'}
            });
        }

        doctor.name = body.name;
        doctor.img = body.img;
        doctor.hospital = body.hospital;
        doctor.user = req.user._id;

        doctor.save( (err, doctorUpdated) => {

            if ( err ){
                return res.status(400).json({
                    ok: false,
                    message: "Error updating doctor",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                doctor: doctorUpdated
            })

        });

    });

});

//============================
// Create new doctor
//============================

app.post('/', mdAuthentication.verifyToken,(req, res) => {

    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        img: body.img,
        hospital: body.hospital,
        user: req.user._id
    });

    doctor.save( ( err, doctorSaved ) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                message: "Error saving doctor",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            doctor: doctorSaved,
            userToken: req.user._id
        })

    });

});


//============================
// Delete hospital
//============================

app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id=req.params.id;

    Doctor.findByIdAndRemove(id, ( err, doctorRemoved ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error deleting doctor",
                errors: err
            });
        }

        if ( !doctorRemoved ){
            return res.status(400).json({
                ok: false,
                message: "Doctor with id" + id + "does not exists",
                errors: { message: 'Doctor with that id does not exists'}
            });
        }

        res.status(200).json({
            ok: true,
            doctor: doctorRemoved
        })
    });
});

module.exports = app;