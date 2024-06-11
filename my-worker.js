//import * as THREE from "./js/three.js";
self.importScripts("./js/three.js");

var mainScene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);
var scene = new THREE.Group();
mainScene.add(scene);
mainScene.add(camera);

var planeSize     =  15.00;
var planeSegments = 300.00;
var vObjHeight    =   1.20;
var vObjRatio     =   1.00;
var adjustX       =   0.00;
var adjustZ       =   0.00;

var maskMat = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide
});

var shadowMat = new THREE.ShadowMaterial({
//	opacity: 0.75,
	side: THREE.DoubleSide,
});


var light = new THREE.DirectionalLight(0xffffff);
var d = vObjRatio * vObjHeight * 40;
light.shadow.camera.left   = -d;
light.shadow.camera.right  =  d;
light.shadow.camera.top    =  d;
light.shadow.camera.bottom = -d;

light.shadow.mapSize.width  = 4096;
light.shadow.mapSize.height = 4096;

var cube  = new THREE.BoxGeometry(vObjHeight, vObjHeight * vObjRatio, vObjHeight);
var plane = new THREE.PlaneGeometry(planeSize, planeSize, planeSegments, planeSegments);

var emptyObj    = new THREE.Mesh();
var vObj        = new THREE.Mesh(cube,  maskMat);
var shadowPlane = new THREE.Mesh(plane, shadowMat);

vObj.position.set(adjustX, vObjRatio * vObjHeight / 2, adjustZ);
camera.position.set(0, 9, 12);

camera.lookAt(new THREE.Vector3(0, 0, 0));

light.castShadow          = true;
shadowPlane.receiveShadow = true;
vObj.castShadow           = true;

shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -0.05;

scene.add(vObj);
scene.add(shadowPlane);
scene.add(emptyObj);
scene.add(light);

self.onmessage = function(e)
{
	var params = e.data.split(" ");
	var p = new THREE.Matrix4();
	for (var i = 0; i < 16; i++)
	{
		p.elements[i] = parseFloat(params[i]);
		camera.projectionMatrix.elements[i] = parseFloat(params[i + 16]);
		//camera.projectionMatrixInverse.elements[i] = parseFloat(params[i + 32]);
	}
	var rendW = parseInt(params[48]);
	var rendH = parseInt(params[49]);
	scene.applyMatrix4(p);
	scene.updateMatrix(true);
	scene.updateMatrixWorld(true);
	camera.updateMatrixWorld(true);

	var v0 = new THREE.Vector3(parseFloat(params[50]), parseFloat(params[51]), parseFloat(params[52]));
	var v1 = new THREE.Vector3(parseFloat(params[53]), parseFloat(params[54]), parseFloat(params[55]));
	var k = 56;
	while (k < params.length)
		mask.push(parseInt(params[k++]));

	var result = getRenderValue(v0, v1, mask)
	console.log(result);
	self.postMessage(result);
	self.close();
};

function getRenderValue(v0, v1, mask)
{
	var w  = rendW;
	var h  = rendH;
	var cw = (w > h) ? Math.floor((w / h) * 256) : 256;
	var ch = (h > w) ? Math.floor((h / w) * 256) : 256;
	var pw = Math.floor((cw - 256) / 2);
	var ph = Math.floor((ch - 256) / 2);
	var padw = (w > h) ? Math.floor((w - h) / 2.0) : 0;
	var padh = (h > w) ? Math.floor((h - w) / 2.0) : 0;

	var canvas = new OffscreenCanvas(cw, ch);
	var ctx = canvas.getContext("2d", {willReadFrequently: true});

	var renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
//		antialias: true,
//		alpha: true
	});
	renderer.setClearColor(new THREE.Color("white"), 0);
	renderer.setSize(rendW, rendH);
	renderer.shadowMap.enabled = true;

	light.position.set(v1.x, v1.y, v1.z);
	emptyObj.position.set(v0.x, v0.y, v0.z);
	ctx.fillStyle = "white";
	renderer.render(mainScene, camera);
	ctx.fillRect(0, 0, cw, ch);
	ctx.drawImage(renderer.domElement, 0, 0, w, h, 0, 0, cw, ch);
	var c00 = 0;
	var c01 = 0;
	var c10 = 0;
	var c11 = 0;
	var img = ctx.getImageData(pw, ph, 256, 256);
	for (var j = 0; j < 65536; j++)
	{
		var c = (img.data[j * 4] == 255) ? 1 : 0;
		if (c == 0 && mask[j] == 0)
			c00++;
		else if (c == 0 && mask[j] == 1)
			c01++;
		else if (c == 1 && mask[j] == 0)
			c10++;
		else
			c11++;
	}

	var img1, img2;
	if (w > h)
	{
		img1 = ctx.getImageData(0, 0, pw, 256);
		img2 = ctx.getImageData(cw - pw, 0, pw, 256);
		n = pw * 256;
	}
	else
	{
		img1 = ctx.getImageData(0, 0, 256, ph);
		img2 = ctx.getImageData(0, ch - ph, 256, ph);
		n = ph * 256;
	}
	for (var j = 0; j < n; j++)
	{
		if (img1.data[j * 4] == 0)
			c01++;
		if (img2.data[j * 4] == 0)
			c01++;
	}

	var val = 0;
	var uni = c00 + c01 + c10;
	var ins = c00;
	if (uni > 0)
		val = parseFloat(ins) / parseFloat(uni);
	return val;
}
