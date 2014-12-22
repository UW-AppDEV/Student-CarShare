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
  .state('tab', {
    url: "/tab",
    templateUrl: "templates/tabs.html"
  })
  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'MainCtrl'
      }
    }
  })
  .state('tab.dash-detail', {
    url: '/dash/detail',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dash-detail.html',
        controller: ''
      }
    }
  })
  .state('tab.reservations', {
    url: '/reservations',
    views: {
      'tab-reservations': {
        templateUrl: 'templates/tab-reservations.html',
        controller: 'ReservationCtrl'
      }
    }
  })
  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });
  $urlRouterProvider.otherwise("/tab");
});


app.factory('web', function($q, $http, $templateCache) {
  return {
    get: function(query) {
      var deferred = $q.defer();
      var url = 'http://168.235.155.40:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?' + query;
      $http.get(url)
      .success(function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
  };
});

app.service('$service', ['$window', '$rootScope', '$http', '$localstorage', 'web', function ($window, $rootScope, $q, $localstorage, web) {
  var service = this;
  this.user = '6525';
  this.pw = 'gamesinstitute';
  this.fault = {8001: "No Such Reservation"};
  this.rest = function (user, pw, method, callback){
    time = Math.floor(Date.now()/1000);
    hash = sha1(sha1(pw)+time+method)
    var promise = web.get('action='+method+'&user='+user+'&hash='+hash+"&time="+time+'&billcode=mobile');
    promise.then(function (data){
      if (data.methodResponse.fault != null)
        console.log (service.fault[data.methodResponse.fault.value.struct.member[0].value.int]);
      else
        callback(data);
    }, function(reason) {
      console.log('Failed: ' + reason);
    });
  };
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
    $state.go('tab.dash-detail');
  };
});

app.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $service) {
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
    $scope.temp = [this.user, this.pw];
    $service.rest(this.user, this.pw, 'isLoggedIn',
                  function(data){
      if (data.methodResponse == 1)
      {
        $state.go('tab');
        $service.user = $scope.temp[0];
        $service.pw = $scope.temp[1];
      }
      else
        alert('failed');});
  };
});

app.controller('ReservationCtrl', function($scope, $state, $ionicSlideBoxDelegate, $service) {
  $scope.getFutureReservation  = function(){
    $service.rest($service.user, $service.pw, 'futureReservations',
                  function(data){console.log(data)});
  };
  $scope.getCurrentReservation  = function(){
    $service.rest($service.user, $service.pw, 'currentReservation',
                  function(data){//console.log(JSON.stringify(data));
      if (data.methodResponse.fault == null){}
      else
        console.log ($service.fault[data.methodResponse.fault.value.struct.member[0].value.int]);
    });
  };
  $scope.getPastReservation  = function(){
    $service.rest($service.user, $service.pw, 'pastReservations',
                  function(data){
      if (data.methodResponse.fault == null){
        console.log(JSON.stringify(data.methodResponse.DBEntityReservation));
      }
      else
        console.log ($service.fault[data.methodResponse.fault.value.struct.member[0].value.int]);
    });
  };

});
app.controller('AccountCtrl', function($scope, $state, $ionicSlideBoxDelegate, $service) {
  $scope.getDriverName  = function(){
    $service.rest($service.user, $service.pw, 'getDriverName',
                  function(data){$scope.driverName = data.methodResponse;});
  };
  $scope.getDriverName();

});
