/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 3/18/14.
 */

/**
 * All of the layer names need to be lowercase.
 */
angular.module('GeoAngular').service('LayerConfig', function () {

  /**
   * Basemaps
   * @type {string}
   */
  this.osm = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
  this.osmhot = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  this.natgeo = 'http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}';
  this.usgstopo = 'http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}';
  this.esriortho = 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  this.redcross = 'https://{s}.tiles.mapbox.com/v3/americanredcross.hcji22de/{z}/{x}/{y}.png';
  this.pinterest = 'http://{s}.tiles.mapbox.com/v3/pinterest.map-ho21rkos/{z}/{x}/{y}.png';
  this.mapboxaerial = 'http://{s}.tiles.mapbox.com/v3/spatialdev.map-hozgh18d/{z}/{x}/{y}.png';


  /**
   * GeoJSON
   *
   * Note: Specifying the properties extends the properties object of the retrieved GeoJSON.
   * Styling adheres to the Github/Mapbox GeoJSON Styling Spec:
   *
   * https://help.github.com/articles/mapping-geojson-files-on-github
   * https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
   *
   */
  this.phl = {
    type: 'geojson',
    url: 'data/test/phl.geo.json',
    properties: {
      "title": 'The Philippines',
      "stroke": 'white',
      "stroke-width": 2,
      "dash-array": '3',
      "stroke-opacity": 1,
      "fill": "green",
      "fill-opacity": 0.7
    }
  };

  this.projectsbycountry = {
    type: 'geojson',
    url: 'data/test/vw_projects_by_country.geojson'
  };

  /**
   * KML
   */
  this.gdacs = 'http://www.gdacs.org/xml/gdacs.kml';
  this.gdacstest = 'data/test/gdacs.kml';
  this.earthquakes = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week_age.kml';




  /**
   * For layers, we try and get an alias for everything, so if it's a URL that
   * does not match, we just want to return itself so we can fetch that given url.
   *
   * @param name
   * @returns {*}
   */
  this.find = function(name) {
    var val = this[name] || this[name.toLowerCase()];
    if (typeof val !== 'undefined' && val !== null) {
      return val;
    } else {
      if (name.slice(0, 4).toLowerCase() === 'http') {
        return name;
      } else {
        console.error('COULD NOT FIND ALIAS: ' + name);
        return null;
      }
    }
  };

});