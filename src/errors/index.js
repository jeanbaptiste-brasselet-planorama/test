/**
 * Dependencies
 */
var NOOT = require('../../')('namespace', 'error', 'http');
var mongoose = require('mongoose');

var ValidationError = mongoose.Error.ValidationError;
var CastError = mongoose.Error.CastError;

/***********************************************************************************************************************
 * @class Errors
 * @static
 * @namespace NOOT
 **********************************************************************************************************************/
var Errors = NOOT.Namespace.create({

  /**
   * @property InternalServerError
   * @static
   * @type Class
   */
  InternalServerError: NOOT.Error.extend({ name: 'InternalServerError', statusCode: NOOT.HTTP.InternalServerError }),

  /**
   * @property NotImplemented
   * @static
   * @type Class
   */
  NotImplemented: NOOT.Error.extend({ name: 'NotImplementedError', statusCode: NOOT.HTTP.NotImplemented }),

  /**
   * @property Unavailable
   * @static
   * @type Class
   */
  Unavailable: NOOT.Error.extend({ name: 'UnavailableError', statusCode: NOOT.HTTP.ServiceUnavailable }),

  /**
   * @property BadRequest
   * @static
   * @type Class
   */
  BadRequest: NOOT.Error.extend({ name: 'BadRequestError', statusCode: NOOT.HTTP.BadRequest }),

  /**
   * @property Unauthorized
   * @static
   * @type Class
   */
  Unauthorized: NOOT.Error.extend({ name: 'UnauthorizedError', statusCode: NOOT.HTTP.Unauthorized }),

  /**
   * @property Forbidden
   * @static
   * @type Class
   */
  Forbidden: NOOT.Error.extend({ name: 'ForbiddenError', statusCode: NOOT.HTTP.Forbidden }),

  /**
   * @property NotFound
   * @static
   * @type Class
   */
  NotFound: NOOT.Error.extend({ name: 'NotFoundError', statusCode: NOOT.HTTP.NotFound }),

  /**
   * @property Conflict
   * @static
   * @type Class
   */
  Conflict: NOOT.Error.extend({ name: 'ConflictError', statusCode: NOOT.HTTP.Conflict }),


  fromMongoose: function(err) {
    if (err instanceof ValidationError || err instanceof CastError) return new this.BadRequest(err.toString());
    else if (err.code === 11000) return new this.Conflict(err.message);
    return new this.InternalServerError(err.message);
  }

});


/**
 * @exports
 */
module.exports = Errors;