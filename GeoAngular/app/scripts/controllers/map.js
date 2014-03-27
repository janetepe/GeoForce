/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *     on Mon Mar 17 2014
 */

// global map object used for debugging only
m = {};

angular.module('GeoAngular').controller('MapCtrl', function ($scope, leafletData, Route, Alias, VectorProvider) {

  var routeParams = Route();

  var lastLayersStr = '';
  $scope.blur = ''

  function setParams(routeParams) {
    if (routeParams.landing) {
      console.log('landing');
      $scope.blur = 'blur';
    } else {
      $scope.blur = '';
    }
    var lat = parseFloat(routeParams.lat) || 0;
    var lng = parseFloat(routeParams.lng) || 0;
    var zoom = parseFloat(routeParams.zoom) || 2;
    var layersStr = routeParams.layers;
    var layers = layersStr.split(',') || Alias.redcross;

    // first layer should always be treated as the basemap
    var basemap = Alias.find(layers[0]) || Alias.redcross;
    var overlays = layers.slice(1);

//    $scope.layers = {
//      overlays: {}
//    };

    if (lastLayersStr !== layersStr) {
      console.log('Setting layers.');
      if (Array.isArray(overlays) && overlays.length > 0)
        addOverlays(overlays);

      $scope.defaults = {
        scrollWheelZoom: true
      }
      $scope.tiles = {
        url: basemap
      };
    }

    $scope.center = {
      lat: lat,
      lng: lng,
      zoom: zoom
    };

    lastLayersStr = layersStr;
  }
  setParams(routeParams);


  $scope.$on('route-init', function (event, params) {
    setParams(params);
  });

  $scope.$on('route-update', function (event, params) {
    setParams(params);
  });


  leafletData.getMap().then(function (map) {
    m = map;
    map.on('moveend', function () { // move is good too
      var c = map.getCenter();
      Route({
        lat: c.lat.toFixed(6),
        lng: c.lng.toFixed(6),
        zoom: map.getZoom()
      });
    });
  });


  function addOverlays(overlays) {
    for (var i = 0, len = overlays.length; i < len; ++i) {
      var o = overlays[i];
      var vecRes = VectorProvider.createResource(o);
      vecRes.fetch(function(geojson, name){
        $scope.geojson = {
          data: geojson,
          style: {
            fillColor: "green",
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
          }
        }
      })
    }

    // NH TODO: Put this in VectorProvider
//    leafletData.getMap().then(function (map) {
//      console.log('Adding Overlays...' + JSON.stringify(overlays));
//      for (var i = 0, len = overlays.length; i < len; ++i) {
//        var o = overlays[i];
//
//        // KML
//        if (o.slice(o.length - 3) === 'kml') {
//          addKml(o);
//        }
//
//      }
//
//    });
  }


  // NH TODO: Put this stuff in VectorProvider
  function addKml(url) {
    omnivore.kml(o).on('ready',function (p) {
      // when this is fired, the layer
      // is done being initialized
      console.log('kml ready');
      console.log(p);

    }).on('error',function (e) {
          console.warn('Error loading kml. Trying php proxy...');

          var layer = omnivore.kml('proxy.php?' + o).on('error', function (e) {
            console.error('giving up loading kml...');
          })

          layer.addTo(map);


        }).addTo(map);
  }

});
