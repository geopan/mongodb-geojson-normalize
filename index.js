/**
 * Copyright (c) 2014 Guillaume de Boyer
 */


/*
 * Good Good
 *
function MyObject(bar) {
  this.bar = bar;
}

MyObject.prototype.foo = function foo() {
  console.log(this.bar);
};

module.exports = MyObject;

// In another module:
var MyObjectOrSomeCleverName = require("./my_object.js");
var my_obj_instance = new MyObjectOrSomeCleverName("foobar");
my_obj_instance.foo(); // => "foobar"

 */

function GeoJSON(options) {

	this.version = '0.1.0';

	// Allow user to specify default parameters
	this.defaults = options || {};

	// Helper functions
	this.geoms = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'];
	this.geomAttrs = [];

}

// The one and only public function.
// Converts an array of objects into a GeoJSON feature collection
GeoJSON.prototype.parse = function(objects, params, callback) {

	var geojson = {"type": "FeatureCollection", "features": []},
			settings = this.applyDefaults(params, this.defaults),
			propFunc;

	this.geomAttrs.length = 0; // Reset the list of geometry fields
	this.setGeom(settings);
	propFunc = this.getPropFunction(settings);

	objects.forEach(function(item){
		geojson.features.push(this.getFeature(item, settings, propFunc));
	});

	this.addOptionals(geojson, settings);

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

// Moves the user-specified geometry parameters
// under the `geom` key in param for easier access
GeoJSON.prototype.setGeom = function(params) {
	params.geom = {};

	for(var param in params) {
		if(params.hasOwnProperty(param) && this.geoms.indexOf(param) !== -1){
			params.geom[param] = params[param];
			delete params[param];
		}
	}

	this.setGeomAttrList(params.geom);
};

// Assembles the `geometry` property
// for the feature output
GeoJSON.prototype.getGeom = function(item, params) {
	var geom = {},
			attr;

	for(var gtype in params.geom) {
		attr = (typeof params.geom[gtype] === 'object') ? params.geom[gtype][0] : params.geom[gtype];
		if(params.geom.hasOwnProperty(gtype) && item[attr]) {
			geom.type = gtype;

			if(typeof params.geom[gtype] === 'string') {
				geom.coordinates = item[params.geom[gtype]];
			} else {
				geom.coordinates = [item[params.geom[gtype][1]], item[params.geom[gtype][0]]];
			}
		}
	}

	return geom;
};

// Creates a feature object to be added
// to the GeoJSON features array
GeoJSON.prototype.getFeature = function(item, params, propFunc) {
	var feature = { "type": "Feature" };

	feature.geometry = this.getGeom(item, params);
	feature.properties = propFunc.call(item);

	return feature;
};

// Returns the function to be used to
// build the properties object for each feature
GeoJSON.prototype.getPropFunction = function(params) {
	var func;

	if(!params.exclude && !params.include) {
		func = function(properties) {
			for(var attr in this) {
				if(this.hasOwnProperty(attr) && (this.geomAttrs.indexOf(attr) === -1)) {
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
				if(this.hasOwnProperty(attr) && (this.geomAttrs.indexOf(attr) === -1) && (params.exclude.indexOf(attr) === -1)) {
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

// Adds the optional GeoJSON properties crs and bbox
// if they have been specified
GeoJSON.prototype.addOptionals = function(geojson, settings){
	if(settings.crs) {
		geojson.crs = {
			type: "name",
			properties: {
				name: settings.crs
			}
		};
	}
	if (settings.bbox) {
		geojson.bbox = settings.bbox;
	}
	if (settings.extraGlobal) {
		geojson.properties = {};
		for (var key in settings.extraGlobal) {
			geojson.properties[key] = settings.extraGlobal[key];
		}
	}
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


module.exports = GeoJSON;
