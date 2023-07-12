var clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var camera, renderer1, renderer, renderer3, rend;
var mainScene1, mainScene2, mainScene3;
var scene1, scene2, scene3;
var emptyObj, vObj, vObjMask, shadowPlane, light, floor;
var hlObj, hlPoint, arrowHelper, gt, wObj, wPlane, dPlane;
var origLight, stoneSphere1, stoneSphere2, metalCylinder, woodCube, rubrikCube, stoneCube1, stoneCube2;
var asphaltFloor, stoneFloor, grassFloor;
var gtObj1, gtObj2, gtObj3, gtLine1, gtLine2, gtLine3, gtPlane, phase;
var adjustX, adjustZ;
var lightFm, emptyObjFm, lp, ltp, lfp, lftp, whichLight = true;
var files, fc, uival, fmval, start = false, done = false;
var globalResult = "";

var ray    = new THREE.Raycaster();
var mouse  = new THREE.Vector2();
var loader = new THREE.TextureLoader();

var planeSize, sPlaneSize, sPlaneSegments, vObjHeight, vObjRatio;
var mag;

initialize();
animate();

function onResize()
{
	arToolkitSource.onResizeElement()	
	arToolkitSource.copyElementSizeTo(renderer.domElement)	
	if ( arToolkitContext.arController !== null )
	{
		arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
	}
}


function initialize()
{
	/**********************************************************************************************
	 *
	 * Cenas e iluminação
	 *
	 *********************************************************************************************/

	mainScene1 = new THREE.Scene(); // base
	mainScene2 = new THREE.Scene(); // objeto virtual
	mainScene3 = new THREE.Scene(); // máscara

	// fov (degrees), aspect, near, far
	//camera = new THREE.PerspectiveCamera(32, 16.0 / 9.0, 1, 1000);
	//camera = new THREE.PerspectiveCamera(32, 1, 1, 1000);
	camera = new THREE.Camera();
	camera.isPerspectiveCamera = true; // enable ray casting
	mainScene1.add(camera);
	mainScene2.add(camera);
	mainScene3.add(camera);

	/**********************************************************************************************
	 *
	 * Renderers e canvas
	 *
	 *********************************************************************************************/
/*
	renderer1 = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
		antialias: true,
		alpha: true
	});
	renderer1.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer1.setSize(640, 640);
	renderer1.domElement.style.position = 'absolute';
	renderer1.domElement.style.top = '0px';
	renderer1.domElement.style.left = '0px';
	renderer1.shadowMap.enabled = true;
	document.body.appendChild(renderer1.domElement);
*/
	renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
		antialias: true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize(640, 640);
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);
/*
	renderer3 = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
		antialias: true,
		alpha: true
	});
	renderer3.setClearColor(new THREE.Color('black'), 0);
	renderer3.setSize(640, 640);
	renderer3.domElement.style.backgroundColor = 'black';
	renderer3.domElement.style.position = 'absolute';
	renderer3.domElement.style.top = '0px';
	renderer3.domElement.style.left = '640px';
	renderer3.shadowMap.enabled = true;
	document.body.appendChild(renderer3.domElement);
*/
	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	/**********************************************************************************************
	 *
	 * AR Toolkit
	 *
	 *********************************************************************************************/

	fc = 0;
	files = document.getElementById("files").innerHTML.split(";");
	contours = document.getElementById("contours").innerHTML.split("\n");

	arToolkitSource = new THREEx.ArToolkitSource({
		//sourceType: 'webcam'
//		sourceType: 'image', sourceUrl: 'my-images/index.jpeg',
		sourceType: 'image', sourceUrl: 'my-images/current/' + files[fc],
//		sourceWidth: 640,
//		sourceHeight: 480,
//		displayWidth: 640,
//		displayHeight: 640
	});

	arToolkitSource.init(function onReady(){
		onResize()
	});

	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init(function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
		//camera.aspect = 1.0;
		//camera.updateProjectionMatrix();
	});


	/**********************************************************************************************
	 *
	 * Declaração de variáveis globais
	 *
	 *********************************************************************************************/

	planeSize      = 150.00;
	sPlaneSize     =  15.00;
	sPlaneSegments = 300.00;
	vObjHeight     =   1.20;
	vObjRatio      =   1.00;
	adjustX        =   0.00;
	adjustZ        =   0.00;

	// 00000: 1.5, -0.1,  0.0
	// 00608: 1.7,  0.2, -0.2
	// 01453: 1.8,  0.0, -0.4
	// 01625: 1.6, -0.2, -0.1
	// 01836: 1.8, -0.2, -0.4
	// 01840: 1.8, -0.2, -0.4

	/**********************************************************************************************
	 *
	 * Texturas
	 *
	 *********************************************************************************************/

	var tex1 = loader.load("my-textures/face/asphalt.png");
	var tex2 = loader.load("my-textures/face/concrete.png");
	var tex3 = loader.load("my-textures/face/marble.png");
	var tex4 = loader.load("my-textures/face/wood.png");
	var tex5 = loader.load("my-textures/face/dark-metal.png");
	var tex6 = loader.load("my-textures/face/grass.png");
	var tex7 = loader.load("my-textures/face/stone.png");

	tex1.wrapS = THREE.RepeatWrapping;
	tex1.wrapT = THREE.RepeatWrapping;
	tex1.repeat.set(20, 20);
	tex6.wrapS = THREE.RepeatWrapping;
	tex6.wrapT = THREE.RepeatWrapping;
	tex6.repeat.set(20, 20);
	tex7.wrapS = THREE.RepeatWrapping;
	tex7.wrapT = THREE.RepeatWrapping;
	tex7.repeat.set(20, 20);

	var asphalt  = new THREE.MeshPhongMaterial({map: tex1});
	var concrete = new THREE.MeshPhongMaterial({map: tex2});
	var marble   = new THREE.MeshPhongMaterial({map: tex3});
	var wood     = new THREE.MeshPhongMaterial({map: tex4});
	var metal    = new THREE.MeshPhongMaterial({map: tex5});
	var grass    = new THREE.MeshPhongMaterial({map: tex6});
	var stone    = new THREE.MeshPhongMaterial({map: tex7});

	var path = "my-textures/cube/rubrik/";
	rubrik = [
		new THREE.MeshStandardMaterial({map: loader.load(path + "px.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "py.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "pz.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "nx.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "ny.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "nz.png")})
	];

	/**********************************************************************************************
	 *
	 * Materiais
	 *
	 *********************************************************************************************/

	var maskMat = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide
	});

	var shadowMat = new THREE.ShadowMaterial({
		opacity: 0.75,
		side: THREE.DoubleSide,
	});

	var lightMat = new THREE.MeshBasicMaterial({
		color: 0x000000,
		side: THREE.DoubleSide,
		opacity: 0.15
	});

	var darkMat = new THREE.MeshBasicMaterial({
		color: 0x000000,
		side: THREE.DoubleSide,
		opacity: 0.15
	});

	var blackMat = new THREE.MeshBasicMaterial({
		color: 0x000000,
		side: THREE.DoubleSide,
	});

	var rMat = new THREE.MeshBasicMaterial({
		color: 0xff0000,
		side: THREE.DoubleSide
	});

	var gMat = new THREE.MeshBasicMaterial({
		color: 0x00ff00,
		side: THREE.DoubleSide
	});

	var bMat = new THREE.MeshBasicMaterial({
		color: 0x0000ff,
		side: THREE.DoubleSide
	});

	var nMat = new THREE.MeshNormalMaterial({
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide
	});

	/**********************************************************************************************
	 *
	 * Cenas
	 *
	 *********************************************************************************************/

	scene1 = new THREE.Group();
	scene2 = new THREE.Group();
	scene3 = new THREE.Group();

	mainScene1.add(scene1);
	mainScene2.add(scene2);
	mainScene3.add(scene3);

	var scene0 = new THREE.Group();
	var markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, scene2, {
		type: 'pattern', patternUrl: "data/kanji.patt",
	});

	/**********************************************************************************************
	 *
	 * Iluminação
	 *
	 *********************************************************************************************/

	var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	origLight = new THREE.DirectionalLight(0xffffff);
	origLight.castShadow = true;
	var d = vObjRatio * vObjHeight * 40;
	origLight.shadow.camera.left   = -d;
	origLight.shadow.camera.right  =  d;
	origLight.shadow.camera.top    =  d;
	origLight.shadow.camera.bottom = -d;
//	origLight.shadow.camera.near   = -d;
//	origLight.shadow.camera.far    = 99;

	origLight.shadow.mapSize.width  = 4096;
	origLight.shadow.mapSize.height = 4096;

	light = origLight.clone();
	lightFm = origLight.clone();

//	var helper = new THREE.CameraHelper(light.shadow.camera);
//	scene2.add(helper);

	/**********************************************************************************************
	 *
	 * Geometrias
	 *
	 *********************************************************************************************/

	var cube     = new THREE.BoxBufferGeometry(vObjHeight, vObjHeight * vObjRatio, vObjHeight);
	var plane    = new THREE.PlaneGeometry(planeSize, planeSize, 150, 150);
	var splane   = new THREE.PlaneGeometry(sPlaneSize, sPlaneSize, sPlaneSegments, sPlaneSegments);
	var sphere1  = new THREE.SphereGeometry(vObjHeight * 0.7, 32, 16);
	var sphere2  = new THREE.SphereGeometry(vObjHeight * 0.9, 32, 16);
	var sphere3  = new THREE.SphereGeometry(0.2, 32, 16);
	var cube1    = new THREE.CubeGeometry(1, 3, 1);
	var cube2    = new THREE.CubeGeometry(1, 3, 2);
	var cylinder = new THREE.CylinderGeometry(1, 1, 3, 32);

	/**********************************************************************************************
	 *
	 * Objetos 3D presentes nas cenas
	 *
	 *********************************************************************************************/

	emptyObj      = new THREE.Mesh();//new THREE.SphereGeometry(0.2), new THREE.MeshNormalMaterial());
	emptyObjFm    = new THREE.Mesh();
	vObj          = new THREE.Mesh(cube,    wood);
	vObjMask      = new THREE.Mesh(cube,    maskMat);
	wObj          = new THREE.Mesh(cube,    maskMat);
	shadowPlane   = new THREE.Mesh(splane,  shadowMat);
	wPlane        = new THREE.Mesh(plane,   maskMat);
	dPlane        = new THREE.Mesh(plane,   blackMat);

	hlObj         = new THREE.Mesh(sphere3, rMat);
	hlPoint       = new THREE.Mesh(sphere3, bMat);
	gtObj1        = new THREE.Mesh(sphere3, gMat);
	gtObj2        = new THREE.Mesh(sphere3, gMat);
	gtObj3        = new THREE.Mesh(sphere3, gMat);
	gtPlane       = new THREE.Mesh(plane,   bMat);
	//gtPlane       = new THREE.Mesh(plane,   shadowMat);
	arrowHelper   = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000);
	gt            = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0xffff00);

	floor         = new THREE.Mesh(plane,    lightMat);
	asphaltFloor  = new THREE.Mesh(plane,    asphalt); // 1, 2, 6: asphalt; 3, 4: stone; 5: grass
	stoneFloor    = new THREE.Mesh(plane,    stone);   // 1, 2, 6: asphalt; 3, 4: stone; 5: grass
	grassFloor    = new THREE.Mesh(plane,    grass);   // 1, 2, 6: asphalt; 3, 4: stone; 5: grass
	auxFloor      = new THREE.Mesh(plane,    lightMat);
	stoneSphere1  = new THREE.Mesh(sphere1,  marble);
	stoneSphere2  = new THREE.Mesh(sphere2,  marble);
	metalCylinder = new THREE.Mesh(cylinder, metal);
	woodCube      = new THREE.Mesh(cube2,    wood);
	stoneCube1    = new THREE.Mesh(cube1,    marble);
	stoneCube2    = new THREE.Mesh(cube1,    marble);
	rubrikCube    = new THREE.Mesh(cube,     rubrik);

	/**********************************************************************************************
	 *
	 * Ajustes de posição, rotação, etc.
	 *
	 *********************************************************************************************/

	light.position.set        (  6,   3,   4); // 1, 2
//	light.position.set        ( -6,   3,   2); // 3, 4, 5
//	light.position.set        (  4,   3,  -2); // 6
	vObj.position.set         ( -1,   0,   4); // 1, 2, 3
//	vObj.position.set         (  1,   0,   4); // 4, 5
//	vObj.position.set         (  1,   0,   3); // 6
	stoneSphere1.position.set (  3,   0,  -6);
	stoneSphere2.position.set (  2,   0,   1);
	metalCylinder.position.set(  2,   1,   1);
	woodCube.position.set     ( -2,   1,  -3);
	rubrikCube.position.set   ( -2,   0,  -2);
	stoneCube1.position.set   (  0,   1,  -4);
	stoneCube2.position.set   (  2,   1,  -1);
	camera.position.set       (  0,   9,  12);

	camera.lookAt(floor.position);
	//light.target = floor;
	mag = (light.target.position.clone()).sub(light.position.clone()).normalize();
//	mag.y = 0;

	vObj.rotation.y       =  0.7;
	woodCube.rotation.y   = -0.3;
	rubrikCube.rotation.y =  0.7;
	stoneCube1.rotation.y =  0.1;
	stoneCube2.rotation.y =  0.1;

	floor.receiveShadow        = true;
	asphaltFloor.receiveShadow = true;
	stoneFloor.receiveShadow   = true;
	grassFloor.receiveShadow   = true;
	shadowPlane.receiveShadow  = true;
	stoneSphere1.castShadow    = true;
	stoneSphere2.castShadow    = true;
	metalCylinder.castShadow   = true;
	woodCube.castShadow        = true;
	rubrikCube.castShadow      = true;
	stoneCube1.castShadow      = true;
	stoneCube2.castShadow      = true;
	wObj.castShadow            = true;

	floor.rotation.x = -Math.PI / 2;
	asphaltFloor.rotation.x = -Math.PI / 2;
	stoneFloor.rotation.x = -Math.PI / 2;
	grassFloor.rotation.x = -Math.PI / 2;
	auxFloor.rotation.x = -Math.PI / 2;
	shadowPlane.rotation.x = -Math.PI / 2;
	floor.position.y = -0.05;
	asphaltFloor.position.y = floor.position.clone().y;
	stoneFloor.position.y = floor.position.clone().y;
	grassFloor.position.y = floor.position.clone().y;
	asphaltFloor.position.y = -0.05;
	stoneFloor.position.y = -0.05;
	grassFloor.position.y = -0.05;
	//auxFloor.position.y = -0.04;
	vObj.position.y = vObjRatio * vObjHeight / 2;
	rubrikCube.position.y = vObjRatio * vObjHeight / 2;
	stoneSphere1.position.y = vObjRatio * vObjHeight * 0.6;
	stoneSphere2.position.y = vObjRatio * vObjHeight * 0.4;
	shadowPlane.position.y = floor.position.clone().y;
//	shadowPlane.position.x = vObj.positoin.x;
//	shadowPlane.position.z = vObj.positoin.z;
	wPlane.rotation.x = -Math.PI / 2;
	wPlane.position.y = floor.position.clone().y - 0.2;
	dPlane.rotation.x = -Math.PI / 2;
	dPlane.position.y = floor.position.clone().y - 0.2;
	gtPlane.rotation.z = -Math.PI / 2;

	/**********************************************************************************************
	 *
	 * Ajustes de posição e rotação
	 *
	 *********************************************************************************************/

	scene1.add(ambientLight.clone());
	scene2.add(ambientLight.clone());

	//scene1.add(floor);
	scene1.add(asphaltFloor);
	scene1.add(stoneFloor);
	scene1.add(grassFloor);
	scene1.add(origLight);
	scene1.add(stoneSphere1);  // 1
	scene1.add(stoneSphere2);  // 1
	scene1.add(metalCylinder); // 2
	scene1.add(woodCube);      // 3
	scene1.add(rubrikCube);    // 4, 5
	scene1.add(stoneCube1);    // 6
	scene1.add(stoneCube2);    // 6

	scene2.add(vObj);
	scene2.add(shadowPlane);
	scene2.add(emptyObj);
	scene2.add(light);
	scene2.add(emptyObjFm);
	scene2.add(lightFm);

	scene2.add(hlObj);
	scene2.add(hlPoint);
	scene2.add(arrowHelper);
	scene2.add(gt);

	scene3.add(vObjMask);

	scene2.add(wPlane);
	scene2.add(dPlane);
	scene2.add(wObj);

	document.addEventListener("mousedown", onDocumentMouseDown,  false);
	document.addEventListener("keydown",   onDocumentKeyDown,    false);
	document.addEventListener("wheel",     onDocumentMouseWheel, false);

	wObj.visible         = false;
	wPlane.visible       = false;
	dPlane.visible       = false;
	vObjMask.visible     = true;

	vObj.castShadow      = true;
	hlObj.visible        = false;
	hlPoint.visible      = false;
	arrowHelper.visible  = false;
	gt.visible           = false;

	lightFm.visible      = false;

	phase = 0;
	setScene(0);
	scene2.scale.set(0.5, 0.5, 0.5);

	//scene2.add(gtObj1);
}


function getMidPoints(p, t, r) // p: pontos, t: tolerancia, r: recursoes
{
	if (r > 0)
	{
		var v, k, n = p.length;
		for (var i = 0; i < n; i++)
		{
			for (var j = 0; j < n; j++)
			{
				if (i == j)
					continue;
				v = ((p[i].clone()).add(p[j].clone())).multiplyScalar(0.5);
				for (k = n; k < p.length; k++)
					if ((Math.abs(v.x - p[k].x) + Math.abs(v.y - p[k].y) + Math.abs(v.z - p[k].z)) < t)
						break;
				if (k == p.length)
					p.push(v.clone());
			}
		}
		return getMidPoints(p, t, --r);
	}
	return p;
}


function setScene(id)
{
	light.position.set(0, 1, 0);
	switch (id)
	{
		case 1:
			origLight.position.set( 6,  3,  4);
			vObj.position.set     (-1,  0,  4);
			stoneSphere1.visible  = true;
			stoneSphere2.visible  = true;
			metalCylinder.visible = false;
			woodCube.visible      = false;
			rubrikCube.visible    = false;
			stoneCube1.visible    = false;
			stoneCube2.visible    = false;
			asphaltFloor.visible  = true;
			stoneFloor.visible    = false;
			grassFloor.visible    = false;
			break;

		case 2:
			origLight.position.set( 6,  3,  4);
			vObj.position.set     (-1,  0,  4);
			stoneSphere1.visible  = false;
			stoneSphere2.visible  = false;
			metalCylinder.visible = true;
			woodCube.visible      = false;
			rubrikCube.visible    = false;
			stoneCube1.visible    = false;
			stoneCube2.visible    = false;
			asphaltFloor.visible  = true;
			stoneFloor.visible    = false;
			grassFloor.visible    = false;
			break;

		case 3:
			origLight.position.set(-6,  3,  2); // 3, 4, 5
			vObj.position.set     (-1,  0,  4); // 1, 2, 3
			stoneSphere1.visible  = false;
			stoneSphere2.visible  = false;
			metalCylinder.visible = false;
			woodCube.visible      = true;
			rubrikCube.visible    = false;
			stoneCube1.visible    = false;
			stoneCube2.visible    = false;
			asphaltFloor.visible  = false;
			stoneFloor.visible    = true;
			grassFloor.visible    = false;
			break;

		case 4:
			origLight.position.set(-6,  3,  2);
			vObj.position.set     ( 1,  0,  4);
			stoneSphere1.visible  = false;
			stoneSphere2.visible  = false;
			metalCylinder.visible = false;
			woodCube.visible      = false;
			rubrikCube.visible    = true;
			stoneCube1.visible    = false;
			stoneCube2.visible    = false;
			asphaltFloor.visible  = false;
			stoneFloor.visible    = true;
			grassFloor.visible    = false;
			break;

		case 5:
			origLight.position.set(-6,  3,  2);
			vObj.position.set     ( 1,  0,  4);
			stoneSphere1.visible  = false;
			stoneSphere2.visible  = false;
			metalCylinder.visible = false;
			woodCube.visible      = false;
			rubrikCube.visible    = true;
			stoneCube1.visible    = false;
			stoneCube2.visible    = false;
			asphaltFloor.visible  = false;
			stoneFloor.visible    = false;
			grassFloor.visible    = true;
			break;

		case 6:
			origLight.position.set( 4,  3, -2);
			vObj.position.set     ( 1,  0,  3);
			stoneSphere1.visible  = false;
			stoneSphere2.visible  = false;
			metalCylinder.visible = false;
			woodCube.visible      = false;
			rubrikCube.visible    = false;
			stoneCube1.visible    = true;
			stoneCube2.visible    = true;
			asphaltFloor.visible  = true;
			stoneFloor.visible    = false;
			grassFloor.visible    = false;
			break;

		default:
			origLight.position.set(10 * vObjHeight, vObjRatio * vObjHeight / 2, vObjHeight / 2);
			light.position.set    (10 * vObjHeight, vObjRatio * vObjHeight / 2, vObjHeight / 2);
//			//console.log(light.position);
//			//console.log(light.target.position);
			vObj.position.set     (adjustX, vObjRatio * vObjHeight / 2, adjustZ);
			vObj.rotation.set     (0, 0, 0);
			stoneSphere1.visible  = false;
			stoneSphere2.visible  = false;
			metalCylinder.visible = false;
			woodCube.visible      = false;
			rubrikCube.visible    = false;
			stoneCube1.visible    = false;
			stoneCube2.visible    = false;
			asphaltFloor.visible  = false;
			stoneFloor.visible    = false;
			grassFloor.visible    = false;
			break;
	}
	mag = (origLight.target.position.clone()).sub(origLight.position.clone()).normalize();
	vObj.position.y = vObjRatio * vObjHeight / 2;
	update();
}


function setLightFromMask(list, debug = false)
{
	var inputVector = prompt("Enter ground truth vector: ", "0 1 0").split(" ");
	var groundTruth = new THREE.Vector3(inputVector[0], inputVector[1], inputVector[2]);

	start = true;
	var startTime = performance.now();
	var origOpacity = shadowPlane.material.opacity;
	shadowPlane.material.opacity = 1;
	//console.log("start");

	var v1     = [];
	var v2     = [];
	var v3     = [];
	var v4     = [];
	var vDebug = [];

	// adquire conjunto de pontos a partir dos vertices do objeto virtual
	var position = vObj.geometry.attributes.position;
	for (var i = 0; i < position.count; i++)
		v1.push(new THREE.Vector3().fromBufferAttribute(position, i));
	getMidPoints(v1, 0.001, 1);

	// adquire conjunto de pontos a partir dos triangulos da geometria
	var pos = vObj.geometry.toNonIndexed().attributes.position;
	for (var i = 0; i < pos.count; i += 3)
	{
		var t1 = new THREE.Vector3().fromBufferAttribute(pos, i);
		var t2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
		var t3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
		v1.push(new THREE.Vector3((t1.x + t2.x + t3.x) / 3, (t1.y + t2.y + t3.y) / 3, (t1.z + t2.z + t3.z) / 3));
	}

	// passa os pontos adquiridos para valores globais
	for (var i = 0; i < v1.length; i++)
	{
		v1[i].x += vObj.position.x;
		v1[i].y += vObj.position.y;
		v1[i].z += vObj.position.z;

		// elimina os pontos abaixo de 25% da altura do objeto virtual
		if (v1[i].y < vObjHeight / 4)
			v1.splice(i--, 1);

		if (debug)
		{
			var newObj = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
			newObj.position.set(v1[i].x, v1[i].y, v1[i].z);
			vDebug.push(newObj.clone());
		}
	}

	//console.log("get floor points");

	var w    = renderer.domElement.clientWidth;
	var h    = renderer.domElement.clientHeight;
	var padw = (w > h) ? Math.floor((w - h) / 2.0) : 0;
	var padh = (h > w) ? Math.floor((h - w) / 2.0) : 0;
	var m    = ((w > h) ? h : w) / 256.0;

	// adquire conjunto de pontos a partir dos pontos 2d da sombra
	//v1 = [vObj.position];
	var k = 0;
	while (k < list.length)//2
	{
		x        = parseInt(list[k++]) * m + padw;
		y        = parseInt(list[k++]) * m + padh;
		mouse.x  =  (x / w) * 2 - 1;
		mouse.y  = -(y / h) * 2 + 1;

		ray.setFromCamera(mouse, camera);
		var i = ray.intersectObject(shadowPlane);
		if (i.length > 0)
			v2.push(new THREE.Vector3((i[0].uv.x - 0.5) * sPlaneSize + shadowPlane.position.x, shadowPlane.position.y, (0.5 - i[0].uv.y) * sPlaneSize + shadowPlane.position.z));
	}

	//console.log("shrink list");

	// reduz o tamanho da segunda lista
	var t = 0.2;
	if (debug)
	for (var i = 0; i < v2.length - 1; i++)
		for (var j = i + 1; j < v2.length; j++)
			if (v2[i].distanceTo(v2[j]) < t)
				v2.splice(j--, 1);
	//console.log(v2.length);

	if (debug)
	{
		for (var i = 0; i < v2.length; i++)
		{
			var newObj = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
			newObj.position.set(v2[i].x, v2[i].y, v2[i].z);
			vDebug.push(newObj.clone());
		}
	}

	//console.log("combine");

	// liga os pontos
	var v4 = [];
	for (var i = 0; i < v1.length; i++)
	{
		for (var j = 0; j < v2.length; j++)
		{
			var aux = v1[i].clone().sub(v2[j].clone());
			var v   = aux.clone().normalize().multiplyScalar(3 * vObjRatio * vObjHeight).add(v1[i].clone()); // quanto maior o escalar, mais longe fica a fonte de luz
			v4.push([v1[i], v2[j], v, aux, Math.atan2(aux.z, aux.x) * 180 / Math.PI + 180]);
		}
	}

	//console.log("sort");

	// ordena a lista
	v4.sort(function(a, b)
	{
		return a[4] - b[4];
	});

	//console.log(v4.length);

	// reduz o tamaho da lista final
	/*
	var v3 = [];
	var step = Math.ceil(v4.length / 200);
	for (var i = 0; i < v4.length; i += step)
		v3.push(v4[i]);
	*/
	v3 = v4;

	//console.log("compare");

	var mask = [];
	for (var i = 0; i < 65536; i++)
		mask.push(1);
	for (var i = 0; i < list.length; i += 2)
		mask[parseInt(list[i]) + parseInt(list[i + 1]) * 256] = 0;
/*
	maskString = "";
	for (var i = 0; i < 256; i++)
	{
		for (var j = 0; j < 256; j++)
			maskString += ((mask[i * 256 + j] == 1) ? " " : "0");
		maskString += "\n";
	}
	console.log(maskString);
*/
/*
	var canvas = document.createElement("canvas");
	canvas.width  = 256;
	canvas.height = 256;
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
*/
	rend = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
		antialias: true
	});
	rend.setClearColor(new THREE.Color('white'), 0);
	rend.setSize(w, h);
	rend.shadowMap.enabled = true;

	light.visible = true;
	light.target = emptyObj;

	var mi = 0, mv = 0;

	for (k = 0; k < v3.length; k++)
	{
		var val = getRenderValue(v3[k][1], v3[k][2], mask);
		if (val > mv)
		{
			mv = val;
			mi = k;
		}
	}

	k = mi;

	light.position.set(v3[k][2].x, v3[k][2].y, v3[k][2].z);
	emptyObj.position.set(v3[k][1].x, v3[k][1].y, v3[k][1].z);

	var v5 = v3[k][2].clone().sub(v3[k][1]).normalize();
	var alpha = 6 * Math.PI / 180;
	//var alpha = Math.PI / 2;

	enhanceDirectionalLight(mask, mv, groundTruth, v5, v3[k], alpha, origOpacity, debug, vDebug, v3.length);
	done = true;
}


function enhanceDirectionalLight(mask, mv, groundTruth, initialVector, objectPosition, alpha, origOpacity, debug, vDebug, v3len, first = true)
{
	var v3 = [];
	for (var i = 0; i < 4; i++)
		v3.push(objectPosition[0].clone());
	v3.push(objectPosition[4]);
	var v5 = initialVector;

	// cria o mapa
	//console.log("map");
	var ni = 65;
	var nj = 513;
	var si = alpha / ni;
	var sj = Math.PI * 2 / nj;
	var v7 = new THREE.Vector3(0, 1, 0).cross(v5);
	var v8 = v5.clone();
	var vl = [];
	var maxRenderVal = 0;
	var maxVec;// = v8.clone().multiplyScalar(5).add(v3[1]);
	for (var i = 0; i < ni; i++)
	{
		v8.applyAxisAngle(v7, si);
		//vl.push([Math.PI * (Math.pow((i + 1) * si / ni, 2) - Math.pow(i * si / ni, 2)) * (sj / nj) * 1000000000]);
		vl.push([]);
		for (var j = 0; j < nj; j++)
		{
			v8.applyAxisAngle(v5, sj);
			var v9 = v8.clone().multiplyScalar(5).add(v3[1]);
			var renderVal = getRenderValue(v3[1], v9, mask);
			vl[i].push([v9, renderVal, (i / ni) * Math.cos(j * sj), (i / ni) * Math.sin(j * sj) * -1, 0]);
			if (renderVal > maxRenderVal)
			{
				maxVec = v9;
				maxRenderVal = renderVal;
			}
		}
	}

	// calcula a imagem integral
	//console.log("integral");
	vl[0][0][4] = vl[0][0][1];
	for (var i = 1; i < vl[0].length; i++)
		vl[0][i][4] = vl[0][i - 1][4] + vl[0][i][1];
	for (var i = 1; i < vl.length; i++)
	{
		vl[i][0][4] = vl[i - 1][0][4] + vl[i][0][1];
		for (var j = 1; j < vl[i].length; j++)
			vl[i][j][4] = vl[i][j][1] + vl[i][j - 1][4] + vl[i - 1][j][4] - vl[i - 1][j - 1][4];
	}

	// encontra o melhor ponto da calota esferica
	//console.log("cap");
	var div = false;
	var res = findBestInSphere(div, mv, mask, vl, si, sj, ni, nj, v3[1], v5, alpha);
	var v6 = res[0].multiplyScalar(5).add(v3[1]);
	light.position.set(v6.x, v6.y, v6.z);

	// desenha o grafico
	if (debug)
	{
		var grid = 0;
		while (Math.pow(++grid, 2) < v3len);
		var size = Math.max(grid * 256, 4096);
		var sqr = Math.floor(size / grid);
		size = Math.min(sqr * grid, 16384); // limite do chrome (area: 268.435.456 pixels) para o canvas. O limite do firefox é maior, entao esse valor serve para ambos
		var canvas2 = document.createElement("canvas");
		canvas2.width  = size;
		canvas2.height = size;
		var ctx2 = canvas2.getContext("2d");
		ctx2.fillStyle = "black";
		ctx2.fillRect(0, 0, size, size);

		//console.log("draw");
		//console.log(res[3]);
		var minVal = 1;
		var maxVal = 0;
		for (var i = 0; i < vl.length; i++)
		{
			for (var j = 1; j < vl[i].length; j++)
			{
				var val = vl[i][j][1];
				if (minVal > val)
					minVal = val;
				if (maxVal < val)
					maxVal = val;
			}
		}
		canvas2.width  = 640;
		canvas2.height = 512;//732;
		ctx2 = canvas2.getContext("2d", true, false, "srgb", true);
		ctx2.fillStyle = "black";
		ctx2.fillRect(0, 0, 640, 732);
		for (var i = 0; i < vl.length; i++)
		{
			for (var j = 0; j < vl[i].length; j++)
			{
				{
					ctx2.fillStyle = colorScale(vl[i][j][1], minVal, maxVal);
					ctx2.fillRect(vl[i][j][2] * 240 + 256, vl[i][j][3] * 240 + 256, 4, 4);
				}
			}
		}

		res[3] = [];
		ctx2.lineWidth = 2;
		ctx2.strokeStyle = "#000000";
		var rho, theta;
		for (var i = 0; i < res[3].length; i++)
		{
			rho   = 240 / (2 * res[3][i][4]);
			theta = Math.PI / ((div ? 8 : 4) * res[3][i][4]);
			var x = vl[res[3][i][0]][res[3][i][1]][2] * 240;
			var y = vl[res[3][i][0]][res[3][i][1]][3] * 240;
			var r = Math.sqrt(x * x + y * y);
			var a = Math.atan2(y, x);
			////console.log(x, y, r, a * 180 / Math.PI);
			ctx2.beginPath();
			ctx2.moveTo((r - rho) * Math.cos(a - theta) + 258, (r - rho) * Math.sin(a - theta) + 258);
			ctx2.lineTo((r + rho) * Math.cos(a - theta) + 258, (r + rho) * Math.sin(a - theta) + 258);
			ctx2.stroke();
			ctx2.beginPath();
			ctx2.moveTo((r - rho) * Math.cos(a + theta) + 258, (r - rho) * Math.sin(a + theta) + 258);
			ctx2.lineTo((r + rho) * Math.cos(a + theta) + 258, (r + rho) * Math.sin(a + theta) + 258);
			ctx2.stroke();
			ctx2.beginPath();
			ctx2.arc(258, 258, Math.max(r - rho, 0), a - theta, a + theta);
			ctx2.stroke();
			ctx2.beginPath();
			ctx2.arc(258, 258, r + rho, a - theta, a + theta);
			ctx2.stroke();
		}
		for (var i = 0; i < res[3].length; i++)
		{
			var x = vl[res[3][i][2]][res[3][i][3]][2] * 240 + 258;
			var y = vl[res[3][i][2]][res[3][i][3]][3] * 240 + 258;
			ctx2.beginPath();
			ctx2.lineWidth = 6;
			ctx2.strokeStyle = colorScale(vl[res[3][i][2]][res[3][i][3]][1], minVal, maxVal);
			ctx2.arc(x, y, 3, 0, Math.PI * 2);
			ctx2.stroke();
			ctx2.beginPath();
			ctx2.lineWidth = 2;
			ctx2.strokeStyle = "#ffffff";
			ctx2.arc(x, y, 6, 0, Math.PI * 2);
			ctx2.stroke();
		}
		for (var i = 0; i < vl.length; i++)
		{
			for (var j = 0; j < vl[i].length; j++)
			{
				if (vl[i][j][1] == maxVal)
				{
					ctx2.beginPath();
					ctx2.lineWidth = 6;
					ctx2.strokeStyle = "#ff0000";
					ctx2.arc(vl[i][j][2] * 240 + 258, vl[i][j][3] * 240 + 258, 3, 0, Math.PI * 2);
					ctx2.stroke();
					ctx2.beginPath();
					ctx2.lineWidth = 2;
					ctx2.strokeStyle = "#ffffff";
					ctx2.arc(vl[i][j][2] * 240 + 258, vl[i][j][3] * 240 + 258, 6, 0, Math.PI * 2);
					ctx2.stroke();
				}
			}
		}
		ctx2.beginPath();
		ctx2.lineWidth = 6;
		ctx2.strokeStyle = "#ffffff";
		ctx2.arc(vl[res[1]][res[2]][2] * 240 + 258, vl[res[1]][res[2]][3] * 240 + 258, 3, 0, Math.PI * 2);
		ctx2.stroke();
		for (var i = 62; i <= 450; i++)
		{
			ctx2.fillStyle = colorScale(i, 62, 450);
			ctx2.fillRect(550, 512 - i, 20, 1);
		}
		ctx2.font = "bolder 15px Arial"
		ctx2.fillStyle = "red";
		ctx2.fillText(maxVal.toFixed(3), 550,  32);
		ctx2.fillStyle = "blue";
		ctx2.fillText(minVal.toFixed(3), 550, 480);
		ctx2.fillStyle = /*"#ff73a4";*/colorScale(mv, minVal, maxVal);
		ctx2.fillText(mv.toFixed(3), 580, 512 - 450 * ((mv - minVal) / (maxVal - minVal)));
		ctx2.fillText("chute",       580, 532 - 450 * ((mv - minVal) / (maxVal - minVal)));
		ctx2.fillText("inicial",     580, 552 - 450 * ((mv - minVal) / (maxVal - minVal)));
/*
		var minImg = vl[0][0][1];
		var maxImg = vl[0][0][1];
		var minInt = vl[0][0][4];
		var maxInt = vl[0][0][4];
		for (var i = 0; i < 50; i++)
		{
			for (var j = 0; j < 360; j++)
			{
				if (minImg > vl[i][j][1])
					minImg = vl[i][j][1];
				if (maxImg < vl[i][j][1])
					maxImg = vl[i][j][1];
				if (minInt > vl[i][j][4])
					minInt = vl[i][j][4];
				if (maxInt < vl[i][j][4])
					maxInt = vl[i][j][4];
			}
		}
		for (var i = 0; i < 360; i++)
		{
			ctx2.fillStyle = colorScale(i, 0, 360);
			ctx2.fillRect(140 + i, 592, 1, 10);
			ctx2.fillRect(140 + i, 692, 1, 10);
		}
		for (var i = 0; i < 50; i++)
		{
			for (var j = 0; j < 360; j++)
			{
				ctx2.fillStyle = colorScale(vl[i][j][1], minImg, maxImg);
				ctx2.fillRect(140 + j, 522 + i, 1, 1);
				ctx2.fillStyle = colorScale(vl[i][j][4], minInt, maxInt);
				ctx2.fillRect(140 + j, 622 + i, 1, 1);
			}
		}
		ctx2.fillStyle = "red";
		ctx2.fillText(maxImg.toFixed(3), 510, 602);
		ctx2.fillText(maxInt.toFixed(3), 510, 702);
		ctx2.fillStyle = "blue";
		ctx2.fillText(minImg.toFixed(3),  90, 602);
		ctx2.fillText(minInt.toFixed(3),  90, 702);
*/
		// imprime o grafico
		var link = document.getElementById('exportLink');
		link.setAttribute('download', 'test.png');
		link.setAttribute('href', canvas2.toDataURL("image/png").replace("image/png", "image/octet-stream"));
		link.click();

		// cria objetos virtuais para facilitar a visualizacao
		light.position.set(v6.x, v6.y, v6.z);
		var pObj = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
		var pLgt = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
		var pFlr = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
		pObj.position.set(v3[0].x, v3[0].y, v3[0].z);
		pLgt.position.set(v3[2].x, v3[2].y, v3[2].z);
		pFlr.position.set(v3[1].x, v3[1].y, v3[1].z);
		scene2.add(pObj);
		scene2.add(pLgt);
		scene2.add(pFlr);
		var geo = new THREE.Geometry();
		geo.vertices.push(v3[2].clone());
		geo.vertices.push(v3[1].clone());
		scene2.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffff00 })));
		vObj.material.opacity = 0.75;
		vObj.material.transparent = true;
		for (var i = 0; i < vDebug.length; i++)
			scene2.add(vDebug[i]);
	}

//	if (first)
//	{
//		globalResult += "IoU 2nd step: " + getRenderValue(v3[1], res[0], mask).toFixed(5) + "\n";
//		globalResult += "Angular deviation 2nd step: " + (res[0].angleTo(groundTruth) * 180 / Math.PI).toFixed(3) + "°\n";
//	}
	var newAlpha = alpha * 0.3;
	if (newAlpha >= 1 && res[0].angleTo(groundTruth) > initialVector.angleTo(groundTruth))
		enhanceDirectionalLight(mask, mv, groundTruth, res[0], objectPosition, newAlpha, origOpacity, debug, vDebug, v3len, false);
	else
	{
		shadowPlane.material.opacity = origOpacity;
		var endTime = performance.now();
		//console.log(parseInt(endTime - startTime), mv, maxRenderVal, res[0].angleTo(maxVec) * 180 / Math.PI);
//		globalResult += "IoU last step: " + getRenderValue(v3[1], res[0], mask).toFixed(5) + "\n";
//		globalResult += "Angular deviation last step: " + (res[0].angleTo(groundTruth) * 180 / Math.PI).toFixed(3) + "°\n";
//		console.log(globalResult + "\nVector last step: " + maxVec.x + " " + maxVec.y + " " + maxVec.z);
		var str = "";
		str += "IoU: " + getRenderValue(v3[1], res[0].clone(), mask).toFixed(5) + "\n";
		str += "Angle: " + (res[0].angleTo(groundTruth) * 180 / Math.PI).toFixed(3) + "°\n";
		str += "Found vector: " + res[0].x + " " + res[0].y + " " + res[0].z + "\n";
		str += "Best vector: " + maxVec.x + " " + maxVec.y + " " + maxVec.z + "\n";
		console.log(str);
		globalResult = "";
	}
}


function colorScale(val, minVal, maxVal)
{
	var r, g, b, color = (val - minVal) / (maxVal - minVal);
	if (color <= 0.25)
	{
		r =   0;
		g = 255 * color * 4;
		b = 255;
	}
	else if (color <= 0.5)
	{
		r =   0;
		g = 255;
		b = 255 - 255 * (color - 0.25) * 4;
	}
	else if (color <= 0.75)
	{
		r = 255 * (color - 0.5) * 4;
		g = 255;
		b =   0;
	}
	else
	{
		r = 255;
		g = 255 - 255 * (color - 0.75) * 4;
		b =   0;
	}
	r = Math.floor(r).toString(16);
	g = Math.floor(g).toString(16);
	b = Math.floor(b).toString(16);
	if (r.length == 1)
		r = "0" + r;
	if (g.length == 1)
		g = "0" + g;
	if (b.length == 1)
		b = "0" + b;
	return "#" + r + g + b;
}


function shrinkList(list, t)
{
	// metodo 01: remover cenas com diferenca angular pro elemento seguinte da lista menor que um certo threshold
	/*
	var t = 0.087; // ~5 graus em rad
	for (var i = 0; i < list.length - 1; i++)
		for (var j = i + 1; j < list.length; j++)
			if (list[i][9].angleTo(list[j][9]) < t)
				list.splice(j--, 1);
	return list;
	*/

	// metodo 02: pegar t elementos espacados uniformemente na lista ordenada
	/*
	var t = 360;
	var n = list.length;
	if (n <= t)
		return list;
	var step = n / t;
	//console.log(n, step);
	var list2 = [];
	for (var i = 0; i < n - step; i += step)
		list2.push(list[Math.floor(i)]);
	return list2;
	*/

	// metodo 03: remover todos da lista ordenada com diferenca angular menor que um certo threshold
	var t = 5;
	for (var i = 0; i < list.length; i++)
		if (list[i][11] < i * t - 180)
			list.splice(i--, 1);
	return list;
}


//
function findBestInSphere(extra, best, mask, map, ii, jj, ni, nj, ori, v0, alpha, beta = Math.PI, theta = 0, p0 = v0.clone(), prev = 0, maxRec = 20, depth = 1, first = true, path = [])
{
//	return [p0, 0, 0, [], 0];
	var p = [];
/*
	if (first)
	{
		var axis = new THREE.Vector3(0, 1, 0).cross(v0).normalize();
		for (var i = 0; i < 4; i++)
		{
			p.push(p0.clone().applyAxisAngle(axis, alpha / 2));
			p[i].applyAxisAngle(v0, i * Math.PI / 2 + Math.PI / 4);
		}
	}
	else
	{
		var axis = v0.clone().cross(p0).normalize();
		for (var i = 0; i < 4; i++)
			p.push(p0.clone());
		p[0].applyAxisAngle(axis,  alpha / 2);
		p[1].applyAxisAngle(axis, -alpha / 2);
		p[2].applyAxisAngle(axis, -alpha / 2);
		p[3].applyAxisAngle(axis,  alpha / 2);
		p[0].applyAxisAngle(v0,    beta  / 4);
		p[1].applyAxisAngle(v0,    beta  / 4);
		p[2].applyAxisAngle(v0,   -beta  / 4);
		p[3].applyAxisAngle(v0,   -beta  / 4);
	}
*/
	if (first)
	{
		var axis = new THREE.Vector3(0, 1, 0).cross(v0).normalize();
		for (var i = 0; i < 8; i++)
		{
			p.push(p0.clone().applyAxisAngle(axis, alpha / 2));
			p[i].applyAxisAngle(v0, i * Math.PI / 2 + Math.PI / (extra ? 8 : 4));
		}
	}
	else
	{
		var axis = v0.clone().cross(p0).normalize();
		for (var i = 0; i < (extra ? 8 : 4); i++)
			p.push(p0.clone());
		p[0].applyAxisAngle(axis,  alpha / 2);
		p[1].applyAxisAngle(axis, -alpha / 2);
		p[2].applyAxisAngle(axis, -alpha / 2);
		p[3].applyAxisAngle(axis,  alpha / 2);
		p[0].applyAxisAngle(v0,    beta  / 4);
		p[1].applyAxisAngle(v0,    beta  / 4);
		p[2].applyAxisAngle(v0,   -beta  / 4);
		p[3].applyAxisAngle(v0,   -beta  / 4);

		if (extra)
		{
			p[4].applyAxisAngle(v0,    beta  / 4);
			p[5].applyAxisAngle(axis, -alpha / 2);
			p[6].applyAxisAngle(v0,   -beta  / 4);
			p[7].applyAxisAngle(axis,  alpha / 2);
		}
	}

	var list = [];
	var res = [];
	var r0, r1, t0, t1;
	for (var i = 0; i < (extra ? 8 : 4); i++)
	{
		var val = 0;
		if (first)
		{
			r0 = 0;
			r1 = alpha;
			t0 = i * Math.PI / (extra ? 4 : 2);
			t1 = t0 + Math.PI / 2;
		}
		else
		{
			var rho = p[i].angleTo(v0);
			r0 = rho - alpha / 2;
			r1 = rho + alpha / 2;
			switch (i)
			{
				case 0:
				case 1:
				case 4:
					t0 = theta;
					t1 = theta + beta / 2;
					break;

				case 2:
				case 3:
				case 6:
					t0 = theta - beta / 2;
					t1 = theta;
					break;

				case 5:
					t0 = theta - beta / 4;
					t1 = theta + beta / 4;
					break;

				case 7:
					t0 = theta + beta / 4;
					t1 = theta - beta / 4;
					break;
			}
		}
		res.push([]);
		res[i].push(r0 *  36 / Math.PI);
		res[i].push(r1 *  36 / Math.PI);
		res[i].push(t0 * 180 / Math.PI);
		res[i].push(t1 * 180 / Math.PI);
		var area = (r1 * r1 - r0 * r0) * Math.PI * (Math.abs(t1 - t0) / (2 * Math.PI));
		r0 = Math.round(r0 / ii);
		r1 = Math.round(r1 / ii);
		t0 = Math.round(t0 / jj);
		t1 = Math.round(t1 / jj);
		if (r0 < 0)
			r0 = 0;
		if (r1 < 1)
			r1 = 1;
		if (r0 > ni - 2)
			r0 = ni - 2;
		if (r1 > ni - 1)
			r1 = ni - 1;
		while (t0 < 0)
			t0 += nj;
		while (t1 < 0)
			t1 += nj;
		while (t0 >= nj)
			t0 -= nj;
		while (t1 >= nj)
			t1 -= nj;
		if (r0 == r1)
			r1++;
		if (t0 == t1)
		{
			if (t0 == nj - 1)
				t0--;
			else
				t1++;
		}
		var ar = Math.max(0, Math.min(Math.round((r0 + r1) / 2), ni - 1));
		var at = Math.max(0, Math.min(Math.round((t0 + t1) / 2) + (t0 > t1 ? nj / 2 : 0), nj - 1));

		var lMax = 0;
		if (t0 > t1)
		{
			for (var j = r0; j <= r1; j++)
			{
				for (var k = 0; k < t1; k++)
					lMax = Math.max(lMax, map[j][k][1]);//val += map[j][k][1];
				for (var k = t0 + 1; k < nj; k++)
					lMax = Math.max(lMax, map[j][k][1]);//val += map[j][k][1];
			}
		}
		else
			for (var j = r0; j <= r1; j++)
				for (var k = t0; k <= t1; k++)
					lMax = Math.max(lMax, map[j][k][1]);//val += map[j][k][1];
		res[i].push(lMax);
		r0--;
		if (t0 > t1)
		{
			t1--;
			var a, b, c, d, e, f;
			a = b = c = e = 0;
			if (r0 >= 0)
			{
				c = map[r0][t0][4];
				e = map[r0][nj - 1][4];
			}
			if (t1 >= 0)
				b = map[r1][t1][4];
			if (r0 >= 0 && t1 >= 0)
				a = map[r0][t1][4];
			d = map[r1][t0][4];
			f = map[r1][nj - 1][4];
			val = f - e - (d - b - c + a);
		}
		else
		{
			t0--;
			var a, b, c, d;
			a = b = c = e = 0;
			if (r0 >= 0)
				c = map[r0][t1][4];
			if (t0 >= 0)
				b = map[r1][t0][4];
			if (r0 >= 0 && t0 >= 0)
				a = map[r0][t0][4];
			d = map[r1][t1][4];
			val = d - b - c + a;
		}
		r0++;
		t0++;
/*
		if (t0 > t1)
			val = map[r1][nj - 1][4] - (r0 == 0 ? 0 : map[r0 - 1][nj - 1][4]) - (map[r1][t0][4] - map[r0][t0][4] - map[r1][t1][4] + map[r0][t1][4]);
		else
			val = map[r1][t1][4] - (r0 == 0 ? 0 : map[r0 - 1][t1][4]) - (t0 == 0 ? 0 : map[r1][t0 - 1][4]) + (r0 == 0 || t0 == 0 ? 0 : map[r0 - 1][t0 - 1][4]);
*/
/*
		res[i].push(val);
		res[i].push(area);
		area = Math.max(r1 - r0, 1) * Math.max(t1 > t0 ? t1 - t0 : nj + t1 - t0, 1);
		res[i].push(area);
		val /= area;
		res[i].push(val);
*/
		/*for (var ri = r0; ri < r1; ri++)
		{
			if (t0 > t1)
			{
				for (var ti = t0; (ti % nj) != t1 + 1; ti++)
					res[i][8] += map[ri][ti % nj][1];
			}
			else
			{
				for (var ti = t0; ti < t1; ti++)
					res[i][8] += map[ri][ti][1];
			}
		}*/
		var mr, mt, cm = 0;
		if (t0 > t1)
		{
			for (var j = r0; j <= r1; j++)
			{
				for (var k = 0; k < t1; k++)
				{
					if (map[j][k][1] > cm)
					{
						cm = map[j][k][1];
						mr = j;
						mt = k;
					}
				}
				for (var k = t0 + 1; k < nj; k++)
				{
					if (map[j][k][1] > cm)
					{
						cm = map[j][k][1];
						mr = j;
						mt = k;
					}
				}
			}
		}
		else
		{
			for (var j = r0; j <= r1; j++)
			{
				for (var k = t0; k <= t1; k++)
				{
					if (map[j][k][1] > cm)
					{
						cm = map[j][k][1];
						mr = j;
						mt = k;
					}
				}
			}
		}
		list.push([p[i], val * lMax, i, ar, at, mr, mt]);
	}
	list.sort(function(a, b)
	{
		return b[1] - a[1]; // b - a: maior valor primeiro; a - b: menor valor primeiro
	});/*
	var sum = 0;
	for (var i = 0; i < 4; i++)
		sum += res[first ? 2 * i : i][8];
	var str = "";
	for (var i = 0; i < 4; i++)
	{
		for (var j = 4; j < 8; j++)
			str += res[first ? 2 * i : i][j].toString() + ", ";
		str += res[first ? 2 * i : i][8] + "\n";
	}*/
//	//console.log(str);
//	//console.log(res[list[0][2]]);//, sum, sum - res[list[0][2]][8]);
	if (!first)
	{
		switch (list[0][2])
		{
			case 0:
			case 1:
			case 4:
				theta += beta / 4;
				break;

			case 2:
			case 3:
			case 6:
				theta -= beta / 4;
				break;
		}
	}
	else
		theta = list[0][2] * Math.PI / (extra ? 4 : 2) + Math.PI / 4;
	path.push([parseInt(list[0][3]), parseInt(list[0][4]), parseInt(list[0][5]), parseInt(list[0][6]), depth]);

	if (maxRec > 12)
	{
		var l = [];
		for (var i = 0; i < (extra ? 8 : 4); i++)
		{
			path.push([parseInt(list[i][3]), parseInt(list[i][4]), parseInt(list[i][5]), parseInt(list[i][6]), depth]);
			var t = theta;
			switch (list[0][2])
			{
				case 0:
				case 1:
				case 4:
					t -= beta / 4;
					break;

				case 2:
				case 3:
				case 6:
					t += beta / 4;
					break;
			}
			switch (list[i][2])
			{
				case 0:
				case 1:
				case 4:
					t += beta / 4;
					break;

				case 2:
				case 3:
				case 6:
					t -= beta / 4;
					break;
			}
			if (first)
				t = list[i][2] * Math.PI / (extra ? 4 : 2) + Math.PI / 4;
			l.push(findBestInSphere(extra, best, mask, map, ii, jj, ni, nj, ori, v0, alpha / 2, beta / 2, t, list[i][0], res[list[i][2]][4], maxRec - 1, depth + 1, false, path));
		}
		l.sort(function(a, b)
		{
			return b[4] - a[4];
		});
		return l[0];
	}
	else
	{
		// condicao de parada: se nao houver candidato melhor que a recursao anterior E ja atingiu um candidato melhor que o original
		// condicao de parada: atingiu o maximo de recursoes
		if (maxRec == 0 || prev >= res[list[0][2]][4])
		{
			////console.log(((100 - 100 * prev / best) * -1).toFixed(3), prev.toFixed(5), best.toFixed(5), map[path[path.length - 1][0]][path[path.length - 1][1]][1].toFixed(5));
			if (res[list[0][2]][4] > best)
				return [p0, list[0][3], list[0][4], path, list[0][1]];
			else
				return [ori, 0, 0, [], 0];
		}
		else
			return findBestInSphere(extra, best, mask, map, ii, jj, ni, nj, ori, v0, alpha / 2, beta / 2, theta, list[0][0], res[list[0][2]][4], maxRec - 1, depth + 1, false, path);
	}
}


function getRenderValue(v0, v1, mask)
{
	var w  = renderer.domElement.clientWidth;
	var h  = renderer.domElement.clientHeight;
	var cw = (w > h) ? Math.floor((w / h) * 256) : 256;
	var ch = (h > w) ? Math.floor((h / w) * 256) : 256;
	var pw = Math.floor((cw - 256) / 2);
	var ph = Math.floor((ch - 256) / 2);
	var padw = (w > h) ? Math.floor((w - h) / 2.0) : 0;
	var padh = (h > w) ? Math.floor((h - w) / 2.0) : 0;

	var canvas = document.createElement("canvas");
	canvas.width  = cw;
	canvas.height = ch;
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";

	light.position.set(v1.x, v1.y, v1.z);
	emptyObj.position.set(v0.x, v0.y, v0.z);
	rend.render(mainScene2, camera);
	ctx.fillRect(0, 0, cw, ch);
	//ctx.drawImage(rend.domElement, padw, padh, w - padw * 2, h - padh * 2, 0, 0, 256, 256);
	ctx.drawImage(rend.domElement, 0, 0, w, h, 0, 0, cw, ch);
	var c00 = 0;
	var c01 = 0;
	var c10 = 0;
	var c11 = 0;
	var img = ctx.getImageData(pw, ph, 256, 256);
//	console.log(ctx.getImageData(0, 0, cw, ch).data);
//	console.log(cw, ch, pw, ph);
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


function teste()
{
	var canvas = document.createElement("canvas");
	canvas.width  = 640;
	canvas.height = 640;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(renderer1.domElement, 0, 0, 640, 640);
	ctx.drawImage(renderer.domElement, 0, 0, 640, 640);
	exportLink.href = canvas.toDataURL('image/png');
	exportLink.download = 'noshadow.png';
	exportLink.click();

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, 640, 640);
	ctx.drawImage(renderer3.domElement, 0, 0, 640, 640);
	exportLink.href = canvas.toDataURL('image/png');
	exportLink.download = 'mask.png';
	exportLink.click();

	canvas.remove();
}


function setNewLightVector(debug = false)
{
//	var inpt = prompt("Ponto 2D:");
	var inpt = contours[fc];
	if (inpt != "")
	{
		var list = inpt.split(" ");
/*
		vObj.visible         = false;
		vObjMask.visible     = false;
		floor.visible        = false;
		wObj.visible         = true;
		wPlane.visible       = true;
		hlObj.visible        = false;
		hlPoint.visible      = false;
		arrowHelper.visible  = false;
		gt.visible           = false;
*/
		vObj.visible         = false;
		vObjMask.visible     = false;
		floor.visible        = false;
		wObj.visible         = true;
		wPlane.visible       = true;

		setLightFromMask(list, debug);
//		setShadowFromSimilarity(list);
		//console.log("done!");

		hlObj.visible        = false;
		hlPoint.visible      = false;
		arrowHelper.visible  = false;
		gt.visible           = false;

		vObj.visible         = true;
		vObjMask.visible     = true;
		floor.visible        = true;
		wObj.visible         = false;
		wPlane.visible       = false;
	}
}


function onDocumentMouseDown(event)
{
	if (done)
		return;

	// the following line would stop any other event handler from firing (such as the mouse's TrackballControls)
	event.preventDefault();

	switch (event.button)
	{
		case 0: // left
			if (++fc >= files.length)
				fc = 0;
			//console.log(files[fc]);
			arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'image', sourceUrl: 'my-images/current/' + files[fc] });
			arToolkitSource.init(function onReady(){ onResize() });
			light.visible = false;
			update();
			break;

		case 1: // middle
			setNewLightVector(true);
			break;

		case 2: // right
			setNewLightVector();
			break;
	}
}


function onDocumentMouseWheel(event)
{
	var opa = shadowPlane.material.opacity;
	if (event.deltaY > 0)
		shadowPlane.material.opacity = Math.max(0, opa - 0.05);
	else if (event.deltaY < 0)
		shadowPlane.material.opacity = Math.min(1, opa + 0.05);
}


function onDocumentKeyDown(event)
{
	switch (event.which)
	{
		case 32: // Espaco
			setLightFromMask(contours[fc].split(" "), true);
			break;

		case 90: // Z
			if (--fc < 0)
				fc = files.length - 1;
			//console.log(fc, files[fc]);
			arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'image', sourceUrl: 'my-images/current/' + files[fc] });
			arToolkitSource.init(function onReady(){ onResize() });
			light.visible = false;
			update();
			break;

		case 88: // X
			setNewLightVector();
			break;

		case 67: // C
			if (++fc >= files.length)
				fc = 0;
			//console.log(fc, files[fc]);
			arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'image', sourceUrl: 'my-images/current/' + files[fc] });
			arToolkitSource.init(function onReady(){ onResize() });
			light.visible = false;
			update();
			break;

		default:
			////console.log(event.which);
	}
}


function angleBetween(va, vb)
{
	return va.angleTo(vb);
	if (va.angleTo(vb) == 0)
		return 0;
	return (va.x * vb.x + va.y * vb.y + va.z * vb.z) / (va.length() * vb.length());
//	angle = Math.acos((dot) / (Math.sqrt(va.x * va.x + va.y * va.y + va.z * va.z) * Math.sqrt(vb.x * va.x + vb.y * va.y + vb.z * va.z)))
}


function update()
{
	// copia posição e rotação do objeto virtual da primeira cena pra segunda
	vObjMask.position.set(vObj.position.x, vObj.position.y, vObj.position.z);
	vObjMask.rotation.set(vObj.rotation.x, vObj.rotation.y, vObj.rotation.z);

	// mesma coisa para a terceira
	wObj.position.set(vObj.position.x, vObj.position.y, vObj.position.z);
	wObj.rotation.set(vObj.rotation.x, vObj.rotation.y, vObj.rotation.z);

	// copia posição e rotação da primeira cena pra segunda
	scene2.position.x = scene1.position.x;
	scene2.position.y = scene1.position.y;
	scene2.position.z = scene1.position.z;
	scene2.rotation.x = scene1.rotation.x;
	scene2.rotation.y = scene1.rotation.y;
	scene2.rotation.z = scene1.rotation.z;
	scene2.visible    = scene1.visible;
/*
	// para testes
	vObj.rotation.y = vObj.rotation.y + 0.0031416;
	if (vObj.rotation.y > 2 * Math.PI)
		vObj.rotation.y = 0;
*/
	// update artoolkit every frame
	if (arToolkitSource.ready !== false)
		arToolkitContext.update(arToolkitSource.domElement);
}


function render()
{
//	if (!start || done)
//	renderer1.render(mainScene1, camera);
	renderer.render(mainScene2, camera);
//	renderer3.render(mainScene3, camera);
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}
