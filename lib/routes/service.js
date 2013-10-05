var parentAccess = require('../scraping/parents-portal');

exports.scraping = function (config) {

    var gradebook = {
        get: function (req, res) {
            parentAccess(config['parents-portal']).getGrades(function (grades) {
                res.send(grades);
            });
        }
    };

    return {
        gradebook: gradebook
    };
};