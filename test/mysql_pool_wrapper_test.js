'use strict'
const async  = require('async')
const assert = require('chai').assert
const MySqlPoolWrapper = require('../src/mysql_pool_wrapper')

const mysqlPoolWrapper = new MySqlPoolWrapper({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASS,
	database: process.env.DB
})

describe('mysql pool wrapper unit tests', () => {
  describe('#getConnection()', () => {

  	// Arrange
  	let error  = null
  	let result = null

  	before((doneBeforeHook) => {
      // get the connection
  		mysqlPoolWrapper.getConnection((connection, done) => {
  			// create the queries, in this case is only one
  			connection.query('select hobbyName as name from USER_HOBBY where userId=?', [1], (err, res) => {
  				done(err, err? null : (res.length > 0? res[0].name : null))
  			})
  		}, 
  		// callback function
  		function(err, res) {
  			error  = err 
  			result = res
  			doneBeforeHook()
  		})
  	})

    it('should return the hobby from the user "1"', () => {
    	assert.isNull(error)
    	assert.equal(result, 'soccer')
    })
  })

  describe('#getTransactionConnection()', () => {

  	// Arrange
  	let error  = null
  	let result = null

  	before((doneBeforeHook) => {
  		mysqlPoolWrapper.getTransactionConnection((connection, done) => {
        // create the queries
  			async.waterfall([
  				// create the user
  				(cb) => {
  					connection.query('insert into USER(name) values(?)', ['bob'], (err, res) => cb(err, res))
  				},
  				// try create the association between the user and the hobby 'COD' that not exists
  				(res, cb) => {
  					connection.query('insert into USER_HOBBY(userId, hobbyName) values(?,?)', [res.insertId, 'COD'], (err, res) => cb(err, res))
  				}
  			],
  			(err, res) => {
  				done(err, res)
  			})
  		},
  		// callback function
  		function(err, res) {
  			error  = err
  			doneBeforeHook()
  		})
  	})

    it('should fail insert new user with the hobby "COD" (hobby doesn\'t exists)', () => {
    	assert.isNotNull(error)
    	assert.isNull(result)
    })
  })
})