 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');

var moment = require('moment');
moment().format();

var app = express();

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });


  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    });

app.route('/api/:str')
  .get(function (req, res) {
    console.log(req.params)
    console.log('aaa')
    var finalData = { unix: null, natural: null };
    var str = req.params.str;

    var isNumbersOnly = /^\d+$/.test(str);

    if (isNumbersOnly) {
      finalData.unix = Number(str);
      finalData.natural = moment.unix(Number(str)).format('MMMM DD, YYYY');
    } else {
      var dateFormats = [
        'M-D-YYYY',
        'MM-D-YYYY',
        'MMM-D-YYYY',
        'MMMM-D-YYYY',
        'M-DD-YYYY',
        'MM-DD-YYYY',
        'MMM-DD-YYYY',
        'MMMM-DD-YYYY',
        'YYYY-MM-DD'
      ];
      var momentObject = moment(str, dateFormats);
      if (momentObject.isValid()) {
        finalData.unix = Number(momentObject.format('X'));
        finalData.natural = momentObject.format('MMMM DD, YYYY');
      }
    }

    res.json(finalData);
  });

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
});

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

