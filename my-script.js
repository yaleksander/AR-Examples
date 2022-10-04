var clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var camera, renderer1, renderer, renderer3;
var mainScene1, mainScene2, mainScene3;
var scene1, scene2, scene3;
var emptyObj, vObj, vObjMask, shadowPlane, light, floor;
var hlObj, hlPoint, arrowHelper, gt, wObj, wPlane, dPlane;
var origLight, stoneSphere1, stoneSphere2, metalCylinder, woodCube, rubrikCube, stoneCube1, stoneCube2;
var asphaltFloor, stoneFloor, grassFloor;
var gtObj1, gtObj2, gtObj3, gtLine1, gtLine2, gtLine3, gtPlane, phase;
var adjustX, adjustZ;
var lightFm, emptyObjFm, lp, ltp, lfp, lftp, whichLight = true;
var files, fc, uival, fmval, done = false;

var ray    = new THREE.Raycaster();
var mouse  = new THREE.Vector2();
var loader = new THREE.TextureLoader();

var planeSize, vObjHeight;
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

	planeSize  = 150.00;
	vObjHeight =   1.20;
	adjustX    =   0.00;
	adjustZ    =   0.00;

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
	origLight = new THREE.DirectionalLight(0xffffff, 2);
	origLight.castShadow = true;
	var d = vObjHeight * 40;
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

	var cube     = new THREE.BoxBufferGeometry(vObjHeight, vObjHeight, vObjHeight);
	var plane    = new THREE.PlaneGeometry(planeSize, planeSize, 150, 150);
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
	shadowPlane   = new THREE.Mesh(plane,   shadowMat);
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
	vObj.position.y = vObjHeight / 2;
	rubrikCube.position.y = vObjHeight / 2;
	stoneSphere1.position.y = vObjHeight * 0.6;
	stoneSphere2.position.y = vObjHeight * 0.4;
	shadowPlane.position.y = floor.position.clone().y;
	wPlane.rotation.x = -Math.PI / 2;
	wPlane.position.y = floor.position.clone().y - 0.01;
	dPlane.rotation.x = -Math.PI / 2;
	dPlane.position.y = floor.position.clone().y - 0.01;
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
			origLight.position.set(10 * vObjHeight, vObjHeight / 2, vObjHeight / 2);
			light.position.set    (10 * vObjHeight, vObjHeight / 2, vObjHeight / 2);
//			console.log(light.position);
//			console.log(light.target.position);
			vObj.position.set     (adjustX, vObjHeight / 2, adjustZ);
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
	vObj.position.y = vObjHeight / 2;
	update();
}


function setShadowFromGroundTruth(list, debug = false)
{
	console.log("start");

	var v1     = [];
	var v2     = [];
	var v3     = [];
	var v4     = [];
	var vDebug = [];

	// adquire conjunto de pontos a partir dos vertices do objeto virtual
/*
	var position = vObj.geometry.attributes.position;
	for (var i = 0; i < position.count; i++)
		v1.push(new THREE.Vector3().fromBufferAttribute(position, i));
	getMidPoints(v1, 0.001, 1);
*/
	// adquire conjunto de pontos a partir dos triangulos da geometria
	var pos = vObj.geometry.toNonIndexed().attributes.position;
	for (var i = 0; i < pos.count; i += 3)
	{
		var t1  = new THREE.Vector3().fromBufferAttribute(pos, i);
		var t2  = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
		var t3  = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
		v1.push(new THREE.Vector3((t1.x + t2.x + t3.x) / 3, (t1.y + t2.y + t3.y) / 3, (t1.z + t2.z + t3.z) / 3));
	}

	// passa os pontos adquiridos para valores globais
	for (var i = 0; i < v1.length; i++)
	{
		v1[i].x += vObj.position.x;
		v1[i].y += vObj.position.y;
		v1[i].z += vObj.position.z;

		// elimina os pontos abaixo de 25% da altura do objeto virtual
//		if (v1[i].y < vObjHeight / 4)
//			v1.splice(i--, 1);

		if (debug)
		{
			var newObj = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
			newObj.position.set(v1[i].x, v1[i].y, v1[i].z);
			vDebug.push(newObj.clone());
		}
	}

	console.log("get floor points");

	// adquire conjunto de pontos a partir dos pontos 2d da sombra
	var k = 0;
	while (k < list.length)
	{
		var w    = renderer.domElement.clientWidth;
		var h    = renderer.domElement.clientHeight;
		var padw = (w > h) ? Math.floor((w - h) / 2.0) : 0;
		var padh = (h > w) ? Math.floor((h - w) / 2.0) : 0;
		var m    = ((w > h) ? h : w) / 256.0;
		x        = parseInt(list[k++]) * m + padw;
		y        = parseInt(list[k++]) * m + padh;
		mouse.x  =  (x / w) * 2 - 1;
		mouse.y  = -(y / h) * 2 + 1;

		ray.setFromCamera(mouse, camera);
		var i = ray.intersectObject(shadowPlane);
		if (i.length > 0)
			v2.push(new THREE.Vector3((i[0].uv.x - 0.5) * planeSize, shadowPlane.position.y, (0.5 - i[0].uv.y) * planeSize));
	}

	console.log("shrink list");

	// reduz o tamanho da segunda lista
	var t = 0.2;
	if (debug)
	for (var i = 0; i < v2.length - 1; i++)
		for (var j = i + 1; j < v2.length; j++)
			if (v2[i].distanceTo(v2[j]) < t)
				v2.splice(j--, 1);

	if (debug)
	{
		for (var i = 0; i < v2.length; i++)
		{
			var newObj = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
			newObj.position.set(v2[i].x, v2[i].y, v2[i].z);
			vDebug.push(newObj.clone());
		}
	}

	console.log("combine");

	// liga os pontos
	var v4 = [];
	for (var i = 0; i < v1.length; i++)
	{
		for (var j = 0; j < v2.length; j++)
		{
			var aux = v1[i].clone().sub(v2[j].clone());
			var v   = aux.clone().normalize().multiplyScalar(2 * vObjHeight).add(v1[i].clone()); // quanto maior o escalar, mais longe fica a fonte de luz
			v4.push([v1[i], v2[j], v, aux, Math.atan2(aux.z, aux.x) * 180 / Math.PI + 180]);
		}
	}

	console.log("sort");

	// ordena a lista
	v4.sort(function(a, b)
	{
		return a[4] - b[4];
	});

	console.log(v4.length);

	// reduz o tamaho da lista final
	/*
	var v3 = [];
	var step = Math.ceil(v4.length / 200);
	for (var i = 0; i < v4.length; i += step)
		v3.push(v4[i]);
	*/
	v3 = v4;

	console.log("compare");

//	console.log(list);
	var mask = [];
	for (var i = 0; i < 65536; i++)
		mask[i] = 1;
	for (var i = 0; i < list.length; i += 2)
		mask[parseInt(list[i]) + parseInt(list[i + 1]) * 256] = 0;

	var canvas = document.createElement("canvas");
	canvas.width  = 256;
	canvas.height = 256;
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";

	var rend = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
		antialias: true,
		alpha: true
	});
	rend.setClearColor(new THREE.Color('white'), 0);
	var w = renderer.domElement.clientWidth;
	var h = renderer.domElement.clientHeight;
	rend.setSize(w, h);
	rend.shadowMap.enabled = true;

	var grid = 0;
	var size = 4096;
	while (Math.pow(++grid, 2) + 1 < v3.length);
	var mult = size / (grid * 256);
	var canvas2 = document.createElement("canvas");
	var sqr = Math.floor(size / grid);
	canvas2.width  = size;
	canvas2.height = size;
	var ctx2 = canvas2.getContext("2d");
	ctx2.fillStyle = "black";
	ctx2.fillRect(0, 0, size, size);
	var padw = (w > h) ? Math.floor((w - h) / 2.0) : 0;
	var padh = (h > w) ? Math.floor((h - w) / 2.0) : 0;

	light.visible = true;
	light.target = emptyObj;

	var mi = 0, mv = 0;
	var mpre = 0, mrec = 0, mf = 0;
	var kpre = 0, krec = 0, kf = 0;

	for (k = 0; k < v3.length; k++)
	{
		var p1 = v3[k][1].clone();
		var p2 = v3[k][2].clone();
		console.log("/ ".concat(v3.length));
		light.position.set(p2.x, p2.y, p2.z);
		emptyObj.position.set(p1.x, p1.y, p1.z);
		rend.render(mainScene2, camera);
		ctx.fillRect(0, 0, 256, 256);
		ctx.drawImage(rend.domElement, padw, padh, w - padw, h - padh, 0, 0, 256, 256);
//		ctx2.drawImage(rend.domElement, padw, padh, w - padw, h - padh, (k % grid) * sqr, Math.floor(k / grid) * sqr, sqr, sqr);
		var c00 = 0;
		var c01 = 0;
		var c10 = 0;
		var c11 = 0;
		var d   = ctx.getImageData(0, 0, 256, 256).data;
//		var str = "";
		for (var i = 0; i < 65536; i++)
		{
//			console.log(d[i * 4]);
			var c = (d[i * 4] > 240) ? 1 : 0;
//			if (i % 256 == 0 && i > 0)
//				str += "\n";
//			str += (mask[i] == 0) ? " " : ".";
			if (c == 0 && mask[i] == 0)
				c00++;
			else if (c == 0 && mask[i] == 1)
				c01++;
			else if (c == 1 && mask[i] == 0)
				c10++;
			else
				c11++;
		}
//		console.log(str);
		if (c00 == 0)
			continue;
		// https://machinelearningmastery.com/precision-recall-and-f-measure-for-imbalanced-classification/#:~:text=Precision%20quantifies%20the%20number%20of,and%20recall%20in%20one%20number
		var uni = c00 + c01 + c10;
		var ins = c00;
		var pre = parseFloat(c00)           / parseFloat(c00 + c01);
		var rec = parseFloat(c00)           / parseFloat(c00 + c10);
		var fme = parseFloat(2 * pre * rec) / parseFloat(pre + rec);
//		var val = 1 * c00 - (c01 + c10);
		var val = 65536 - (c01 + c10);
//		console.log(c00, c01, c10, c11, uni, ins, 65536 - val, (1 - (parseFloat(val) / 65536)).toFixed(2), pre.toFixed(2), rec.toFixed(2), fme.toFixed(2));
		if (val > mv)
		{
			mv = val;
			mi = k;
		}
		if (pre > mpre)
		{
			mpre = pre;
			kpre = k;
		}
		if (rec > mrec)
		{
			mrec = rec;
			krec = k;
		}
		if (fme > mf)
		{
			mf = fme;
			kf = k;
		}
		//console.log(parseFloat(val) / 65536.0, fme, uni, ins, pre, rec, c00, c01, c10, c11);
	}
/*
	var link = document.getElementById('exportLink');
	link.setAttribute('download', 'test.png');
	link.setAttribute('href', canvas2.toDataURL("image/png").replace("image/png", "image/octet-stream"));
	link.click();
*/
//	console.log(1 - parseFloat(mv) / 65536, mf);

	k = mi;

	light.position.set(v3[k][2].x, v3[k][2].y, v3[k][2].z);
	emptyObj.position.set(v3[k][1].x, v3[k][1].y, v3[k][1].z);

	if (debug)
	{
		var pObj = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
		var pLgt = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
		var pFlr = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
		pObj.position.set(v3[k][0].x, v3[k][0].y, v3[k][0].z);
		pLgt.position.set(v3[k][2].x, v3[k][2].y, v3[k][2].z);
		pFlr.position.set(v3[k][1].x, v3[k][1].y, v3[k][1].z);
		scene2.add(pObj);
		scene2.add(pLgt);
		scene2.add(pFlr);
		var geo = new THREE.Geometry();
		geo.vertices.push(v3[k][2].clone());
		geo.vertices.push(v3[k][1].clone());
		scene2.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffff00 })));
		vObj.material.opacity = 0.75;
		vObj.material.transparent = true;
		for (var i = 0; i < vDebug.length; i++)
			scene2.add(vDebug[i]);
		var str = "";
		for (var i = 0; i < 65536; i++)
		{
			if (i % 256 == 0 && i > 0)
				str += "\n";
			str += (mask[i] == 0) ? " " : ".";
		}
		console.log(str);
	}

	done = true;
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
	console.log(n, step);
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


function findShadow(debug = false)
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

		setShadowFromGroundTruth(list, debug);
//		setShadowFromSimilarity(list);
		console.log("done!");

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
			console.log(fc, files[fc]);
			arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'image', sourceUrl: 'my-images/current/' + files[fc] });
			arToolkitSource.init(function onReady(){ onResize() });
			light.visible = false;
			update();
			break;

		case 1: // middle
			findShadow(true);
			break;

		case 2: // right
			findShadow();
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
			setShadowFromGroundTruth(contours[fc].split(" "), true);
			break;

		case 90: // Z
			if (--fc < 0)
				fc = files.length - 1;
			console.log(fc, files[fc]);
			arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'image', sourceUrl: 'my-images/current/' + files[fc] });
			arToolkitSource.init(function onReady(){ onResize() });
			light.visible = false;
			update();
			break;

		case 88: // X
			findShadow();
			break;

		case 67: // C
			if (++fc >= files.length)
				fc = 0;
			console.log(fc, files[fc]);
			arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'image', sourceUrl: 'my-images/current/' + files[fc] });
			arToolkitSource.init(function onReady(){ onResize() });
			light.visible = false;
			update();
			break;

		default:
			console.log(event.which);
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

	// update artoolkit every frame
	if (arToolkitSource.ready !== false)
		arToolkitContext.update(arToolkitSource.domElement);
}


function render()
{
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
