/**
 * Dependencies
 */
var NOOT = require('../../../')('object', 'url', 'http', 'errors');
var _ = require('lodash');
var moment = require('moment');

var Stack = require('./stack');
var Authable = require('./mixins/authable');
var Queryable = require('./mixins/queryable');

/***********************************************************************************************************************
 * @class Route
 * @namespace NOOT.API
 * @extends NOOT.Object
 * @constructor
 **********************************************************************************************************************/
var Route = NOOT.Object.extend(Authable).extend(Queryable).extend({

  /**
   * @property method
   * @type String
   * @default get
   */
  method: 'get',

  /**
   * @property path
   * @type String
   */
  path: '',

  /**
   * @property resource
   * @type NOOT.API.Resource
   */
  resource: null,

  /**
   * @property schema
   * @type Object
   */
  schema: null,

  /**
   * @property handlers
   * @type Array of middlewares
   * @default []
   */
  handlers: null,

  /**
   * @property handler
   * @type middleware
   */
  handler: null,

  /**
   * Define if route concerns only one item, in which case an `:id` parameter will be added to the route's path
   *
   * @property isDetail
   * @type Boolean
   * @default false
   */
  isDetail: false,

  /**
   * Is this route a "writable" one ? `true` is route's method is "put", "patch" or "post".
   *
   * @property isWritable
   * @type Boolean
   * @readOnly
   */
  get isWritable() { return _.contains(['put', 'patch', 'post'], this.method); },

  /**
   * Constructor
   */
  init: function() {
    NOOT.defaults(this, Route.DEFAULTS);
    NOOT.required(this, 'path', 'resource');
    this.method = this.method.toLowerCase();
    this.computeQueryable();
    this._buildPath();
    this._buildHandlers();
  },

  /**
   * Define routes's handlers array.
   *
   * @method _buildHandlers
   * @return {Array}
   * @private
   */
  _buildHandlers: function() {
    var self = this;
    var handlers;

    if (this.handlers) {
      if (this.handler) throw new Error('Cannot provide both `handler` and `handlers`');
      handlers = NOOT.makeArray(this.handlers);
    } else {
      handlers = [];
      if (this.handler) handlers.push(this.handler);
    }

    var pre = _.compact([
      this.createStack.bind(this),

      this.resource.api.authentication && this.resource.api.authentication.bind(this.resource.api),
      this.resource.authentication && this.resource.authentication.bind(this.resource),
      this.authentication && this.authentication.bind(this),

      this.resource.api.authorization && this.resource.api.authorization.bind(this.resource.api),
      this.resource.authorization && this.resource.authorization.bind(this.resource),
      this.authorization && this.authorization.bind(this),

      this.setupStack && this.setupStack.bind(this),
      this._parseQueryString.bind(this),

      this.resource.parseQueryFilter && this.resource.parseQueryFilter.bind(this.resource),
      this.resource.parseQuerySelect && this.resource.parseQuerySelect.bind(this.resource),
      this.resource.parseQuerySort && this.resource.parseQuerySort.bind(this.resource),
      this.isWritable && this.resource.parseQueryBody && this.resource.parseQueryBody.bind(this.resource),

      this.schema && this._validateSchema.bind(this),
      this.validation && this.validation.bind(this)
    ]);

    var post = _.compact([
      this.resource.formatResponsePackage && this.resource.formatResponsePackage.bind(this.resource),
      this.resource.sendResponse && this.resource.sendResponse.bind(this.resource)
    ]);

    handlers = handlers.map(function(handler) { return handler.bind(self); });

    handlers = pre.concat(handlers).concat(post).map(function(handler) {
      if (handler.length > 2) return handler;
      return function(req, res, next) {
        var stack = req.noot.stack;
        stack.next = next;
        return handler(stack);
      };
    });

    NOOT.makeReadOnly(this, 'handlers', handlers);
  },

  /**
   * Safely build route's path for it to include its resource path.
   *
   * @method _buildPath
   * @private
   */
  _buildPath: function() {
    var args = [
      '/',
      this.resource.api.name,
      this.resource.path,
      this.isDetail ? ':id' : '',
      this.path
    ];

    NOOT.makeReadOnly(this, 'path', NOOT.Url.join.apply(NOOT.Url, args).replace(/\/$/, ''));
  },

  /**
   * Middleware. In charge of creating a new instance of NOOT.API.Stack and attach it to `req.nootApiStack`.
   *
   * @method createStack
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   */
  createStack: function(req, res, next) {
    req.noot = {
      stack: this.constructor.Stack.create({
        req: req,
        res: res,
        startedOn: moment(),
        __queryableParent: this
      }),
      route: this,
      resource: this.resource
    };

    return next();
  },

  /**
   * Middleware. In charge of calling stack's `parseQueryString()` method.
   *
   * @method _parseQueryString
   * @param {NOOT.API.Stack} stack
   * @private
   */
  _parseQueryString: function(stack) {
    stack.parseQueryString();
    return stack.next();
  },

  /**
   * Validate body against JSON schema.
   *
   * @method _validateSchema
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @async
   * @private
   */
  _validateSchema: function(req, res, next) {
    return Route.validateSchema(req.body, this.schema, function(err) {
      if (err) return next(new NOOT.Errors.BadRequest(err));
      return next();
    });
  }

}, {

  /**
   * @property DEFAULTS
   * @type Object
   * @static
   */
  DEFAULTS: {
    method: 'get'
  },

  /**
   * Redefine this property if you want to add custom behaviors to the Stack class. The route uses this property for
   * created its Stack instance.
   *
   * @property Stack
   * @type Class
   */
  Stack: Stack,

  /**
   * Validate a JSON schema.
   *
   * @method validateSchema
   * @param {Object} obj
   * @param {Object} schema
   * @param {Function} callback
   * @async
   * @static
   */
  validateSchema: function(obj, schema, callback) {
    return callback();
  }
});


/**
 * @exports
 */
module.exports = Route;