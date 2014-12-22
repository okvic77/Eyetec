var express = require('express')
var app = express(),
    expressLess = require('express-less');

var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.configure(function() {
// //   io.set('transports', ['xhr-polling']);
// //   io.set('polling duration', 10);
// });


var mongo = require('mongodb');
var monk = require('monk');
var db = monk('eyetec:PasswordTec1@kahana.mongohq.com:10057/eyetec');
var expressHbs = require('express-handlebars');
var bodyParser = require('body-parser');
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use('/style', expressLess(__dirname + '/styles', {
    compress: true
}));
var pubnub = require("pubnub").init({
    publish_key: "pub-c-da41bb1f-a431-4657-8dc9-b29b8dfd7719",
    subscribe_key: "sub-c-92faa9d2-4467-11e4-908d-02ee2ddab7fe"
});
app.set('views', __dirname + '/views');
app.engine('hbs', expressHbs({
    extname: 'hbs',
    defaultLayout: 'main.hbs'
}));
app.set('view engine', 'hbs');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/', function(req, res) {
    res.render('index', {
        scripts: ['/home.js']
    });
})
app.post('/insert', function(req, res) {
    var collection = db.get('prorotipe');
    var data = req.body;
    if (req.body == undefined) return res.send('Sin information');
    data['date'] = new Date();
    collection.insert(data, function(err, doc) {
        pubnub.publish({
            channel: 'prototipo',
            message: {
                add: data
            },
            callback: function(e) {
                console.log("SUCCESS!", e);
            },
            error: function(e) {
                console.log("FAILED! RETRY PUBLISH!", e);
            }
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    });
});
app.get('/historial', function(req, res) {
    var collection = db.get('prorotipe');
    collection.find({}, {
        sort: {
            date: -1
        }
    }, function(err, docs) {
        docs.forEach(function(a) {
            a.date = new Date(a.date).toISOString();
        });
        res.render('historial', {
            historia: docs,
            scripts: ['/historia.js']
        });
        //res.setHeader('Content-Type', 'application/json');
        //res.end(JSON.stringify(docs));
    });
});
app.get('/off', function(req, res) {
    pubnub.publish({
        channel: 'prototipo',
        message: {
            poweroff: true
        },
        callback: function(e) {
            console.log("POWEROFF!", e);
            res.send('offff');
        },
        error: function(e) {
            console.log("FAILED! RETRY PUBLISH!", e);
            res.send('FAIL');
        }
    });
});



io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(app.get('port'), function(){
  console.log('listening on *:'+app.get('port'));
});

// app.listen(app.get('port'), function() {
//     console.log("Node app is running at localhost:" + app.get('port'))
// })