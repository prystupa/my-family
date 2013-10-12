var logger = require('winston').loggers.get('service');

var parentsPortal = require('./parents-portal');
var ParentsPortalStore = require('../persistence/ParentsPortalStore');
var GradeLog = ParentsPortalStore.GradeLog;

exports.scraping = function (config) {

    var ppConfig = config['parents-portal'];
    var ppScraper = parentsPortal(ppConfig);
    var ppUpdateInterval = (ppConfig.updateIntervalHours || 12) * 60 * 60 * 1000;

    var gradebook = {
        get: function (req, res) {
            ppScraper.getGrades(function (grades) {
                res.send(grades);
            });
        },

        subscribe: function (conn) {
            var timer;


            (function getGrades() {
                logger.debug('getting grades');

                function schedule() {
                    logger.debug('scheduling next grades scrape at ' + (new Date(new Date().getTime() + ppUpdateInterval)));
                    timer = setTimeout(getGrades, ppUpdateInterval);
                }

                ppScraper.getGrades().then(processGrades).then(function (grades) {
                    conn.write(JSON.stringify(grades));
                    ParentsPortalStore.saveGrades(grades);
                },function (error) {

                    logger.error(error);
                    logger.error("TODO: send error to client");
                }).then(schedule, schedule);
            })();

            conn.on('close', function () {
                if (timer) clearTimeout(timer);
            });
        }
    };

    return {
        gradebook: gradebook
    };

    function processGrades(grades) {
        logger.debug('processing grades');

        return {
            timestamp: new Date().getTime(),
            grades: grades.map(function (grade) {
                var course = grade.course.replace(/.*-\s*/, "");
                var avg = parseFloat(grade.avg) || undefined;
                var warning = avg < 90;
                var danger = avg < 80;

                return {
                    course: course,
                    avg: avg,
                    context: danger ? "danger" : (warning ? "warning" : "")
                };
            })
        };
    }
};