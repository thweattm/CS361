var mysql = require('mysql');
var pool = mysql.createPool({
 connectionLimit : 10,
 host : 'classmysql.engr.oregonstate.edu',
 user : 'cs361_thweattm',
 password : '7257',
 database : 'cs361_thweattm'
});

module.exports.pool = pool;