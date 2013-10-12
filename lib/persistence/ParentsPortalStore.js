/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/12/13
 * Time: 9:21 AM
 */

var logger = require('winston').loggers.get('ParentsPortalStore');
var mongoose = require('mongoose');
mongoose.connect("localhost");

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

    saveGrades: function (grades) {
        new GradeLog(grades).save(function (err) {
            if(err) {
                logger.error("Error saving grade log to store: " + err);
            } else {
                logger.debug("Stored grade log to MongoDb");
            }
        });
    }
};