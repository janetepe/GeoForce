/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 3/27/14.
 */

module.exports = angular.module('GeoAngular').controller('FiltersCtrl', function ($scope, $http, $state, $stateParams,$timeout) {
  $scope.filterMode = "project"; //Which theme are we filtering?
  $scope.params = $stateParams;
  $scope.searchText = '';
  $scope.navTab = 'sectors';
  $scope.sectors = [];
  $scope.selected = false;
  $scope.disasterTypes = [];
  $scope.status = [];
  $scope.businessUnits = [];
  $scope.disasterTypescategory = {};
  debug.budget = $scope.budget = {
    slider: [2000, 8000],
    min: 0,
    mean: 5000,
    max: 100000
  };

  /**
   * Get checkbox info that was generated by the Succubus.
   */
  $http.get('succubus_gitignore/sf-project-filter-checkboxes.json', {cache: true}).success(function (data, status) {
    angular.extend($scope, data);
    debug.filtersScope = $scope;
9  }).error(function () {
    console.error("Unable to fetch project filter meta data");
  });

  $http.get('succubus_gitignore/sf-disaster-filter-checkboxes.json', {cache: true}).success(function (data, status) {
    angular.extend($scope, data);
    debug.filtersScope = $scope;
    $scope.categorizeDisasterFilters();
    $scope.defaultStatus(); // check Monitoring and Active in Status object
  }).error(function () {
    console.error("Unable to fetch disaster filter meta data");
  });

  $http.get('succubus_gitignore/sf-object-field-hash.json', {cached: true}).success(function(sfFieldHash) {
    $scope.sfFieldHash = sfFieldHash;
    $scope.businessUnits = sfFieldHash["Project__c"]["business_unit__c"]["picklistValues"];
    getBusinessUnitTypes();
  }).error(function(){
    console.error("Unable to fetch object field meta data");
  });

  // take array of disaster types and create a new object that separates by category
  $scope.categorizeDisasterFilters = function () {
    $scope.searchList = [];
    var dt = $scope.disasterTypes;
    var p = null;
    var arr = [];
    var cTypes = {};
    for (var i = 0; i < dt.length; i++) {
      if (dt[i].name.indexOf('---') !== -1) {
        arr = [];
        cTypes[dt[i].name.replace("--- ", "").replace(" ---", "")] = {};
        p = dt[i].name.replace("--- ", "").replace(" ---", "");
      } else {
        $scope.searchList.push(dt[i]);
      }
      if (dt[i].name.indexOf('---') == -1) {
        arr.push(dt[i]);
        cTypes[p] = arr;
      }
    }
    $scope.disasterTypescategory = cTypes;
  };

  $scope.closePanels = function (){
    for (var param in $stateParams) {
      if ($stateParams[param] === 'open') {
        $stateParams[param] = null;
      }
    }
  };

  $scope.$on('theme-update', function () {
    if ($stateParams.theme == 'disaster' || $stateParams.theme == 'disasterType') {
      $scope.navTab = 'disasterType';
    };
    if ($stateParams.theme == 'project' || $stateParams.theme == 'projectHealth' || $stateParams.theme == 'projectRisk') {
      $scope.navTab = 'sectors';
    };

    //$scope.closePanels(); // close all panels on theme change

    //clear theme filters
    if ($stateParams.filters !== null) {

      // only clear filters when switching from project to disaster; and vice versa
      if(($stateParams.theme.indexOf('disaster')!==-1 && ($stateParams.filters && $stateParams.filters.indexOf("sector__c")!==-1))) {
          delete $stateParams.filters;
          var state = $state.current.name || 'main';
          $state.go(state, $stateParams);
        }

      if($stateParams.theme.indexOf('project')!==-1 && ($stateParams.filters && $stateParams.filters.indexOf("iroc_status__c")!==-1)) {
        delete $stateParams.filters;
        var state = $state.current.name || 'main';
        $state.go(state, $stateParams);

      }
      //else {
      //  //delete $stateParams.filters;
      //  ////$stateParams.filters = null; //clear theme filters
      //  //var state = $state.current.name || 'main';
      //  //$state.go(state, $stateParams);
      //}

    }
  });

  var getBusinessUnitTypes = function () {
    var BusinessUnitTypes = [];

    $scope.businessUnits.forEach(function(val,idx){
      BusinessUnitTypes.push(val);
      BusinessUnitTypes[idx].checked = false;
    });
    $scope.BusinessUnitTypes = BusinessUnitTypes;

    console.log(BusinessUnitTypes);
  };

  var decodeDisasterFiltersURL = function () {
    var str = decodeURIComponent(encodeURIComponent($stateParams.filters));
    var index = [];
    for (var i = 0; i < str.length; i++) {
      if (str[i] === "%") index.push(i);
    }

    var arr = [];
    for (var i = 0; i < index.length; i++) {
      arr.push(str.substring(index[i] + 1, index[i + 1]));
      i = i + 1;
    }

    if ($stateParams.filters !== null && $stateParams.filters !== ""
      && $stateParams.filters !== "null" && typeof $stateParams.filters !== 'undefined'){
      var disasters = $scope.disasterTypes;
      $scope.sectorClause = null;
      var first = true;
      for (var s = 0; s < arr.length; s++) {
        for (var i = 0, len = disasters.length; i < len; ++i) {
          var disaster = disasters[i];
          if (arr[s].indexOf(disaster.name) !== -1) {
            if (first) {
              disaster.checked = true;
              $scope.sectorClause = "disaster_type__c LIKE '%" + disaster.name + "%' ";
              first = false;
            } else {
              disaster.checked = true;
              $scope.sectorClause += "OR disaster_type__c LIKE '%" + disaster.name + "%' ";
            }
          }
        }
      }
    }
  };

  var decodeProjectFiltersURL = function () {
    var str = decodeURIComponent(encodeURIComponent($stateParams.filters));
    var index = [];
    for (var i = 0; i < str.length; i++) {
      if (str[i] === "%") index.push(i);
    }

    var arr = [];
    for (var i = 0; i < index.length; i++) {
      arr.push(str.substring(index[i] + 1, index[i + 1]));
      i = i + 1;
    }

    if ($stateParams.filters !== null && $stateParams.filters !== ""
      && $stateParams.filters !== "null" && typeof $stateParams.filters !== 'undefined'){
      var sectors = $scope.sectors;
      $scope.sectorClause = null;
      var first = true;
      for (var s = 0; s < arr.length; s++) {
        for (var i = 0, len = sectors.length; i < len; ++i) {
          var sector = sectors[i];
          if (arr[s].indexOf(sector.name) !== -1) {
            if (first) {
              sector.checked = true;
              $scope.sectorClause = "sector__c LIKE '%" + sector.name + "%' ";
              first = false;
            } else {
              sector.checked = true;
              $scope.sectorClause = "sector__c LIKE '%" + sector.name + "%' ";
            }
          }
        }
      }
    }
  };

  $scope.$on('filters-update', function () {
    if($stateParams.theme.indexOf('disaster')!==-1) decodeDisasterFiltersURL();
    if($stateParams.theme == 'project') decodeProjectFiltersURL();
  });


  /**
   * Get budget stats from Chubbs - dynamic from PostGIS.
   */
  $http.get(config.chubbsPath('services/custom/custom_operation?name=projecttotalbudget&format=json'), {cache: true}).success(function (data, status) {
    if (data.length > 0) {
      $scope.budget.min = data[0].min;
      $scope.budget.mean = data[0].avg;
      $scope.budget.max = data[0].max;
      $scope.budget.slider = [data[0].min, data[0].max];
    }
  }).error(function () {
    console.error("Unable to fetch Total Budget Min, Mean, Max");
  });

  $scope.dateFilters = [
    {
      name: 'Start Date',
      radio: 'on',
      empty: true,
      opened: false
    }, {
      name: 'End Date',
      radio: 'on',
      empty: true,
      opened: false
    }, {
      name: 'Create Date',
      radio: 'on',
      empty: true,
      opened: false
    }, {
      name: 'Last Modified',
      radio: 'on',
      empty: true,
      opened: false
    }
  ];

  $scope.toggleDate = function ($event, dateFilter) {
    $event.preventDefault();
    $event.stopPropagation();

    dateFilter.opened = !dateFilter.opened;
  };

  $scope.sectorsFilter = function () {
    var sectors = $scope.sectors;
    $scope.sectorClause = null;
    var first = true;
    for (var i = 0, len = sectors.length; i < len; ++i) {
      var sector = sectors[i];
      if (sector.checked) {
        if (first) {
          $scope.sectorClause = "sector__c LIKE '%" + sector.name + "%' ";
          first = false;
        } else {
          $scope.sectorClause += "OR sector__c LIKE '%" + sector.name + "%' ";
        }
      }
    }
    $scope.composeWhereClause();
  };

  $scope.businessUnitsFilter = function () {
    var bunits = $scope.BusinessUnitTypes;
    $scope.businessUnitsClause = null;
    var first = true;
    for (var i = 0, len = bunits.length; i < len; ++i) {
      var bunit = bunits[i];
      if (bunit.checked) {
        if (first) {
          $scope.businessUnitsClause = "business_unit__c LIKE '%" + bunit.label + "%' ";
          first = false;
        } else {
          $scope.businessUnitsClause += "OR business_unit__c LIKE '%" + bunit.label + "%' ";
        }
      }
    }
    $scope.composeWhereClause();
  };


  $scope.disasterTypesFilter = function () {
    var disasters = $scope.disasterTypes;
    $scope.sectorClause = null;
    var first = true;
    for (var i = 0, len = disasters.length; i < len; ++i) {
      var disaster = disasters[i];
      if (disaster.checked) {
        if (first) {
          $scope.sectorClause = "disaster_type__c LIKE '%" + disaster.name + "%' ";
          if($scope.statusClause !== null){
            $scope.sectorClause = $scope.sectorClause + 'AND ' + "(" + $scope.statusClause + ")";
          }
          first = false;
        } else {
          $scope.sectorClause += "OR disaster_type__c LIKE '%" + disaster.name + "%' ";
          if($scope.statusClause !== null){
            $scope.sectorClause = $scope.sectorClause + 'AND ' + $scope.statusClause;
          }
        }
      }
    }
    $scope.composeWhereClause();
  };

  $scope.clearSectorsFilter = function () {
    var sectors = $scope.sectors;
    for (var i = 0, len = sectors.length; i < len; ++i) {
      sectors[i].checked = false;
    }
    $scope.sectorClause = null;
    $scope.composeWhereClause();
  };

  $scope.clearDisasterTypeFilter = function () {
    var disasters = $scope.disasterTypes;
    for (var i = 0, len = disasters.length; i < len; ++i) {
      disasters[i].checked = false;
    }

    for (var i=0;i<$scope.status.length;i++){
      $scope.status[i].checked = false;
    }

    $scope.statusClause = null;
    $scope.sectorClause = null;
    $scope.composeWhereClause();
  };

  $scope.clearDisasterFilter = function () {
    var disasters = $scope.disasterTypes;
    for (var i = 0, len = disasters.length; i < len; ++i) {
      disasters[i].checked = false;
    }
    $scope.sectorClause = null;
    $scope.composeWhereClause();
  };

  $scope.defaultStatus = function() {
    for (var i=0;i<$scope.status.length;i++){
      if($scope.status[i].name !== "Inactive"){
        $scope.status[i].checked = true;
      }
    }
  };

  $scope.statusFilter = function () {
    var status = $scope.status;
    $scope.statusClause = null;
    var first = true;
    for (var i = 0, len = status.length; i < len; ++i) {
      var stat = status[i];
      if (stat.checked) {
        if (first) {
          $scope.statusClause = "iroc_status__c LIKE '%" + stat.name + "%'";
          first = false;
        } else {
          $scope.statusClause += "OR iroc_status__c LIKE '%" + stat.name + "%' ";
        }
      }
    }
    $scope.composeWhereClause();
  };

  $scope.clearStatusFilter = function () {
    var status = $scope.status;
    for (var i = 0, len = status.length; i < len; ++i) {
      status[i].checked = false;
    }
    $scope.statusClause = null;
    $scope.composeWhereClause();
  };


  $scope.dateFilter = function () {
    $scope.dateClause = null;
    var _first = true;
    var first = function () {
      if (_first) {
        _first = false;
        return '';
      }
      return ' AND ';
    };
    var dateFilters = $scope.dateFilters;
    for (var i = 0, len = dateFilters.length; i < len; ++i) {
      var filter = dateFilters[i];

      if (filter.name === 'Start Date' && filter.date) {
        $scope.dateClause = first() + 'start_date__c' + compare(filter) + "'" + dateString(filter.date) + "'";
        continue;
      }

      if (filter.name === 'End Date' && filter.date) {
        $scope.dateClause = first() + 'end_date__c' + compare(filter) + "'" + dateString(filter.date) + "'";
        continue;
      }

      if (filter.name === 'Create Date' && filter.date) {
        $scope.dateClause = first() + 'createdate' + compare(filter) + "'" + dateString(filter.date) + "'";
        continue;
      }

      if (filter.name === 'Last Modified' && filter.date) {
        $scope.dateClause = first() + 'lastmodifieddate' + compare(filter) + "'" + dateString(filter.date) + "'";
      }

    }
    $scope.composeWhereClause();
  };

  $scope.clearDateFilter = function () {
    $scope.dateFilters = [
      {
        name: 'Start Date',
        radio: 'on',
        empty: true,
        opened: false,
        date: null
      }, {
        name: 'End Date',
        radio: 'on',
        empty: true,
        opened: false,
        date: null
      }, {
        name: 'Create Date',
        radio: 'on',
        empty: true,
        opened: false,
        date: null
      }, {
        name: 'Last Modified',
        radio: 'on',
        empty: true,
        opened: false,
        date: null
      }
    ];
    $scope.dateClause = null;
    $scope.composeWhereClause();
  };

  /**
   * Used in dateFilter. Determines the proper SQL comparator to use
   * for filtering a date.
   *
   * @param filter
   */
  function compare(filter) {
    var radio = filter.radio;
    if (radio === 'on') {
      return '=';
    }
    if (radio === 'before') {
      return '<';
    }
    if (radio === 'after') {
      return '>';
    }
  }

  /**
   * Returns date as YYYY-MM-DD
   *
   * @param date
   * @returns {string}
   */
  function dateString(date) {
    return date.toISOString().slice(0, 10);
  }

  $scope.budgetFilter = function () {
    $scope.budgetClause = null;
    var min = $scope.budget.slider[0];
    var max = $scope.budget.slider[1];
    if (min !== 0 && max !== $scope.budget.max) { //both min and max changed
      $scope.budgetClause = 'total_budget__c>=' + min + ' AND total_budget__c<=' + max;
    } else if (min !== 0) { // only min changed
      $scope.budgetClause = 'total_budget__c>=' + min
    } else if (max !== $scope.budget.max) { // only max changed
      $scope.budgetClause = 'total_budget__c<=' + max;
    }
    $scope.composeWhereClause();
  };

  $scope.clearBudgetFilter = function () {
    $scope.budget.slider[0] = $scope.budget.min;
    $scope.budget.slider[1] = $scope.budget.max;
    $scope.budgetClause = null;
    $scope.composeWhereClause();
  };

  $scope.composeWhereClause = function () {
    $scope.whereClause = null;
    var parts = [];
    if($stateParams.theme.indexOf('disaster')!==-1){
      if($scope.sectorClause == null){
        parts = [$scope.sectorClause, $scope.dateClause, $scope.statusClause, $scope.budgetClause];
      }else {
        parts = [$scope.sectorClause, $scope.dateClause, $scope.budgetClause];
      }
    } else {
      parts = [$scope.sectorClause, $scope.dateClause, $scope.statusClause, $scope.budgetClause, $scope.businessUnitsClause];
    }
    var first = true;
    for (var i = 0, len = parts.length; i < len; ++i) {
      var part = parts[i];
      if (part) {
        if (first) {
          $scope.whereClause = part;
          first = false;
        } else {
          $scope.whereClause += 'AND ' + part;
        }
      }
    }
    if (!$scope.whereClause) $scope.whereClause = 'null';
    $scope.submitFilter();
  };

  $scope.submitFilter = function () {

    if($stateParams.theme.indexOf('project')!==-1)$stateParams.filters = $scope.whereClause;
    if($stateParams.theme.indexOf('disaster')!==-1)$stateParams.filters = $scope.whereClause;

    var state = $state.current.name || 'main';
    $state.go(state, $stateParams);
  };

  $scope.clearAllFilters = function () {
    $scope.clearSectorsFilter();
    $scope.clearStatusFilter();
    $scope.clearDateFilter();
    $scope.clearBudgetFilter();
    $scope.clearDisasterTypeFilter();
  };

  // puts the category in URL
  $scope.putCategoryURL = function (categoryName) {
      if ($stateParams.category == categoryName){
        $stateParams.category = null;
        $state.go($state.current.name, $stateParams);
      }else{
        $stateParams.category = categoryName;
        $state.go($state.current.name, $stateParams);
      }
  };

  $scope.handleSearch = function(val){
    var dt = $scope.disasterTypescategory;
    $scope.searchText = val;
    for(var i=0;i<Object.keys(dt).length;i++){
      var arr = dt[Object.keys(dt)[i]];
      for(var z=0;z<arr.length;z++){
        if(arr[z].name.indexOf(val)!==-1){
          $stateParams.category = Object.keys(dt)[i];
          $scope.disasterTypescategory[Object.keys(dt)[i]][z].isSearchActive = true;
        }
      }
    }
    var state = $state.current.name || 'main';
    $state.go(state, $stateParams);
  };

  $scope.highlightLayer = function (val){
    $scope.selected = true;
    $timeout(function(){
      var dt = $scope.disasterTypescategory;
      for(var i=0;i<Object.keys(dt).length;i++){
        var arr = dt[Object.keys(dt)[i]];
        for(var z=0;z<arr.length;z++){
          if(arr[z].name.indexOf(val)!==-1){
            $scope.disasterTypescategory[Object.keys(dt)[i]][z].isSearchActive = false;
          }
        }
      }
      $scope.searchText = '';
      $scope.selected = false;
    },2000);
  };

  $scope.$on('route-update', function() {

    //Set default filter status to Monitoring and Active on page load
    if(($stateParams.filters == null || $stateParams.filters == 'null') && $stateParams.filters !== undefined){
      if($stateParams.theme.indexOf('disaster')!== -1){
        $scope.statusFilter();
      }
    }

  });

  var opacity = "0.5";
  $scope.UNOCHAIconLookup={
    "Meteorological - Tropical Cyclone": {
      icon: "icon-disaster_cyclone",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Floods": {
      icon: "icon-disaster_flood",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Volcano": {
      icon: "icon-disaster_tsunami",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Meteorological - Local Storm": {
      icon: "icon-disaster_flood",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Tsunami": {
      icon: "icon-disaster_tsunami",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Famine / Food Insecurity": {
      icon: "icon-cluster_food_security",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Drought": {
      icon: "icon-disaster_drought",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Hydrological - Floods": {
      icon: "icon-disaster_cyclone",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Meteorological - Tropical Cyclone":{
      icon: "icon-disaster_cyclone",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Food Insecurity": {
      icon: "icon-cluster_food_security",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Civil Unrest": {
      icon: "icon-people_rebel",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Floods, Tropical Storm": {
      icon: "icon-disaster_flood",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Complex Emergency": {
      icon: "icon-crisis_conflict",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Conflict": {
      icon: "icon-crisis_conflict",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Epidemic": {
      icon: "icon-disaster_epidemic",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Population Movement": {
      icon: "icon-crisis_population_displacement",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Climatological - Drought": {
      icon: "icon-disaster_drought",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Winter Storm": {
      icon: "icon-disaster_snowfall",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Tropical Storm": {
      icon: "icon-disaster_heavy_rain",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Earthquake, Tsunami": {
      icon: "icon-disaster_earthquake",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Hydrological - Floods": {
      icon: "icon-disaster_flood",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Hydrological - Landslide": {
      icon: "icon-disaster_landslide",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Earthquake": {
      icon: "icon-disaster_earthquake",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Landslide": {
      icon: "icon-disaster_landslide",
      color: "rgba(255,0,0,"+opacity+")"
    },
    "Avalanche": {
      icon: "icon-disaster_snow_avalanche",
      color: "rgba(255,0,0,"+opacity+")"
    }
  };

});
