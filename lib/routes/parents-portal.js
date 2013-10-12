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

    function getGrades(success, error) {
        logger.debug('getting grades from parent portal');

        return portal.loadSite()
            .then(logUrl)
            .then(portal.login)
            .then(logUrl)
            .then(portal.loadGradebook)
            .then(takeSnapshot("/tmp/after loadGradebook.png"))
            .then(logUrl)
            .then(portal.scrapeGrades)
            .then(processGrades)
            .then(success, error);
    }

    return {
        getGrades: getGrades
    };
}

function processGrades(grades) {
    logger.debug('processing grades');

    return {
        timestamp: new Date().getTime(),
        grades: grades.map(function (grade) {
            var course = grade.course.replace(/.*-\s*/, "");
            var avg = grade.avg;
            var warning = parseFloat(avg) < 90;
            var danger = parseFloat(avg) < 80;

            return {
                course: course,
                avg: avg,
                context: danger ? "danger" : (warning ? "warning" : "")
            };
        })
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
    }
}


module.exports = parentsPortal;
