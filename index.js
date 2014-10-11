/**
 * Copyright (c) 2014 Guillaume de Boyer
 */

function GeoJSON() {

	this.version = '0.1.0';

	// Allow user to specify default parameters
	this.defaults = {};

	// Helper functions
	this.geomAttr = '';

}

// The one and only public function.
// Converts an array of objects into a GeoJSON feature collection
GeoJSON.prototype.parse = function(objects, params, callback) {

	var geojson = {"type": "FeatureCollection", "features": []},
			_this = this,
			propFunc;

	this.geomAttr = params.path || 'geom'; // Reset the geometry fields
	propFunc = this.getPropFunction(params);

	objects.forEach(function(item){
		geojson.features.push(_this.getFeature(item, propFunc));
	});

	if (callback && typeof callback === 'function') {
		callback(geojson);
	} else {
		return geojson;
	}
};

// Adds default settings to user-specified params
// Does not overwrite any settings--only adds defaults
// the the user did not specify
GeoJSON.prototype.applyDefaults = function(params, defaults) {
	var settings = params || {};

	for(var setting in defaults) {
		if(defaults.hasOwnProperty(setting) && !settings[setting]) {
			settings[setting] = defaults[setting];
		}
	}

	return settings;
};



// Creates a feature object to be added
// to the GeoJSON features array
GeoJSON.prototype.getFeature = function(item, propFunc) {
	var feature = { "type": "Feature" };

	feature.geometry = item[this.geomAttr];
	feature.properties = propFunc.call(item);

	return feature;
};

// Returns the function to be used to
// build the properties object for each feature
GeoJSON.prototype.getPropFunction = function(params) {

	var func, _this = this;

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
};


// Adds data contained in the `extra`
// parameter if it has been specified
GeoJSON.prototype.addExtra = function(properties, extra) {
	for(var key in extra){
		if(extra.hasOwnProperty(key)) {
			properties[key] = extra[key];
		}
	}

	return properties;
};


module.exports = new GeoJSON();
