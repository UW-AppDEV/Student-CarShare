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
        .state('tab.map', {
            url: '/map',
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
