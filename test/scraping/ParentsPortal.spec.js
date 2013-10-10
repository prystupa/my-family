/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/8/13
 * Time: 10:35 PM
 */

var ParentsPortal = require('../../lib/scraping/ParentsPortal');
var target;

var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
    usingServer('http://localhost:8910/wd/hub').
    withCapabilities(webdriver.Capabilities.chrome()).
    build();

describe("Parents Portal", function () {

    beforeEach(function () {

        target = new ParentsPortal(driver, {
            site: "https://parents.westfieldnj12.org"
        });
    });

    describe('when I navigate to the portal', function () {
        beforeEach(function (done) {
            target.loadSite().then(function() {
                done();
            }, function() {
                throw "Error!";
            });
        });

        it('shows the site', function () {

        });
    });
});