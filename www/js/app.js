// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic']);

app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
        // Set the statusbar to use the default style, tweak this to
        // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
});

app.config(function ($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

      .state('page10', {
          url: '/page10',
          templateUrl: 'page10.html',
          controller: 'MainCtrl'
    })

      .state('page11', {
          url: '/page11',
          templateUrl: 'page11.html'
    })
  ;

  // if none of the above states are matched, use this as the fallback

    $urlRouterProvider.otherwise('/page10');
});

app.controller('MainCtrl', function ($scope, $http) {
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