var express = require("express");

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Hospital = require('../models/hospital');

//============================
// Obtain all hospitals
//============================

app.get('/', ( req, res, next ) => {

    var from = req.query.from || 0;
    from = Number(from)

    Hospital.find({ })
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec(
            (err, hospitals) => {

            if ( err ){
                return res.status(500).json({
                    ok: false,
                    message: "Error loading hospitals",
                    errors: err
                });
            }
            Hospital.count({}, (err, numElems) => {
                res.status(200).json({
                    ok: true,
                    hospitals: hospitals,
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
    Hospital.findById(id)
        .populate('user', 'name img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error searching hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital with id ' + id + 'does not exists',
                    errors: { message: 'Hospital with that ID does not exists' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
})

//============================
// Update hospital
//============================

app.put('/:id', mdAuthentication.verifyToken, ( req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {

        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error getting hospital",
                errors: err
            });
        }

        if ( !hospital ){
            return res.status(400).json({
                ok: false,
                message: "Hospital with id" + id + "does not exists",
                errors: { message: 'Hospital with that id does not exists'}
            });
        }

        hospital.name = body.name;
        hospital.img = body.img;
        hospital.user = req.user._id;

        hospital.save( (err, hospitalUpdated) => {

            if ( err ){
                return res.status(400).json({
                    ok: false,
                    message: "Error updating hospital",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalUpdated
            })

        });

    });

});

//============================
// Create new hospital
//============================

app.post('/', mdAuthentication.verifyToken,(req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: req.user._id
    });

    hospital.save( ( err, hospitalSaved ) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                message: "Error saving hospital",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalSaved,
            userToken: req.user
        })

    });

});


//============================
// Delete hospital
//============================

app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id=req.params.id;

    Hospital.findByIdAndRemove(id, ( err, hospitalRemoved ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: "Error deleting hospital",
                errors: err
            });
        }

        if ( !hospitalRemoved ){
            return res.status(400).json({
                ok: false,
                message: "Hospital with id" + id + "does not exists",
                errors: { message: 'Hospital with that id does not exists'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalRemoved
        })
    });
});

module.exports = app;