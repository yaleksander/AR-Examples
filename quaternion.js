var scene, camera, renderer, clock, deltaTime, totalTime;

var sphere, sphere0, sphere1, sphere2, v0, v1, v2, camV1, camV2, camR1, camR2, zoom = 1;

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );

	camV1 = new THREE.Vector3(0, 2, 4);
	camR1 = 0;
	camR2 = 0;
	camera.position.set(camV1.x, camV1.y, camV1.z);
	camera.lookAt(scene.position);	
	scene.add(camera);

	var ambientLight = new THREE.AmbientLight( 0xcccccc, 1.00 );
	scene.add(ambientLight);

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: false
	});
	renderer.setClearColor(new THREE.Color('black'), 0)
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top  = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;

	var sphereGeo = new THREE.SphereGeometry(1, 64, 64);
	var smallGeo = new THREE.SphereGeometry(0.05);
	var planeGeo = new THREE.PlaneGeometry(4, 4);

	var sphereMat = new THREE.MeshNormalMaterial();
	var v0Mat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
	var v1Mat = new THREE.MeshBasicMaterial({ color: 0xeeee44 });
	var v2Mat = new THREE.MeshBasicMaterial({ color: 0x0077ff });
	var planeMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });

	sphere = new THREE.Mesh(sphereGeo, sphereMat);
	sphere0 = new THREE.Mesh(smallGeo, v0Mat);
	sphere1 = new THREE.Mesh(smallGeo, v1Mat);
	sphere2 = new THREE.Mesh(smallGeo, v2Mat);
	var plane = new THREE.Mesh(planeGeo, planeMat);

	plane.rotation.set(-Math.PI / 2, 0, 0);

	scene.add(sphere);
	scene.add(sphere0);
	scene.add(sphere1);
	scene.add(sphere2);
	//scene.add(plane);
}

function update()
{
	//mesh.rotation.y += 0.01;
}

function render()
{
	renderer.render( scene, camera );
}

function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}

function onWindowResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var v0 = new THREE.Vector3(0, 0, 0);
var v1 = new THREE.Vector3(0, 0, 0);
var v2 = new THREE.Vector3(0, 0, 0);
var zero = new THREE.Vector3(0, 0, 0);

document.addEventListener("mousedown", onDocumentMouseDown,  false);
function onDocumentMouseDown(event)
{
	var ray   = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var w     = renderer.domElement.clientWidth;
	var h     = renderer.domElement.clientHeight;
	mouse.x   =  (event.clientX / w) * 2 - 1;
	mouse.y   = -(event.clientY / h) * 2 + 1;
	ray.setFromCamera(mouse, camera);
	var i = ray.intersectObject(sphere);
	if (i.length > 0)
	{
		if (v0.equals(zero))
		{
			v0 = i[0].point.clone().normalize();
			sphere0.position.set(v0.x, v0.y, v0.z);
		}
		else if (v1.equals(zero))
		{
			v1 = i[0].point.clone();
			sphere1.position.set(v1.x, v1.y, v1.z);

			v2 = findBest(v0, Math.PI / 8);
			sphere2.position.set(v2.x, v2.y, v2.z);
		}
	}
}

document.addEventListener("keypress", onDocumentKeyPress,  false);
function onDocumentKeyPress(event)
{
	var step = 0.05;
	switch (event.key)
	{
		case "w":
			if (camR1 < Math.PI / 3)
				camR1 += step;
			break;

		case "a":
			camR2 -= step;
			break;

		case "s":
			if (camR1 > -Math.PI / 3)
				camR1 -= step;
			break;

		case "d":
			camR2 += step;
			break;
	}
	if (camR2 > Math.PI * 2)
		camR2 -= Math.PI * 2;
	else if (camR2 < 0)
		camR2 += Math.PI * 2;
	updateCameraPosition();
}

document.addEventListener("wheel", onDocumentWheel,  false);
function onDocumentWheel(event)
{
	var step = 0.05;
	if (event.deltaY > 0)
		zoom = Math.min(2, zoom + step);
	else if (event.deltaY < 0)
		zoom = Math.max(0.3, zoom - step);
	updateCameraPosition();
}

function updateCameraPosition()
{
	camV2 = camV1.clone().multiplyScalar(zoom);
	camera.position.set(camV2.x, camV2.y, camV2.z);
	camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), camR1);
	camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), camR2);
	camera.lookAt(scene.position);	
}

function findBest(p0, alpha, beta = Math.PI * 2, maxRec = 10, drawAll = true)
{
	if (maxRec == 0)
		return p0;

	var axis = new THREE.Vector3(0, 1, 0).cross(p0).normalize();
	if (!p0.equals(v0))
		axis = v0.clone().cross(p0).normalize();

	var p = [];
	for (var i = 0; i < 4; i++)
		p.push(p0.clone());
	p[0].applyAxisAngle(v0,    beta / 4);
	p[1].applyAxisAngle(v0,   -beta / 4);
	p[2].applyAxisAngle(v0,   -beta / 4);
	p[3].applyAxisAngle(v0,    beta / 4);
	p[0].applyAxisAngle(axis, -alpha);
	p[1].applyAxisAngle(axis, -alpha);
	p[2].applyAxisAngle(axis,  alpha);
	p[3].applyAxisAngle(axis,  alpha);

	drawPoints(p0, alpha, beta);

	if (beta == Math.PI * 2)
		beta /= 2;

	var list = [];
	list.push([p[0], p[0].angleTo(v1)]);
	list.push([p[1], p[1].angleTo(v1)]);
	list.push([p[2], p[2].angleTo(v1)]);
	list.push([p[3], p[3].angleTo(v1)]);
	list.sort(function(a, b)
	{
		return a[1] - b[1];
	});
	if (list[0][1] < 0.0087)
		return p0;

	return findBest(list[0][0], alpha / 2, beta / 2, --maxRec, false);
}

function drawPoints(p, alpha, beta)
{
	var mat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
	if (!v0.equals(p))
		alpha = v0.angleTo(p);
	var ringGeo  = new THREE.TorusGeometry(Math.sin(alpha) + 0.005, 0.005, 3, 64);
	var ring = new THREE.Mesh(ringGeo, mat);
	ring.position.set(v0.x, v0.y, v0.z);
	ring.position.multiplyScalar(Math.cos(alpha));
	var ux = new THREE.Vector3(1, 0, 0);
	var uy = new THREE.Vector3(0, 1, 0);
	var px = v0.clone();
	var py = v0.clone();
	px.y = 0;
	py.x = 0;
	px.normalize();
	py.normalize();
	var rx = py.angleTo(uy);
	var ry = px.angleTo(ux);
	console.log(rx * 180 / Math.PI, ry * 180 / Math.PI);
//	ring.rotation.set(rx + Math.PI / 2, ry + Math.PI / 2, 0);
	ring.rotateY(ry + Math.PI / 2);
	ring.rotateOnAxis(uy.cross(py), -rx + Math.PI / 2);
	scene.add(ring);
}
