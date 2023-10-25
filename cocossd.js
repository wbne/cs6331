// Notice there is no 'import' statement. 'cocoSsd' and 'tf' is
// available on the index-page because of the script tag above.
let model;

window.onload = (event) => {
  console.log("page is fully loaded");
  loadModel();
};

async function loadModel() {
	console.time('model');
	model = await cocoSsd.load();
	console.timeEnd('model');
}

async function scanCanvas() {
	const img = document.getElementById('canvas');
	if(img == null || model == null)
		return;

	// NOTE: about 40ms to parse
	//console.time('predictions');
	let result = await model.detect(img);
	//console.timeEnd('predictions');
	//console.log(result);

	const c = document.getElementById('canvas');
	const context = c.getContext('2d');
	context.font = '10px Arial';

	drawVideo();
	for (let i = 0; i < result.length; i++) {
		context.beginPath();
		context.rect(...result[i].bbox);
		context.lineWidth = 4;
		context.strokeStyle = 'green';
		context.fillStyle = 'green';
		context.stroke();
		context.fillText(
		result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
		result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
	}

}
