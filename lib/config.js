/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/6/13
 * Time: 1:15 AM
 */

var path = require('path');
var _ = require('lodash');
var argv = require('optimist').argv;

var defaults = {

    scraping: {
        "parents-portal": {
            site: "https://parents.westfieldnjk12.org",
            username: "olga@sqlapi.com",
            password: "",   // override on deploy
            updateIntervalHours: 12
        }
    },

    configureLogging: function (winston) {

        // override on deploy
    }
};

var overrides = argv.config ? readOverrides(argv.config) : {};

function readOverrides(filename) {
    return require(path.resolve(filename));
}

function deep(a, b) {
    return _.isPlainObject(a) && _.isPlainObject(b) ? _.extend(a, b, deep) : b;
}

module.exports = _.extend(defaults, overrides, deep);
