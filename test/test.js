'use strick';

var chai = require('chai'),
    expect = chai.expect,
    GeoJSON = require('../index');

describe('GeoJSON parse', function() {

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

  it('should return a well formated GeoJSON.', function(done) {
    GeoJSON.parse(data, {path:'geom'}, function(err, geojson) {
      if (err) return done(err);
      expect(geojson).to.be.an('object');
      expect(geojson).to.have.property('type').which.equal('FeatureCollection');
      expect(geojson).to.have.property('features').which.is.an('array');
      expect(geojson.features).to.have.length(data.length);
      expect(geojson.features[0]).to.have.property('type').which.equal('Feature');
      expect(geojson.features[0]).to.have.property('geometry').which.is.an('object');
      expect(geojson.features[0]).to.have.property('properties').which.is.an('object');
      expect(geojson.features[0].properties).to.not.have.property('geom');
      return done();
    });
  });


  it('should only include attributes listed in the include parameter', function(done) {
    GeoJSON.parse(data, {path: 'geom', include: ['reference']}, function(err, geojson) {
      if (err) return done(err);
      var prop = geojson.features[0].properties;
      expect(prop).to.have.property('reference');
      expect(prop).to.not.have.property('location');
      return done();
    });
  });

  it('should not include attributes listed in the exclude parameter', function(done) {
    GeoJSON.parse(data, {path: 'geom', exclude: ['reference']}, function(err, geojson) {
      if (err) return done(err);
      var prop = geojson.features[0].properties;
      expect(prop).to.have.property('location');
      expect(prop).to.not.have.property('reference');
      return done();
    });
  });

  it("should return a valid GeoJSON output when path equals 'geom' but is not difined", function(done) {
    GeoJSON.parse(data, function(err, geojson) {
      if (err) return done(err);
      expect(geojson).to.be.an('object');
      expect(geojson).to.have.property('type').which.equal('FeatureCollection');
      expect(geojson).to.have.property('features').which.is.an('array');
      expect(geojson.features).to.have.length(data.length);
      expect(geojson.features[0]).to.have.property('type').which.equal('Feature');
      expect(geojson.features[0]).to.have.property('geometry').which.is.an('object');
      expect(geojson.features[0]).to.have.property('properties').which.is.an('object');
      expect(geojson.features[0].properties).to.not.have.property('geom');
      return done();
    });
  });

  it("returns the GeoJSON output if no callback", function(){
    var output = GeoJSON.parse(data, {path: 'geom'});
    output.features.forEach(function(feature){
      expect(feature).to.have.property('properties');
      expect(feature).to.have.property('geometry');
    });
  });

});
