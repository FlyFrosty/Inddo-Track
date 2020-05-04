import document from "document";
import clock from "clock";

import { today } from 'user-activity';
import { me } from "appbit";
import { display } from "display";

let mainView = document.getElementById("mainView");

//Big numbers while running
let myLaps = document.getElementById("myLaps");
let lapTime = document.getElementById("lapTime");
let lapCount = document.getElementById("lapCount");

//small top right info
let topLap = document.getElementById("topLap");
let botLap = document.getElementById("botLap");
let lastLapText = document.getElementById("lastLapText");
let currLapText = document.getElementById("currLapText");

let btnBr = document.getElementById("btn-br");
let btnTr = document.getElementById("btn-tr");

//End of run screen
let summary = document.getElementById("summary");
let summaryView = document.getElementById("summaryView");
let totLaps = document.getElementById("totLaps");
let totTimeShaddow = document.getElementById("totTimeShaddow");
let totLapsShaddow = document.getElementById("totLapsShaddow");
let totTime = document.getElementById("totTime");
let timeMrkr = document.getElementById("timeMrkr");
let lapMrkr = document.getElementById("lapMrkr");
let lapMrkrShaddow = document.getElementById("lapMrkrShaddow");
let timeMrkrShaddow = document.getElementById("timeMrkrShaddow");

let VTList = document.getElementById("my-list");

let interval;
let running = "Start";
let lapCounter = 0;

let pauseStart = 0;
let pauseEnd = 0;
let pauseLapSum = 0;  //Total pause time per lap
let pauseTot = 0;  //Total pause time per run

var history = new Array();
let actLapTime = new Array();

let NUM_ELEMS = 100;

lapCount.text = "0";
lapTime.text = "00:00";
topLap.text = "00:00";
botLap.text = "00:00";
lastLapText.text = "Curr";
currLapText.text = "Prev";

me.appTimeoutEnabled = false;

//Function that returns a configure "00:00"
function minSec(numTime) {
  let totDifSec = 0;
  let totDifMin = 0;  
  let totDif = Math.round(numTime/1000);
  if (totDif < 10) {
    totDifSec = "0" + totDif;
    totDifMin = "00";
  } else if (totDif > 59) {
    totDifMin = Math.floor(totDif / 60);
    if (totDifMin < 10) {
      totDifMin = "0" + totDifMin;
    }
    totDifSec = totDif - (60 * totDifMin);
    if (totDifSec < 10) {
      totDifSec = "0" + totDifSec;
    }
  } else {
    totDifMin = "00";
    totDifSec = totDif;
  }    
  return totDifMin + ":" + totDifSec;  
};
    
 
//Resets the watch if stopped to new
function finish() {
      
  lapMrkr.text = "Laps";
  timeMrkr.text = "Time";
  lapMrkrShaddow.text = "Laps";
  timeMrkrShaddow.text = "Time"; 

  let myDiff1 = history[lapCounter] - history[0] - pauseTot;
  totTime.text = minSec(myDiff1);
  totTimeShaddow.text = minSec(myDiff1);
  totLaps.text = lapCounter;
  totLapsShaddow.text = lapCounter; 
  
  
  //Zero out time's of unused slots less than ten for the final screen  
  if (lapCounter < 100) {
    for(var i=lapCounter; i < 100; i++) {
      actLapTime[i] = 0;
    }
  }  
  
  //Create new array to ensure first la is shown
  let endLapTime = new Array(); 
  var i;
  for (i=0; i < 100; i++) {
    endLapTime[i+1] = actLapTime[i];
  }
  actLapTime = endLapTime;
  actLapTime[0] = actLapTime[1];
  
  //Scroll Display
  VTList.delegate = {
    getTileInfo: function(index) {   
      return {
        type: "my-pool", 
        value: minSec(actLapTime[index]),
        index: index 
      };
    },  
    configureTile: function(tile, info) {
      if (info.type == "my-pool") {
        tile.getElementById("text").text = `${info.index}  ${info.value}`;
        console.log(`config loop ${info.index}  ${info.value}`);
      }
    }
  }
  
  // VTList.length must be set AFTER VTList.delegate
  VTList.length = NUM_ELEMS; 
 
};

//Controls what happens when a new lap is marked
function newLap() {
  if (running !== "Start") {
    console.log("BR not Start");
    if (running === "Started") {
      console.log("BR running is Started");
      //advance the lap counter
      lapCounter = lapCounter + 1;
      lapCount.text = lapCounter;
      //Store then shift the top lap down one
      history[lapCounter] = Date.now();
      actLapTime[lapCounter - 1] = history[lapCounter] - history[lapCounter - 1] - pauseLapSum;
      console.log(`BR Started actLapTime ${actLapTime[lapCounter]}`);
      console.log(`BR Started lap number ${lapCounter}`);  
      botLap.text = minSec(actLapTime[lapCounter - 1]);
      //Reset the top lap to 0
      topLap.text = "00:00";
      pauseLapSum = 0;
    } else if (running === "Paused"){
      //this ends the running
      console.log("BR running is Paused");
      clearInterval(interval);
      
      //Clear the screen
      mainView.style.display = "none";
      summary.style.display = "inline";
      
      finish();
 
    } else if (running === "Running") {
      console.log("BR running is else");
      //Reset the lap pause time and start a new lap
      //advance the lap counter
      lapCounter = lapCounter + 1;
      lapCount.text = lapCounter;
      //Store then shift the top lap down one
      history[lapCounter] = Date.now();
      actLapTime[lapCounter - 1] = history[lapCounter] - history[lapCounter - 1] - pauseLapSum;
      console.log(`BR else actLapTime ${actLapTime[lapCounter - 1]}`);
      console.log(`BR else lap number ${lapCounter}`);  
      botLap.text = minSec(actLapTime[lapCounter - 1]);
      //Reset the top lap to 0
      pauseLapSum = 0;
      topLap.text = "00:00";      
    };
  } else {
    console.log("Not yet started");
  };
  
}

//Bottom Right Button is pressed
btnBr.onactivate = function(evt) {
  newLap();
};


// Treat the time indicator as a lap counter button
lapTime.onclick = function(e) {
  newLap();
}

//Treat the lap indicator as a lap counter button
lapCount.onclick = function(e) {
  newLap();
}

// Top Right button is pressed
btnTr.onactivate = function(evt) {
  //Check to see if the start time has been recorded
  if (running === "Start") {
    me.appTimeoutEnabled = false;
    console.log("TR Start");
    history[0] = Date.now();
    actLapTime[0] = 0;
    btnTr.style.fill="yellow";
    running = "Started";
    console.log("TR running changed to Started")
  };
   
  //Check for different states and act on them
  //This only works before a first pause
  if (running === "Started") {
    console.log("TR Started");
    //Run the clocks with no pauses
    interval = setInterval(function() {
      //Display the main clock
      lapTime.text = minSec(Date.now() - history[0]);      
      //Show the lap time
      topLap.text = minSec(Date.now() - history[lapCounter]);
    }, 500);
    running = "Running";
    console.log("TR running changed to Running");
  } else if (running === "Running") {
    //Pauses the clock and record the time
    clearInterval(interval);
    pauseStart = Date.now();
    btnTr.style.fill="green";
    btnBr.style.fill="red";    
    running = "Paused";
    console.log("TR running changed to Paused from Running");
  } else if (running === "Paused") {
    //End the pause, start the clock and record the differences
    pauseEnd = Date.now();
    pauseLapSum = pauseLapSum + (pauseEnd - pauseStart);
    pauseEnd = 0;
    pauseStart = 0;
    pauseTot = pauseTot + pauseLapSum;
    btnTr.style.fill="yellow";
    btnBr.style.fill="green";    
    //Start the clock loops subtracting pause times
    interval = setInterval(function() {
      //Display the main clock
      lapTime.text = minSec(Date.now() - history[0] - pauseTot);      
      //Show the lap time
      topLap.text = minSec(Date.now() - history[lapCounter] - pauseLapSum);
    }, 500);  
    running = "Running";
    console.log("TR running changed to Running from Paused")
  };
};

