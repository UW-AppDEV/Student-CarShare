//Local Storage
app.factory('$localstorage', ['$window', function ($window) {
  return {
    set: function (key, value) {
      $window.localStorage[key] = value;
    },
    get: function (key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function (key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function (key, defaultValue) {
      return JSON.parse($window.localStorage[key] || JSON.stringify(defaultValue));
    }
  }
}]);

//Web Requests
app.factory('web', function ($q, $http, $templateCache) {
  return {
    get: function (query) {
      var deferred = $q.defer();
      $http.get(query)
      .success(function (data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
  };
});

//DateTime
app.factory('$dateTime', function () {
  return {
    //Converts array[48] slot to unix time
    arrayToUnix: function (time) {
      var day = Math.floor(new Date().valueOf()/1000) - Math.floor(new Date().valueOf()/1000)%86400;
      return day+time*1800;
    },
    unixToArray: function (UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      return ((Math.floor(hour*2+min/30)-2)%48+48)%48;
    },
    //Rounds time to 30 minute intervals
    roundTime: function (time){
      return time - (time % 1800);
    },
    dateString : function (UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = month + ' ' + date + ', ' + year + ' ' + hour + ':' + min + ':' + sec;
      return time;
    },
    //get unix timestamp
    convertUnixTime : function (year, month, day, hour, min) {
      return (new Date(year + "/" + month + "/" + day + " " + hour + ":" + min + ":00").getTime() / 1000);
    }
  };
});

//Timetable special functions
app.factory('$timetable', function () {
  return {
    continuous: function (timetable) {
      for (i=0; i<timetable.length; i++){
        for (i2=0; i2<timetable[0].length; i2++){
          if (timetable[i][i2].state == 1 && timetable[i][i2].index>timetable.start && timetable[i][i2].index<timetable.end){
            return false;
          }
        }
      }
      return true;
    },
    startEnd: function (timetable) {
      timetable.start = 23;
      timetable.end = 0;
      for (i=0; i<timetable.length; i++){
        for (i2=0; i2<timetable[0].length; i2++){
          if (timetable[i][i2].state == 2){
            if (timetable[i][i2].index<timetable.start)
              timetable.start = timetable[i][i2].index;
            if (timetable[i][i2].index>timetable.end)
              timetable.end = timetable[i][i2].index;
          }
        }
      }
      return timetable;
    },
    applyStyle: function (timetable){
      var ampmRecord = "";
      for (i=0;i<timetable.length;i++){
        if (ampmRecord != timetable[i][0].ampm){
          timetable[i].tmDisp = timetable[i][0].ampm;
          ampmRecord = timetable[i][0].ampm;
        }
        else{
          timetable[i].tmDisp = "";
        }
        for (i2=0;i2<timetable[0].length;i2++){
          timetable[i][i2].row = i;
          timetable[i][i2].col = i2;
          if (timetable[i][i2].ampm=="AM")
            timetable[i][i2].style="{'color':'#6DCCE0',";
          else if (timetable[i][i2].ampm=="PM")
            timetable[i][i2].style="{'color':'#86C335',";
          if (timetable[i][i2].col==0)
            timetable[i][i2].style = timetable[i][i2].style.concat("'border-left-style':'none',");
          timetable[i][i2].style = timetable[i][i2].style.concat("}");
        }
      }
      return timetable;
    },
  };
});
