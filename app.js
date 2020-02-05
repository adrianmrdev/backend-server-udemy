// Requires
var express=require('express');
var mongoose=require('mongoose');
var bodyParser = require('body-parser')

//Init variables
var app = express();


//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//Import routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');

//Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',  ( err, res )=>{

    if ( err ) throw err;

    console.log('Database up and running on port 27017: \x1b[32m%s\x1b[0m', 'online');

});

//Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Express listening requests
app.listen(3000, () => {
    console.log('Express server up and running on port 3000: \x1b[32m%s\x1b[0m', 'online');
});