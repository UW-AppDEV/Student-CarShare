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

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $stateProvider
  .state('intro', {
    url: '/',
    templateUrl: 'templates/intro.html',
    controller: 'IntroCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'IntroCtrl'
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'IntroCtrl'
  })
  .state('main', {
    url: '/main',
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl'
  })
  .state('page11', {
    url: '/page11',
    templateUrl: 'page11.html',
    controller: 'MainCtrl'
  });
  $urlRouterProvider.otherwise("/");
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

app.service('$service', ['$window', '$rootScope', '$http', '$localstorage', 'web', function ($window, $rootScope, $q, $localstorage, web) {
  var service = this;

}]);

app.controller('MainCtrl', function ($scope, $http, $localstorage, $ionicModal, $service, web, $state) {
  $scope.toIntro = function(){
    $state.go('intro');
  }
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
    hash = sha1(sha1(pw)+time+method);
    web.get('action='+method+'&user='+user+'&hash='+hash+"&time="+time+'&billcode=mobile');
  };
$scope.navigate = function(){
    $state.go('page11');
  };
});

app.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $service, web) {
  //Toggle between log in, sign up, forgot password
  $scope.state = 0;
  $scope.tabTo = function(i) {
    $scope.state = i;
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };
  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
  $scope.navigate = function (page){
    $state.go(page);
  };
  $scope.login = function (){
    time = Math.floor(Date.now()/1000);
    hash = sha1(sha1(this.pw)+time+'isLoggedIn')
    var promise = web.get('action='+'isLoggedIn'+'&user='+this.user+'&hash='+hash+"&time="+time+'&billcode=mobile');
    promise.then(function(data) {
      if (data.methodResponse == 1)
      {
        $state.go('main');
        $service.user = 0;
        $service.pw = 0;
      }
      else
        alert('failed');
    }, function(reason) {
      console.log('Failed: ' + reason);
    });
  };
});
