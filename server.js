var express = require('express')
  , sql = require('sql')
  , sqlite3 = require('sqlite3');

var app = express()
  , port = process.env.PORT || 8000
  , router = express.Router()
  , db = new sqlite3.Database('db');

app.use(express.static(__dirname + '/public'));

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

router.get('/trip', function (req, res, next) {
  console.log("Wuery "+JSON.stringify(req.query));
  res.json({
    "features": {
      "2013-11-16 05:54:00": [
      {
          "type": "Feature",
          "properties": {
              "batchStart": "20131116000000",
              "terminal": "JFKT5",
              "duration": "975",
              "pickupTime": "2013-11-16 05:54:00"
          },
          "geometry": {
              "type": "LineString",
              "coordinates": "_zzmAus`yM|@bCnCdHhA`DLFF@JAJE??b@{A|@kCp@aBzBiF`@iAj@qC`AeEZcAbCeGh@sALYx@mBT]JIPKREbAWzA}@p@k@b@m@~C_GVm@V_ATgBn@eDvA{ERm@b@iAbEuJnCyG`AaC\_AJ_@x@yChEcO??JL??gBfG"
          }
      }],
      "2013-11-16 05:56:00": [
        {
            "type": "Feature",
            "properties": {
                "batchStart": "20131116000000",
                "terminal": "JFKT5",
                "duration": "567",
                "pickupTime": "2013-11-16 05:56:00"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": "ujxmAm`cyMqAAgAA}DFiAMu@Ms@Oq@WKE??nCyG`AaC\_AJ_@x@yC??JD??{@vCK^Mb@"
            }
        }],
      "2013-11-16 05:58:00": [
        {
            "type": "Feature",
            "properties": {
                "batchStart": "20131116000000",
                "terminal": "JFKT5",
                "duration": "638",
                "pickupTime": "2013-11-16 05:58:00"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": "}|ymAmnfyMv@q@\Sr@i@PIf@Hr@N`Cr@^B~EDfABpBLrABzALpDp@`Bd@`@b@tAfA|ChBpAlAlAlALXX~@??tBCj@DzBVNB??_CrNa@zBmAxG_AxFk@nCo@~BmBtG??~Bp@vAJ~AFH?pA?tF@dAO??YwB|@Q??ScC"
            }
        }
      ],

      "2013-11-16 05:57:00": [
        {
            "type": "Feature",
            "properties": {
                "batchStart": "20131116000000",
                "terminal": "JFKT5",
                "duration": "973",
                "pickupTime": "2013-11-16 05:57:00"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": "ajymA{lbyMlAP??vA{ERm@b@iAbEuJnCyG`AaC\_AJ_@x@yChEcO??JL~Bp@vAJ~AF???_@A}A|@@"
            }
        }],

      "2013-11-16 05:55:00": [
        {
            "type": "Feature",
            "properties": {
                "batchStart": "20131116000000",
                "terminal": "JFKT5",
                "duration": "234",
                "pickupTime": "2013-11-16 05:55:00"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": "ubxmAuqbyMVmJ??oAGcBG??BeAMSkDAgAA}DFiAMu@Ms@Oq@W??{EdL_@dAiAtDKd@[hB"
            }
        }],
        "2013-11-16 05:59:00": [
        {
            "type": "Feature",
            "properties": {
                "batchStart": "20131116000000",
                "terminal": "JFKT5",
                "duration": "455",
                "pickupTime": "2013-11-16 05:59:00"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": "uiymAodbyMPsAn@eDvA{ERm@b@iAbEuJnCyG`AaC\_AJ_@x@yChEcO??JL~Bp@vAJ~AF???_@A}A~A@F?"
            }
        }],
    },
    "batchStart": "20131116000000"
});
 /* var sql = buildQuery(req.query)
    , queryText = sql.text.replace('SELECT', 'SELECT DISTINCT');

  db.serialize(function () {
    db.all(queryText, sql.values, function (err, result) {
      if (err) { console.log(err); }
      
      createGeojson(result, function (features) {
        res.json(features);
      });
    });
  });*/
});

app.use('/', router);
app.listen(port);
console.log('Listening on port ' + port);

var columns = [
    'pickupTime', 'duration', 'terminal', 'direction'
  ]
  , trip = sql.define({name: 'trips', columns: columns})

function buildQuery(params) {
  var query = trip.select(columns);
  if (params.terminals) {
    query.where(trip.terminal.in(params.terminals));
  }
  if (params.startDate) {
    query.where(trip.pickupTime.gte(params.startDate));
  } 
  if (params.endDate) {
    query.where(trip.pickupTime.lte(params.endDate));
  }
  query = query.order(trip.pickupTime);
  return query.toQuery();
}

function getNYCTime (s) {
  var formatted = s.replace(' ', 'T') + '-05:00';
  return new Date(formatted);
}

function createGeojson(rawData, callback) {
  var features = {};
  var halfKey = Math.floor(rawData.length / 2);
  var batchStart = rawData[0].pickupTime.replace(/[- :]/g, '');

  for (var i=0; i < rawData.length; i++) {
    var trip = rawData[i];
    var pickupTime = trip.pickupTime;

    if ( !(pickupTime in features) ) features[pickupTime] = [];

    var feature = {
      type: 'Feature',
      properties: {
        batchStart: batchStart,
        terminal: trip.terminal,
        duration: trip.duration,
        pickupTime: trip.pickupTime
      },
      geometry: {
        type: 'LineString',
        coordinates: trip.direction
      }
    };
    if (i === halfKey) {
      // Marking that this is at the middle of the result set
      // Used on client to trigger a new fetch
      feature.properties['halfKey'] = true;
    }

    features[pickupTime].push(feature);
  }

  var response = {
    features: features,
    batchStart: batchStart
  };

  callback(response);
}
