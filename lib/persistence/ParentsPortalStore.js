/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/12/13
 * Time: 9:21 AM
 */

var logger = require('winston').loggers.get('ParentsPortalStore');
var mongoose = require('mongoose');
mongoose.connect("localhost/myfamily");

var gradeSchema = mongoose.Schema({
    course: String,
    avg: Number
}, {
    _id: false
});

var gradesLogSchema = mongoose.Schema({
    timestamp: Date,
    grades: [gradeSchema]
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