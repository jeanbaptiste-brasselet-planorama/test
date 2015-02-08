var NOOT = require('../../../../../')('object');
var _ = require('lodash');

/***********************************************************************************************************************
 * Base Field class
 *
 * @class Field
 * @namespace NOOT.API
 * @constructor
 **********************************************************************************************************************/
var Field = NOOT.Object.extend({

  /**
   * Default value to be applied in case `value` is not provided.
   *
   * @property defaultValue
   * @type *
   */
  defaultValue: null,

  /**
   * Defines whether or not this field is required.
   *
   * @property isRequired
   * @type Boolean
   * @default false
   */
  isRequired: false,

  /**
   * Defines whether or not this field is a reference to another resource.
   *
   * @property isReference
   * @type Boolean
   * @default false
   */
  isReference: false,

  /**
   * Defines whether or not this field references multiple items of another resource.
   *
   * @property isReferenceArray
   * @type Boolean
   * @default false
   */
  isReferenceArray: false,


  /**
   * Internal path to access the field.
   *
   * @property path
   * @type String
   * @required
   */
  path: null,

  /**
   * List of operators supported by this field.
   *
   * @property supportedOperators
   * @type Array of String
   * @default []
   */
  supportedOperators: [],

  /**
   * Public path to access the field.
   *
   * @property publicPath
   * @type String
   * @default path
   */
  _publicPath: null,
  get publicPath() { return this._publicPath || this.path; },
  set publicPath(value) { this._publicPath = value; },

  /**
   * @constructor
   */
  init: function() {
    NOOT.required(this, 'path');
  },

  /**
   * Responsible of transforming `value` into a public compliant value. By default, simply returns `value`.
   *
   * @method toPublic
   * @return {*}
   */
  toPublic: function(value) {
    return value;
  },

  /**
   * Responsible of transforming `value` into an internal compliant value. By default, simply returns `value`.
   *
   * @method toInternal
   * @return {*}
   */
  toInternal: function(value) {
    return value;
  },

  /**
   * Responsible of parsing value from a query string. I.e., cast a string to a number. By default, simply returns
   * `value`.
   *
   * @method parseFromQueryString
   * @return {*}
   */
  parseFromQueryString: function(value) {
    return value;
  },

  /**
   * Method that needs to return the resource that the field is referencing.
   *
   * @method getReference
   * @return NOOT.API.Resource
   */
  reference: null,

  /**
   * Check if `value` is a valid. You must set `isValue` in order to make the system aware of the field's validity,
   * otherwise the field will be considered as valid in further operations. For convenience, returns `isValid`. Default
   * method returns the value of `isValid` for convenience. You may want to keep this behavior when overriding this
   * method.
   *
   * @method validate
   * @return {Boolean} isValid
   */
  validate: function(value) {
    if (this.isRequired && NOOT.isNone(value)) return false;
    return true;
  },

  validateOperator: function(operator) {
    if (!operator) return true;
    return _.contains(this.supportedOperators, operator);
  }

}, {
  /**
   * Message : parameter is missing.
   *
   * @method missingParameterMessage
   * @static
   * @param {String} property
   * @return {String}
   */
  missingParameterMessage: function(property) {
    return [property, 'is required.'].join(' ');
  },

  /**
   * Message : value is not in provided list of allowed values.
   *
   * @method notInEnumMessage
   * @static
   * @param {String} property
   * @param {Array} enumeration
   * @param {*} currentValue
   * @return {String}
   */
  notInEnumMessage: function(property, enumeration, currentValue) {
    return [property, 'should be in:', enumeration.join(', '), '- instead got', currentValue + '.'].join(' ');
  },

  /**
   * Message : value's type is incorrect.
   *
   * @method badTypeMessage
   * @static
   * @param {String} property
   * @param {String} expectedType
   * @param {String} currentType
   * @return {String}
   */
  badTypeMessage: function(property, expectedType, currentType) {
    return [property, 'should be a', expectedType, '- instead go a', currentType + '.'].join(' ');
  },

  forbiddenOperatorMessage: function(property, operator) {
    return ['Operator `' + operator + '`', 'is not allowed for property', property + '.'].join(' ');
  },

  forbiddenFieldMessage: function(property) {
    return ['Field `' + property + '`', 'is not allowed or does not exist.'].join(' ');
  }
});

/**
 * @exports
 */
module.exports = Field;
