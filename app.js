// Requires
var express=require('express');
var mongoose=require('mongoose');

//Init variables
var app = express();


//Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',  ( err, res )=>{

    if ( err ) throw err;

    console.log('Database up and running on port 27017: \x1b[32m%s\x1b[0m', 'online');

});

// Rutas
app.get('/', ( req, res, next ) => {

    res.status(200).json({
        ok: true,
        message: 'Successfully request'
    })

});

// Express listening requests
app.listen(3000, () => {
    console.log('Express server up and running on port 3000: \x1b[32m%s\x1b[0m', 'online');
});