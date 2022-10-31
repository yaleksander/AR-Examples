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
	var smallGeo = new THREE.SphereGeometry(0.02);
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
	renderer.setSize(window.innerWidth, window.innerHeight);
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

function findBest(p0, alpha, beta = Math.PI, acc = 0, maxRec = 10, first = true)
{
	var p = [];
	if (first)
	{
		var axis = new THREE.Vector3(0, 1, 0).cross(v0).normalize();
		for (var i = 0; i < 4; i++)
		{
			p.push(p0.clone().applyAxisAngle(axis, alpha / 2));
			p[i].applyAxisAngle(v0, i * Math.PI / 2 + Math.PI * 3 / 4);
		}
	}
	else
	{
		var axis = v0.clone().cross(p0).normalize();
		for (var i = 0; i < 4; i++)
			p.push(p0.clone());
		p[0].applyAxisAngle(axis,  alpha / 2);
		p[1].applyAxisAngle(axis,  alpha / 2);
		p[2].applyAxisAngle(axis, -alpha / 2);
		p[3].applyAxisAngle(axis, -alpha / 2);
		p[0].applyAxisAngle(v0,   -beta / 4);
		p[1].applyAxisAngle(v0,    beta / 4);
		p[2].applyAxisAngle(v0,    beta / 4);
		p[3].applyAxisAngle(v0,   -beta / 4);
/*
		var m1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		var m2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		var m3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
		var m4 = new THREE.MeshBasicMaterial({ color: 0xffffff });
		var g  = new THREE.SphereGeometry(0.02);
		var s1 = new THREE.Mesh(g, m1);
		var s2 = new THREE.Mesh(g, m2);
		var s3 = new THREE.Mesh(g, m3);
		var s4 = new THREE.Mesh(g, m4);
		s1.position.set(p[0].x, p[0].y, p[0].z);
		s2.position.set(p[1].x, p[1].y, p[1].z);
		s3.position.set(p[2].x, p[2].y, p[2].z);
		s4.position.set(p[3].x, p[3].y, p[3].z);
		scene.add(s1);
		scene.add(s2);
		scene.add(s3);
		scene.add(s4);
*/
	}

	// criterio: diferenca angular entre p[i] e v1
	var list = [];
	for (var i = 0; i < 4; i++)
		list.push([p[i], p[i].distanceTo(v1), i]);
	list.sort(function(a, b)
	{
		return a[1] - b[1];
	});

	drawPoints(p0, alpha, beta, acc, first);

	// condicao de parada: se a diferenca angular for menor que 0.5 grau (0.0087 rad)
	// condicao de parada: atingiu o maximo de recursoes (10)
	if (maxRec == 0 || list[0][1] < 0.0087)
		return p0;

	//acc += (first ? list[0][2] * Math.PI / 2 : ((list[0][2] == 1 || list[0][2] == 2) ? -beta : beta) / 4);
	if (first)
		acc += list[0][2] * Math.PI / 2;
	else if (list[0][2] == 1 || list[0][2] == 2)
		acc += beta / 2;

	return findBest(list[0][0], alpha / 2, beta / 2, acc, --maxRec, false);
}

function drawPoints(p, alpha, beta, acc, first)
{
	var ux = new THREE.Vector3(1, 0, 0);
	var px = v0.clone();
	px.y = 0;
	var rx = px.angleTo(v0);
	var ry = px.angleTo(ux);
	if (v0.y > 0)
		rx *= -1;

	var mat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
	if (first)
	{
		var ringGeo = new THREE.TorusGeometry(Math.sin(alpha) + 0.005, 0.005, 3, 64);
		var ring = new THREE.Mesh(ringGeo, mat);
		ring.position.set(v0.x, v0.y, v0.z);
		ring.position.multiplyScalar(Math.cos(alpha));
		ring.rotateY(Math.PI / 2 - ry);
		ring.rotateX(rx);

		var crossLines = new THREE.TorusGeometry(1.005, 0.005, 3, 64, alpha * 2);
		var ver = new THREE.Mesh(crossLines, mat);
		var hor = new THREE.Mesh(crossLines, mat);
		hor.rotateY(Math.PI / 2 - ry);
		ver.rotateY(-ry);
		hor.rotateX(rx + Math.PI / 2);
		hor.rotateZ(alpha * 3);
		ver.rotateZ(-alpha - rx);

		scene.add(ring);
		scene.add(ver);
		scene.add(hor);
	}
	else
	{
		mat = new THREE.MeshBasicMaterial({ color: 0xeeee44 });

		var a = p.angleTo(v0);
		var hGeo = new THREE.TorusGeometry(Math.sin(a) + 0.005, 0.005, 3, 64, beta);
		var hor = new THREE.Mesh(hGeo, mat);
		hor.position.set(v0.x, v0.y, v0.z);
		hor.position.multiplyScalar(Math.cos(a));
		hor.rotateY(Math.PI / 2 - ry);
		hor.rotateX(rx);
		hor.rotateZ(acc);

		var vGeo = new THREE.TorusGeometry(1.005, 0.005, 3, 64, alpha * 2);
		var ver = new THREE.Mesh(vGeo, mat);
		ver.rotateY(Math.PI / 2 - ry);
		ver.rotateX(rx + Math.PI / 2);
		ver.rotateY(acc + beta / 2);
		ver.rotateZ(Math.PI / 2 - a - alpha);

		scene.add(hor);
		scene.add(ver);
	}
}
