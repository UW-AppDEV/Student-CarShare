angular.module('ionic.utils', [])
    .factory('$localstorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || JSON.stringify(defaultValue));
            }
        }
    }]);

var app = angular.module('app', ['ionic', 'ionic.utils']);

app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
      .state('page10', {
          url: '/page10',
          templateUrl: 'page10.html',
          controller: 'MainCtrl'
    })
      .state('page11', {
          url: '/page11',
          templateUrl: 'page11.html'
      });
    $urlRouterProvider.otherwise('/page10');
});

app.controller('MainCtrl', function ($scope, $http, $localstorage) {
    $scope.testlocal = $localstorage.get('test', 'local storage is working');
    $scope.test = function () {
        alert($scope.testlocal);
    };
    $scope.httpTest = function () {
        $http.get('http://rest-service.guides.spring.io/greeting', {
            params: {}
        })
            .success(function (data) {
                alert(JSON.stringify(data, null, 4));
            })
            .error(function () {
            });
    };
    $scope.request = function () {
        $http.get('https://reserve.studentcarshare.ca/webservices/WSUser/WSRest', {
            params: {}
        })
            .success(function (data) {
                alert("done");
            })
            .error(function () {
            });
    };
});

app.controller('SideCtrl', function ($scope, $http) {

});