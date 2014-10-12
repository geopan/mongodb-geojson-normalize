if (typeof window === 'undefined') {
	var expect = require('expect.js');
	var GeoJSON = require('../index');
}

describe('GeoJSON', function() {

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
			expect(output.features.length).to.be(data.length);
		});

		it('doesn\'t include geometry fields in feature properties', function(){
			var output = GeoJSON.parse(data, {path:'geom'});
			output.features.forEach(function(feature){
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

		it("returns valid GeoJSON output when path equals 'geom' but is not difined", function(){
			var output = GeoJSON.parse(data);
			expect(output.features.length).to.be(data.length);
			output.features.forEach(function(feature){
				expect(feature.properties.reference).to.be.ok();
				expect(feature.properties.location).to.be.ok();
			});
		});


		it("returns valid GeoJSON output when input length is 0", function(done){
			GeoJSON.parse([], {path: 'geom'}, function(geojson){
				expect(geojson.type).to.be('FeatureCollection');
				expect(geojson.features).to.be.an('array');
				expect(geojson.features.length).to.be(0);
				done();
			});
		});


		it("calls the calback function if one is provided", function(done){
			GeoJSON.parse(data, {path: 'geom'}, function(geojson){

				expect(geojson.features.length).to.be(data.length);

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
