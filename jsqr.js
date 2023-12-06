var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var outputContainer = document.getElementById("output");
var outputMessage = document.getElementById("outputMessage");
var outputData = document.getElementById("outputData");
let userURL = document.getElementById("url");
let copyButton = document.getElementById("copy");
let openButton = document.getElementById("open");
let overlayExists = false;

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
		if(overlay !== null && overlay !== undefined) {
			overlay.remove();
		}
		//overlay = createFrame(newData, xDiff, yDiff);
		createFrame(newData);
		data = newData;
		userURL.innerHTML = newData;
		openButton.setAttribute("href", newData);
		openButton.setAttribute("target", "_blank");
		openButton.innerHTML = "<button> Open in new tab</button>";
	  }

	  transformFrame(code);
        } 
	else {
		countdown--;
		if(countdown <= 0 && overlay != null) {
			countdown = 0;	
			overlay.remove();
			data = null;
			userURL.innerHTML = "";
			openButton.innerHTML = "<button>Open in new tab</button>";
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
			clickedCode = true;
		}
	}
	if(clickedCode && overlayExists == false)
		pullUpPage();
	else
		pullDownPage();
	
};

let visiblePage; 
function pullUpPage() {
	if(visiblePage !== undefined && visiblePage !== null)
		visiblePage.remove();
	let iframe;
	data = data.split("://")[1];
	data = data.replaceAll("/", "SLASHINGTON");
	startLoading();
	overlayExists = true;
	fetch("http://localhost:8000/" + data)
			.then(response => response.json())
			.then((value) => {
				THE_DATA = value.data;

				let offsetLeft = document.getElementById("canvas").offsetLeft;
				let offsetTop = document.getElementById("canvas").offsetHeight;
				iframe = document.createElement("div");
				iframe.setAttribute("class", "slider close");
				iframe.innerHTML = THE_DATA;
				iframe.style.left = offsetLeft + "px";
				iframe.style.transformOrigin = "0 0";
				iframe.style.width = canvasElement.clientWidth + "px";

				document.body.appendChild(iframe);

				visiblePage = iframe;
				
				setTimeout(pullUpAnimation, 100);
	});
}

function startLoading() {
	const load = document.getElementById("loading");
	load.removeAttribute("hidden");
}

function stopLoading() {
	const load = document.getElementById("loading");
	load.setAttribute("hidden", "true");
}

function pullUpAnimation() {
	stopLoading();
	visiblePage.setAttribute("class", "slider");
}

function pullDownPage() {
	if(visiblePage !== undefined && visiblePage !== null) {
		visiblePage.setAttribute("class", "slider close");
		overlayExists = false;
		setTimeout(deleteOverlay, 2000);
	}
}

function deleteOverlay() {
	document.body.removeChild(visiblePage);
}

copyButton.addEventListener("click", (event) => {
	if(!navigator.clipboard) {
		userURL.focus();
		userURL.select();
		let code = document.execCommand('copy');
		let status = code ? 'not sad' : 'sad';
		console.log(status, userURL);
	}
	else {
		navigator.clipboard.writeText(userURL.innerHTML);
	}
});

