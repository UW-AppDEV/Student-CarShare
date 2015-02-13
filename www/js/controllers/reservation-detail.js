app.controller('ReservationDetailCtrl', ['$rootScope', '$scope',"$stateParams","$state", "$service","$dateTime", "$timetable", "uiGmapLogger", 'drawChannel', 'clearChannel', '$http', '$sce', 'Locations', 'uiGmapGoogleMapApi', function ($rootScope, $scope, $stateParams, $state,$service, $dateTime, $log, drawChannel, clearChannel, $http, $sce, Locations, GoogleMapApi) {
  //Init
  $scope.estimatedCost = "N/A";
  $scope.reservationId = $stateParams.id;
  $scope.reservation = $service.getReservation($scope.reservationId);
  console.log($scope.reservation);
  GoogleMapApi.then(function (maps) { //maps is an instance of google map
    $scope.locations = Locations;
      var defaultlat= $scope.stack.DBEntityStack.latitude;
      var defaultlng = $scope.stack.DBEntityStack.longitude;
    $scope.map = {
      center: {
        latitude: defaultlat || parseInt(1234),
        longitude:  defaultlng|| parseInt(1234)
      },
      control: {},
      pan: true,
      zoom: 14,
      refresh: false,
      events: {},
      bounds: {},
      polys: [],
      draw: undefined,
      options:{
          scrollwheel: false,
          navigationControl: false,
          mapTypeControl: false,
          scaleControl: false,
        disableDefaultUI:true,
        draggable:false
      }
    };
    //$scope.markers = Locations; Not using the list of carshare locations from service anymore,
      //instead, markers are now generated from the stackInfo
      $scope.markers=[{
          'idKey':0,
          latitude: defaultlat || parseInt($scope.stack.DBEntityStack.latitude) ,
          longitude: defaultlng || parseInt($scope.stack.DBEntityStack.longitude) ,
          options:{
              draggable: false
          },
          onClick:function(){
              $state.go('tab.map-detail',{
                  lat: $scope.stack.DBEntityStack.latitude,
                  lng: $scope.stack.DBEntityStack.longitude
              })
          }
      }];
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
