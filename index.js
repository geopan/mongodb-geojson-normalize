/**
 * Copyright (c) 2014 Guillaume de Boyer
 */

function GeoJSON() {

	var _this = this;

	this.version = '0.1.2';

	// Helper functions
	this.geomAttr = '';

	// The one and only public function.
	// Converts an array of objects into a GeoJSON feature collection
	this.parse = function(objects, params, callback) {

		var geojson = {"type": "FeatureCollection", "features": []},
				propFunc;

		params = params || {};

		this.geomAttr = params.path || 'geom'; // Reset the geometry fields
		propFunc = getPropFunction(params);

		objects.forEach(function(item){
			geojson.features.push(getFeature(item, propFunc));
		});

		if (callback && typeof callback === 'function') {
			callback(geojson);
		} else {
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

	// Creates a feature object to be added
	// to the GeoJSON features array
	function getFeature(item, propFunc) {
		var feature = { "type": "Feature" };

		feature.geometry = item[_this.geomAttr];
		feature.properties = propFunc.call(item);

		return feature;
	}

}

module.exports = new GeoJSON();
