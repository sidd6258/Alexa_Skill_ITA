var showModalCtrl = function ($scope, $modalInstance, $sharedContestProperties) {
    $scope.main = $sharedContestProperties.getProperty("main");
    console.log("$scope.main showModalCtrl "+JSON.stringify($scope.main));
    $scope.mId = $sharedContestProperties.getProperty("mId");
    //console.log("$scope.mId "+$scope.mId);
    $scope.selectedModule = $sharedContestProperties.getProperty("selectedModule");
    //console.log("$scope.selectedModule "+$scope.selectedModule);
    $scope.sDate = $sharedContestProperties.getProperty("sDate");
    $scope.eDate = $sharedContestProperties.getProperty("eDate");
    if($scope.selectedModule === "car"){
        for(var i=0; i<$scope.main.carData.length; i++){
            if($scope.main.carData[i]._id == $scope.mId){
                $scope.data = $scope.main.carData[i];
            }
        }
    }else if($scope.selectedModule === "flight"){
        for(var i=0; i<$scope.main.flightData.length; i++){
            if($scope.main.flightData[i]._id == $scope.mId){
                $scope.data = $scope.main.flightData[i];
            }
        }
    }else{
        for(var i=0; i<$scope.main.hotelData.length; i++){
            if($scope.main.hotelData[i]._id == $scope.mId){
                $scope.data = $scope.main.hotelData[i];
            }
        }
    }
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
app.controller('bookingController',function($scope,$http, $sharedContestProperties) {
    console.log("Inside bookingController");
    $scope.filter = "";
    $scope.itemsPerPage = 20;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage1 = 15;
    $scope.currentPage1 = 1;
    $scope.itemsPerPage2 = 15;
    $scope.currentPage2 = 1;
    $scope.maxSize1 = 5;
    $scope.displayMap = false;
    $scope.sortReverse = false;
    $scope.sortType = 'booking_id';
    $scope.chartFlightConfig = {};
    $scope.chartCarConfig = {};
    $scope.chartHotelConfig = {};
    $scope.init = function(value){
        $scope.email = value;
        $http({
            method : "POST",
            data :{
                "email" : $scope.email
            },
            url : '/bookingFuture'
        }).success(function(data){
            console.log("Inside success of bookingFuture Controller");
            if (data.statusCode == 401) {
                $scope.invalid_login = false;
                $scope.unexpected_error = true;
            } else {
                $scope.fullFutureData = data;
                console.log("fullFutureData------->"+JSON.stringify($scope.fullFutureData));
            }
        }).error(function (error){
            $scope.invalid_login = true;
            $scope.unexpected_error = false;
        });
        $http({
            method : "POST",
            data :{
                "email" : $scope.email
            },
            url : '/bookingHistory'
        }).success(function(data){
            console.log("Inside success of bookingController");
            if (data.statusCode == 401) {
                $scope.invalid_login = false;
                $scope.unexpected_error = true;
            } else {
                $scope.fullData = data;
                $scope.flightDates = [];
                $scope.carDates = [];
                $scope.hotelDates = [];
                $scope.priceFlight = [];
                $scope.priceCar = [];
                $scope.priceHotel = [];
                for (var i = 0; i < data.data.length; i++) {
                    if (data.data[i].module == 'flight') {
                        $scope.flightDates.push(data.data[i].start_date);
                        $scope.priceFlight.push(parseFloat((data.data[i].price).replace(/[^\d.]/g, '')));
                    } else if (data.data[i].module == 'car') {
                        $scope.carDates.push(data.data[i].start_date);
                        $scope.priceCar.push(parseFloat((data.data[i].price).replace(/[^\d.]/g, '')));
                    } else {
                        $scope.hotelDates.push(data.data[i].start_date);
                        $scope.priceHotel.push(parseFloat((data.data[i].price).replace(/[^\d.]/g, '')));
                    }
                }
                $scope.chartFlightConfig = {
                    options: {
                        chart: {
                            type: 'bar'
                        }
                    },
                    title: {
                        text: 'Flight Module Usage'
                    },
                    yAxis: {
                        title: {
                            text: 'Purchased Price'
                        }
                    },
                    xAxis: {
                        title: {
                            text: 'Flight\'s Booked Dates',
                        },
                        categories: $scope.flightDates
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: true
                            },
                            enableMouseTracking: true
                        }
                    },
                    series: [
                        {
                            name: 'Flights',
                            data: $scope.priceFlight
                        }
                    ]
                };
                $scope.chartCarConfig = {
                    options: {
                        chart: {
                            type: 'bar'
                        }
                    },
                    title: {
                        text: 'Car Module Usage'
                    },
                    yAxis: {
                        title: {
                            text: 'Purchased Price'
                        }
                    },
                    xAxis: {
                        title: {
                            text: 'Car\'s Booked Dates'
                        },
                        categories: $scope.carDates
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: true
                            },
                            enableMouseTracking: true
                        }
                    },
                    series: [
                        {
                            name: 'Cars',
                            data: $scope.priceCar
                        }
                    ]
                };
                $scope.chartHotelConfig = {
                    options: {
                        chart: {
                            type: 'bar'
                        }
                    },
                    title: {
                        text: 'Hotel Module Usage'
                    },
                    yAxis: {
                        title: {
                            text: 'Purchased Price'
                        }
                    },
                    xAxis: {
                        title: {
                            text: 'Hotel\'s Booked Dates'
                        },
                        categories: $scope.hotelDates
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: true
                            },
                            enableMouseTracking: true
                        }
                    },
                    series: [
                        {
                            name: 'Hotels',
                            data: $scope.priceHotel
                        }
                    ]
                };
            }
            $scope.showMap = function(val){
                $scope.displayMap = true;
                initiate(val);
            };
        }).error(function (error){
            $scope.invalid_login = true;
            $scope.unexpected_error = false;
        });
    };
    $scope.showModal = function($scope, $modal, $window, $location, $sharedContestProperties) {
        $scope.setValue = function (main, val, selectedModule, sDate, eDate) {
            $sharedContestProperties.setProperty("mId", val);
            $sharedContestProperties.setProperty("main", main);
            $sharedContestProperties.setProperty("selectedModule", selectedModule);
            $sharedContestProperties.setProperty("sDate", sDate);
            $sharedContestProperties.setProperty("eDate", eDate);
        };
        $scope.cancelBooking = function(id){
            console.log("Booking Id "+id);
            var r = confirm("Are you sure you want to cancel this booking?");
            if (r) {
                $http({
                    method: "POST",
                    data: {
                        "bookingId": id
                    },
                    url: '/bookingCancel'
                }).success(function (data) {
                    console.log("Inside success of bookingController");
                    if (data.statusCode == 401) {
                        $scope.invalid_login = false;
                        $scope.unexpected_error = true;
                    } else {
                        $window.location.reload();
                    }
                });
            }
        };
        $scope.open = function () {
            var showModalInstance = $modal.open({
                templateUrl: 'showModal.html',
                controller: showModalCtrl,
                windowClass: 'app-modal-window'
            });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
});