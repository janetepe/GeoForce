/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *     on Tue Mar 11 2014
 */

var pg                  = require('pg');
var S                   = require('string');
var settings            = require('./settings').pg;
var salesforce          = require('./salesforce');
var salesforceQueries   = require('./salesforce-queries');

// PostGIS Connection String
var conString =     "postgres://" +
                    settings.user + ":" +
                    settings.password + "@" +
                    settings.server + ":" +
                    settings.port + "/" +
                    settings.database;


function query(queryStr, cb) {
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error fetching client from pool', err);
        }
        client.query(queryStr, function(queryerr, result) {
            //call `done()` to release the client back to the pool
            done();

            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', queryStr, queryerr);
            }

            cb((err || queryerr), (result && result.rows ? result.rows : result));
        });
    });
}


function fetchTableNames(cb) {
    var queryStr = "SELECT * FROM pg_tables;";

    query(queryStr, function(err, rows) {
        var tables = {};
        rows.forEach(function(row){
            tables[row.tablename] = true;
        });
        cb(tables);
    });
}


function insertRows(queryTable, rows, queryStr) {

	//Get an array of proper field names
	var fields = getTableFieldNamesFromQuery(queryStr);

	fetchTableNames(function (tables) {
        // See if a query table exists.
        if (tables[queryTable]) {
            //It exists. If the query returns any rows, then assume it's good data.
            if(rows.length > 0){
                //Drop the view, then the old table.  Create table again and insert new rows
                dropView(queryTable, function(err, result){
                    if(err){
                        console.log("Error dropping view: " + queryTable + ".  Msg: " + err );
                    }else{
                        //Drop table
                        dropQueryTable(queryTable, function(err){
                            if(!err){
                                //Create table again
                                createTable(queryTable, rows, fields, function() {
                                    _insertRows(queryTable, rows, fields, function(){
                                        //After finished inserting rows, (re)build the view
                                        isSpatialTable(rows, function(isSpatial){
                                            if(isSpatial === true){
                                                //Create a view if table is spatial
                                                createSpatialView(queryTable, rows, fields, function(err, res){
                                                    if(err){
                                                        console.log("Error creating view: " + queryTable + ".  Msg: " + err );
                                                    }
                                                }) ;
                                            }
                                        });
                                    });
                                });
                            }
                            else{
                                console.log("Error dropping table: " + queryTable + ".  Msg: " + err );
                            }
                        }, false);
                    }
                })
            }
            else{
                //If no rows, then don't drop the old table
            }
        }
        // If not, create the given table and then insert rows.
        else {
            createTable(queryTable, rows, fields,  function() {
                _insertRows(queryTable, rows, fields);
            });
        }
    });

}


/**
 * This is to be called inside of function insertRows only.
 * Consider this private private.
 *
 * @param rows
 * @private
 */
function _insertRows(queryTable, rows, fields, cb) {
    rows.forEach(function(row){
        var insertStr = "INSERT INTO " + queryTable + " ( ";
        var valStr = "VALUES ( ";
        for (var field in row) {
					if(isValidColumn(fields, field) == true){
						insertStr += field + ', ';
						valStr += sanitize(row[field]) + ', ';
					}
        }
        insertStr = insertStr.slice(0, insertStr.length-2) + ') ';
        valStr = valStr.slice(0, valStr.length-2) + ');';
        var sql = insertStr.toLowerCase() + valStr;

        query(sql, function(err) {
            console.log(sql);
            if(err){

            }
        });
    });

    //Done
    if(cb) cb();
}


/**
 * Creates a table based on the type of each field in a given row.
 * If a given field for a row is null, we iterate further until we
 * find the type for the given field. If all rows for a given field
 * are null, we just make the type be a String.\
 *
 * @param queryTable
 * @param rows
 * @param cb
 */
function createTable(queryTable, rows, fields, cb) {
	var table = {
		// fieldName: type
	};

	var row = rows[0];
	var len = rows.length;

	for (var field in row) {

		var val = row[field];

			// it's a string that may be a stringified object
			if (typeof val === 'string') {
				table[field] = 'text';
			}

			// it's a number
			if (typeof val === 'number') {
				if (isInt(val)) {
					table[field] = 'integer';
				} else {
					table[field] = 'float';
				}
			}

			// it's a null value, see if you can find a row that has a field that isn't null...
			else if (typeof val === 'object' && val === null) {
				for (var i = 0; i < len; ++i) {
					row = rows[i];
					val = row[field];
					// its a string that may be a stringified object
					if (typeof val === 'string') {
						table[field] = 'text';
						break;
					}
					// it's a number
					if (typeof val === 'number') {
						if (isInt(val)) {
							table[field] = 'integer';
						} else {
							table[field] = 'float';
						}
						break;
					}
				}
				// OK, well... We haven't found what we're looking for. Let's just call it text
				// and move on with our lives...
				if (!table[field]) table[field] = 'text';
			}
		}

	//TODO: Get rid of this workaround.
	var lowerList = {}; //a lowercase list of field names coming back from salesforce.

	var sql = "CREATE TABLE " + queryTable + "( ID  SERIAL PRIMARY KEY, ";
	for (var field in table) {
		//Make sure the return field matches one of the whitelisted fields from the original SOQL query, otherwise ignore the property
		if (isValidColumn(fields, field) == true) {
			//It's ok.  Let it pass
			sql += field.toLowerCase() + ' ' + table[field] + ', ';
			lowerList[field.toLowerCase()] = true; //keep a lower case version
		}
	}

	//Add any columns that are defined in the select statement that AREN'T in the table object.
	fields.forEach(function(field){
		//Check to see if the field is in the table list.
		if(!lowerList[field] && field != 'id'){
			sql += field.toLowerCase() + ' text, ';
		}
	});

	sql = sql.slice(0, sql.length - 2); // get rid of that last ', '
	sql += ");";

	console.log("Creating table for " + queryTable);
	console.log(sql);

	query(sql, function (err, res) {
		console.log(queryTable + ' successfully created.');
		console.log(res);

		// If we have a location guid, we should make an index on it.
		// NOTE: We can have this happen whenever, so don't worry about a callback with this.
		var locationField = 'Location__c';
		if (typeof row !== 'undefined' && typeof row[locationField] !== 'undefined') {
			var sql = 'CREATE INDEX idx_' + queryTable + '_location__c ON ' + queryTable + '(' + locationField + ');';
			query(sql, function (err, res) {
				console.log('Created Index: ' + sql);
				console.log(res);
			});
		}

		cb(err, res);
	});
}

/**
 * Creates a spatial view of the incoming data, joining it with the GADM dataset.
 * If a given field for a row is null, we iterate further until we
 * find the type for the given field. If all rows for a given field
 * are null, we just make the type be a String.\
 *
 * @param tableName
 * @param rows
 * @param cb
 */
function createSpatialView(tableName, rows, fields, cb) {
    var table = {
        // fieldName: type
    };

    var row = rows[0];
    var len = rows.length;
    var tableQueryAlias = "a"; //Alias to use in the query to refer to the sf table

	for (var field in row) {
		var val = row[field];

		// it's a string that may be a stringified object
		if (typeof val === 'string') {
			table[field] = 'text';
		}

		// it's a number
		if (typeof val === 'number') {
			if (isInt(val)) {
				table[field] = 'integer';
			} else {
				table[field] = 'float';
			}
		}

		// it's a null value, see if you can find a row that has a field that isn't null...
		else if (typeof val === 'object' && val === null) {
			for (var i = 0; i < len; ++i) {
				row = rows[i];
				val = row[field];
				// its a string that may be a stringified object
				if (typeof val === 'string') {
					table[field] = 'text';
					break;
				}
				// it's a number
				if (typeof val === 'number') {
					if (isInt(val)) {
						table[field] = 'integer';
					} else {
						table[field] = 'float';
					}
					break;
				}
			}
			// OK, well... We haven't found what we're looking for. Let's just call it text
			// and move on with our lives...
			if (!table[field]) table[field] = 'text';
		}
	}


    var sql = "CREATE VIEW vw_" + tableName + " AS SELECT ";
    var fields = []; //Array of field names;
    var fieldsString = ""; //Joined string of field names

    for (var field in table) {
			//Make sure the return field matches one of the whitelisted fields from the original SOQL query, otherwise ignore the property
			if (isValidColumn(fields, field)) {
				fields.push(tableQueryAlias + "." + field.toLowerCase());
			}
		}

    //Add text_search columns
    fields.push("text_search.*");

    //Join field names
    sql += fields.join(",");
    sql += " FROM " + tableName + " " + tableQueryAlias;
    sql += " INNER JOIN text_search on text_search.stack_guid::character varying = " + tableQueryAlias + ".gis_geo_id__c;"

    console.log("Creating view for " + tableName);
    console.log(sql);

    query(sql, function(err, res) {
        console.log(tableName + ' successfully created.');
        console.log(res);

        cb(err, res);
    });
}


function insertQuery(sfQueryName) {
	var queryStr = salesforceQueries[sfQueryName];
	var queryTable = 'sf_' + S(sfQueryName).underscore().s;

	salesforce.queryAndFlattenResults(queryStr, function (rows) {
		insertRows(queryTable, rows, queryStr);
	});
}

//addPrefix: boolean - specifies whether or not to add the 'sf_' before the incoming table name.
function dropQueryTable(sfQueryName, cb, addPrefix) {
    var queryTable = (addPrefix ? 'sf_' : '') + S(sfQueryName).underscore().s;
    var sql = "DROP TABLE IF EXISTS " + queryTable + ";";
    query(sql, function(err, res) {
        console.log(sql);

        cb(err,res);
    })
}

//addPrefix: boolean - specifies whether or not to add the 'sf_' before the incoming view name.
function dropView(sfViewName, cb) {
    var queryView = 'vw_' + S(sfViewName).underscore().s;
    var sql = "DROP VIEW IF EXISTS " + queryView + ";";
    query(sql, function(err, res) {
        console.log(sql);

        cb(err,res);
    })
}

function insertAllQueryTables() {
    for (var sfQueryName in salesforceQueries) {
        insertQuery(sfQueryName);
    }
}


function dropAllSalesforceTables() {
    for (var sfQueryName in salesforceQueries) {
        dropQueryTable(sfQueryName);
    }
}

/******************************************************************
 ************************ UTILITY FUNCTIONS************************
 ******************************************************************/
function isInt(n) {
    return n % 1 === 0;
}

function sanitize(val) {
    // we want a null to still be null, not a string
    if (typeof val === 'string' && val !== 'null') {
        // $nh9$ is using $$ with an arbitrary tag. $$ in pg is a safe way to quote something,
        // because all escape characters are ignored inside of it.
        var esc = settings.escapeStr;
        return "$"+esc+"$" + val + "$"+esc+"$";
    }
    return val;
}

/**
 * Based on field names, find if the salesforce table has the column gis_geo_id__c
 * This is a GUID that also lives in the GeoDB.
 * If found, assume this is a table that can be joined to the spatial tables.
 *
 * @param queryTable
 * @param rows
 * @param cb
 */
function isSpatialTable(rows, cb) {
    var row = rows[0];

    for (var key in row) {
        if(key.toLowerCase() == 'gis_geo_id__c'){
            //it's showtime
            cb(true);
            return;
        }
    }
    //Didn't find it
    cb(false);
}


/*
 ...Becasuse what you ask for in the SOQL queries is not exactly what you get back from the API.
 This will parse the query statement so we know exactly which fields to use to create the PostGres Tables and Views
 */
function getTableFieldNamesFromQuery(queryStr){
	//break the query string in 1/2 by splitting on the FROM clause.  Take the 1st 1/2 and remove the 'select' statement.
	//Next, split the remainder by commas, then account for spaces and aliases.
	var fields = queryStr.toLowerCase().split('from')[0].replace('select','').split(',').map(function(field){
		//trim
		field = field.trim();

		//handle fully qualified names
		if(field.indexOf('.') > -1){
			field = field.split('.')[1]; //take the last part of the name
		}

		if(field.indexOf(' ') > -1){
			field = field.split(' ')[1]; //use the alias
		}

		return field.trim();
	});

	return fields;
}

/*
...because there are several places where we're getting results from SalesForce API that don't match the original select statement.
This will tell you if the field is supposed to be going into the DB.
Filter out id, since we're handling that in a non-dynamic way.
 */
function isValidColumn(fields, field){
	if (fields.indexOf(field.toLowerCase()) > -1) {
		return true;
	}
	else{
		return false;
	}
}

/******************************************************************
 **************************** TESTS *******************************
 ******************************************************************/

function testSimpleSelectQuery() {
    var queryStr = "SELECT id_0, ogc_fid, year, guid FROM gadm0;";

    query(queryStr, function(err, rows) {
        console.log(rows);
    });
}



//testSimpleSelectQuery();

//dropAllSalesforceTables()
setTimeout(null,500);
//insertQuery('allProjects');
//insertQuery('allOrganizations');
//insertQuery('allMoneyInWorld');
//insertQuery('numProjAndBudgetPerCountry');
//insertQuery('projGroupedByCountry');
//insertQuery('allDataForAGivenProject');
//insertQuery('allDataForAGivenProgram');

insertAllQueryTables();
