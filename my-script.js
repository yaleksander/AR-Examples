var scene, camera, renderer, rendererExport, clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var markerRoot1, markerRoot2, sceneExport;
var mesh1, mesh2, plane, sphere;
var planeSize, virtualObjectHeight, light, helper;

var ray   = new THREE.Raycaster();
var mouse = new THREE.Vector2();

initialize();
animate();

function initialize()
{
	scene       = new THREE.Scene();
	sceneExport = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	light = new THREE.DirectionalLight(0xffffff, 0.8);
	light.castShadow = true;
	scene.add(ambientLight);

	// fov (degrees), aspect, near, far
	//camera = new THREE.PerspectiveCamera(32, 16.0 / 9.0, 1, 1000);
	camera = new THREE.Camera();
	camera.isPerspectiveCamera = true; // enable ray casting
	scene.add(camera);
	sceneExport.add(camera);

	helper = new THREE.DirectionalLightHelper(light, 0xFF8C00);
	scene.add(new THREE.CameraHelper(camera));

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
		sourceType: 'image', sourceUrl: 'my-images/00015.jpg'
	});

	function onResize()
	{
/*
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
		}
*/
	}

	arToolkitSource.init(function onReady(){
//		onResize()
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
	virtualObjectHeight = 1;

	const loader = new THREE.TextureLoader();
	const path = "my-textures/cube/rubrik/";
	const rubrik = [
		new THREE.MeshStandardMaterial({map: loader.load(path + "px.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "py.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "pz.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "nx.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "ny.png")}),
		new THREE.MeshStandardMaterial({map: loader.load(path + "nz.png")})
	];

	// build markerControls
	markerRoot1 = new THREE.Group();
	markerRoot2 = new THREE.Group();
	scene.add(markerRoot1);
	sceneExport.add(markerRoot2);
	var markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type: 'pattern', patternUrl: "data/hiro.patt",
	});

	var geometry1 = new THREE.CubeGeometry(virtualObjectHeight, virtualObjectHeight, virtualObjectHeight);
	var material1 = new THREE.MeshNormalMaterial({
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide,
	}); 
	mesh1 = new THREE.Mesh(geometry1, rubrik);
	mesh1.position.y = virtualObjectHeight / 2;
	mesh1.castShadow = true;
	
	var material2 = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
	}); 
	mesh2 = new THREE.Mesh(geometry1, material2);
	mesh2.position.y = virtualObjectHeight / 2;

	var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
	var planeMat = new THREE.ShadowMaterial({
		transparent: true,
		opacity: 0.75,
		side: THREE.DoubleSide,
	});
	plane = new THREE.Mesh(planeGeo, planeMat);
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = 0.1;
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
	markerRoot1.add(sphere);
	markerRoot1.add(light);
	markerRoot1.add(helper);

	markerRoot2.add(mesh2);

	document.addEventListener("mousedown", onDocumentMouseDown, false);
}


function onDocumentMouseDown(event)
{
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();

	switch (event.button)
	{
		case 0: // left
			if (mesh1.visible)
			{
				mouse.x =  ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth)  * 2 - 1;
				mouse.y = -((event.clientY - renderer.domElement.offsetTop)  / renderer.domElement.clientHeight) * 2 + 1;
				ray.setFromCamera(mouse, camera);
				var i = ray.intersectObject(plane);
				if (i.length > 0)
				{
/*
					console.log(i);
					console.log(i[0].point.x, i[0].point.y, i[0].point.z);
					console.log(i[0].uv.x, i[0].uv.y);
					console.log(plane.position.x, plane.position.y, plane.position.z);
					console.log(ray);
*/
					sphere.position.x = plane.position.x + i[0].uv.x * planeSize - planeSize / 2;
					sphere.position.y = plane.position.y;
					sphere.position.z = plane.position.z - i[0].uv.y * planeSize + planeSize / 2;
					var v = mesh1.position.clone();
					v.y += virtualObjectHeight / 2;
					v.add(new THREE.Vector3().subVectors(v, sphere.position);//.multiplyScalar(2));
					light.position.set(v.x, v.y, v.z);
					light.target = sphere;
					helper.update();
/*
					console.log(v);
					console.log(light);
*/
				}
			}
			break;

		case 1: // middle
			count++;
			if (count == 3 || count == 13)
				count++;
			else if (count > 4 && count < 11)
				count = 12;
			else if (count > 15)
				count = 1;
			arToolkitSource = new THREEx.ArToolkitSource({sourceType: "image", sourceUrl: "my-images/000" + (count < 10 ? "0" : "") + count + ".jpg"});
			arToolkitSource.init(function onReady(){});
			break;

		case 2: // right
			rendererExport.render(sceneExport, camera);
			console.log(camera.position);
			console.log(markerRoot1.position);
			console.log(mesh2.position);
//			setTimeout(teste, 5);
			break;
	}
}
var count = 1;


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
	// update cube position and orientation on second scene
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
