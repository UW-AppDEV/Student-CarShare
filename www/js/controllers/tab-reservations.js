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
    if (typeof $service.avaliableStacks === 'undefined' || forceRefresh){
      $service.getResultsFromStackFilter(function () {});
    }
    else {

    }
  };
  $scope.loaded = function (){
    return !(typeof $service.avaliableStacks === 'undefined');
  };
  $scope.loadData();
});
