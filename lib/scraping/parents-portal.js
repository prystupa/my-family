/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 9/23/13
 * Time: 10:19 PM
 */

var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var driver = new webdriver.Builder().
    usingServer('http://localhost:8910/wd/hub').
    withCapabilities(webdriver.Capabilities.chrome()).
    build();


function parentAccess(config) {

    function getGrades(success, error) {
        return loadParentPortal(config)
            .then(login)
            .then(loadGradebook)
            .then(scrapeGrades)
            .then(processGrades)
            .then(success, error);

        function loadParentPortal() {
            return driver.get(config.site);
        }

        function login() {
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
    return driver
        .findElement(By.xpath('//span[contains(text(), "Gradebook")]'))
        .then(click);
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

function scrapeGrades() {
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

module.exports = parentAccess;