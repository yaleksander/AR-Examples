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

			v2 = findBest(v0, Math.PI / 8, 10, true);
			sphere2.position.set(v2.x, v2.y, v2.z);
		}
	}
}

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

			v2 = findBest(v0, Math.PI / 8, 10, true);
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

function findBest(p0, alpha, maxRec, drawAll)
{
	if (maxRec == 0)
		return p0;

	var axis1 = new THREE.Vector3(0, 1, 0).cross(v0).normalize();
	var axis2 = axis1.clone().cross(v0).normalize();
/*
	var p1 = p0.clone();
	var p2 = p0.clone();
	var p3 = p0.clone();
	var p4 = p0.clone();
	var p5 = p0.clone();
	var p6 = p0.clone();
	var p7 = p0.clone();
	var p8 = p0.clone();
	var p9 = p0.clone();
	var p01 = p0.clone();
	var p02 = p0.clone();
	var p03 = p0.clone();
	var p04 = p0.clone();

	var q1 = new THREE.Quaternion();
	var q2 = new THREE.Quaternion();
	var q3 = new THREE.Quaternion();
	var q4 = new THREE.Quaternion();
	var q6 = new THREE.Quaternion();
	var q7 = new THREE.Quaternion();
	var q8 = new THREE.Quaternion();
	var q9 = new THREE.Quaternion();
	var q01 = new THREE.Quaternion();
	var q02 = new THREE.Quaternion();
	var q03 = new THREE.Quaternion();
	var q04 = new THREE.Quaternion();
	q2.setFromAxisAngle(axis1,  alpha);
	q4.setFromAxisAngle(axis2, -alpha);
	q6.setFromAxisAngle(axis2,  alpha);
	q8.setFromAxisAngle(axis1, -alpha);
	q1.multiplyQuaternions(q2, q4);
	q3.multiplyQuaternions(q2, q6);
	q7.multiplyQuaternions(q4, q8);
	q9.multiplyQuaternions(q6, q8);
	THREE.Quaternion.slerp(q6, q8, q01, 0.5);
	THREE.Quaternion.slerp(q4, q8, q02, 0.5);
	THREE.Quaternion.slerp(q2, q4, q03, 0.5);
	THREE.Quaternion.slerp(q2, q6, q04, 0.5);

	p1.applyQuaternion(q1);
	p2.applyQuaternion(q2);
	p3.applyQuaternion(q3);
	p4.applyQuaternion(q4);
	p6.applyQuaternion(q6);
	p7.applyQuaternion(q7);
	p8.applyQuaternion(q8);
	p9.applyQuaternion(q9);
	p01.applyQuaternion(q01);
	p02.applyQuaternion(q02);
	p03.applyQuaternion(q03);
	p04.applyQuaternion(q04);

	drawPoints(p1, p2, p3, p4, p5, p6, p7, p8, p9, p01, p02, p03, p04, drawAll);
*/

	var p = [];
	p.push(p0.clone().applyAxisAngle(axis1, alpha));
	for (var i = 0; i < 7; i++)
		p.push(p[i].clone().applyAxisAngle(p0, Math.PI / 4));
	var p2 = [];
	p2.push(p0.clone().applyAxisAngle(axis1, alpha / 2));
	p2[0].applyAxisAngle(p0, Math.PI / 4);
	for (var i = 0; i < 3; i++)
		p2.push(p2[i].clone().applyAxisAngle(p0, Math.PI / 2));

/*	
	var p01 = p1.clone();
	var p02 = p1.clone();
	var p03 = p1.clone();
	var p04 = p1.clone();

	var q0 = new THREE.Quaternion().setFromAxisAngle(p0, 0);
	var q1 = q0.clone();
	q1.rotateTowards(q1, Math.PI / 4);
	p2.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 4);
	p3.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 4);
	p4.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 4);
	p5.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 4);
	p6.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 4);
	p7.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 4);
	p8.applyQuaternion(q1);
	var q2 = new THREE.Quaternion().setFromAxisAngle(p0, 0);
	q1.rotateTowards(q1, Math.PI / 2);
	p01.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 2);
	p02.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 2);
	p03.applyQuaternion(q1);
	q1.rotateTowards(q1, Math.PI / 2);
	p04.applyQuaternion(q1);
	drawPoints(p1, p2, p3, p4, p5, p6, p7, p8, p9, p01, p02, p03, p04, drawAll);
*/
	drawPoints(p0, p, p2, alpha, true);

	var list = [];
	list.push([p2[0], p2[0].angleTo(v1)]);
	list.push([p2[1], p2[1].angleTo(v1)]);
	list.push([p2[2], p2[2].angleTo(v1)]);
	list.push([p2[3], p2[3].angleTo(v1)]);
	list.sort(function(a, b)
	{
		return a[1] - b[1];
	});
	if (list[0][1] < 0.0087)
		return p0;

	return findBest(list[0][0], alpha / 2, --maxRec, false);
//	return new THREE.Vector3(0, 0, 0);
}

function drawPoints(p0, p, p2, alpha, full)
{
/*
	var smallGeo = new THREE.SphereGeometry(0.02);
	var mat1 = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
	var mat2 = new THREE.MeshBasicMaterial({ color: 0xee9900 });
	var s2 = new THREE.Mesh(smallGeo, mat1);
	var s4 = new THREE.Mesh(smallGeo, mat1);
	var s6 = new THREE.Mesh(smallGeo, mat1);
	var s8 = new THREE.Mesh(smallGeo, mat1);
	var s01 = new THREE.Mesh(smallGeo, mat2);
	var s02 = new THREE.Mesh(smallGeo, mat2);
	var s03 = new THREE.Mesh(smallGeo, mat2);
	var s04 = new THREE.Mesh(smallGeo, mat2);
	s2.position.set(p[2].x, p[2].y, p[2].z);
	s4.position.set(p[4].x, p[4].y, p[4].z);
	s6.position.set(p[6].x, p[6].y, p[6].z);
	s8.position.set(p[8].x, p[8].y, p[8].z);
	s01.position.set(pq[0].x, pq[0].y, pq[0].z);
	s02.position.set(pq[1].x, pq[1].y, pq[1].z);
	s03.position.set(pq[2].x, pq[2].y, pq[2].z);
	s04.position.set(pq[3].x, pq[3].y, pq[3].z);
	scene.add(s2);
	scene.add(s4);
	scene.add(s6);
	scene.add(s8);
	scene.add(s01);
	scene.add(s02);
	scene.add(s03);
	scene.add(s04);
	if (full)
	{
		var s1 = new THREE.Mesh(smallGeo, mat1);
		var s3 = new THREE.Mesh(smallGeo, mat1);
//		var s5 = new THREE.Mesh(smallGeo, mat2);
		var s7 = new THREE.Mesh(smallGeo, mat1);
		var s9 = new THREE.Mesh(smallGeo, mat1);
		s1.position.set(p[1].x, p[1].y, p[1].z);
		s3.position.set(p[3].x, p[3].y, p[3].z);
//		s5.position.set(p[5].x, p[5].y, p[5].z);
		s7.position.set(p[7].x, p[7].y, p[7].z);
		s9.position.set(p[9].x, p[9].y, p[9].z);
		scene.add(s1);
		scene.add(s3);
//		scene.add(s5);
		scene.add(s7);
		scene.add(s9);
	}
*/
	var smallGeo = new THREE.SphereGeometry(0.02);
	var ringGeo  = new THREE.TorusGeometry(Math.sin(alpha) + 0.02, 0.02, 3, 64);
	var mat1 = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
	var mat2 = new THREE.MeshBasicMaterial({ color: 0xee9900 });
	var s = [];
	var s2 = [];
	var ring = new THREE.Mesh(ringGeo, mat1);
	var q = new THREE.Quaternion().setFromAxisAngle(p0, 0);
	ring.applyQuaternion(q);
	ring.position.set(p0.x, p0.y, p0.z);
	var axis1 = v0.clone().cross(p0).normalize();
	ring.rotateOnAxis(axis1, -v0.angleTo(p0));
	//scene.add(ring);
	if (full)
	{
		for (var i = 0; i < 8; i++)
		{
			s.push(new THREE.Mesh(smallGeo, mat1));
			s[i].position.set(p[i].x, p[i].y, p[i].z);
			scene.add(s[i]);
		}
	}
	for (var i = 0; i < 4; i++)
	{
		s2.push(new THREE.Mesh(smallGeo, mat2));
		s2[i].position.set(p2[i].x, p2[i].y, p2[i].z);
		scene.add(s2[i]);
	}
}

