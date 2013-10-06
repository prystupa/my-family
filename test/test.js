/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/6/13
 * Time: 2:05 AM
 */

var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var driver = new webdriver.Builder().
    usingServer('http://localhost:8910/wd/hub').
    withCapabilities(webdriver.Capabilities.chrome()).
    build();

function load() {

    return driver.get("http://google2.com");
}

load()
    .then(login)
    .then(done, failed);

function login(n) {
    return driver.findElement(By.css('img'))
        .then(function(span) {
            console.log('clicking...');
            return span.click();
        });

}

function done(r) {
    console.log('done');
}

function failed(e) {
    console.log('failed: ' + e);
}