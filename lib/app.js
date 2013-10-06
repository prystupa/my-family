/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var sockjs = require('sockjs');
var path = require('path');
var argv = require('optimist')
    .usage('Usage: $0 --config [foler path]')
    .default('config', __dirname + '/../../my-family-config')
    .argv;
var service = require('./routes/service');

var scrapingConfig = require(argv.config + "/scraping");
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

gradebookServer.on('connection', service.scraping(scrapingConfig).gradebook.subscribe);
gradebookServer.installHandlers(httpServer, {prefix: '/services/rt/gradebook'});

httpServer.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
