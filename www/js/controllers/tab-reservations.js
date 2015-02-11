app.controller('ReservationCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $service) {
  //CAN ADD TO EVERY SCOPE
  //Bind service variables to scope
  $scope.service = $service;
  //Navigation (can also use ui.sref)
  $scope.navigate = function (page) {
    $state.go(page);
  };
  $scope.go = function (stackId) {
    $state.go("tab.reservation-book", {
      'id':stackId
    });
  };
  $scope.loadData = function (forceRefresh){

  };
  $scope.loadedPast = function (){
    return !(typeof $scope.pastReservations === 'undefined');
  };
  $scope.loadedFuture = function (){
    return !(typeof $scope.futureReservations === 'undefined');
  };
  $scope.loadedCurrent = function (){
    return !(typeof $scope.currentReservation === 'undefined');
  };
  $scope.loadData();
});
