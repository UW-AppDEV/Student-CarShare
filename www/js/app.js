var app = angular.module('app', ['ionic', 'uiGmapgoogle-maps']);

app.service('$service', ['$window', '$rootScope', '$http', '$localstorage', '$web', '$dateTime', function ($window, $rootScope, $q, $localstorage, $web, $dateTime) {
  //INITIALIZE VARIABLES
  var service = this;
  //STAGING ACCOUNT
  this.user = '9738';
  this.pw = '1234';
  //REAL SETTING - REPLACE TESTING WHEN DONE
  //this.user = '';
  //this.pw = '';

  //========================DATE AND TIME FUNCTIONS========================
  this.searchSettings = function () {
    service.searchSetting.start.time = $dateTime.roundTime(Math.floor(Date.now() / 1000));
    service.searchSetting.end.time = $dateTime.roundTime(Math.floor(Date.now() / 1000 + 10800));
    service.searchSetting.start.year = service.searchSetting.start.time.getYear();
    service.searchSetting.start.month = service.searchSetting.start.time.getMonth();
    service.searchSetting.start.date = service.searchSetting.start.time.getDate();
    service.searchSetting.start.hour = service.searchSetting.start.time.getHours();
    service.searchSetting.start.min = service.searchSetting.start.time.getMinutes();
    service.searchSetting.end.year = service.searchSetting.end.time.getYear();
    service.searchSetting.end.month = service.searchSetting.end.time.getMonth();
    service.searchSetting.end.date = service.searchSetting.end.time.getDate();
    service.searchSetting.end.hour = service.searchSetting.end.time.getHours();
    service.searchSetting.end.min = service.searchSetting.end.time.getMinutes();
  };


  //=========================SCOPE INTERFACING FUNCTIONS===================
  this.getReservation = function (id) {
    try{
    for (var i = 0; i < service.pastReservations.length; i++) {
      if (service.pastReservations[i].id == id) {
        return service.pastReservations[i];
      }
    }
    }catch(e){}
    try{
    for (var i = 0; i < service.futureReservations.length; i++) {
      if (service.futureReservations[i].id == id) {
        return service.futureReservations[i];
      }
    }
    }catch(e){}
  };
  this.getStack = function (id) {
    for (var i = 0; i < service.avaliableStacks.length; i++) {
      if (service.avaliableStacks[i].stackId == id) {
        return service.avaliableStacks[i];
      }
    }
    return service.avaliableStacks[0];
  };

  //========================CARSHARE API FUNCTION==========================
  this.rest = function (method, callback, param, user, pw) {
    //SERVER ADDRESS
    //MUST MOVE TO HTTPS MODE ONCE RELEASED TO PUBLIC
    //RUBY METHOD - REMOVED
    //var adr = 'http://168.235.155.40:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
    //LOCAL METHOD - FOR TESTING
    //var adr = 'http://localhost:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
    //PHP METHOD - IN USE
    //var adr = 'http://jerryzhou.net/cors.php?https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
    var adr = 'http://jerryzhou.net/cors.php?http://staging.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
    //OPTIONAL PARAMETERS
    if (typeof param === 'undefined')
      param = '';
    if (typeof user === 'undefined')
      user = service.user;
    if (typeof pw === 'undefined')
      pw = service.pw;
    //AUTHETICATION
    time = Math.floor(Date.now() / 1000);
    hash = sha1(sha1(pw) + time + method)
    var promise = $web.get(adr + 'action=' + method + param + '&user=' + user + '&hash=' + hash + "&time=" + time + '&billcode=mobile');
    promise.then(function (data) {
      //CHECK FOR ERROR BEFORE CALLBACK
      if (data == null) {
      }
      else if (data.fault != null) {
        console.log(data.fault.value.struct.member[1].value.string);
      }
      else {
        callback(data);
      }
    });
  };
  //========================CARSHARE API USE==============================
  this.getDriverName = function () {
    service.rest('getDriverName', function (data) {
      service.driverName = data[0];
    });
  };
  this.getTimeZone = function () {
    service.rest('getTimeZone', function (data) {
      service.timeZone = data[0];
    });
  };
  this.getClientPhone = function () {
    service.rest('clientPhone', function (data) {
      service.clientPhone = data[0];
    });
  };
  this.getTripEstimate = function (stackId, startTime, endTime, callback) {
    service.rest('tripEstimate', function (data) {
      if (typeof callback !== 'undefined')
        callback(data);
    }, "&stackId=" + stackId + "&startTime=" + startTime + "&endTime=" + endTime);
  };
  this.getResultsFromStackFilter = function (callback) {
    service.rest('resultsFromStackFilter', function (data) {
      if(data){
        console.log(data);
        service.avaliableStacks = data.DBRankedStacks;
        for (i=0; i<service.avaliableStacks.length; i++){
          service.avaliableStacks[i].distancekm = Math.round(service.avaliableStacks[i].distance/1000);
        }
      }else{
        console.log("calling resultsFromStackFilter: cannot get data from server");
      }

      if (typeof callback !== 'undefined')
        callback(data);
    }, "&aStackFilter[startTime]=" + $dateTime.roundTime(Math.floor(Date.now() / 1000)) +
                 "&aStackFilter[endTime]=" + $dateTime.roundTime(Math.floor(Date.now() / 1000 + 1800))
                 + "&aStackFilter[latitude]=" + "43.467121" + "&aStackFilter[longitude]=" + "-80.546756" + "&includeStack=" + 'true');
  };
  this.getDriversIntrestingThings = function () {
    service.rest('getDriversIntrestingThings', function (data) {
      service.locale = data.WSDriversIntrestingThings.WSGetConfigurationResult.driverLanguageLocale;
      service.timeZone = data.WSDriversIntrestingThings.WSGetConfigurationResult.timeZone;
      service.driverName = data.WSDriversIntrestingThings.WSGetConfigurationResult.driverName;
      service.tripTimeResolution = data.WSDriversIntrestingThings.WSGetConfigurationResult.tripTimeResolution;
      service.driverLocations = data.WSDriversIntrestingThings.driverLocations.DBDriverLocation;
      service.messages = data.WSDriversIntrestingThings.driverMessages;
    });
  };
  this.getFutureReservations = function (callback) {
    service.rest('futureReservations', function (data) {
      console.log(data);
      if (data.DBEntityReservation.constructor == Array)//CHECKS IF IT IS AN ARRAY, if not make an array
        service.futureReservations = data.DBEntityReservation;
      else{
        service.futureReservations = [];
        service.futureReservations[0] = data.DBEntityReservation;
      }

      if (typeof callback !== 'undefined')
        callback(data);
    });
  };
  this.getCurrentReservation = function (callback) {
    service.rest('currentReservation', function (data) {
      console.log(data);
      if (data.DBEntityReservation.constructor == Array)//CHECKS IF IT IS AN ARRAY
        service.currentReservation = data.DBEntityReservation;
      else {
        service.currentReservation = [];
        service.currentReservation = data.DBEntityReservation;
      }
      if (typeof callback !== 'undefined')
        callback(data);
    });
  };
  this.getPastReservations = function (callback) {
    service.rest('pastReservations', function (data) {
      console.log(data);
      if (data.DBEntityReservation.constructor == Array) //CHECKS IF IT IS AN ARRAY
        service.pastReservations = data.DBEntityReservation;
      else {
        service.pastReservations = [];
        service.pastReservations = data.DBEntityReservation;
      }

      if (typeof callback !== 'undefined')
        callback(data);
    });
  };
  //============================CALLING API UPON APP START (use for testing)==========
}]);
