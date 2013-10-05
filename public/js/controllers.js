/**
 * Created with IntelliJ IDEA.
 * User: eprystupa
 * Date: 10/3/13
 * Time: 10:53 PM
 */

function GradebookController($scope, $http) {

    $http.get('/services/gradebook').success(function (data) {
        $scope.grades = data;
    });
}
