app.controller('MapCtrl', ['$rootScope', '$scope', "uiGmapLogger", "$state","$stateParams",'drawChannel', 'clearChannel', '$http', '$sce', 'Locations', 'uiGmapGoogleMapApi', function ($rootScope, $scope, $log, $state,$stateParams,drawChannel, clearChannel, $http, $sce, Locations, GoogleMapApi) {
  GoogleMapApi.then(function (maps) { //maps is an instance of google map
    var defaultlat=43.4711753;
      var defaultlng = -80.5531673;
    $scope.locations = Locations;
    $scope.map = {
      center: {
        latitude: $stateParams.lat || defaultlat,
        longitude: $stateParams.lng ||defaultlng
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
