app.controller('MainCtrl', function ($scope, $http, $localstorage, $ionicModal, $service, web, $state) {
  $scope.toIntro = function () {
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
  $scope.rest = function (user, pw, method) {
    time = Math.floor(Date.now() / 1000);
    hash = sha1(sha1(pw) + time + method);
    web.get('action=' + method + '&user=' + user + '&hash=' + hash + "&time=" + time + '&billcode=mobile');
  };
  $scope.navigate = function () {
    $state.go('tab.dash-detail');
  };
  $scope.getReservationWithId = function (id) {
    $service.rest("reservationWithId", function (data) {
      console.log(data.methodResponse);
    }, "&reservationId=" + id);
  };
});

app.controller('IntroCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $service) {
  //Slide Box
  $scope.next = function () {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function () {
    $ionicSlideBoxDelegate.previous();
  };
  // Called each time the slide changes
  $scope.slideChanged = function (index) {
    $scope.slideIndex = index;
  };
  $scope.navigate = function (page) {
    $state.go(page);
  };
  $scope.login = function () {
    $scope.temp = [this.user, this.pw];
    $service.rest('isLoggedIn',
                  function (data) {
      if (data[0] == 1) {
        $state.go('tab');
        $service.user = $scope.temp[0];
        $service.pw = $scope.temp[1];
      }
      else
        alert('failed');
    }, '', this.user, this.pw);
  };
});

app.controller('ReservationCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $service) {

  //CAN ADD TO EVERY SCOPE
  //Bind service variables to scope
  $scope.service = $service;
  //Navigation (can also use ui.sref)
  $scope.navigate = function (page) {
    $state.go(page);
  };
});



app.controller('ReservationNewCtrl', function ($scope, $service, $state) {
  $scope.service = $service;
  $scope.navigate = function (page) {
    $state.go(page);
  };

  $service.rest('getDriverName', function (data) {
    for (var i=0; i<$service.avaliableStacks.length; i++){
      $("#slider"+$service.avaliableStacks[i].stackId).ionRangeSlider({
        type: "double",
        from: 1,
        to: 2,
        values: ["6:00AM", "6:30AM", "7:00AM", "7:30AM", "8:00AM", "8:30AM", "9:00AM", "9:30AM", "10:00AM", "10:30AM", "11:00AM", "11:30AM", "12:00", "12:30", "1:00PM", "1:30PM", "2:00PM", "2:30PM", "3:00PM", "3:30PM", "4:00PM", "4:30PM", "5:00PM", "5:30PM", "6:00PM", "6:30PM", "7:00PM", "7:30PM", "8:00PM", "8:30PM", "9:00PM", "9:30PM", "10:00PM", "10:30PM", "11:00PM", "11:30PM", "12:00", "12:30", "1:00AM", "1:30AM", "2:00AM", "2:30AM", "3:00AM", "3:30AM", "4:00AM", "4:30AM", "5:00AM", "5:30AM", "6:00AM"],
        prefix: "",
        postfix: "",
        values_separator: " → ",
        force_edges: true,
        from_fixed: true,
        to_fixed: true
      });
    }
  });
});

app.controller('ReservationDetailCtrl', function ($scope, $stateParams, $service) {
  //$scope.reservation = $service.pastReservation[$stateParams.id];
  $scope.reservationId = $stateParams.id;
  $scope.reservation = $service.getReservation($scope.reservationId);
});

app.controller('ReservationBookCtrl', function ($scope, $stateParams, $ionicSlideBoxDelegate, $service) {
  //$scope.reservation = $service.pastReservation[$stateParams.id];
  $scope.timetable = [["6:00", "6:30", "7:00", "7:30", "8:00", "8:30"],
                      ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30"],
                      ["12:00", "12:30", "1:00", "1:30", "2:00", "2:30"],
                      ["3:00", "3:30", "4:00", "4:30", "5:00", "5:30"],
                      ["6:00", "6:30", "7:00", "7:30", "8:00", "8:30"],
                      ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30"],
                      ["12:00", "12:30", "1:00", "1:30", "2:00", "2:30"],
                      ["3:00", "3:30", "4:00", "4:30", "5:00", "5:30"]];

  $scope.stackId = $stateParams.id;
  $scope.stack = $service.getStack($scope.stackId);
});

app.controller('ReservationSearchCtrl', function ($scope, $service) {
  $scope.service = $service;
});

app.controller('AccountCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $service) {
  //CAN ADD TO EVERY SCOPE
  //Bind service variables to scope
  $scope.service = $service;
  //Navigation (can also use ui.sref)
  $scope.navigate = function (page) {
    $state.go(page);
  };
});

app.controller('MapCtrl', ['$rootScope', '$scope', "uiGmapLogger", 'drawChannel', 'clearChannel', '$http', '$sce', 'Locations', 'uiGmapGoogleMapApi', function ($rootScope, $scope, $log, drawChannel, clearChannel, $http, $sce, Locations, GoogleMapApi) {
  GoogleMapApi.then(function (maps) { //maps is an instance of google map
    $scope.locations = Locations;
    $scope.map = {
      center: {
        latitude: 42.307827,
        longitude: -83.067037
      },
      control: {},
      pan: true,
      zoom: 14,
      refresh: false,
      events: {},
      bounds: {},
      polys: [],
      draw: undefined
    };
    console.log(Locations);
    $scope.markers = Locations;
  });
  //This is for getting user's location in Cordova
  $scope.myLocation = "";
  $scope.getMyLocation = function () {
    function onError(error) {
      console.log('code: ' + error.code + '\n' +
                  'message: ' + error.message + '\n');
    }

    function onSuccess(position) {
      $scope.myLocation = "Lat: " + position.coords.latitude.toString() + "lng:" + position.coords.longitude.toString();
    }

    var options = { enableHighAccuracy: true };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  };
  //=====================jerry's code=======================
  var clear = function () {
    $scope.map.polys = [];
  };
  var draw = function () {
    $scope.map.draw();//should be defined by now
  };
  $scope.testRefresh = function () {
    console.log($scope.map.control.refresh);
    $scope.map.control.refresh({latitude: 32.779680, longitude: -79.935493});
  };
  //add beginDraw as a subscriber to be invoked by the channel, allows controller to controller coms
  drawChannel.add(draw);
  clearChannel.add(clear);
  //========================================Khashayar's Map======================================================
  /*
     Google Maps methods and manipulation
     */
  //Initializing the addressArray
  var addressArray;
  $scope.GoogleMapsSrc = '';
  $scope.address = '';
  $scope.updateAddress = function (addressText) {
    //TODO check $http, might be native in angular
    //TODO check search in AngularGoogleMap
    $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + addressText + '&sensor=false')
    // After getting the results
    .then(function (results) {
      console.log(results.toString);
      // If the call was successful
      if (results.data.status === "OK") {
        // setting the addressArray to the results of the call.
        addressArray = results.data;
        // Url to be used in google maps iframe src.
        $scope.GoogleMapsSrc = 'https://www.google.com/maps/embed/v1/place?key=AIzaSyCuD7GXWfGRg-tbFBjno02hjPODQVtWbpI&q=' + addressText;
      }
    });
  };
  // helper function for trusting a url to be used withing an iframe.
  $scope.trustSrc = function (src) {
    console.log($sce.trustAsResourceUrl(src));
    return $sce.trustAsResourceUrl(src);
  };
}]);

