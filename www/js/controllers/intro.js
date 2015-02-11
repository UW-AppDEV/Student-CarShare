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
