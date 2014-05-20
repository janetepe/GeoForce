/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 4/7/14.
 */

(function () {
  'use strict';

  L.spatialdev.featurelabel.FeatureSet = function () {
    this.features = [];
    this._pathIdHash = {};
    L.spatialdev.featurelabel.featureSets.push(this);
  };

  L.spatialdev.featurelabel.FeatureSet.prototype.addFeature = function (featureLayer, geojsonLayer) {
    featureLayer.geojsonLayer = geojsonLayer;
    if (!featureLayer._leaflet_id) {
      L.stamp(featureLayer);
    }
    this.features.push(featureLayer);

    // feature consists of one polygon
    if (!featureLayer._layers) {
      var leafletId = featureLayer._leaflet_id;
      this._pathIdHash[leafletId] = featureLayer;
    }

    // feature consists of several polygons
    else {
      for (var id in featureLayer._layers) {
        var pathLayer = featureLayer._layers[id];
        var leafletId = pathLayer._leaflet_id;
        this._pathIdHash[leafletId] = featureLayer;
      }
    }

    pathUpdated(featureLayer);
  };

  L.spatialdev.featurelabel.FeatureSet.prototype._pathUpdated = function (leafletId) {
    var featureLayer = this._pathIdHash[leafletId];
    // the hash doesn't always catch the id if the graphic has not yet been rendered.
    if (!featureLayer) {
      var features = this.features;
      for (var key in features) {
        var feat = this.features[key];
        if (feat._leaflet_id === leafletId) {
          featureLayer = feat;
          break;
        }
      }
    }
    pathUpdated(featureLayer);
  };

  function pathUpdated(featureLayer) {
    // If the id doesnt hash, no path for the features in are feature set apply.
    if (!featureLayer) {
      console.error('pathUpdated featureLayer empty');
      return;
    }

    if (featureLayer._layers) {

      // only calculate center after all of the polygons have been updated
      if (!featureLayer.pathsUpdated) featureLayer.pathsUpdated = 0;
      ++featureLayer.pathsUpdated;

      if (featureLayer.pathsUpdated === Object.keys(featureLayer._layers).length) {
        var l = findMostComplexLayer(featureLayer._layers);

        if (l) {
          featureLayer.labelCenterPoint = calculateCenter(l._parts);
          updateLabel(featureLayer);
        }

        featureLayer.pathsUpdated = 0;
      }

      return;
    }

    // there is only one polygon, so calculate center. also check to see if there are parts
    if ( featureLayer._parts && featureLayer._parts.length ) {
      featureLayer.labelCenterPoint = calculateCenter(featureLayer._parts);
      updateLabel(featureLayer);

      return;
    }

//    // no paths for the feature are on the screen anymore
//    if ( featureLayer.geojsonLayer && featureLayer.label) {
//      console.log("REMOVING: " + featureLayer.feature.properties.name);
//      featureLayer.geojsonLayer.removeLayer(featureLayer.label);
//      featureLayer.label = null;
//      return;
//    }
//
//    if ( featureLayer.geojsonLayer && featureLayer.geojsonLayer.label) {
//      console.log("REMOVING: " + featureLayer.feature.properties.name);
//      featureLayer.geojsonLayer.removeLayer(featureLayer.geojsonLayer.label);
//      featureLayer.geojsonLayer.label = null;
//    }


  }


  var selectedFeatureLayer = null;

  function createLabel(featureLayer) {
    var point = featureLayer.labelCenterPoint;

    var properties = featureLayer.feature.properties;
    var text = properties.title || properties.name || 'Label';
    if (properties.labelProperty) {
      if (typeof properties.labelProperty === 'function') {
        text = properties.labelProperty();
      } else {
        text = properties[properties.labelProperty];
      }

    }

    console.log('LABEL: ' + text + ' (' + point.x + ', ' + point.y + ') ' + properties.name);

    var icon = L.divIcon({
      className: $.isNumeric(text) ? 'btn btn-danger featurelabel-icon-number' : 'featurelabel-icon',
      iconSize: [60,60],
      html: text
    });

    var label = L.label(point, {icon:icon});
    label.featureLayer = featureLayer;

    label.on('mouseover', function(e) {
      // self is the label
      var self = this;
      if (self.featureLayer !== selectedFeatureLayer) {
        // yellow EAED6B
        self.featureLayer.setStyle({
          color: '#EAED6B'
        });
        self.featureLayer.bringToFront();
      }
    });

    label.on('mouseout', function(e) {
      // self is the label
      var self = this;
      if (self.featureLayer !== selectedFeatureLayer) {
        self.featureLayer.setStyle({
          color: properties.color || 'white'
        });
        if (selectedFeatureLayer) {
          selectedFeatureLayer.bringToFront();
        } else {
          self.featureLayer.bringToFront();
        }
      }
    });

    label.on('click', function (e) {
      // self is the label
      var self = this;

      // TURN OFF
      if (self.featureLayer === selectedFeatureLayer) {
        self.featureLayer.setStyle({
          color: properties.color || 'white'
        });
        featureLayer.bringToFront();
        selectedFeatureLayer = null;
        if (properties && properties.onDeselect && typeof properties.onDeselect === 'function') {
          properties.onDeselect(self.featureLayer);
        }
      }

      // TURN ON
      else {
        if (selectedFeatureLayer) {
          selectedFeatureLayer.setStyle({
            color: properties.color || 'white'
          });
          selectedFeatureLayer.bringToFront();
          selectedFeatureLayer = null;
        }
        // red cross red #ed1b2e
        self.featureLayer.setStyle({
          color: '#d9534f' // red
        });
        self.featureLayer.bringToFront();
        selectedFeatureLayer = self.featureLayer;
        if (properties && properties.onSelect && typeof properties.onSelect === 'function') {
          properties.onSelect(self.featureLayer);
        }
      }

    });


    if (!featureLayer.addLayer) {
      featureLayer.geojsonLayer.addLayer(label);
    } else {
      featureLayer.addLayer(label);
    }

    L.spatialdev.featurelabel.labels[featureLayer.feature.properties.guid] = label;
    return label;
  }


  function updateLabel(featureLayer) {
    if ( ! featureLayer.label ) {
      featureLayer.label = createLabel(featureLayer);
    } else {
      featureLayer.label.update(featureLayer.labelCenterPoint);
    }
  }


  function calculateCenter(parts) {

    var part = findMostComplexPart(parts);
    var center = centroid(part);

    return center.round();
  }


//  http://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon

  function area(partArr) {
    var area = 0;
    var len = partArr.length;
    for (var i = 0, j = len - 1; i < len; j=i, i++) {
      var p1 = partArr[j];
      var p2 = partArr[i];

      area += p1.x * p2.y - p2.x * p1.y;
    }

    return area / 2;
  }

  function centroid(partArr) {
    var len = partArr.length;
    var x = 0;
    var y = 0;
    for (var i = 0, j = len - 1; i < len; j=i, i++) {
      var p1 = partArr[j];
      var p2 = partArr[i];
      var f = p1.x * p2.y - p2.x * p1.y;
      x += (p1.x + p2.x) * f;
      y += (p1.y + p2.y) * f;
    }
    f = area(partArr) * 6;
    return L.point(x/f, y/f);

  }

  /**
   * NH TODO: Calculate the layer with the most area rather than the most paths.
   * @param layers
   * @returns {*}
   */
  function findMostComplexLayer(layers) {
    var complexLayer = null;
    var numPoints = 0;

    for (var id in layers) {
      var l = layers[id];
      var parts = l._parts;
      var pointsLen = 0;
      if (!parts) {
        continue;
      }
      for (var i = 0, len = parts.length; i < len; ++i) {
        pointsLen += parts[i].length;
      }
      if (pointsLen > numPoints) {
        numPoints = pointsLen;
        complexLayer = l;
      }
    }

    return complexLayer;
  }

  function findMostComplexPart(parts) {
    var complexPart = parts[0];
    var maxLen = 0;

    for (var i = 0, len = parts.length; i < len; ++i) {
      var length = parts[i].length;
      if (length > maxLen) {
        maxLen = length;
        complexPart = parts[i];
      }
    }

    return complexPart;
  }

}());
