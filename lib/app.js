/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
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

app.get('/services/gradebook', service.scraping(scrapingConfig).gradebook.get);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
