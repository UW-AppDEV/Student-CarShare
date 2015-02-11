app.controller('ReservationCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $service) {
  //CAN ADD TO EVERY SCOPE
  //Bind service variables to scope
  $scope.service = $service;
  //Navigation (can also use ui.sref)
  $scope.navigate = function (page) {
    $state.go(page);
  };
});
