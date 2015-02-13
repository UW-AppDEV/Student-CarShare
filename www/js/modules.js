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
app.factory('$web', function ($q, $http, $templateCache) {
  return {
    get: function (query) {
      var deferred = $q.defer();
      $http.get(query)
      .success(function (data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    },
    rest: function (method, callback, param, user, pw) {
      //SERVER ADDRESS
      //MUST MOVE TO HTTPS MODE ONCE RELEASED TO PUBLIC
      //var adr = 'http://jerryzhou.net/cors.php?https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
      var adr = 'http://jerryzhou.net/cors.php?http://staging.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
      //OPTIONAL PARAMETERS
      if (typeof param === 'undefined')
        param = '';
      if (typeof user === 'undefined')
        user = '9738';
      if (typeof pw === 'undefined')
        pw = '1234';
      //AUTHETICATION
      time = Math.floor(Date.now() / 1000);
      hash = sha1(sha1(pw) + time + method);
      var deferred = $q.defer();
      $http.get(adr + 'action=' + method + param + '&user=' + user + '&hash=' + hash + "&time=" + time + '&billcode=mobile')
      .success(function (data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    },
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
    timeString : function (UNIX_timestamp) {
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
    dateString : function (UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var day = days[a.getDay()];
      var hour = a.getHours();
      var min = a.getMinutes()|| "00";
      var time = day + ', ' + month + ' ' + date + ', ' + year + ' ' + hour + ':' + min;
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
    makeTimetable: function (start,end){
      //Mark Avaliable
      var timetable = timetableTemplate;
      var count = 0;
      for (i=0; i<timetable.length; i++){
        for (i2=0; i2<timetable[0].length;i2++){
          timetable[i][i2].index=i*6+i2;
          if (count>=start && count<=end)
            timetable[i][i2].state = 1;
          else
            timetable[i][i2].state = 0;
          count++;
        }
      }
      //Remove empty rows and return
      return timetable.slice(start/6, end/6+1);
    },
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

app.factory('channel', function () {
  return function () {
    var callbacks = [];
    this.add = function (cb) {
      callbacks.push(cb);
    };
    this.invoke = function () {
      callbacks.forEach(function (cb) {
        cb();
      });
    };
    return this;
  };
});
app.service('drawChannel', ['channel', function (channel) {
  return new channel()
}]);
app.service('clearChannel', ['channel', function (channel) {
  return new channel()
}]);


app.factory('Locations', function () {
  //LOCATIONS
  var locations = [
    //guelph
    [43.531887, -80.219113,
     '<h4>Guelph</h4>' +
     '<p>50 Stone Road East Guelph, Ontario, CA N1G 2M7 <br/>' +
     '<center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    [43.522787, -80.235772,
     '<h4>Guelph</h4>' +
     '<p>226 Chancellors Way Guelph, Ontario, CA N1G 5K1 <br/>' +
     '<center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //hamilton
    [43.239145, -79.888082,
     '<h4>Hamilton</h4>' +
     '<p>135 Fennell Avenue West Hamilton, Ontario, CA L9C 7V7' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    [43.261908, -79.906233,
     '<h4>Hamilton</h4>' +
     '<p>1024 King Street West Hamilton, Ontario, CA L8S 1L5 ' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR ' +
     '</a></center></p>'],
    [43.257936, -79.923646,
     '<h4>Hamilton</h4>' +
     '<p>1520 Main Street West Hamilton, Ontario, CA L8S 1C8' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR' +
     '</a></center></p>'],
    //kingston
    [44.231701, -76.492617,
     '<h4>Kingston</h4>' +
     '<p>326 Johnson Street Kingston, Ontario, CA K7L 1Y7 <br/>' +
     '<center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //london
    [43.012242, -81.264478,
     '<h4>London</h4>' +
     '<p>1223 Richmond Street London, Ontario, CA N6A 3L8 ' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    [42.992413, -81.257727,
     '<h4>London</h4>' +
     '<p>75 Ann Street London, Ontario, CA N6A 1P9 <br/><center>' +
     '<a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //oshawa
    [43.942043, -78.896085,
     '<h4>Oshawa</h4>' +
     '<p>32 Commencement Drive Oshawa, Ontario, CA L1G 8G3 <br/>' +
     '<center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //otawa
    [45.431664, -75.679748,
     '<h4>Ottawa</h4> ' +
     '<p>475 Rideau Street Ottawa, Ontario, CA K1N 5Z5 ' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a> ' +
     '</center></p>'],
    [45.350365, -75.755023,
     '<h4>Ottawa</h4>' +
     '<p>1385 Woodroffe Avenue Ottawa, Ontario, CA K2G 3G7 <br/>' +
     '<center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    [45.383682, -75.695081,
     '<h4>Ottawa</h4>' +
     '<p>1125 Colonel By Drive Ottawa, Ontario, CA K1S 5R1 <br/>' +
     '<center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    [45.391146, -75.680083,
     '<h4>Ottawa</h4>' +
     '<p>1255 Bank Street Ottawa, Ontario, CA K1S 3Y3 ' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //peterborough
    [44.304632, -78.321133,
     '<h4>Peterborough</h4>' +
     '<p>190 Simcoe Street Peterborough, Ontario, CA K9H 2H6' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    [44.356667, -78.290754,
     '<h4>Peterborough</h4>' +
     '<p>1600 West Bank Drive Peterborough, Ontario, CA K9J 7B8' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //sherbroke
    [45.365746, -71.846416,
     '<h4>Sherbrooke</h4>' +
     '<p>2600 College Street Sherbrooke, Quebec, CA J1M 1Z7' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //windsor
    [42.307827, -83.067037,
     '<h4>Windsor</h4>' +
     '<p>401 Sunset Avenue Windsor, Ontario, CA N9B 3P4' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    //waterloo
    [43.479548, -80.524459,
     '<h4>Waterloo</h4>' +
     '<p>328 Regina Street North Waterloo, Ontario, CA N2J 3J6' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
    [43.479425, -80.52566,
     '<h4>Waterloo</h4>' +
     '<p>315 King Street North Waterloo, Ontario, CA N2J 2Z1' +
     '<br/><center><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
     '</center></p>'],
  ];
  var markers = [];
  var createMarker = function (template) {
    template.onClick = function () {
      template.show = !template.show;
    };
    return template;
  };
  for (var i = 0; i < locations.length; i++) {
    var temp = {
      idKey: i,
      latitude: locations[i][0],
      longitude: locations[i][1],
      city: 'Some City',
      address: '123 King Str',
      link: 'Link to a page for more info',
      options: {labelContent: 'label here',
                draggable: false
               },
      windowOptions: {
        //note that window can also be loaded with a templateUrl
        content: '<div style="opacity:0.9"><h4>Waterloo</h4>' +
        '<p>315 King Street North Waterloo, Ontario, CA N2J 2Z1' +
        '<br/><a class="scs-button orange" href="index.html">FIND A CAR</a>' +
        '</p></div>'
      },
      onWindowClose: function () {
        console.log('closed');
      },
      show: false
    };
    var marker = createMarker(temp);
    markers.push(marker);
  }
  return markers;
});
