app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
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
  .state('tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-map.html',
        controller: 'MapCtrl'
      }
    }
  })
  .state('tab.map-detail', {
    url: '/map/:lat/:lng',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-map.html',
        controller: 'MapCtrl'
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
  .state('tab.reservation-new', {
    url: '/reservations/new',
    views: {
      'tab-reservations': {
        templateUrl: 'templates/reservation-new.html',
        controller: 'ReservationNewCtrl'
      }
    }
  })
  .state('tab.reservation-search', {
    url: '/reservations/search',
    views: {
      'tab-reservations': {
        templateUrl: 'templates/reservation-search.html',
        controller: 'ReservationSearchCtrl'
      }
    }
  })
  .state('tab.reservation-book', {
    url: '/reservations/book/:id',
    views: {
      'tab-reservations': {
        templateUrl: 'templates/reservation-book.html',
        controller: 'ReservationBookCtrl'
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
})
.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCuD7GXWfGRg-tbFBjno02hjPODQVtWbpI',
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
});

const timetableTemplate = [[{time:"6:00", ampm:"AM"}, {"time":"6:30", "ampm":"AM"},
                            {time:"7:00", "ampm":"AM"}, {"time":"7:30", "ampm":"AM"},
                            {time:"8:00", "ampm":"AM"}, {"time":"8:30", "ampm":"AM"}],
                           [{time:"9:00", "ampm":"AM"}, {"time":"9:30", "ampm":"AM"},
                            {time:"10:00", "ampm":"AM"}, {"time":"10:30", "ampm":"AM"},
                            {time:"11:00", "ampm":"AM"}, {"time":"11:30", "ampm":"AM"}],
                           [{time:"12:00", "ampm":"PM"}, {"time":"12:30", "ampm":"PM"},
                            {time:"1:00", "ampm":"PM"}, {"time":"1:30", "ampm":"PM"},
                            {time:"2:00", "ampm":"PM"}, {"time":"2:30", "ampm":"PM"}],
                           [{time:"3:00", "ampm":"PM"}, {"time":"3:30", "ampm":"PM"},
                            {time:"4:00", "ampm":"PM"}, {"time":"4:30", "ampm":"PM"},
                            {time:"5:00", "ampm":"PM"}, {"time":"5:30", "ampm":"PM"}],
                           [{"time":"6:00", "ampm":"PM"}, {"time":"6:30", "ampm":"PM"},
                            {"time":"7:00", "ampm":"PM"}, {"time":"7:30", "ampm":"PM"},
                            {"time":"8:00", "ampm":"PM"}, {"time":"8:30", "ampm":"PM"}],
                           [{"time":"9:00", "ampm":"PM"}, {"time":"9:30", "ampm":"PM"},
                            {"time":"10:00", "ampm":"PM"}, {"time":"10:30", "ampm":"PM"},
                            {"time":"11:00", "ampm":"PM"}, {"time":"11:30", "ampm":"PM"}],
                           [{"time":"12:00", "ampm":"AM"}, {"time":"12:30", "ampm":"AM"},
                            {"time":"1:00", "ampm":"AM"}, {"time":"1:30", "ampm":"AM"},
                            {"time":"2:00", "ampm":"AM"}, {"time":"2:30", "ampm":"AM"}],
                           [{"time":"3:00", "ampm":"AM"}, {"time":"3:30", "ampm":"AM"},
                            {"time":"4:00", "ampm":"AM"}, {"time":"4:30", "ampm":"AM"},
                            {"time":"5:00", "ampm":"AM"}, {"time":"5:30", "ampm":"AM"}]];
const timelineTemplate = [{time:"6:00", state:0}, {"time":"6:30", state:0},
                          {time:"7:00", state:0}, {"time":"7:30", state:0},
                          {time:"8:00", state:0}, {"time":"8:30", state:0},
                          {time:"9:00", state:0}, {"time":"9:30", state:0},
                          {time:"10:00", state:0}, {"time":"10:30", state:0},
                          {time:"11:00", state:0}, {"time":"11:30", state:0},
                          {time:"12:00", state:0}, {"time":"12:30", state:0},
                          {time:"1:00", state:0}, {"time":"1:30", state:0},
                          {time:"2:00", state:0}, {"time":"2:30", state:0},
                          {time:"3:00", state:0}, {"time":"3:30", state:0},
                          {time:"4:00", state:0}, {"time":"4:30", state:0},
                          {time:"5:00", state:0}, {"time":"5:30", state:0},
                          {"time":"6:00", state:0}, {"time":"6:30", state:0},
                          {"time":"7:00", state:0}, {"time":"7:30", state:0},
                          {"time":"8:00", state:0}, {"time":"8:30", state:0},
                          {"time":"9:00", state:0}, {"time":"9:30", state:0},
                          {"time":"10:00", state:0}, {"time":"10:30", state:0},
                          {"time":"11:00", state:0}, {"time":"11:30", state:0},
                          {"time":"12:00", state:0}, {"time":"12:30", state:0},
                          {"time":"1:00", state:0}, {"time":"1:30", state:0},
                          {"time":"2:00", state:0}, {"time":"2:30", state:0},
                          {"time":"3:00", state:0}, {"time":"3:30", state:0},
                          {"time":"4:00", state:0}, {"time":"4:30", state:0},
                          {"time":"5:00", state:0}, {"time":"5:30", state:0}];
