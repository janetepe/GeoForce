/**
 * This is the entry point of the application. We declare the main module here and then configure the main router
 * that creates corresponding views. The array parameter for module declares this module's dependencies.
 */
var GeoAngular = angular.module('GeoAngular', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.router', 'ngAnimate', 'leaflet-directive']);

GeoAngular.run(function ($rootScope, $state, $stateParams) {

  // It's very handy to add references to $state and $stateParams to the $rootScope
  // so that you can access them from any scope within your applications.For example,
  // <li ui-sref-active="active }"> will set the <li> // to active whenever
  // 'contacts.list' or one of its decendents is active.
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $rootScope.isState = function (stateName) {
    return $state.$current.name === stateName;
  };

  $rootScope.isParam = function(paramName) {
    var bool = $stateParams[paramName];
    if (!bool) {
      return false;
    }
    return true;
  };

  $rootScope.isNotParam = function(paramName) {
    var bool = $stateParams[paramName];
    if (!bool) {
      return true;
    }
    return false;
  };

  $rootScope.toggleParam = function(paramName) {
    var bool = $stateParams[paramName];
    if (!bool) {
      $stateParams[paramName] = 'true';
    } else {
      delete $stateParams[paramName];
    }
    var state = $state.current.name || 'main';
    $state.go(state, $stateParams);
  };

  $rootScope.isNotState = function (stateName) {
    return $state.$current.name !== stateName;
  };

  window.$state = $state;
  window.$stateParams = $stateParams;

});

GeoAngular.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider
    .when('/landing', '/map@35.029996,-89.340820,4(redcross,smartgadm)/landing')
    .when('/main', '/map@35.029996,-89.340820,4(redcross,smartgadm)')
    .when('/phl', '/map@11.759815,121.893311,6(redcross,phl)')
    .otherwise('/map@0,0,2(pinterest)/landing');

  $stateProvider
    .state('main', {
      url: '/map@:lat,:lng,:zoom(*layers)?title&zoom-extent&stories',
      views: {
        'details': {
          template: 'in main state',
          controller: 'MainCtrl'
        }
      }
    })
    .state('landing', {
      url: '/map@:lat,:lng,:zoom(*layers)/landing?title&zoom-extent&stories',
      views: {
        'details': {
          template: 'in landing state',
          controller: 'MainCtrl'
        },
        'landing': {
          templateUrl: 'views/landing.html',
          controller: 'LandingCtrl'
        }
      }
    })
    .state('layers', {
      url: '/map@:lat,:lng,:zoom(*layers)/layers',
      views: {
        'details': {
          template: 'in layers state',
          controller: 'MainCtrl'
        },
        'landing': {
          templateUrl: 'views/layers.html',
          controller: 'LayersCtrl'
        }
      }
    })
    .state('filters', {
      url: '/map@:lat,:lng,:zoom(*layers)/filters',
      views: {
        'details': {
          template: 'in filters state',
          controller: 'MainCtrl'
        },
        'landing': {
          templateUrl: 'views/filters.html',
          controller: 'FiltersCtrl'
        }
      }
    })
    .state('legend', {
      url: '/map@:lat,:lng,:zoom(*layers)/legend',
      views: {
        'details': {
          template: 'in legend state',
          controller: 'MainCtrl'
        },
        'landing': {
          templateUrl: 'views/legend.html',
          controller: 'LegendCtrl'
        }
      }
    })
    .state('info', {
      url: '/map@:lat,:lng,:zoom(*layers)/info',
      views: {
        'details': {
          template: 'in info state',
          controller: 'MainCtrl'
        },
        'landing': {
          templateUrl: 'views/info.html',
          controller: 'InfoCtrl'
        }
      }
    })
    .state('basemaps', {
      url: '/map@:lat,:lng,:zoom(*layers)/basemaps',
      views: {
        'details': {
          template: 'in basemaps state',
          controller: 'MainCtrl'
        },
        'landing': {
          templateUrl: 'views/basemaps.html',
          controller: 'BasemapsCtrl'
        }
      }
    })


});
