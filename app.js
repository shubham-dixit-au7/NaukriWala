const express = require('express');
const app = express();

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');

const connectDatabase = require('./config/database');
const errorMiddleware = require('./middlewares/errors')
const ErrorHandler = require('./utils/errorHandler')

//Setting up the config.env file variables
dotenv.config({path : './config/config.env'});

//Handling Uncaught Exceptions
process.on('uncaughtException', err => {
    console.log( `Error : ${err.message}`);
    console.log('Shutting down due to uncaught exception.')
    process.exit(1);
});

// connecting to database
connectDatabase();

//Setup body parser
app.use(bodyParser.urlencoded({ extended : true}));

app.use(express.static('public'));

// Setup security headers
app.use(helmet());

// Setup body parser
app.use(express.json());

// Set Cookie Parser
app.use(cookieParser());

// Handle File Uploads 
app.use(fileUpload());

//Sanitize Data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xssClean());

// Prevent Parameter Pollution
app.use(hpp({
    whitelist : ['positions']
}));

// Rate Limiting


//Importing all routes
const jobs = require('./routes/jobs');
const auth = require('./routes/auth');
const user = require('./routes/user');

app.use('/api/v1', jobs);
app.use('/api/v1', auth);
app.use('/api/v1', user);

//Handle Unhandled Routes
app.all('*', (req, res, next) => {u
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
});

//Handling unhandled Promise Rejection 
process.on('unhandledRejection', err => {
    console.log (`Error : ${err.message}`);
    console.log('Shutting down the server due to Unhandled promise rejection.')
    server.close( () =>{
        process.exit(1);
    })
});
