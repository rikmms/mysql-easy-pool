'use strict'

const mysql = require('mysql')

/**
 * MySql connections' pool wrapper to handle the connections, mainly with the transactions, more easily. 
 * 
 * @author rikmms <ricardo.sousa@challenge.pt>
 */
class MySqlPoolWrapper {

	/**
	 * Constructor function.
	 * @param {Object} options The mysql module's options for create the connections' pool. @see https://www.npmjs.com/package/mysql#connection-options
	 */
	constructor(options) {
		this._pool = mysql.createPool(options)
	}

	/**
	 * Getter function for the created pool instance.
	 * Use this for add more functionality to the pool. @see https://www.npmjs.com/package/mysql#pool-events
	 * @return {Object} The created pool instance from the mysql module. 
	 */
	get pool() { return this._pool }

	/**
	 * Returns one available connection from the pool.
	 * @param  {Function} queries  Function with all the queries for run in the created connection. Each query must be like this @see https://www.npmjs.com/package/mysql#performing-queries
	 * @param  {Function} callback The callback function.
	 */
	getConnection(queries, callback) {
		this._pool.getConnection((err, connection) => {
			if(err) return callback(err)

			queries(connection, (err, result) => {
				connection.release()
				callback(err, result)
			})
		})
	}

	/**
	 * Returns one available connection from the pool.
	 * Use this function if you want to use the connection inside one transaction.
	 * @param  {Function} queries  Function with all the queries for run in the created connection. Each query must be like this @see https://www.npmjs.com/package/mysql#performing-queries
	 * @param  {Function} callback The callback function.
	 */
	getTransactionConnection(queries, callback) {
		this._pool.getConnection((err, connection) => {
			if(err) return callback(err)

			connection.beginTransaction(function (err) {
				if(err) {
					connection.release()
					return callback(err)
				}

				// Invoke the queries function received from arguments with the created connection, and callback function for release the connection and commit/rollback the statements.
				queries(connection, done)
			})

			/** 
			 * Helper function for define the close of the connection.
			 * This function invokes the callback with the error, if exists, or the queries' result.
			 * @param  {Err}    err    
			 * @param  {Object} result
			 */
			function done(err, result) {
				if(err)
					return connection.rollback(() => {
						connection.release()
						callback(err)
					})

				connection.commit((err) => {
					if(err)
						return connection.rollback(() => {
							connection.release()
							callback(err)
						})

					connection.release()
					callback(null, result)
				})
			}
		})
	}
}

module.exports = MySqlPoolWrapper