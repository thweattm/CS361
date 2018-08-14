/**********************************************
* CS361
* Eyeglasses Donation site
***********************************************/

//Express
var express = require('express');
var app = express();
//Handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//MySQL
var mysql = require('./dbcon.js');
//Misc
app.set('port', 9156);
app.use(express.static('public'));
//Request
const request = require('request');

//Using hyperlinks 
app.use('/warehouse', require('./warehouse.js'));
app.use('/', require('./main.js'));

//Load homepage
app.get('/',function(req,res,next){
	res.render('home');
});

//Load new user page
app.get('/newUser', function(req, res, next){
	res.render('newUser');
});

//Load new dropoff location page
app.get('/newDropoff', function(req, res, next){
	res.render('newDropoff');
});

app.get('/findALocation', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM donorLocation WHERE verify = 0', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		if (rows){
			var params = [];
			for(var row in rows){
				var addItem = {'id': rows[row].id,
							'businessName': rows[row].businessName,
							'streetAddress': rows[row].streetAddress,
							'city': rows[row].city,
							'state': rows[row].state,
							'country': rows[row].country,
							'postalCode': rows[row].postalCode,
							'phoneNumber': rows[row].phoneNumber};
							
				params.push(addItem);
				}
				
			context.results = params;
			}
			
	res.render('findALocation', context);
	})
}); 

app.get('/verifyTable', function(req, res, next){
	var context = {};
	var found = 0;
	mysql.pool.query('SELECT * FROM donorLocation WHERE verify = 1', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		var params = [];
		for(var row in rows){
			found = 1;
			var addItem = {'id': rows[row].id,
						'ownerName': rows[row].ownerName,
						'businessName': rows[row].businessName,
						'streetAddress': rows[row].streetAddress,
						'city': rows[row].city,
						'state': rows[row].state,
						'country': rows[row].country,
						'postalCode': rows[row].postalCode,
						'phoneNumber': rows[row].phoneNumber,
						'email': rows[row].email};
						if(rows[row].verify == '1'){
							addItem.verify = "Unverified";
						}
						else
						{
							addItem.verify = "Verified";
						}

			params.push(addItem);
		}
	if (found == 1)
		context.results = params;
	res.render('verifyTable', context);
	})

});

app.get('/verify', function(req,res,next){
	var context = {};
	var sql = "UPDATE donorLocation SET verify = '0' WHERE id = ?"
	var values = [req.query.id];
	mysql.pool.query(sql, [values],
	function(err, result)
	{
	if (err)
	{
		throw err;
	}
	else{
	console.log("updated");
	res.render('verifySuccess');
	}
});
});

app.post('/newDropoffSubmit', function(req, res, next){
	var context = {};
	var values = [req.body.ownerName, req.body.businessName, req.body.streetAddress, req.body.city, req.body.state, 
		req.body.country, req.body.postalCode, req.body.phoneNumber, req.body.email];
	var sql = "INSERT INTO donorLocation (`ownerName`,`businessName`,`streetAddress`,`city`,`state`,`country`,`postalCode`,`phoneNumber`,`email`) VALUES (?)"
	console.log(JSON.stringify(req.body))
	mysql.pool.query(sql, [values], function(err,result){
		if(err){
			next(err);
			return;
		}
		if(err){
			console.log("Error inserting into donorLocation");
			res.render('500',sqlResponse);
		}
		else {
			res.render('dropoffSuccess');
		}
	});
});

//Add new item to donorInfo database
app.post('/newDonorSubmit', function(req, res, next){
	//console.log(JSON.stringify(req.body));
	var context = {};
	var values = [req.body.firstName, req.body.lastName, req.body.userName, req.body.password, req.body.email];
	var sql = "INSERT INTO donorInfo (`firstName`, `lastName`, `userName`, `password`, `email`) VALUES (?)"
	
	mysql.pool.query(sql, [values], function(err, result){
		if(err){
		  next(err);
		  return;
		}
		if(err){
			console.log("Error inserting into donorInfo");
			res.render('500', sqlResponse);
		} else {
			//console.log(JSON.stringify(result));
			var userInfo = [];
			//Barcode generation provided by: https://github.com/metafloor/bwip-js/wiki/Online-Barcode-API
			var barcodeURL = "http://bwipjs-api.metafloor.com/?bcid=code128&text=361_" + result.insertId + "&includetext";
			var addItem = {'id': result.insertId,
						'firstName': req.body.firstName,
						'lastName': req.body.lastName,
						'userName': req.body.userName,
						'email': req.body.email,
						'barcode': barcodeURL};
						
			userInfo.push(addItem);
			context.results = userInfo;
			
			//Load for 'user's my account'
			res.render('donorSuccess', context);
		}
	});
});

//Error 404 - Page not found
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

//Error handler	
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

//Start server
app.listen(app.get('port'), function(){
  console.log('Express started on http://flip1.engr.oregonstate.edu:' + app.get('port'));
  console.log('Press Ctrl-C to terminate.')
});
