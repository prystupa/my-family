/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 9/23/13
 * Time: 10:19 PM
 */

var ParentPortal = require('../scraping/ParentsPortal');
var logger = require('winston').loggers.get('parents-portal');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var driver = new webdriver.Builder().
    usingServer('http://localhost:8910/wd/hub').
    withCapabilities(webdriver.Capabilities.chrome()).
    build();


function parentsPortal(config) {
    var portal = new ParentPortal(driver, config);

    function getGrades() {
        logger.debug('getting grades from parent portal');

        return portal.loadSite()
            .then(logUrl)
            .then(portal.login)
            .then(logUrl)
            .then(portal.loadGradebook)
            .then(takeSnapshot("/tmp/after loadGradebook.png"))
            .then(logUrl)
            .then(portal.scrapeGrades);
    }

    return {
        getGrades: getGrades
    };
}

function logUrl() {
    return driver.getCurrentUrl().then(function (url) {
        logger.debug('current url: ' + url);
    });
}

function takeSnapshot(name) {
    return function () {
        return driver.takeScreenshot().then(function (image64) {
            require('fs').writeFileSync(name, image64, 'base64');
        });
    };
}


module.exports = parentsPortal;
