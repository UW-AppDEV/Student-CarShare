app.controller('ReservationCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $service, $dateTime) {
  //CAN ADD TO EVERY SCOPE
  //Bind service variables to scope
  $scope.service = $service;
  //Navigation (can also use ui.sref)
  $scope.navigate = function (page) {
    $state.go(page);
  };
  $scope.go = function (id) {
    $state.go("tab.reservation-detail", {
      'id':id
    });
  };
  $scope.getDate = function (unixTime){
    return $dateTime.dateString(unixTime);
  };
  $scope.loadData = function (forceRefresh){
    $service.getCurrentReservation(function (data) {$scope.$broadcast('scroll.refreshComplete');});
    $service.getPastReservations(function (data) {$scope.$broadcast('scroll.refreshComplete');});
    $service.getFutureReservations(function (data) {$scope.$broadcast('scroll.refreshComplete');});
  };
  $scope.loadedPast = function (){
    return !(typeof $service.pastReservations === 'undefined');
  };
  $scope.loadedFuture = function (){
    return !(typeof $service.futureReservations === 'undefined');
  };
  $scope.loadedCurrent = function (){
    return !(typeof $service.currentReservation === 'undefined');
  };
  $scope.loaded = function(){
    return ($scope.loadedPast() || $scope.loadedFuture() || $scope.loadedCurrent());
  };
  $scope.loadData();
});
