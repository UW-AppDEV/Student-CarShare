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

var app = angular.module('app', ['ionic', 'ionic.utils', 'ngResource']);

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

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
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


app.factory('web', function($q, $http, $templateCache) {
  return {
    get: function(query) {
      var deferred = $q.defer();
      var url = 'http://168.235.155.40:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?' + query;
      $http.get(url)
      .success(function(data) {
        console.log(JSON.stringify(data));
        deferred.resolve(data);
      });
      return deferred.promise;
    }
  };
});

app.service('$service', ['$window', '$rootScope', '$http', '$localstorage', '$resource', function ($window, $rootScope, $q, $localstorage, $http) {
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

app.controller('MainCtrl', function ($scope, $http, $localstorage, $service, web) {
  $scope.testlocal = $localstorage.get('test', 'local storage is working');
  $scope.test = function () {
    alert($scope.testlocal);
  };
  $scope.hashPW = function (pw) {
    alert(sha1(sha1(pw)));
  };
  $scope.request = function () {
    web.get('');
  };
  $scope.rest = function (user, pw, method){
    time = Math.floor(Date.now()/1000);
    hash = sha1(sha1(pw)+time+method)
    web.get('action='+method+'&user='+user+'&hash='+hash+"&time="+time+'&billcode=mobile')
  };
});

app.controller('SideCtrl', function ($scope, $http) {

});
