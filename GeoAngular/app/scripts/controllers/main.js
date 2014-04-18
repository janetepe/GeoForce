angular.module('GeoAngular').controller('MainCtrl', function($scope, $rootScope, $state, $stateParams) {
  console.log('MainCtrl');

  localStorage.setItem('defaultRoute', '/map@0,0,2(pinterest)');

  // NH TODO: See if this is also the case with ui-router?
  // weird bug where redirect peels out '://{s' when ':' is there
  // $routeParams.layers We just dont have the : in main.js so that
  // part of the path does not go away...
  $stateParams.layers = $stateParams.layers.replace('http//', 'http://');

  $rootScope.$broadcast('route-update');

});
