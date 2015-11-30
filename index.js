/**
 * Copyright (c) 2014 Guillaume de Boyer
 */

var config = require('./package.json'),
    async = require('async');

function GeoJSON() {

  var _this = this;

  this.version = config.verion;

  // Helper functions
  this.geomAttr = '';

  // The one and only public function.
  // Converts an array of objects into a GeoJSON feature collection
  this.parse = function(documents, params, callback) {

    var geojson = { "type": "FeatureCollection", features: [] },
        features = [],
        propFunc,
        _this = this;

    if (arguments.length === 2) {
      if (typeof arguments[1] === 'object') {
        params = params;
      } else if (typeof arguments[1] === 'function') {
        callback = arguments[1];
        params = {};
      }
    }

    if (arguments.length === 3) {
      if (typeof arguments[2] !== 'function') {
        return new Error('Callback is not a Function');
      }
      if (!arguments[0].length) {
        return callback(new Error('Data is not an array'));
      }
    }

    this.geomAttr = params.path || 'geom'; // Reset the geometry fields

    propFunc = getPropFunction(params);

    if (callback) {

      // The asynchronous way;

      async.each(documents, function(doc, next) {

        if (!doc[_this.geomAttr]) return next(new Error('No geometry for document' + doc._id));

        features.push({
          type: "Feature",
          geometry: doc[_this.geomAttr],
          properties: propFunc.call(doc)
        });
        return next();
      }, function(err) {

        geojson.features = features;
        if (callback && typeof callback === 'function') {
          callback(err, geojson);
        } else {
          return geojson;
        }

      });

    } else {

      // The Synchronous way

      documents.forEach(function(doc){
        features.push({
          type: "Feature",
          geometry: doc[_this.geomAttr],
          properties: propFunc.call(doc)
        });
      });

      geojson.features = features;
      return geojson;

    }

  };

  // Returns the function to be used to
  // build the properties object for each feature
  function getPropFunction(params) {

    var func;

    if(!params.exclude && !params.include) {
      func = function(properties) {
        for(var attr in this) {
          if(this.hasOwnProperty(attr) && _this.geomAttr !== attr) {
            properties[attr] = this[attr];
          }
        }
      };
    } else if(params.include) {
      func = function(properties) {
        params.include.forEach(function(attr){
          properties[attr] = this[attr];
        }, this);
      };
    } else if(params.exclude) {
      func = function(properties) {
        for(var attr in this) {
          if(this.hasOwnProperty(attr) && _this.geomAttr !== attr && (params.exclude.indexOf(attr) === -1)) {
            properties[attr] = this[attr];
          }
        }
      };
    }

    return function() {
      var properties = {};

      func.call(this, properties);

      if(params.extra) { this.addExtra(properties, params.extra); }
      return properties;
    };
  }

}

module.exports = new GeoJSON();
