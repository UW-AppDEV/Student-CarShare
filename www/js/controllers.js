app.controller('ReservationDetailCtrl', function ($scope, $stateParams, $service) {
  //$scope.reservation = $service.pastReservation[$stateParams.id];
  $scope.reservationId = $stateParams.id;
  $scope.reservation = $service.getReservation($scope.reservationId);
});

app.controller('ReservationSearchCtrl', function ($scope, $service) {
  $scope.service = $service;
});
