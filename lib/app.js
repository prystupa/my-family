/**
 * Module dependencies.
 */

var _ = require('lodash');
var express = require('express');
var http = require('http');
var sockjs = require('sockjs');
var path = require('path');
var argv = require('optimist')
    .usage('Usage: $0 --config [file path]')
    .argv;
var service = require('./routes/service');

var config = overrideConfig(require('./config'), argv.config);
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var httpServer = http.createServer(app);
var gradebookServer = sockjs.createServer();

gradebookServer.on('connection', service.scraping(config.scraping).gradebook.subscribe);
gradebookServer.installHandlers(httpServer, {prefix: '/services/rt/gradebook'});

httpServer.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function overrideConfig(config, overrideModule) {

    function deep(a, b) {
        return _.isObject(a) && _.isObject(b) ? _.extend(a, b, deep) : b;
    }

    try {
        var overrides = require(overrideModule);
        return _.extend(config, overrides, deep);
    } catch (e) {
        return config;
    }
}