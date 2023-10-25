var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var outputContainer = document.getElementById("output");
var outputMessage = document.getElementById("outputMessage");
var outputData = document.getElementById("outputData");
const frame = document.getElementById("page");
frame.hidden = true;

function drawLine(begin, end, color) {
	canvas.beginPath();
	canvas.moveTo(begin.x, begin.y);
	canvas.lineTo(end.x, end.y);
	canvas.lineWidth = 4;
	canvas.strokeStyle = color;
	canvas.stroke();
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
	video.srcObject = stream;
	video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
	video.play();
	requestAnimationFrame(tick);
});

var scanned = false;
let coords;
let data;
let overlay;
let countdown = 0;
function tick() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
	  coords = code.location;
	  countdown = 50;
	  let newData = code.data;
          //drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
          //drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
          //drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
          //drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
	  let xDiff = code.location.bottomRightCorner.x - code.location.topLeftCorner.x;
	  let yDiff = code.location.bottomRightCorner.y - code.location.topLeftCorner.y;
	  if(newData !== data) {
		console.log(code);
		if(overlay != null)
		  overlay.remove();
		overlay = createFrame(newData, xDiff, yDiff);
		data = newData;
	  }

	  transformFrame(code);
        } 
	else {
		countdown--;
		if(countdown <= 0 && overlay != null) {
			countdown = 0;	
			overlay.remove();
			data = null;
		}
	}
      }
      requestAnimationFrame(tick);
    }

document.body.onclick = function(anEvent) {
	//console.log(anEvent);
	let htmlElement = document.getElementById("canvas");
	let xRatio = video.videoWidth / htmlElement.clientWidth;
	let yRatio = video.videoHeight / htmlElement.clientHeight;
	let x = (anEvent.clientX - htmlElement.offsetLeft) * xRatio;
	let y = (anEvent.clientY - htmlElement.offsetTop) * yRatio;
	//console.log(xRatio, yRatio);
	//console.log(x, y);
	let clickedCode = false;
	if(coords == null)
		return;
	if(coords.topLeftCorner.x < x && coords.topRightCorner.x > x) {
		if(coords.topLeftCorner.y < y && coords.bottomLeftCorner.y > y) {
			console.log("You clicked on the qr code");
			clickedCode = true;
		}
	}
	if(clickedCode)
		pullUpPage();
	else
		pullDownPage();
	
};

function pullUpPage() {
	frame.hidden = false;
	frame.src = data;
}

function pullDownPage() {
	frame.hidden = true;
	frame.src = "";
}
