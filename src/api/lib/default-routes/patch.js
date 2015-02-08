/**
 * Dependencies
 */
var Route = require('../route');

/***********************************************************************************************************************
 * @class Patch
 * @namespace NOOT.API.DefaultRoutes
 * @extends NOOT.API.Route
 * @constructor
 *
 **********************************************************************************************************************/
var Patch = Route.extend({

  method: 'patch',
  path: '/',

  handler: function(stack) {
    var id = stack.req.param('id');
    if (id) stack.primaryKey = id;
    return id ? this.resource.update(stack) : this.resource.updateMany(stack);
  }

});

/**
 * @exports
 */
module.exports = Patch;