app.controller('ReservationBookCtrl', ['$rootScope', '$scope',"$stateParams","$state", "$service","$dateTime", "$timetable", "uiGmapLogger", 'drawChannel', 'clearChannel', '$http', '$sce', 'Locations', 'uiGmapGoogleMapApi', function ($rootScope, $scope, $stateParams, $state,$service, $dateTime, $timetable, $log, drawChannel, clearChannel, $http, $sce, Locations, GoogleMapApi) {
  //Init
  $scope.estimatedCost = "N/A";
  $scope.stackId = $stateParams.id;
    $scope.dates=[];
    var DATE_FORMAT="ddd, MMM Do";
    function initializedates(){
        var date = moment();

        for (var i = 0; i < 3; i++) {
            var temp = {
                format: date.add(i,"d").format(DATE_FORMAT),
                isActive:i===0
            };
            $scope.dates.push(temp);
        }
    }
    initializedates();
    function getActiveDate(){
        for (var i = 0; i < 3; i++) {
            if($scope.dates[i].isActive===true){
                return $scope.dates[i].format;
            }
        }
        return $scope.dates[0].format;
    }
    $scope.toggleActive=function(index){
        for(var i =0;i<$scope.dates.length;i++){
            $scope.dates[i].isActive=i===index;
        }
    };
  $scope.stack = $service.getStack($scope.stackId);
    console.log($scope.stack);
    console.log($service.getStack);
  $scope.timetable = $timetable.applyStyle($timetable.makeTimetable(1,24));
  //Select Time etc
  $scope.check = function (index, row, col){
    if ($scope.timetable[row][col].state==1)
      $scope.timetable[row][col].state = 2;
    else if ($scope.timetable[row][col].state==2)
      $scope.timetable[row][col].state = 1;
    $scope.estimateCost();
  };
  $scope.estimateCost = function (){
    $scope.timetable = $timetable.startEnd($scope.timetable);
      console.log($scope.timetable);
    if ($timetable.continuous($scope.timetable)){
        //this is in unix format, used moment.js to parse the string to unix
        var TIME_FORMAT = "h:mm a";
        var activeDate=getActiveDate();
        var bookingStart =
            moment(activeDate+" "+$timetable.getTimeByIndex($scope.timetable.start,$scope.timetable),
                DATE_FORMAT+" "+TIME_FORMAT).unix();
        console.log(bookingStart);
        var bookingEnd =
            moment(activeDate+" "+$timetable.getTimeByIndex($scope.timetable.end,$scope.timetable),
                    DATE_FORMAT+" "+TIME_FORMAT).unix();
        console.log(bookingEnd);
      $service.getTripEstimate($scope.stack.stackId,bookingStart,bookingEnd,
                               function(data){
                                   console.log(data);
                                   $scope.estimatedCost = data[0];
                               });
    }
    else{
      $scope.estimatedCost = "N/A";
    }
  };

  GoogleMapApi.then(function (maps) { //maps is an instance of google map
    $scope.locations = Locations;
      var defaultlat= $scope.stack.DBEntityStack.latitude;
      var defaultlng = $scope.stack.DBEntityStack.longitude;
    $scope.map = {
      center: {
        latitude: defaultlat || parseInt($scope.stack.DBEntityStack.latitude),
        longitude:  defaultlng|| parseInt($scope.stack.DBEntityStack.longitude)
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
