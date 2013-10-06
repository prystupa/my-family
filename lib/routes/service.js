var parentsPortal = require('../scraping/parents-portal');

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
                function schedule() {
                    timer = setTimeout(getGrades, ppUpdateInterval)
                }

                ppScraper.getGrades(function (grades) {
                    conn.write(JSON.stringify(grades));
                },function (error) {
                    console.log("TODO: send error to client");
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
};