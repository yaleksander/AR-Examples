var clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var camera, renderer1, renderer2, renderer3
var scene1, scene2, scene3;
var emptyObj, vObj, vObjMask, shadowPlane, light, floor;

var ray   = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var planeSize, vObjHeight;

initialize();
animate();

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
	camera = new THREE.PerspectiveCamera(32, 1, 1, 1000);
	//camera = new THREE.Camera();
	camera.isPerspectiveCamera = true; // enable ray casting
	mainScene1.add(camera);
	mainScene2.add(camera);
	mainScene3.add(camera);

	/**********************************************************************************************
	 *
	 * Renderers e canvas
	 *
	 *********************************************************************************************/

	renderer1 = new THREE.WebGLRenderer({
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

	renderer2 = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer2.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer2.setSize(640, 640);
	renderer2.domElement.style.position = 'absolute';
	renderer2.domElement.style.top = '0px';
	renderer2.domElement.style.left = '0px';
	renderer2.shadowMap.enabled = true;
	document.body.appendChild(renderer2.domElement);

	renderer3 = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer3.setClearColor(new THREE.Color('black'), 0);
	renderer3.setSize(640, 640);
	renderer3.domElement.style.backgroundColor = 'black';
	renderer3.domElement.style.position = 'absolute';
	renderer3.domElement.style.top = '0px';
	renderer3.domElement.style.left = '640px';
	document.body.appendChild(renderer3.domElement);

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	/**********************************************************************************************
	 *
	 * AR Toolkit
	 *
	 *********************************************************************************************/

	arToolkitSource = new THREEx.ArToolkitSource({
		//sourceType: 'webcam'
		sourceType: 'image', sourceUrl: 'my-images/scene.png'
	});

	function onResize() // disabled
	{
		//arToolkitSource.onResize()	
		//arToolkitSource.copySizeTo(renderer.domElement)	
		/*if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
		}*/
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
/*
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
*/	
	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
		camera.aspect = 1.0;
		camera.updateProjectionMatrix();
	});


	/**********************************************************************************************
	 *
	 * Declaração de variáveis globais
	 *
	 *********************************************************************************************/

	planeSize  = 150.00;
	vObjHeight =   1.35;

	/**********************************************************************************************
	 *
	 * Texturas
	 *
	 *********************************************************************************************/

	var loader = new THREE.TextureLoader();

	var tex1 = loader.load("my-textures/face/asphalt.png");
	var tex2 = loader.load("my-textures/face/concrete.png");
	var tex3 = loader.load("my-textures/face/marble.png");
	var tex4 = loader.load("my-textures/face/wood.png");

	tex1.wrapS = THREE.RepeatWrapping;
	tex1.wrapT = THREE.RepeatWrapping;
	tex1.repeat.set(20, 20);

	var asphalt  = new THREE.MeshPhongMaterial({map: tex1});
	var concrete = new THREE.MeshPhongMaterial({map: tex2});
	var marble   = new THREE.MeshPhongMaterial({map: tex3});
	var wood     = new THREE.MeshPhongMaterial({map: tex4});

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
	var markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, scene0, {
		type: 'pattern', patternUrl: "data/kanji.patt",
	});

	/**********************************************************************************************
	 *
	 * Iluminação
	 *
	 *********************************************************************************************/

	var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	light = new THREE.DirectionalLight(0xffffff, 0.9);

	light.castShadow = true;

	var d = 10;
	light.shadow.camera.left   = -d;
	light.shadow.camera.right  =  d;
	light.shadow.camera.top    =  d;
	light.shadow.camera.bottom = -d;

	/**********************************************************************************************
	 *
	 * Geometrias
	 *
	 *********************************************************************************************/

	var cube    = new THREE.CubeGeometry(vObjHeight, vObjHeight, vObjHeight);
	var plane   = new THREE.PlaneGeometry(planeSize, planeSize, 150, 150);
	var sphere1 = new THREE.SphereGeometry(vObjHeight * 0.7, 32, 16);
	var sphere2 = new THREE.SphereGeometry(vObjHeight * 0.9, 32, 16);

	/**********************************************************************************************
	 *
	 * Objetos 3D presentes nas cenas
	 *
	 *********************************************************************************************/

	emptyObj    = new THREE.Mesh();//new THREE.SphereGeometry(0.2), new THREE.MeshNormalMaterial());
	vObj        = new THREE.Mesh(cube,    wood);
	vObjMask    = new THREE.Mesh(cube,    maskMat);
	shadowPlane = new THREE.Mesh(plane,   shadowMat);

	var floor        = new THREE.Mesh(plane,   asphalt);
	var stoneSphere1 = new THREE.Mesh(sphere1, marble);
	var stoneSphere2 = new THREE.Mesh(sphere2, marble);

	/**********************************************************************************************
	 *
	 * Ajustes de posição, rotação, etc.
	 *
	 *********************************************************************************************/

	vObj.position.set        ( -1,   0,   4);
	stoneSphere1.position.set(  3,   0,  -6);
	stoneSphere2.position.set(  2,   0,   1);
	light.position.set       (  6,   3,   4);
	camera.position.set      (  0,   9,  16);

	camera.lookAt(floor.position);
	light.target = floor;

	vObj.rotation.y = 0.7;

	floor.receiveShadow = true;
	//floor.visible = false;
	shadowPlane.receiveShadow = true;
	stoneSphere1.castShadow = true;
	stoneSphere2.castShadow = true;
	//vObj.castShadow = false;

	floor.rotation.x = -Math.PI / 2;
	shadowPlane.rotation.x = -Math.PI / 2;
	floor.position.y = -0.05;
	vObj.position.y = vObjHeight / 2;
	stoneSphere1.position.y = vObjHeight * 0.6;
	stoneSphere2.position.y = vObjHeight * 0.4;
	shadowPlane.position.y = floor.position.clone().y;

	/**********************************************************************************************
	 *
	 * Ajustes de posição e rotação
	 *
	 *********************************************************************************************/

	scene1.add(ambientLight.clone());
	scene2.add(ambientLight.clone());

	scene1.add(floor);
	scene1.add(light.clone());
	scene1.add(stoneSphere1);
	scene1.add(stoneSphere2);

	scene2.add(vObj);
	scene2.add(shadowPlane);
	scene2.add(emptyObj);
	scene2.add(light);

	scene3.add(vObjMask);

	document.addEventListener("mousedown", onDocumentMouseDown, false);
}


function onDocumentMouseDown(event)
{
	// the following line would stop any other event handler from firing (such as the mouse's TrackballControls)
	// event.preventDefault();

	switch (event.button)
	{
		case 0: // left
			//console.log(event.clientX, event.clientY);
			//break;

		case 1: // middle
			var x =  42 * 2.5;
			var y = 188 * 2.5 - 80;
			setShadowPos(x, y);
			break;

		case 2: // right
			break;
	}
}


function setShadowPos(x, y)
{
	mouse.x =  ((x - renderer2.domElement.offsetLeft) / renderer2.domElement.clientWidth)  * 2 - 1;
	mouse.y = -((y - renderer2.domElement.offsetTop)  / renderer2.domElement.clientHeight) * 2 + 1;
	ray.setFromCamera(mouse, camera);
	var i = ray.intersectObject(shadowPlane);
	if (i.length > 0)
	{
		var meshTop = vObj.position.clone();
		meshTop.y += vObjHeight / 2;
		var atb = meshTop.clone().sub(i[0].point);
		meshTop.add(atb.multiplyScalar(1));
		light.position.set(meshTop.x, meshTop.y, meshTop.z);
		emptyObj.position.set(i[0].point.x, i[0].point.y, i[0].point.z);
		light.target = emptyObj;
	}
	vObj.castShadow = true;
}


function teste()
{
	var dataURL = renderer.domElement.toDataURL('image/png');
	//var dataURL = document.getElementsByTagName("canvas")[0].toDataURL('image/png');
	exportLink.href = dataURL;//.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
	exportLink.download = 'export.png';
	exportLink.click();
}


function update()
{
	// copia posição e rotação do objeto virtual da primeira cena pra segunda
	vObjMask.position.set(vObj.position.x, vObj.position.y, vObj.position.z);
	vObjMask.rotation.set(vObj.rotation.x, vObj.rotation.y, vObj.rotation.z);

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
	renderer1.render(mainScene1, camera);
	renderer2.render(mainScene2, camera);
	renderer3.render(mainScene3, camera);
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}
