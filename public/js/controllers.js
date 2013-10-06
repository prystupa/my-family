/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/3/13
 * Time: 10:53 PM
 */

function GradebookController($scope, $filter) {

    var sock;

    (function createSocket() {
        sock = new SockJS('/services/rt/gradebook');
        sock.onopen = function () {
            console.log('opened gradebook socket');
        };

        sock.onmessage = function (e) {
            var data = JSON.parse(e.data);
            $scope.updated = $filter('date')(data.timestamp, 'short');
            $scope.grades = data.grades;
            $scope.$apply();
        };

        sock.onclose = function () {
            console.log('lost gradebook socket, reconnecting...');
            createSocket();
        };
    })();
}
