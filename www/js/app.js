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
      $http.get(query)
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

  .state('tab.reservation-detail', {
      url: '/reservations/:id',
      views: {
        'tab-reservations': {
          templateUrl: 'templates/reservation-detail.html',
          controller: 'ReservationDetailCtrl'
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
  //INITIALIZE VARIABLES
  var service = this;
  //TESTING ACCOUNT
  this.user = '6525';
  this.pw = 'gamesinstitute';
  //REAL SETTING - REPLACE TESTING WHEN DONE
  //this.user = '';
  //this.pw = '';

  //========================DATE AND TIME FUNCTIONS========================
  //Rounds time to 30 minute intervals
  this.roundTime  = function(time){
    return time-(time%1800);
  };
  this.convertDate = function(UNIX_timestamp){
    var a = new Date(UNIX_timestamp*1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = month + ' ' + date + ', '  + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  };

  //=========================SCOPE INTERFACING FUNCTIONS===================
  this.getReservation = function(id){
    for(var i=0; i<service.pastReservation.length; i++)
    {
      if (service.pastReservation[i].id == id)
      {
        return service.pastReservation[i];
      }
    }
  };
  //========================CARSHARE API FUNCTION==========================
  this.rest = function (method, callback, param, user, pw){
    //SERVER ADDRESS
    //RUBY METHOD - REMOVED
    //var adr = 'http://168.235.155.40:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
    //LOCAL METHOD - FOR TESTING
    //var adr = 'http://localhost:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
    //PHP METHOD - IN USE
    var adr = 'http://jerryzhou.net/cors.php?https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
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
    var promise = web.get(adr + 'action='+method+param+'&user='+user+'&hash='+hash+"&time="+time+'&billcode=mobile');
    promise.then(function (data){
      //CHECK FOR ERROR BEFORE CALLBACK
      if (data == null)
      {
      }
      else if (data.fault != null)
      {
        console.log(data.fault.value.struct.member[1].value.string);
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
    service.rest('getDriverName',function(data){service.driverName = data[0];});
  };
  this.getTimeZone  = function(){
    service.rest('getTimeZone',function(data){service.timeZone = data[0];});
  };
  this.getClientPhone  = function(){
    service.rest('clientPhone',function(data){service.clientPhone = data[0];});
  };
  this.getTripEstimate = function(){
    service.rest('tripEstimate',function(data){console.log(data)},"&stackId="+"11"+"&startTime="+'1421280000'+"&endTime="+'1421301600');
  };
  this.getResultsFromStackFilter = function(){
    service.rest('resultsFromStackFilter',function(data){console.log(data)},"&aStackFilter[startTime]="+service.roundTime(Math.floor(Date.now()/1000))+"&aStackFilter[endTime]="+service.roundTime(Math.floor(Date.now()/1000+1800))+"&aStackFilter[latitude]="+"43.467121"+"&aStackFilter[longitude]="+"-80.546756"+"&includeStack="+'true');
  };
  this.getDriversIntrestingThings = function(){
    service.rest('getDriversIntrestingThings', function(data){
      service.locale=data.WSDriversIntrestingThings.WSGetConfigurationResult.driverLanguageLocale;
      service.timeZone=data.WSDriversIntrestingThings.WSGetConfigurationResult.timeZone;
      service.driverName=data.WSDriversIntrestingThings.WSGetConfigurationResult.driverName;
      service.tripTimeResolution=data.WSDriversIntrestingThings.WSGetConfigurationResult.tripTimeResolution;
      service.driverLocations=data.WSDriversIntrestingThings.driverLocations.DBDriverLocation;
      service.messages=data.WSDriversIntrestingThings.driverMessages;
    });
  };
  this.getFutureReservation  = function(){
    service.rest('futureReservations', function(data){console.log(data)});
  };
  this.getCurrentReservation  = function(){
    service.rest('currentReservation', function(data){console.log(data);});
  };
  this.getPastReservation  = function(){
    service.rest('pastReservations', function(data){
      service.pastReservation = [];
      if (data.length===undefined)
      {
        service.pastReservation.push(data.DBEntityReservation);
        service.pastReservation[0].startDate = service.convertDate(service.pastReservation[0].startStamp);
      }
      else
      {
        for (var i = 0; i<data.length; i++)
        {
          service.pastReservation.push(data.DBEntityReservation[i]);
        }
      }
      console.log(service.pastReservation[0]);
    });
  };
  //============================CALLING API UPON APP START==========
  service.getDriversIntrestingThings();
  service.getClientPhone();
  service.getTripEstimate();
  service.getResultsFromStackFilter();
  service.getPastReservation();
  service.getFutureReservation();
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
      if (data[0] == 1)
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

  //CAN ADD TO EVERY SCOPE
  //Bind service variables to scope
  $scope.service = $service;
  //Navigation (can also use ui.sref)
  $scope.navigate = function (page){
    $state.go(page);
  };
});

app.controller('ReservationDetailCtrl', function($scope, $stateParams, $service) {
  //$scope.reservation = $service.pastReservation[$stateParams.id];
  $scope.reservationId = $stateParams.id;
  $scope.reservation = $service.getReservation($scope.reservationId);
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
