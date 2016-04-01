'use strict';

/**
 * A properly extendable error object.
 * This is really just a helper so errors work well when extended.
 * @extends Error
 */
class ExtendableError extends Error {

    constructor(message) {
        super(message);

        /**
         * The name of the constructor.
         * @type {String}
         */
        this.name = this.constructor.name;

        /**
         * The error message.
         * @type {String}
         */
        this.message = message;

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {

            /**
             * The stack trace.
             * @type {Error.stack}
             */
            this.stack = (new Error(message)).stack;
        }
    }
}

module.exports = ExtendableError;
