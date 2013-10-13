var logger = require('winston').loggers.get('service');
var events = require('events');
var Q = require('q');
var _ = require('lodash');

var parentsPortal = require('./parents-portal');
var ParentsPortalStore = require('../persistence/ParentsPortalStore');
var GradeLog = ParentsPortalStore.GradeLog;

exports.scraping = function (config) {

    var ppConfig = config['parents-portal'];
    var ppScraper = parentsPortal(ppConfig);
    var ppUpdateInterval = (ppConfig.updateIntervalHours || 12) * 60 * 60 * 1000;

    var GradeBook = {
        aggregate: Q.nbind(GradeLog.aggregate, GradeLog),
        update: new events.EventEmitter()
    };

    var gradebook = {
            get: function (req, res) {
                ppScraper.getGrades(function (grades) {
                    res.send(grades);
                });
            },

            startPolling: function () {
                var timer;

                function pollGrades() {
                    logger.debug('getting grades');

                    function schedule() {
                        logger.debug('scheduling next grades scrape at ' + (new Date(new Date().getTime() + ppUpdateInterval)));
                        timer = setTimeout(pollGrades, ppUpdateInterval);
                    }

                    ppScraper.getGrades().then(processScrapedGrades).then(function (grades) {
                        ParentsPortalStore.saveGrades(grades);
                        GradeBook.update.emit('grades', interpretGrades(grades));
                    },function (error) {
                        logger.error(error);
                    }).then(schedule, schedule);
                }

                pollGrades();
            },

            subscribe: function (conn) {

                function send(grades) {
                    conn.write(JSON.stringify(grades));
                }

                GradeBook.aggregate([
                        {$sort: {timestamp: -1}},
                        {$unwind: "$grades"},
                        {$project: {
                            date: {
                                $add: [
                                    {$multiply: [
                                        {$year: "$timestamp"},
                                        366
                                    ]},
                                    {$dayOfYear: "$timestamp"}
                                ]
                            },
                            course: "$grades.course",
                            timestamp: 1,
                            avg: "$grades.avg",
                            "_id": 0
                        }},
                        {$group: {
                            "_id": {
                                date: "$date",
                                course: "$course"
                            },
                            grade: {$first: {timestamp: "$timestamp", avg: "$avg"}}
                        }},
                        {$project: {
                            "course": "$_id.course",
                            "timestamp": "$grade.timestamp",
                            "avg": "$grade.avg"
                        }},
                        {$group: {
                            "_id": "$timestamp",
                            timestamp: {$first: "$timestamp"},
                            grades: {$push: {course: "$course", avg: "$avg"}}
                        }}

                    ]).then(function (results) {
                        results.map(interpretGrades).forEach(send);
                    }).fail(function (error) {
                        logger.error(error);
                    }).done();

                conn.on('close', function () {
                    GradeBook.update.removeListener('grades', send);
                });
            }
        }
        ;

    return {
        gradebook: gradebook
    };

    function processScrapedGrades(grades) {
        logger.debug('processing scraped grades');

        return {
            timestamp: new Date().getTime(),
            grades: grades.map(function (grade) {
                var course = grade.course.replace(/.*-\s*/, "");
                var avg = parseFloat(grade.avg) || undefined;

                return {
                    course: course,
                    avg: avg
                };
            })
        };
    }

    function interpretGrades(snapshot) {
        logger.debug('interpreting grades');

        return _.extend(snapshot, {
            grades: snapshot.grades.map(function (grade) {
                var avg = grade.avg;
                var warning = avg < 90;
                var danger = avg < 80;

                return _.extend(grade, {
                    context: danger ? "danger" : (warning ? "warning" : "")
                });
            })
        });

    }
}
;