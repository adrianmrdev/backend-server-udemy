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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS, PATCH"); 
    next();
});

//Import routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');

//Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',  ( err, res )=>{

    if ( err ) throw err;

    console.log('Database up and running on port 27017: \x1b[32m%s\x1b[0m', 'online');

});

//Server index config
var serveIndex = require('serve-index');

app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));

//Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/', appRoutes);

// Express listening requests
app.listen(3000, () => {
    console.log('Express server up and running on port 3000: \x1b[32m%s\x1b[0m', 'online');
});