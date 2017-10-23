
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , flight=require('./routes/flights')
  , path = require('path')
  , hotel=require('./routes/hotel')
  , car=require('./routes/car');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//controller

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/flight',flight.search);
app.post('/fly',flight.searchf);
app.post('/htl',hotel.search);
app.post('/car',car.search);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
