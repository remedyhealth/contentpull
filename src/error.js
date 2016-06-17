'use strict';

const ExtendableError = require('./utils/extendable-error');

/**
 * A customized error object.
 * @extends ExtendableError
 */
class PullerError extends ExtendableError {};

module.exports = PullerError;
