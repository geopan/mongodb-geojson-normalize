if (typeof window === 'undefined') {
	var expect = require('expect.js');
	var GeoJSON = require('../index');
}

describe('GeoJSON', function() {

	describe('#defaults', function(){
		it('exists as a public object of GeoJSON', function(){
			expect(typeof GeoJSON.defaults).to.eql('object');
		});

		it('is initially empty', function() {
			var count = 0;
			for(var key in GeoJSON.defaults) {
				if(GeoJSON.defaults.hasOwnProperty(key)) {
					count++;
				}
			}

			expect(count).to.be(0);
		});
	});

	describe('#parse', function(){
		var data;

		before(function() {
			// Sample Data
			data = [
				{ "reference" : "RKJ092", "location" : "George St",
				 "geom" : { "coordinates" : [ 151.20340999, -33.88516821 ], "type" : "Point" } },
				{ "reference" : "GHT078", "location" : "Market Pl",
				 "geom" : { "coordinates" : [ 151.20344137, -33.88509032 ], "type" : "Point" }	}
			];
		});

		it('returns output with the same number of features as the input', function(){
			var output = GeoJSON.parse(data, {path:'geom'});
			expect(output.features.length).to.be(3);
		});

		it('doesn\'t include geometry fields in feature properties', function(){
			var output = GeoJSON.parse(data, {path:'geom'});
			output.features.forEach(function(feature){
				console.log(feature.geometry);
				expect(feature.properties.geom).to.not.be.ok();
				expect(feature.geometry.coordinates[0]).to.be.ok();
				expect(feature.geometry.coordinates[1]).to.be.ok();
			});
		});

		it('includes all properties besides geometry attributes when include or exclude isn\'t set', function() {
			var output = GeoJSON.parse(data, {path: 'geom'});

			output.features.forEach(function(feature){

				expect(feature.properties.reference).to.be.ok();
				expect(feature.properties.location).to.be.ok();
			});
		});

		it('only includes attributes that are listed in the include parameter', function(){
			var output = GeoJSON.parse(data, {path: 'geom', include: ['reference']});

			output.features.forEach(function(feature){
				expect(feature.properties.reference).to.be.ok();
				expect(feature.properties.location).to.not.be.ok();
			});
		});


		it('does not include attributes listed in the exclude parameter', function(){
			var output = GeoJSON.parse(data, {path: 'geom', exclude: ['location']});

			output.features.forEach(function(feature){
				expect(feature.properties.reference).to.be.ok();
				expect(feature.properties.location).to.not.be.ok();
			});
		});

		it('uses the default settings when they have been specified', function(){
			GeoJSON.defaults = {
				Point: ['lat', 'lng'],
				include: ['name'],
				crs: 'urn:ogc:def:crs:EPSG::4326'
			};

			var output = GeoJSON.parse(data, {});

			expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');

			output.features.forEach(function(feature){
				expect(feature.properties.name).to.be.ok();
				expect(feature.properties.lat).to.not.be.ok();
				expect(feature.properties.lng).to.not.be.ok();
				expect(feature.geometry.coordinates[0]).to.be.ok();
				expect(feature.geometry.coordinates[1]).to.be.ok();
			});

			it('only applies default settings that haven\'t been set in params', function(){
				var output = GeoJSON.parse(data, {include: ['category', 'street']});

				expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');

				output.features.forEach(function(feature){
					expect(feature.properties.name).to.not.be.ok();
					expect(feature.properties.category).to.be.ok();
					expect(feature.properties.street).to.be.ok();
				});
			});

			it('keeps the default settings until they have been explicity reset', function(){
				var output = GeoJSON.parse(data, {});

				expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');

				output.features.forEach(function(feature){
					expect(feature.properties.name).to.be.ok();
					expect(feature.properties.lat).to.not.be.ok();
					expect(feature.properties.lng).to.not.be.ok();
					expect(feature.geometry.coordinates[0]).to.be.ok();
					expect(feature.geometry.coordinates[1]).to.be.ok();
				});
			});

			GeoJSON.defaults = {};
		});

		it("adds 'bbox' and/or 'crs' to the output if either is specified in the parameters", function(){
			var output = GeoJSON.parse(data, {
				Point: ['lat', 'lng'],
				bbox: [-75, 39, -76, 40],
				crs: 'urn:ogc:def:crs:EPSG::4326'});

			expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');
			expect(output.bbox[0]).to.be(-75);
			expect(output.bbox[1]).to.be(39);
			expect(output.bbox[2]).to.be(-76);
			expect(output.bbox[3]).to.be(40);
		});

		it("adds extra attributes if extra param is set", function() {
			var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], extra: { 'foo':'bar', 'bar':'foo'}});

			output.features.forEach(function(feature){
				expect(feature.properties.foo).to.be('bar');
				expect(feature.properties.bar).to.be('foo');
			});

			var output2 = GeoJSON.parse(data, {
				Point: ['lat', 'lng'],
				extra: {
					style: {
						"color": "#ff7800",
						"weight": 5,
						"opacity": 0.65
					}
				}
			});

			output2.features.forEach(function(feature) {
				expect(feature.properties.style.color).to.be('#ff7800');
				expect(feature.properties.style.weight).to.be(5);
				expect(feature.properties.style.opacity).to.be(0.65);
			});
		});

		it("adds a properties key at the top level if the extraGlobal parameter is set", function() {
			var output = GeoJSON.parse(data, {
				Point: ['lat', 'lng'],
				extra: { 'foo':'bar', 'bar':'foo'},
				extraGlobal: { 'name': 'A bunch of points', 'source': 'Government website'}
			});

			expect(output.properties).to.be.ok();
			expect(output.properties.name).to.be('A bunch of points');
			expect(output.properties.source).to.be('Government website');

		});

		it("returns valid GeoJSON output when input length is 0", function(done){
			GeoJSON.parse([], {Point: ['lat', 'lng']}, function(geojson){
				expect(geojson.type).to.be('FeatureCollection');
				expect(geojson.features).to.be.an('array');
				expect(geojson.features.length).to.be(0);
				done();
			});
		});

		it("throws an error if no geometry attributes have been specified", function() {
			expect(function(){ GeoJSON.parse(data); }).to.throwException(/No geometry attributes specified/);
		});

		it("calls the calback function if one is provided", function(done){
			GeoJSON.parse(data, {path: 'geom'}, function(geojson){
				expect(geojson.features.length).to.be(3);

				geojson.features.forEach(function(feature){
					expect(feature.properties.lat).to.not.be.ok();
					expect(feature.properties.lng).to.not.be.ok();
					expect(feature.geometry.coordinates[0]).to.be.ok();
					expect(feature.geometry.coordinates[1]).to.be.ok();
				});

				done();
			});
		});

		it("returns the GeoJSON output if the callback parameter is not a function", function(){
			var output = GeoJSON.parse(data, {path: 'geom'}, 'foo');

			output.features.forEach(function(feature){
				expect(feature.properties.lat).to.not.be.ok();
				expect(feature.properties.lng).to.not.be.ok();
				expect(feature.geometry.coordinates[0]).to.be.ok();
				expect(feature.geometry.coordinates[1]).to.be.ok();
			});
		});

	});
});
