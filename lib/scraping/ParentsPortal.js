/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 9/23/13
 * Time: 10:19 PM
 */

var logger = require('winston').loggers.get('ParentsPortal');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;


function ParentsPortal(driver, config) {

    function loadParentPortal() {
        logger.debug('loading parents portal site');
        return driver.get(config.site).then(function () {
            return driver.wait(function () {
                return driver.isElementPresent(By.css('.parentsBody'));
            });
        });
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

    function findAllByName(name) {
        return driver.findElements(By.name(name));
    }

    function populateByName_(name, keys) {
        return function () {
            return driver.findElement(By.name(name))
                .then(function (element) {
                    return element.sendKeys(keys);
                });
        };
    }

    function findByName_(name) {
        return function () {
            return driver.findElement(By.name(name));
        };
    }

    function submit(element) {
        return element.submit();
    }


    return {
        loadSite: loadParentPortal,
        login: login,
        loadGradebook: loadGradebook,
        scrapeGrades: scrapeGrades
    };
}


module.exports = ParentsPortal;
