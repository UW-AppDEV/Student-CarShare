app.controller('ReservationNewCtrl', function ($scope, $service, $state, $dateTime, $timeout) {
  $scope.service = $service;
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
      $service.getResultsFromStackFilter(function () {
        $timeout(function(){$scope.drawSliders();}, 10);});
    }
    else {
      $timeout(function(){$scope.drawSliders();}, 10);
    }
  };
  $scope.drawSliders = function (){
    for (var i=0; i<$service.avaliableStacks.length; i++){
      //this will be an array of values from the nearest hour now (round down) to 24 hours later
      // in increments of 30min
      var timeslots=[];
      var bestStartStamp=moment($service.avaliableStacks[i].bestStartStamp*1000);
      var startIndex=null;
      var bestEndStamp=moment($service.avaliableStacks[i].bestEndStamp*1000);
      var endIndex=null;
      var now=moment().startOf('hour');
      for(var j=0;j<48;j++){
        var temp = now.add(j*30,'m');
        timeslots.push(temp.format('hh:mm A'));
        if(startIndex === null && (temp.isAfter(bestStartStamp) || temp.isSame(bestStartStamp))){
          startIndex=j==0?0:j-1;
        }
        if(endIndex=== null && (temp.isAfter(bestEndStamp) || temp.isSame(bestEndStamp))){
          endIndex=j==0?0:j-1;
        }
      }
      //["6:00AM", "6:30AM", "7:00AM", "7:30AM", "8:00AM", "8:30AM", "9:00AM", "9:30AM", "10:00AM", "10:30AM", "11:00AM", "11:30AM", "12:00", "12:30", "1:00PM", "1:30PM", "2:00PM", "2:30PM", "3:00PM", "3:30PM", "4:00PM", "4:30PM", "5:00PM", "5:30PM", "6:00PM", "6:30PM", "7:00PM", "7:30PM", "8:00PM", "8:30PM", "9:00PM", "9:30PM", "10:00PM", "10:30PM", "11:00PM", "11:30PM", "12:00", "12:30", "1:00AM", "1:30AM", "2:00AM", "2:30AM", "3:00AM", "3:30AM", "4:00AM", "4:30AM", "5:00AM", "5:30AM", "6:00AM"]

      $("#slider"+$service.avaliableStacks[i].stackId).ionRangeSlider({
        type: "double",
        from: startIndex,
        to: endIndex,
        values: timeslots,
        prefix: "",
        postfix: "",
        values_separator: " → ",
        force_edges: true,
        from_fixed: true,
        to_fixed: true
      });
    }
    //Cancel Refresh Loading
    $scope.$broadcast('scroll.refreshComplete');
  };
  $scope.loaded = function (){
    return !(typeof $service.avaliableStacks === 'undefined');
  };
  $scope.loadData();
});
