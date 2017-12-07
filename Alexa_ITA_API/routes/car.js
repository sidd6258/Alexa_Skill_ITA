/**
 * http://usejsdoc.org/
 */
var request = require('request');
var nodemailer = require("nodemailer");

var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ainuco.ddns.net:4325/iTravelDB";
var mysql = require("./mysql");
var config = require('./config');
const moment=require('moment');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "intelligenttravelagent@gmail.com",
        pass: "sjsuita295"
    }
});
exports.search= function(req,resp) {
	var details={};
	var cars=[];
	var speechText = "";
	var option = 0;
	var input=req.param('destination');;
    var startDate = req.param('sdatetime');
   var endDate = req.param('edatetime');
    queryObject={destination:input,availability:{$not:{$elemMatch:{date:{$gte: new Date(startDate),$lte: new Date(endDate)},status:false}}}}
    console.log("queryObject"+JSON.stringify(queryObject));
    var carOptions={};
    var carObjects={};
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at search: ' + mongoURL);
		var coll = mongo.collection('carDataset');
		coll.find(queryObject,{availability:0}).toArray(function(err, cars){
			if (cars) {
				console.log(cars.length);
				if(cars.length > 0)
				{
					getTop3Raters(cars,function (err,arr){
						for(j=0;j<3;j++){
						for(i=0;i<cars.length;i++){
							if(cars[i]._id ==arr[j].id)
								{
								console.log(cars[i]._id);
								console.log(arr[j].id);
								details = cars[i];
								option = j+1;
								if(option == 1)
									{
									speechText += "The top search results are. Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+" with features "+details.carFeatures;
									speechText += " and seating avaialble for "+details.seating + " Total price is "+ details.dailyRate+". ";		
									optionNumber="Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+".";
									carOptions[option]=optionNumber;
									carObjects[option]=details;
									}
								else{
									speechText += " Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+" with features "+details.carFeatures;
									speechText += " and seating avaialble for "+details.seating + " Total price is "+ details.dailyRate+".";
									optionNumber="Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+".";
									carOptions[option]=optionNumber;
									carObjects[option]=details;
								}
								}
							}
					}

					var respon={"statusCode":200,
		    				"cars":speechText,
		    				"carObject":carObjects,
		    				"carOptions":carOptions
		    			};
					console.log("Response generated");
					resp.send(respon);
					});
					
					
				}
			else{
				speechText += "no results found";
				var respon={"statusCode":200,
	    				"cars":speechText,
	    				"carObject":cars,
	    				"carOptions":carOptions
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
	
}

function getTop3Raters(cars,callback){
    mongo.connect(mongoURL, function(){
        var coll = mongo.collection('UserPredictedRatings_car');
        var tmp = [];
        coll.find({"userId.email": "siddharth.gupta@sjsu.edu"}, {"rating": 1}).toArray(function(err, userRatings){
        	
            if (userRatings) {
            	 
                console.log("Data retrieved successfully");
               // console.log('user1------>' + JSON.stringify(userRatings[0]));
                userRatings1 = userRatings[0]['rating'];
               // console.log('user2------>' + JSON.stringify(userRatings1));
                //console.log("length"+Object.keys(userRatings1).length);

                for(var key in userRatings1)
                	
                	{
                	
                    for(var j=0; j<cars.length;j++)
                    {
                             //console.log("userRatings[i].(cars[j]._id)", userRatings1[cars[j]._id]);
                    	//console.log("rating object"+userRatings1[cars[j]._id]);
                	//console.log("car object"+cars[j]._id);
                  if(cars[j]._id == key){
                     var json = {};
                            json["id"] = cars[j]._id;
                            json["rating"] = userRatings1[cars[j]._id];
                            tmp.push(json);
                  }
                       
               }
            }
                //console.log('tmp', tmp);
                
                tmp = tmp.sort(function (a, b) {
                    return -a.rating.localeCompare(b.rating);
                });
          console.log('tmp', tmp);
          
        callback(null,tmp.slice(0,3));
          
            }else {
                console.log("returned false");
                json_responses = {"statusCode" : 401};
                res.send(json_responses);
            }
        });
    });
}
exports.carBooking= function(req,resp) {
	var attributes=req.param('attributes');
	var option=attributes.car_selection
	var mongo_id=attributes.carObject[option]._id;
	var module="car";
	var start_date=attributes.startdate_car;
	var end_date=attributes.enddate_car;
	var source='null';
	var destination=attributes.destination_car;
	var price=attributes.carObject[option].dailyRate;
	var email=attributes.profile.email;
	var carModel=attributes.carObject[option].carModel;
	var carBrand=attributes.carObject[option].carBrand;
	var rentalAgency=attributes.carObject[option].rentalAgency;
	var user=attributes.mongo_user.first_name;
	console.log(JSON.stringify(attributes));
    var setBooking = "Insert into booking (mongo_id, module, start_date, end_date, source, destination, price, email) " +
    "VALUES('" + mongo_id + "','" + module + "','" + start_date + "','" + end_date + "','" + source + "','" + destination + "','" + price + "','" + email + "')";
	console.log(setBooking);
	mysql.insertData(function (err, result) {
	    if (err) {
	        console.log(err);
	    }
	    else {
	        console.log("Successfully inserted details in MYSQL");
	        mailobj={
	        		"email": email,
	        		"bookingId":result.insertId,
	        		"booking": module,
	        		"destination": destination,
	        		"carModel": carModel,
	        		"carBrand":carBrand,
	        		"rentalAgency":rentalAgency,
	        		"startdate": start_date,
	        		"enddate":end_date,
	        		"amount":price,
	        		"user": user
	        }
	        sendmail(mailobj);
	    	var respon={"statusCode":200};
	    	resp.send(respon);
	    }
	}, setBooking);
}

function sendmail(obj){
    var mailOptions={
            to : obj['email'],
            subject : "Congratulations for your Rental Car Booking",
            html:
                '<p><b>Hello '+obj["user"]+'</b></p>' +
                '<p>You have successfully booked <b>'+obj["carModel"]+' '+obj["carBrand"]+
                '</b> in <b>'+obj["destination"]+
                '</b> with Rental company <b>'+obj["rentalAgency"]+
                '</b> from <b>'+obj["startdate"]+
                '</b> to <b>'+obj["enddate"]+
                '</b> for <b>$'+obj["amount"]+
                '</b>.<br/></p>'+'<p><b>Your Booking Id is: '+obj["bookingId"]+
                '</b>.'+'<p>If you have any questions with your booking please reach out to ITA team at <b>intelligenttravelagent@gmail.com</b> or login to your online account.</b> </p>'
                +'<p>Regards,<br/> ITA Team</p>'
        }
        console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
         }else{
                console.log("Message sent: " + response);
             }
    });
 };

