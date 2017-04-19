// Using IIFE for Implementing Module Pattern to keep the Local Space for the JS Variables
(function() {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var serverUrl = "/",
        members = [],
        pusher = new Pusher('<your-api-key>', {
          encrypted: true
        }),
        channel,weatherChartRef;

    function showEle(elementId){
      document.getElementById(elementId).style.display = 'flex';
    }

    function hideEle(elementId){
      document.getElementById(elementId).style.display = 'none';
    }

    function ajax(url, method, payload, successCallback){
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function () {
        if (xhr.readyState != 4 || xhr.status != 200) return;
        successCallback(xhr.responseText);
      };
      xhr.send(JSON.stringify(payload));
    }


   function renderWeatherChart(weatherData) {
      var ctx = document.getElementById("weatherChart").getContext("2d");
      var options = { };
      weatherChartRef = new Chart(ctx, {
        type: "line",
        data: weatherData,
        options: options
      });
  }

        var chartConfig = {
        labels: [],
        datasets: [
            {
                label: "London Weather",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
    };

  ajax("/getTemperature", "GET",{}, onFetchTempSuccess);

  function onFetchTempSuccess(response){
    hideEle("loader");
    var respData = JSON.parse(response);
    chartConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
    chartConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.temperature);
    renderWeatherChart(chartConfig)
  }

  channel = pusher.subscribe('london-temp-chart');
  channel.bind('new-temperature', function(data) {
    var newTempData = data.dataPoint;
    if(weatherChartRef.data.labels.length > 15){
      weatherChartRef.data.labels.shift();  
      weatherChartRef.data.datasets[0].data.shift();
    }
    weatherChartRef.data.labels.push(newTempData.time);
    weatherChartRef.data.datasets[0].data.push(newTempData.temperature);
    weatherChartRef.update();
  });


/* TEMP CODE FOR TESTING */
  var dummyTime = 1500;
  setInterval(function(){
    dummyTime = dummyTime + 10;
    ajax("/addTemperature?temperature="+ getRandomInt(10,20) +"&time="+dummyTime,"GET",{},() => {});
  }, 1000);

  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
/* TEMP CODE ENDS */

})();