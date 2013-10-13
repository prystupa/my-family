/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/12/13
 * Time: 9:21 AM
 */

var logger = require('winston').loggers.get('ParentsPortalStore');
var mongoose = require('mongoose');
mongoose.connect("localhost/myfamily");

var gradesLogSchema = mongoose.Schema({
    timestamp: Date,
    grades: [
        {
            course: String,
            avg: Number
        }
    ]
});

var GradeLog = mongoose.model('GradeLog', gradesLogSchema);

module.exports = {
    GradeLog: GradeLog,

    saveGrades: function (grades) {
        new GradeLog(grades).save(function (err) {
            if (err) {
                logger.error("error saving grade log to store: " + err);
            } else {
                logger.debug("stored grade log to MongoDb");
            }
        });
    }
};