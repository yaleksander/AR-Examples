var scene, camera, renderer, rendererExport, clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var markerRoot1, markerRoot2, sceneExport;
var mesh1, mesh2, plane, sphere, material2, material5, rubrik;
var planeSize, virtualObjectHeight, light, helper;
var px, py, count = 1;
var mesh11, mesh12, mesh13, mesh14, mesh15, mesh16;
var mesh21, mesh22, mesh23, mesh24, mesh25, mesh26;
var ray   = new THREE.Raycaster();
var mouse = new THREE.Vector2();

initialize();
animate();

function initialize()
{
	scene       = new THREE.Scene();
	sceneExport = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	light = new THREE.DirectionalLight(0xffffff, 0.9);
	light.castShadow = true;
	scene.add(ambientLight);

	const d = 10;
	light.shadow.camera.left   = -d;
	light.shadow.camera.right  =  d;
	light.shadow.camera.top    =  d;
	light.shadow.camera.bottom = -d;

	// fov (degrees), aspect, near, far
	//camera = new THREE.PerspectiveCamera(32, 16.0 / 9.0, 1, 1000);
	camera = new THREE.Camera();
	camera.isPerspectiveCamera = true; // enable ray casting
	scene.add(camera);
	sceneExport.add(camera);

	helper = new THREE.DirectionalLightHelper(light, 0xFF8C00);
	//scene.add(new THREE.CameraHelper(camera));

	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize(640, 480);
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);

	rendererExport = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	rendererExport.setClearColor(new THREE.Color('black'), 0);
	rendererExport.setSize(640, 480);
//	rendererExport.domElement.style.display = 'none';
	rendererExport.domElement.style.backgroundColor = 'black';
	rendererExport.domElement.style.position = 'absolute';
	rendererExport.domElement.style.top = '0px';
	rendererExport.domElement.style.left = '640px';
	document.body.appendChild(rendererExport.domElement);

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
//		sourceType: 'webcam'
//		sourceType: 'image', sourceUrl: 'my-images/hiro-test-01.png'
		sourceType: 'image', sourceUrl: 'my-images/00001.jpg'
	});

	function onResize()
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
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	planeSize = 150;
	virtualObjectHeight = 1.35;

	const loader = new THREE.TextureLoader();
	const path = "my-textures/cube/rubrik/";
/*
	rubrik = [
		new THREE.MeshStandardMaterial({map: loader.load(path + "px.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "py.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "pz.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "nx.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "ny.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "nz.png")})
	];
*/
	rubrik = new THREE.MeshStandardMaterial({map: loader.load("my-textures/face/wood.png")});
	var tex1 = loader.load("my-textures/face/asphalt.png");
	var tex2 = loader.load("my-textures/face/concrete.png");
	var tex3 = loader.load("my-textures/face/marble.png");
	tex1.wrapS = THREE.RepeatWrapping;
	tex1.wrapT = THREE.RepeatWrapping;
	tex1.repeat.set(20, 20);
	tex2.wrapS = THREE.RepeatWrapping;
	tex2.wrapT = THREE.RepeatWrapping;
//	tex2.repeat.set(20, 20);
	tex3.wrapS = THREE.RepeatWrapping;
	tex3.wrapT = THREE.RepeatWrapping;
//	tex3.repeat.set(20, 20);
	var asphalt  = new THREE.MeshPhongMaterial({map: tex1});
	var concrete = new THREE.MeshPhongMaterial({map: tex2});
	var marble   = new THREE.MeshPhongMaterial({map: tex3});

	// build markerControls
	markerRoot1 = new THREE.Group();
	markerRoot2 = new THREE.Group();
	markerRoot3 = new THREE.Group();
	scene.add(markerRoot1);
	sceneExport.add(markerRoot2);
//	var markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
	var markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot3, {
		type: 'pattern', patternUrl: "data/kanji.patt",
	});

	var geometry1 = new THREE.CubeGeometry(virtualObjectHeight, virtualObjectHeight, virtualObjectHeight);
	var material1 = new THREE.MeshNormalMaterial({
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide,
	});
	material5 = new THREE.MeshStandardMaterial({
		transparent: true,
		color: 0x0088ff,
		side: THREE.DoubleSide,
	});
	mesh1 = new THREE.Mesh(geometry1, rubrik);
	//mesh1 = new THREE.Mesh(geometry1, material5);
	mesh1.position.y = virtualObjectHeight / 2;
	//mesh1.castShadow = true;
	
	material2 = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
	}); 
	mesh2 = new THREE.Mesh(geometry1, material2);

	var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
	var planeMat = new THREE.MeshPhongMaterial({
//	var planeMat = new THREE.ShadowMaterial({
		//transparent: true,
		//opacity: 0.75,
		color: 0x99ff33,
		side: THREE.DoubleSide,
	});
//	plane = new THREE.Mesh(planeGeo, planeMat);
	plane = new THREE.Mesh(planeGeo, asphalt);
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -0.05;
	plane.receiveShadow = true;

	var sphereGeo = new THREE.SphereGeometry(0.2);
	var sphereMat = new THREE.MeshNormalMaterial({
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide,
	});
	sphere = new THREE.Mesh(sphereGeo, sphereMat);

	markerRoot1.add(mesh1);
	markerRoot1.add(plane);
//	markerRoot1.add(sphere);
	markerRoot1.add(light);
//	markerRoot1.add(helper);

	markerRoot2.add(mesh2);

	var geometry3 = new THREE.SphereGeometry(virtualObjectHeight * 0.7, 32, 16);
	var material3 = new THREE.MeshPhongMaterial({
//		color: 0xff0000,
		map: tex2,
		side: THREE.DoubleSide,
	}); 
	var geometry4 = new THREE.SphereGeometry(virtualObjectHeight * 0.9, 32, 16);
	var material4 = new THREE.MeshPhongMaterial({
//		color: 0x0000ff,
		map: tex3,
		side: THREE.DoubleSide,
	}); 
	var material6 = new THREE.MeshPhongMaterial({
		color: 0xaa7722,
		side: THREE.DoubleSide,
	});
	plane2 = new THREE.Mesh(planeGeo, material6);
	plane2.rotation.y = 0.4;
	plane2.position.set(0, 0, -15);
	plane2.receiveShadow = true;
	mesh3 = new THREE.Mesh(geometry3, material3);
	mesh4 = new THREE.Mesh(geometry4, material4);
	mesh3.position.set( 3, 0, -6);
	mesh4.position.set( 2, 0,  1);
	mesh1.position.set(-1, 0,  4);
	mesh3.position.y = virtualObjectHeight * 0.6;
	mesh4.position.y = virtualObjectHeight * 0.4;
	mesh1.position.y = virtualObjectHeight / 2;
	mesh1.rotation.y = 0.7;
	mesh3.castShadow = true;
	mesh4.castShadow = true;
	//mesh1.castShadow = true;
	markerRoot1.add(mesh3);
	markerRoot1.add(mesh4);
	//markerRoot1.add(plane2);
	light.position.set(6, 3, 4);
	light.target = plane;
	camera.position.set(0, 5, 9);
	camera.lookAt(plane.position);
	var geo1 = new THREE.CubeGeometry(virtualObjectHeight, virtualObjectHeight, virtualObjectHeight);
	var geo3 = new THREE.TorusKnotGeometry(virtualObjectHeight * 0.4, virtualObjectHeight / 4, 128, 32);
	var geo4 = new THREE.TorusGeometry(virtualObjectHeight * 0.4, virtualObjectHeight / 4, 32, 32);
	var geo5 = new THREE.CylinderGeometry(virtualObjectHeight / 2, virtualObjectHeight / 2, virtualObjectHeight, 32);
	var geo6 = new THREE.ConeGeometry(virtualObjectHeight / 2, virtualObjectHeight);
	mesh11 = new THREE.Mesh(geo1, material5);
	mesh12 = new THREE.Mesh(geo1, rubrik);
	mesh13 = new THREE.Mesh(geo3, material5);
	mesh14 = new THREE.Mesh(geo4, material5);
	mesh15 = new THREE.Mesh(geo5, material5);
	mesh16 = new THREE.Mesh(geo6, material5);
	mesh21 = new THREE.Mesh(geo1, material2);
	mesh22 = new THREE.Mesh(geo1, material2);
	mesh23 = new THREE.Mesh(geo3, material2);
	mesh24 = new THREE.Mesh(geo4, material2);
	mesh25 = new THREE.Mesh(geo5, material2);
	mesh26 = new THREE.Mesh(geo6, material2);
	var x = mesh1.position.x;
	var y = mesh1.position.y;
	var z = mesh1.position.z;
	mesh2.position.set(x, y, z);
	mesh11.position.set(x, y, z);
	mesh12.position.set(x, y, z);
	mesh13.position.set(x, y, z);
	mesh14.position.set(x, y, z);
	mesh15.position.set(x, y, z);
	mesh16.position.set(x, y, z);
	mesh21.position.set(x, y, z);
	mesh22.position.set(x, y, z);
	mesh23.position.set(x, y, z);
	mesh24.position.set(x, y, z);
	mesh25.position.set(x, y, z);
	mesh26.position.set(x, y, z);
	x = mesh1.rotation.x;
	y = mesh1.rotation.y;
	z = mesh1.rotation.z;
	mesh2.rotation.set(x, y, z);
	mesh11.rotation.set(x, y, z);
	mesh12.rotation.set(x, y, z);
	mesh13.rotation.set(x, y, z);
	mesh14.rotation.set(x, y, z);
	mesh15.rotation.set(x, y, z);
	mesh16.rotation.set(x, y, z);
	mesh21.rotation.set(x, y, z);
	mesh22.rotation.set(x, y, z);
	mesh23.rotation.set(x, y, z);
	mesh24.rotation.set(x, y, z);
	mesh25.rotation.set(x, y, z);
	mesh26.rotation.set(x, y, z);
	markerRoot1.add(mesh11);
	markerRoot1.add(mesh12);
	markerRoot1.add(mesh13);
	markerRoot1.add(mesh14);
	markerRoot1.add(mesh15);
	markerRoot1.add(mesh16);
	markerRoot2.add(mesh21);
	markerRoot2.add(mesh22);
	markerRoot2.add(mesh23);
	markerRoot2.add(mesh24);
	markerRoot2.add(mesh25);
	markerRoot2.add(mesh26);
	mesh1.visible = false;
	mesh11.visible = true;
	mesh12.visible = false;
	mesh13.visible = false;
	mesh14.visible = false;
	mesh15.visible = false;
	mesh16.visible = false;
	mesh2.visible = false;
	mesh21.visible = true;
	mesh22.visible = false;
	mesh23.visible = false;
	mesh24.visible = false;
	mesh25.visible = false;
	mesh26.visible = false;

	document.addEventListener("mousedown", onDocumentMouseDown, false);
}


function onDocumentMouseDown(event)
{
	// the following line would stop any other event handler from firing (such as the mouse's TrackballControls)
	// event.preventDefault();

	switch (event.button)
	{
		case 0: // left
			changeImage2();
			break;

		case 1: // middle
			setShadowPos();
			break;

		case 2: // right
			break;
	}
}


function changeImage2()
{
	count++;
	if (count > 7)
		count = 1;
	mesh11.visible = false;
	mesh12.visible = false;
	mesh13.visible = false;
	mesh14.visible = false;
	mesh15.visible = false;
	mesh16.visible = false;
	mesh21.visible = false;
	mesh22.visible = false;
	mesh23.visible = false;
	mesh24.visible = false;
	mesh25.visible = false;
	mesh26.visible = false;
	mesh3.visible = true;
	mesh4.visible = true;
	switch (count)
	{
		case 1:
			mesh11.visible = true;
			mesh21.visible = true;
			break;

		case 2:
			mesh12.visible = true;
			mesh22.visible = true;
			break;

		case 3:
			mesh13.visible = true;
			mesh23.visible = true;
			break;

		case 4:
			mesh14.visible = true;
			mesh24.visible = true;
			break;

		case 5:
			mesh15.visible = true;
			mesh25.visible = true;
			break;

		case 6:
			mesh16.visible = true;
			mesh26.visible = true;
			break;

		case 7:
			mesh3.visible = false;
			mesh4.visible = false;
			break;
	}
	mesh2 = new THREE.Mesh(mesh1.geometry, material2);
	camera.lookAt(plane.position);
}


function changeImage()
{
	count++;
	if (count > 18)
		count = 1;
	arToolkitSource = new THREEx.ArToolkitSource({sourceType: "image", sourceUrl: "my-images/000" + (count < 10 ? "0" : "") + count + ".jpg"});
	switch (count)
	{
		case  1:
			px = 145;
			py = 145;
			break;

		case  2:
			px = 121;
			py = 132;
			break;

		case  3:
			px = 115;
			py = 141;
			break;

		case  4:
			px = 118;
			py = 122;
			break;

		case  5:
			px = 144;
			py = 148;
			break;

		case  6:
			px =  86;
			py = 146;
			break;

		case  7:
			px = 132;
			py = 134;
			break;

		case  8:
			px = 141;
			py = 121;
			break;

		case  9:
			px = 135;
			py = 135;
			break;

		case 10:
			px =  96;
			py = 139;
			break;

		case 11:
			px = 140;
			py = 145;
			break;

		case 12:
			px =  97;
			py = 139;
			break;

		case 13:
			px = 163;
			py = 146;
			break;

		case 14:
			px = 159;
			py = 110;
			break;

		case 15:
			px = 149;
			py = 146;
			break;

		case 16:
			px = 121;
			py = 118;
			break;

		case 17:
			px = 187;
			py = 153;
			break;

		case 18:
			px =  83;
			py = 144;
			break;
	}
	px = Math.round(px * 1.875 + 80);
	py = Math.round(py * 1.875);
	arToolkitSource.init(function onReady(){});
}


// por algum motivo a sombra não carrega corretamente junto com a imagem e a função setTimeout não ajuda
function setShadowPos()
{
	mouse.x =  ((px - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth)  * 2 - 1;
	mouse.y = -((py - renderer.domElement.offsetTop)  / renderer.domElement.clientHeight) * 2 + 1;
	ray.setFromCamera(mouse, camera);
	var i = ray.intersectObject(plane);
	if (i.length > 0)
	{
		var shadow_center  = new THREE.Vector3();
		var mesh_top       = mesh1.position.clone();
		var mesh_bottom    = mesh1.position.clone();
		shadow_center.x    = plane.position.x + i[0].uv.x * planeSize - planeSize / 2;
		shadow_center.y    = plane.position.y;
		shadow_center.z    = plane.position.z - i[0].uv.y * planeSize + planeSize / 2;
		mesh_top.y        += virtualObjectHeight / 2;
		mesh_bottom.y      = plane.position.y;
		var mesh_to_shadow = new THREE.Vector3().subVectors(shadow_center, mesh_bottom).multiplyScalar(1);
		var light_pos      = mesh_top.clone().add(new THREE.Vector3().subVectors(mesh_top, mesh_to_shadow).multiplyScalar(1));
		sphere.position.x  = mesh_to_shadow.x;
		sphere.position.y  = mesh_to_shadow.y;
		sphere.position.z  = mesh_to_shadow.z;
		light.position.set(light_pos.x, light_pos.y, light_pos.z);
		light.target = sphere;
		helper.update();
	}
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
	// update mesh position and orientation on second scene
	mesh2.position.set(mesh1.position.x, mesh1.position.y, mesh1.position.z);

	// update scene position and orientation on second scene
	markerRoot2.position.x = markerRoot1.position.x;
	markerRoot2.position.y = markerRoot1.position.y;
	markerRoot2.position.z = markerRoot1.position.z;
	markerRoot2.rotation.x = markerRoot1.rotation.x;
	markerRoot2.rotation.y = markerRoot1.rotation.y;
	markerRoot2.rotation.z = markerRoot1.rotation.z;
	markerRoot2.visible    = markerRoot1.visible;

	// update artoolkit on every frame
	if (arToolkitSource.ready !== false)
		arToolkitContext.update(arToolkitSource.domElement);
}


function render()
{
	renderer.render(scene, camera);
	rendererExport.render(sceneExport, camera);
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}
