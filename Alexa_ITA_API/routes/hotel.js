/**
 * http://usejsdoc.org/
 */
console.log("server start");
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://localhost:27017/local_ita";
const moment=require('moment');
var jsonObj = 
{
	"input":"",
	"sdatetime":"",
	"edatetime":""	
};
exports.search= function(req,resp) {
	var details={};
	var hotels=[];
	var speechText = "";
	var option = 0;
	var input = req.param('destination');
	var startDate= new Date(req.param('sdatetime'));
	var endDate = new Date(req.param('edatetime'));
	var dates = [];
	var hotelOptions={};
	
    var dateString="[";

	while(startDate <= endDate) {
		dateString=dateString+"{date:new Date(\""+new Date(startDate)+"\"),status:true}";
        dates.push(new Date(startDate));
        startDate = new Date(startDate.setDate(
        		startDate.getDate() + 1
        		))
        if(startDate <= endDate){
        	dateString=dateString+",";
        }
        }
	dateString+="]";
	console.log(eval(dateString));
	queryObject = {destination:input,availability:{$all:eval(dateString)}};
	console.log("queryObject: "+JSON.stringify(queryObject));
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at search: ' + mongoURL);
		var coll = mongo.collection('hoteldb');
		coll.find(queryObject,{"availability":0}).toArray(function(err, hotels){
			if(hotels){
				console.log(hotels.length)
				if(hotels.length > 0)
				{
				speechText="The top search results are. ";
				for(i=0;i<3;i++){
					details = hotels[i];
					option = i+1;
					
						speechText += "Option "+option+", "+details.roomType+ " room type in a "+details.starRating+" star "+details.propertyType+", "+details.hotelName +", for "+ details.dailyRate+" per day, with amenities like "+details.amenities[0]+", "+details.amenities[1];
						optionNumber= "Option "+option+", "+details.roomType+ " room type in a "+details.starRating+" star "+details.propertyType+", "+details.hotelName +", for "+ details.dailyRate+" per day.";
						hotelOptions[option]=optionNumber;
					}
					var respon={"statusCode":200,
		    				"hotels":speechText,
		    				"hotelObject":hotels,
		    				"hotelOptions":hotelOptions
		    			};
					console.log("Response generated");
					resp.send(respon);
				}
			else{
				speechText = "no results found";
				var respon={"statusCode":404,
	    				"hotels":speechText,
	    				"hotelObject":hotels,
	    				"hotelOptions":hotelOptions
	    			};
				resp.send(respon);
			}
			}else {
				console.log("returned false");
				json_responses = {"statusCode" : 401};
				callback(null,json_responses);
			}
		});
		
	});
	
//	coll.find(queryObject).toArray(function(err, hotels){
	
}