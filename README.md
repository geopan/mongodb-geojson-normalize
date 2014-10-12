mongodb-geojson-normalize
=========================

[GeoJSON](http://geojson.org/) normalization for mongoDB. Convert an array of [documents](http://docs.mongodb.org/manual/core/document/) with geospatial information ([2dsphere](http://docs.mongodb.org/manual/applications/geospatial-indexes/)  only) into a GeoJSON feature collection.

## Installation

For node, use npm: `$ npm install mongodb-geojson-normalize`

## Getting Started

In node, `var GeoJSON = require('mongodb-geojson-normalize');`

## Example Usage

The library has one method, parse, which takes an array of objects with geometry data as the first parameter, an object consisting of settings for the second parameter, and an optional callback function as the third parameter. If a callback is not specified, the parse function returns the GeoJSON output.

Take the example data below:

```javascript
var data = [
{ "reference" : "RKJ092", "location" : "George St",
"geom" : { "coordinates" : [ 151.2034, -33.8851 ], "type" : "Point" } }, 
{ "reference" : "GHT078", "location" : "Market Pl",
"geom" : { "coordinates" : [ 151.2034, -33.8850 ], "type" : "Point" }	}
];
```

Convert it to GeoJSON:

```javascript
var output = GeoJSON.parse(data, {path:'geom'});

  { 
    "type": "FeatureCollection",
    "features": [
      { 
				"type": "Feature",
				"geometry": { 
					"coordinates" : [ 151.2034, -33.8851 ], 
					"type" : "Point" 
				},
				"properties": {
					"reference" : "RKJ092", 
					"location" : "George St"
				}
			}, { 
				"type": "Feature",
				"geometry": { 
					"coordinates" : [ 151.2034, -33.8850 ]
					"type" : "Point" 
				},
				"properties": {
					"reference" : "GHT078", 
					"location" : "Market Pl"
				}
			}
		]
	}

```

Convert the example data to GeoJSON, and only include the reference attribute in properties for each feature.

```javascript
var ouput = GeoJSON.parse(data, {path: 'geom', include: ['reference']});

{ 
    "type": "FeatureCollection",
    "features": [
      { 
				"type": "Feature",
				"geometry": { 
					"coordinates" : [ 151.2034, -33.8851 ], 
					"type" : "Point" 
				},
				"properties": {
					"reference" : "RKJ092"
				}
			}, { 
				"type": "Feature",
				"geometry": { 
					"coordinates" : [ 151.2034, -33.8850 ]
					"type" : "Point" 
				},
				"properties": {
					"reference" : "GHT078"
				}
			}
		]
	}
```

You can specify a callback function as an option third parameter.

```javascript
GeoJSON.parse(data, {path: 'geom'}, function(geojson) {
	console.log(geojson);
});
```

## Parameters

#### Geometry

Default value: geom

The `path` parameter specifies which attribute contains the geometric data (where the 2dsphere is).

#### include/exclude

Depending on which makes more sense for the data that is being parsed, either specify an array of attributes to include or exclude in `properties` for each feature. If neither `include` nor `exclude` is set, all the attributes (besides the attributes containing the geometry data) will be added to feature `properties`.

- `include` - Array of attributes to include in `properties` for each feature. All other fields will be ignored.
- `exclude` - Array of attributes that shouldn't be included in feature `properties`. All other attributes will be added (besides geometry attributes)

## License

Licensed under the MIT License.

Copyright (c) 2014 Guillaume de Boyer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


