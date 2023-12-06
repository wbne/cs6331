function adjugate(m) { // Compute the adjugate of m
    return [
        m[4]*m[8]-m[7]*m[5],m[7]*m[2]-m[1]*m[8],m[1]*m[5]-m[4]*m[2],
        m[6]*m[5]-m[3]*m[8],m[0]*m[8]-m[6]*m[2],m[3]*m[2]-m[0]*m[5],
        m[3]*m[7]-m[6]*m[4],m[6]*m[1]-m[0]*m[7],m[0]*m[4]-m[3]*m[1]
    ];
}

function multiply(a,b) { // multiply two matrices
    a = [
        a[0],a[3],a[6],
        a[1],a[4],a[7],
        a[2],a[5],a[8]
    ];

    b = [
        b[0],b[3],b[6],
        b[1],b[4],b[7],
        b[2],b[5],b[8]
    ];

    var m = Array(9);

    for (var i = 0; i != 3; ++i) {
        for (var j = 0; j != 3; ++j) {
            var mij = 0;
            for (var k = 0; k != 3; ++k) {
                mij += a[3*i + k]*b[3*k + j];
            }
            m[3*i + j] = mij;
        }
    }

    return [
        m[0],m[3],m[6],
        m[1],m[4],m[7],
        m[2],m[5],m[8]
    ];
}

function apply(m,v) { // multiply matrix and vector
    return [
        m[0]*v[0] + m[3]*v[1] + m[6]*v[2],
        m[1]*v[0] + m[4]*v[1] + m[7]*v[2],
        m[2]*v[0] + m[5]*v[1] + m[8]*v[2]
    ];
}


let iframe;
let s;
let v;
let frameLength = "400px";
let embed;
function createFrame(url) {
	if(overlayExists == true || url == undefined)
		return;
	let ENDPOINT = "http://localhost:8000/";
	let THE_DATA = "Error. Nothing loaded!";
	url = url.split("://")[1];
	url = url.replaceAll("/", "SLASHINGTON");
	startLoading();
	fetch("http://localhost:8000/" + url)
			.then(response => response.json())
			.then((value) => {
				THE_DATA = value.data;

				let offsetLeft = document.getElementById("canvas").offsetLeft;
				let offsetTop = document.getElementById("canvas").offsetHeight;
				iframe = document.createElement("div");
				iframe.innerHTML = THE_DATA;
				iframe.style.position = "absolute";
				iframe.style.left = offsetLeft + "px";
				iframe.style.top = "0px";
				iframe.style.transformOrigin = "0 0";
				iframe.style.height = frameLength;
				iframe.style.width = frameLength;
				iframe.style.overflow = "hidden";
				iframe.style.background = "white";

				stopLoading();
				document.body.appendChild(iframe);

				s = [
				    0,0,1,
				    iframe.offsetWidth,0,1,
				    0,iframe.offsetHeight,1
				];

				v = apply(adjugate(s),[iframe.offsetWidth,iframe.offsetHeight,1]);

				s = multiply(s,[
				    v[0], 0, 0,
				    0, v[1], 0,
				    0, 0, v[2]
				]);
				overlay = iframe;
	});
}

function transformFrame(code) {
	let htmlElement = document.getElementById("canvas");
	let xRatio = video.videoWidth / htmlElement.clientWidth;
	let yRatio = video.videoHeight / htmlElement.clientHeight;
	var d = [
	    code.location.topLeftCorner.x / xRatio, code.location.topLeftCorner.y / yRatio,1,
	    code.location.topRightCorner.x / xRatio, code.location.topRightCorner.y / yRatio,1,
	    code.location.bottomLeftCorner.x / xRatio, code.location.bottomLeftCorner.y / yRatio,1
	];

	var v = apply(adjugate(d),[code.location.bottomRightCorner.x / xRatio, code.location.bottomRightCorner.y / yRatio,1]);

	d = multiply(d,[
	    v[0],0,0,
	    0,v[1],0,
	    0,0,v[2]
	]);

	if(s == null || s == undefined)
		return;
	var t = multiply(d,adjugate(s));

	for (i = 0; i < 9; ++i) {
	    t[i] = t[i] / t[8];
	    t[i] = Math.abs(t[i]) < Number.EPSILON ? 0 : t[i];
	}

	t = [
	    t[0],t[1],0,t[2],
	    t[3],t[4],0,t[5],
	    0,0,1,0,
	    t[6],t[7],0,t[8]
	];

	iframe.style.transform = "matrix3d(" + t.join(", ") + ")";

}

