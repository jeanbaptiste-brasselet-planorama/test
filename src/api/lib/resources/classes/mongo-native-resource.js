var NOOT = require('../../../../../index')();

var MongoResource = require('./../lib/mongo-resource');


var MongoNativeResource = MongoResource.extend({

  collection: null,

  init: function() {
    this._super();

    NOOT.require(this, 'collection ');
  }


});


module.exports = MongoNativeResource;

