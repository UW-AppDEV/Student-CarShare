//=============================Functions==============================
var httpGet = function (URL) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", URL, false);
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}

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

app.service('VideosService', ['$window', '$rootScope', '$http', '$localstorage', function ($window, $rootScope, $q, $localstorage, $http) {
    var service = this;
    this.search = function (term, type, items, page) {
        results[type].length = 0;
        data = httpGet('https://www.googleapis.com/youtube/v3/search' +
        '?key=' + key +
        '&type=' + type +
        '&maxResults=' + items +
        '&part=' + 'id,snippet' +
        '&fields' + 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle' +
        '&q=' + term);
        results[type] = data.items;
    };
}]);

app.controller('MainCtrl', function ($scope, $http, $localstorage) {
    $scope.testlocal = $localstorage.get('test', 'local storage is working');
    $scope.test = function () {
        alert($scope.testlocal);
    };
    $scope.httpTest = function () {
        data = httpGet('http://rest-service.guides.spring.io/greeting');
        alert(JSON.stringify(data));
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