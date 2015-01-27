var app = angular.module('app', ['ionic', 'uiGmapgoogle-maps']);

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

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.service('$service', ['$window', '$rootScope', '$http', '$localstorage', 'web', function ($window, $rootScope, $q, $localstorage, web) {
    //INITIALIZE VARIABLES
    var service = this;
    //STAGING ACCOUNT
    this.user = '9738';
    this.pw = '1234';
    //REAL SETTING - REPLACE TESTING WHEN DONE
    //this.user = '';
    //this.pw = '';

    //========================DATE AND TIME FUNCTIONS========================
    //Rounds time to 30 minute intervals
    this.roundTime = function (time) {
        return time - (time % 1800);
    };
    this.convertDate = function (UNIX_timestamp) {
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
    };
    this.searchSettings = function () {
        service.searchSetting.start.time = service.roundTime(Math.floor(Date.now() / 1000));
        service.searchSetting.end.time = service.roundTime(Math.floor(Date.now() / 1000 + 10800));
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
    }
    this.convertUnixTime = function (year, month, day, hour, min) {
        return (new Date(year + "/" + month + "/" + day + " " + hour + ":" + min + ":00").getTime() / 1000);
    }

    //=========================SCOPE INTERFACING FUNCTIONS===================
    this.getReservation = function (id) {
        for (var i = 0; i < service.pastReservation.length; i++) {
            if (service.pastReservation[i].id == id) {
                return service.pastReservation[i];
            }
        }
    };
    //========================CARSHARE API FUNCTION==========================
    this.rest = function (method, callback, param, user, pw) {
        //SERVER ADDRESS
        //RUBY METHOD - REMOVED
        //var adr = 'http://168.235.155.40:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
        //LOCAL METHOD - FOR TESTING
        //var adr = 'http://localhost:2000/https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
        //PHP METHOD - IN USE
        //var adr = 'http://jerryzhou.net/cors.php?https://reserve.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
        var adr = 'http://jerryzhou.net/cors.php?https://staging.studentcarshare.ca/webservices/index.php/WSUser/WSRest?';
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
        var promise = web.get(adr + 'action=' + method + param + '&user=' + user + '&hash=' + hash + "&time=" + time + '&billcode=mobile');
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
        }, function (reason) {
            console.log('Failed: ' + reason);
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
    this.getTripEstimate = function () {
        service.rest('tripEstimate', function (data) {
            console.log(data)
        }, "&stackId=" + "11" + "&startTime=" + '1421280000' + "&endTime=" + '1421301600');
    };

    this.getResultsFromStackFilter = function () {
        service.rest('resultsFromStackFilter', function (data) {
            service.avaliableStacks = [];
            if (Object.getOwnPropertyNames(data).length === 0) {
            }
            else {
                service.avaliableStacks = data.DBRankedStacks;
            }
            console.log(service.avaliableStacks);
        }, "&aStackFilter[startTime]=" + service.roundTime(Math.floor(Date.now() / 1000)) +
            "&aStackFilter[endTime]=" + service.roundTime(Math.floor(Date.now() / 1000 + 1800))
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
    this.getFutureReservation = function () {
        service.rest('futureReservations', function (data) {
            console.log(data)
        });
    };
    this.getCurrentReservation = function () {
        service.rest('currentReservation', function (data) {
            console.log(data);
        });
    };
    this.getPastReservation = function () {
        service.rest('pastReservations', function (data) {
            console.log(data);
            service.pastReservation = [];
            //If object is EMPTY
            if (Object.getOwnPropertyNames(data).length === 0) {
            }
            //If object is 1 item (not array)
            else if (data.length === undefined) {
                service.pastReservation.push(data.DBEntityReservation);
                service.pastReservation[0].startDate = service.convertDate(service.pastReservation[0].startStamp);
            }
            //if array
            else {
                for (var i = 0; i < data.length; i++) {
                    service.pastReservation.push(data.DBEntityReservation[i]);
                }
            }
        });
    };
    //============================CALLING API UPON APP START==========
    service.getDriversIntrestingThings();
    service.getClientPhone();
    service.getResultsFromStackFilter();
    service.getPastReservation();
}]).factory('channel', function () {
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
})
    .service('drawChannel', ['channel', function (channel) {
        return new channel()
    }])
    .service('clearChannel', ['channel', function (channel) {
        return new channel()
    }])
    .factory('Locations', function () {
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

