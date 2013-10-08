/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 9/23/13
 * Time: 10:19 PM
 */

var logger = require('winston').loggers.get('parents-portal');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var driver = new webdriver.Builder().
    usingServer('http://localhost:8910/wd/hub').
    withCapabilities(webdriver.Capabilities.chrome()).
    build();


function parentAccess(config) {

    function getGrades(success, error) {
        logger.debug('getting grades from parent portal');

        return loadParentPortal(config)
            .then(logUrl)
            .then(login)
            .then(logUrl)
            .then(loadGradebook)
            .then(logUrl)
            .then(scrapeGrades)
            .then(processGrades)
            .then(success, error);

        function loadParentPortal() {
            logger.debug('loading parents portal site');
            return driver.get(config.site);
        }

        function login() {
            logger.debug('logging into the site as ' + config.username);
            if (!config.password) logger.warn('empty password');

            return findAllByName("j_username").then(function (list) {
                if (list.length > 0) {
                    return list[0].sendKeys(config.username)
                        .then(populateByName_("j_password", config.password))
                        .then(findByName_("logon"))
                        .then(submit);
                }

                return undefined;
            });
        }
    }

    return {
        getGrades: getGrades
    };
}

function loadGradebook() {
    logger.debug('navigating to gradebook');

    return driver.getCurrentUrl().then(function (url) {
        var targetUrl = url.replace(/module=home/, "module=gradebook");
        return driver.get(targetUrl);
    });
}

function scrapeGrades() {
    logger.debug('scraping grades');

    return driver.executeScript(function () {
        return $('table.list > tbody > tr:not(.listheading)').toArray().map(function (tr) {
            var $td = $('td', tr);
            var course = $td.filter(':eq(0)').text().trim();
            var avg = $td.filter(':eq(2)').text().trim();

            return {
                course: course,
                avg: avg
            };
        });
    });
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

function submit(element) {
    return element.submit();
}

function findAllByName(name) {
    return driver.findElements(By.name(name));
}

function findByName_(name) {
    return function () {
        return driver.findElement(By.name(name));
    };
}

function click(element) {
    return element.click();
}

function populateByName_(name, keys) {
    return function () {
        return driver.findElement(By.name(name))
            .then(function (element) {
                return element.sendKeys(keys);
            });
    };
}


module.exports = parentAccess;
