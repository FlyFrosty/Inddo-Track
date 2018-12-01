import document from "document";
import clock from "clock";

import { today } from 'user-activity';

import { me } from "appbit";
import { display } from "display";

let mainView = document.getElementById("mainView");
let myLaps = document.getElementById("myLaps");
let lapTime = document.getElementById("lapTime");
let lapCount = document.getElementById("lapCount");

let subLap1 = document.getElementById("subLap1");
let subLap2 = document.getElementById("subLap2");
let lastLapText = document.getElementById("lastLapText");
let prevLapText = document.getElementById("prevLapText");

let btnBr = document.getElementById("btn-br");
let btnTr = document.getElementById("btn-tr");

let summary = document.getElementById("summary");
let totLaps = document.getElementById("totLaps");
let totTime = document.getElementById("totTime");
let timeMrkr = document.getElementById("timeMrkr");
let lapMrkr = document.getElementById("lapMrkr");

let mins = 0;
let seconds = 0;
let interval;
let running = 0;
let lapCounter = 0;
let myDiffSec2;
let myDiffMin2;
let myLapDif;

let endTime = 0; 
let myPause = 0;

var history = new Array();

lapCount.text = "0";
lapTime.text = "00:00";
subLap1.text = "0:00";
subLap2.text = "0:00";
lastLapText.text = "Recent";
prevLapText.text = "Curr";


function goStopBtn() {
  seconds++;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (seconds > 59) {
    seconds = seconds - 60;
    if (seconds < 9) {
      seconds = "0" + seconds;
    }
    mins++;
  }
  if (mins < 10) {
    lapTime.text = `0` + mins + `:` + seconds; 
  } else {
    lapTime.text = mins + `:` + seconds;
  }
  
  myLapDif = Date.now() - history[lapCounter];

  myLapDif = Math.round(myLapDif/1000);
  if (myLapDif < 10) {
    myDiffSec2 = "0" + myLapDif;
    myDiffMin2 = "0";
  } else if (myLapDif > 59) {
    myDiffMin2 = Math.floor(myLapDif / 60);
    myDiffSec2 = myLapDif - (60 * myDiffMin2);
    if (myDiffSec2 < 10) {
      myDiffSec2 = "0" + myDiffSec2;
    }
  } else {
    myDiffMin2 = "0";
    myDiffSec2 = myLapDif;
  }
  subLap2.text = myDiffMin2 + ":" + myDiffSec2;
};


function lapBtn() {
  let myDiffMin1;
  let myDiffSec1;
  
  lapCounter = lapCounter + 1;
  lapCount.text = lapCounter;
  
  //Sets the previous lap to time now to get accurate count
  if (myPause === 1) {
    history[lapCounter - 1] = Date.now();
    history[lapCounter] = Date.now();
  } else {
    history[lapCounter] = Date.now();
  };

  myPause = 0;
  
  if (lapCounter === 1) {
    subLap2.text = "0:00";
  } else {
    subLap2.text = subLap1.text;
  }
  
  let myDiff1 = history[lapCounter] - history[lapCounter - 1];
  
  myDiff1 = Math.round(myDiff1/1000);
  if (myDiff1 < 10) {
    myDiffSec1 = "0" + myDiff1;
    myDiffMin1 = "0";
  } else if (myDiff1 > 59) {
    myDiffMin1 = Math.floor(myDiff1 / 60);
    myDiffSec1 = myDiff1 - (60 * myDiffMin1);
    if (myDiffSec1 < 10) {
      myDiffSec1 = "0" + myDiffSec1;
    }
  } else {
    myDiffMin1 = "0";
    myDiffSec1 = myDiff1;
  }
  subLap1.text = myDiffMin1 + ":" + myDiffSec1;
};

//Resets the watch if stopped to new
function finish() {
  let myDiffSec1;
  let myDiffMin1;
  
 
  //Clear the screen
  mainView.style.display = "none";
  
  lapMrkr.text = "Laps";
  timeMrkr.text = "Total Time";
  
  let myDiff1 = endTime - history[0];
  
  myDiff1 = Math.round(myDiff1/1000);
  if (myDiff1 < 10) {
    myDiffSec1 = "0" + myDiff1;
    myDiffMin1 = "0";
  } else if (myDiff1 > 59) {
    myDiffMin1 = Math.floor(myDiff1 / 60);
    myDiffSec1 = myDiff1 - (60 * myDiffMin1);
    if (myDiffSec1 < 10) {
      myDiffSec1 = "0" + myDiffSec1;
    }
  } else {
    myDiffMin1 = "0";
    myDiffSec1 = myDiff1;
  }
  totTime.text = myDiffMin1 + ":" + myDiffSec1;
  totLaps.text = lapCounter;
  summary.style.display = "inline";  
  
  lapCounter = 0;
  lapCount.text = "0";
  mins = 0;
  seconds = 0;
  lapTime.text = "00:00";
  running = 0;
  subLap1.text = "0:00";
  subLap2.text = "0:00";
  btnTr.style.fill="green";
  btnBr.style.fill="green";
  myPause = 0;
  me.appTimeoutEnabled = true;
 
}


btnBr.onactivate = function(evt) {
  if (running === 2) {
    finish();
  } else if (running === 1) {lapBtn()}; 
}

btnTr.onactivate = function(evt) {
  if (running === 0) {
    me.appTimeoutEnabled = false;
    history[0] = Date.now();
    console.log(`Base Time = ${history[0]}`);
    running = 1;
    btnTr.style.fill="yellow";
    interval = setInterval(goStopBtn, 1000);
  } else if (running === 1) {
    clearInterval(interval);
    endTime = Date.now();
    running = 2;
    btnTr.style.fill="green";
    btnBr.style.fill="fb-red";
  } else if (running === 2) {
    clearInterval(interval);
    myPause = 1;
    running = 1;
    btnTr.style.fill="yellow";
    btnBr.style.fill="green";
    interval = setInterval(goStopBtn, 1000);
  }
}

lapCount.onclick = function(e) {
  if (running !==0) {lapBtn()};
}

lapTime.onclick = function(e) {
  if (running !==0) {lapBtn()};
}