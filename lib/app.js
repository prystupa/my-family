/**
 * Module dependencies.
 */
var config = require('./config');
var winston = require('winston');
config.configureLogging(winston);

var express = require('express');
var http = require('http');
var sockjs = require('sockjs');
var path = require('path');
var service = require('./routes/service');

var logger = winston.loggers.get('app');
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
var gradebookServer = sockjs.createServer({
    log: function () {
        var logger = winston.loggers.get('sockjs');
        logger.log.apply(logger, arguments);
    }
});

gradebookServer.on('connection', service.scraping(config.scraping).gradebook.subscribe);
gradebookServer.installHandlers(httpServer, {prefix: '/services/rt/gradebook'});

httpServer.listen(app.get('port'), function () {
    logger.info('Express server listening on port ' + app.get('port'));
});
