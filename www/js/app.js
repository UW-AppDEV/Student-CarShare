var app = angular.module('app', ['ionic']);

app.factory('$localstorage', ['$window', function ($window) {
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

app.factory('web', function($q, $http, $templateCache) {
  return {
    get: function(query) {
      var deferred = $q.defer();
      var url = 'http://168.235.155.40:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?' + query;
      //var url = 'http://localhost:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?' + query;
      $http.get(url)
      .success(function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
  };
});

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
  })
  .state('tab.account-locations', {
    url: '/dash/locations',
    views: {
      'tab-account': {
        templateUrl: 'templates/locations.html',
        controller: 'AccountCtrl'
      }
    }
  })
  .state('tab.account-messages', {
    url: '/dash/messages',
    views: {
      'tab-account': {
        templateUrl: 'templates/messages.html',
        controller: 'AccountCtrl'
      }
    }
  });
  $urlRouterProvider.otherwise("/tab");
});

app.service('$service', ['$window', '$rootScope', '$http', '$localstorage', 'web', function ($window, $rootScope, $q, $localstorage, web) {
  var service = this;
  //TESTING ACCOUNT
  this.user = '6525';
  this.pw = 'gamesinstitute';
  //REAL SETTING - REPLACE TESTING WHEN DONE
  //this.user = '';
  //this.pw = '';

  //========================CARSHARE API FUNCTION==========================
  this.rest = function (method, callback, param, user, pw){
    //OPTIONAL PARAMETERS
    if (typeof param === 'undefined')
      param = '';
    if (typeof user === 'undefined')
      user = service.user;
    if (typeof pw === 'undefined')
      pw = service.pw;
    //AUTHETICATION
    time = Math.floor(Date.now()/1000);
    hash = sha1(sha1(pw)+time+method)
    var promise = web.get('action='+method+param+'&user='+user+'&hash='+hash+"&time="+time+'&billcode=mobile');
    promise.then(function (data){
      //CHECK FOR ERROR BEFORE CALLBACK
      if (data.methodResponse == null)
      {
        console.log(null);
      }
      else if (data.methodResponse.fault != null)
      {
        console.log(data.methodResponse.fault.value.struct.member[1].value.string);
      }
      else
      {
        callback(data);
      }
    }, function(reason) {
      console.log('Failed: ' + reason);
    });
  };
  //========================CARSHARE API USE==============================
  this.getDriverName  = function(){
    service.rest('getDriverName',function(data){service.driverName = data.methodResponse;});
  };
  this.getTimeZone  = function(){
    service.rest('getTimeZone',function(data){service.timeZone = data.methodResponse;});
  };
  this.getClientPhone  = function(){
    service.rest('clientPhone',function(data){service.clientPhone = data.methodResponse;});
  };
  this.getTripEstimate = function(){
    service.rest('tripEstimate',function(data){console.log(data)},"&stackId="+'100'+"&startTime="+'1421280000'+"&endTime="+'1421301600');
  };
  this.getDriversIntrestingThings = function(){
    service.rest('getDriversIntrestingThings', function(data){
      service.locale=data.methodResponse.WSDriversIntrestingThings.WSGetConfigurationResult.driverLanguageLocale;
      service.timeZone=data.methodResponse.WSDriversIntrestingThings.WSGetConfigurationResult.timeZone;
      service.driverName=data.methodResponse.WSDriversIntrestingThings.WSGetConfigurationResult.driverName;
      service.tripTimeResolution=data.methodResponse.WSDriversIntrestingThings.WSGetConfigurationResult.tripTimeResolution;
      service.driverLocations=data.methodResponse.WSDriversIntrestingThings.driverLocations.DBDriverLocation;
      service.messages=data.methodResponse.WSDriversIntrestingThings.driverMessages;
    });
  };
  //============================CALLING API UPON APP START==========
  service.getDriversIntrestingThings();
  service.getClientPhone();
  service.getTripEstimate();
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
  $scope.getReservationWithId  = function(id){
    $service.rest("reservationWithId", function(data){console.log(data.methodResponse);}, "&reservationId="+id);
  };
});

app.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $service) {
  //Slide Box
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
    $service.rest('isLoggedIn',
                  function(data){
      if (data.methodResponse == 1)
      {
        $state.go('tab');
        $service.user = $scope.temp[0];
        $service.pw = $scope.temp[1];
      }
      else
        alert('failed');},'',this.user, this.pw);
  };
});

app.controller('ReservationCtrl', function($scope, $state, $ionicSlideBoxDelegate, $service) {
  $scope.getFutureReservation  = function(){
    $service.rest('futureReservations',
                  function(data){console.log(data)});
  };
  $scope.getCurrentReservation  = function(){
    $service.rest('currentReservation',
                  function(data){$scope.reservation.current[0]=data;});
  };
  $scope.getPastReservation  = function(){
    $service.rest('pastReservations',
                  function(data){console.log(data.methodResponse.DBEntityReservation);});
  };

});

app.controller('AccountCtrl', function($scope, $state, $ionicSlideBoxDelegate, $service) {
  //CAN ADD TO EVERY SCOPE
  //Bind service variables to scope
  $scope.service = $service;
  //Navigation (can also use ui.sref)
  $scope.navigate = function (page){
    $state.go(page);
  };
});
