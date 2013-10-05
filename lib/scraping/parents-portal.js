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
            return driver.findElements(By.name("j_username")).then(function (list) {
                if (list.length > 0) {
                    driver.findElement(By.name("j_username")).sendKeys(config.username);
                    driver.findElement(By.name("j_password")).sendKeys(config.password);
                    return driver.findElement(By.name("logon")).submit();
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
    return driver.findElement(By.xpath('//span[contains(text(), "Gradebook")]')).click();
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
    return grades.map(function (grade) {
        var course = grade.course.replace(/.*-\s*/, "");
        var avg = grade.avg;
        var warning = parseFloat(avg) < 90;
        var danger = parseFloat(avg) < 80;

        return {
            course: course,
            avg: avg,
            context: danger ? "danger" : (warning ? "warning" : "")
        };
    });
}

module.exports = parentAccess;