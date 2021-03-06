//4.9.2014 - Ryan Whitley
var flow = require('flow');
var common = require("../../../common"),
    settings = require('../../../private/settings'),
    shortid = require('shortid');

var operation = {};

/* METADATA */
operation.name = "GetProjectRiskByGUID";
operation.description = "Gets ECOS Projects/Risks for a given GADM boundary based on a GUID.";
operation.inputs = {};

operation.outputImage = false;

operation.inputs["guids"] = {}; //comma separated list of guids
operation.inputs["gadm_level"] = {}; //gadm_level to search thru
operation.inputs["filters"] = ""; //string - sql WHERE clause, minus the 'WHERE'





operation.execute = flow.define(
  function (args, callback) {
    this.args = args;
    this.callback = callback;

    //Step 1

    // Newer schema where we can have many-to-many locations per project.
    if (settings.projectsManyToMany) {
      operation.ProjectQuery =
        "SELECT sf_project.* \
        FROM sf_project \
        WHERE sf_id = (SELECT DISTINCT sf_id from sf_aggregated_gadm_project_counts_many where sf_project.sf_id = sf_id and guid{{gadm_level}} = {{guids}}) \
         {{filters}};";
    }
// Original project query where we have 1 location per project.
    else {
      operation.ProjectQuery =
        "SELECT sf_project.* \
        FROM sf_aggregated_gadm_project_counts, sf_project \
        WHERE sf_aggregated_gadm_project_counts.sf_id = sf_project.sf_id \
          AND guid{{gadm_level}} = {{guids}} {{filters}}; ";
    }

    operation.RiskQuery = "SELECT * " +
    "FROM sf_project_risk " +
    "WHERE project__c = {{guid}}; " ;

    //Generate UniqueID for this Task
    operation.id = shortid.generate();

    //If theme is project, projectRisk, or projectHealth, add to the filters where phase is 2 - 4, which equates to Active projects.
    //In SalesForce, the phase__c column is text and has delimited values in the cells.  So, we'll do a 'like' operator instead of =
    var activeProjectWhereClause = " AND (sf_project.phase__c LIKE '%1%' OR sf_project.phase__c LIKE '%2%' OR sf_project.phase__c LIKE '%3%' OR sf_project.phase__c LIKE '%4%' OR sf_project.phase__c LIKE '%5%' OR sf_project.phase__c LIKE '%6%')";

    //Do not display projects or disasters that have TEST as the first word in the project name.
    var removeTESTProjects = " AND name NOT ILIKE 'test%'";

    //See if inputs are set. Incoming arguments should contain the same properties as the input parameters.
    if (operation.isInputValid(args) === true) {
      //prepare bbox string as WKT
      operation.inputs["guids"] = args.guids;
      operation.inputs["gadm_level"] = args.gadm_level;
      operation.inputs["filters"] = args.filters;

      var filters = '';

      if (operation.inputs["gadm_level"] == -1) {
        operation.inputs["gadm_level"] = "arc";
      }
      if(operation.inputs["filters"] && operation.inputs["filters"] !== 'null'){
        var inputFilters = operation.inputs["filters"].replace(/%20/g, ' ').replace(/%25/g,'%').replace(/%27/g,"'");
        filters = " AND (" + inputFilters + ")";
        //filters += activeProjectWhereClause;
        filters += removeTESTProjects;
      }
      else{
        //Add where clause to only show active projects
        //filters = activeProjectWhereClause;
        filters += removeTESTProjects;
      }

      //need to wrap ids in single quotes
      //Execute the query
      var projectQuery = { text: operation.ProjectQuery.replace("{{guids}}", operation.wrapIdsInQuotes(operation.inputs["guids"])).replace("{{gadm_level}}", operation.inputs["gadm_level"]).replace("{{filters}}", filters)};
      common.executePgQuery(projectQuery, this); //Flow to next function when done.
    }
    else {
      //Invalid arguments
      //return message
      callback("Missing or invalid required arguments: guids"); //err is first argument
    }
  },
  function (err, results) {
    if (err) {
      this.callback(err);
      return;
    }
    var projects = this.projects = results.rows;
    for (var i = 0, len = projects.length; i < len; i++) {
      var proj = projects[i];
      var projId = proj.sf_id;
      var indicatorQuery = { text: operation.RiskQuery.replace("{{guid}}", operation.wrapIdsInQuotes(projId)) };
      common.executePgQuery(indicatorQuery, this.MULTI(projId));
    }
  },
  function (args) {
    for (var i = 0, len = this.projects.length; i < len; i++) {
      var proj = this.projects[i];
      var projId = proj.sf_id;
      for (var key in args) {
        if (key === projId) {
          var indicRes = args[key];
          // if there is an error for the risks query
          if (indicRes[0] !== null) {
            this.callback(indicRes[0]);
          } else {
            // apply risks data to project
            proj.risks = indicRes[1].rows;
            if (proj.risks.length === 0) {
              proj.risks = 'none';
            }
          }
          break;
        }
      }
    }
    var results = { rows: this.projects };

    this.callback(null, results);
  }
);

//Make sure arguments are tight before executing
operation.isInputValid = function (input) {
  //Test to see if inputs are specified
  var isValid = false;

  if (input) {
    //make sure we have a bbox.  Other args are optional
    if (input["guids"] && input["gadm_level"]) {
      //It's got everything we need.
      return true;
    }
  }

  return isValid;
};

operation.wrapIdsInQuotes = function (ids) {
  return ids.split(',').map(function (item) {
    return "'" + item + "'";
  });
};

module.exports = operation;