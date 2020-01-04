const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const request = require('request');
const moment = require('moment');

let config = require('./util/config2');
let middleware = require('./util/middleware.js');

// API Address
const localServer = config.localServer;

let apiAddress = config.apiAddress;
let timeOut = 3000;

if (localServer){
  apiAddress = config.localAPI;
  timeOut = 0;
}

console.log("Using API from url", apiAddress);

// INIT
const app = express();
app.options('*', cors());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);


// app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());


// CODE STARTS HERE

mongoose.Promise = global.Promise;
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
moment.suppressDeprecationWarnings = true;

dbConfig = {
  url: config.dbURL
}
// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// Imports
const users = require('./controllers/user.controller.js');
const submissions = require('./controllers/submissionTut.controller.js');
const questions = require('./controllers/questionTut.controller.js');
const participations = require('./controllers/participationTut.controller.js');
const courses = require('./controllers/course.controller.js');



// Require course routes
require('./routes/course.route.js')(app);
// // // Require user routes
require('./routes/user.route.js')(app);
// Require question routes
require('./routes/questionTut.route.js')(app);
// Require submission routes
require('./routes/submissionTut.route.js')(app);
// Require participation routes
require('./routes/participationTut.route.js')(app);


app.post('/submissionValidation', middleware.checkToken, (req, res) => {
  questions.getTestCases(req, (err, testCases) => {
    if (err){
      res.status(404).send({message: "Question not found with id " + req.body.questionId});
  } else {
    if(localServer){
      postUrl = apiAddress + '/submissions/?wait=true';
    } else {
      postUrl = apiAddress + '/submissions';
    }
    let options1 = {
      method: 'post',
      body: {
        source_code: req.body.source_code,
        language_id: req.body.language_id,
        stdin: testcases.HI1,
        expected_output: testcases.HO1
      },
      json: true,
      url: postUrl
    };

    let options2 = {
      method: 'post',
      body: {
        source_code: req.body.source_code,
        language_id: req.body.language_id,
        stdin: testcases.HI2,
        expected_output: testcases.HO2
      },
      json: true,
      url: postUrl
    };

    let options3 = {
      method: 'post',
      body: {
        source_code: req.body.source_code,
        language_id: req.body.language_id,
        stdin: testcases.HI3,
        expected_output: testcases.HO3
      },
      json: true,
      url: postUrl
    };
  }
  });
});

app.listen(5003,()=>console.log('Server @ port 5003'));