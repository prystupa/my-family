/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/3/13
 * Time: 10:53 PM
 */

function GradebookController($scope, $filter) {

    var sock;
    var history;

    function updateHistory(grades) {
        grades.forEach(function (grade) {
            if (!history[grade.course]) history[grade.course] = [];
            history[grade.course].push(grade.avg);
        });
    }

    (function createSocket() {
        sock = new SockJS('/services/rt/gradebook');
        sock.onopen = function () {
            history = {};
            console.log('opened gradebook socket');
        };

        sock.onmessage = function (e) {
            var data = JSON.parse(e.data);
            $scope.updated = $filter('date')(data.timestamp, 'short');
            $scope.grades = data.grades;
            $scope.$apply();

            updateHistory(data.grades);

            $('.sparkline').each(function (index, el) {
                var values = history[$(el).attr('data-course')];
                $(el).sparkline(values, {width: '70px', normalRangeMin: 90, normalRangeMax: 100});
            });
        };

        sock.onclose = function () {
            console.log('lost gradebook socket, reconnecting...');
            createSocket();
        };
    })();
}
