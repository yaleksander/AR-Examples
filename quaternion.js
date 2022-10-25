var scene, camera, renderer, clock, deltaTime, totalTime;

var sphere, sphere0, sphere1, sphere2, v0, v1, v2;

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set(0, 2, 4);
	camera.lookAt( scene.position );	
	scene.add( camera );

	var ambientLight = new THREE.AmbientLight( 0xcccccc, 1.00 );
	scene.add( ambientLight );

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: false
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
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
//	scene.add(plane);
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

function findBest(p0, alpha, maxRec, drawAll)
{
	if (maxRec == 0)
		return p0;

	var axis1 = new THREE.Vector3(0, 1, 0).cross(v0).normalize();
	var axis2 = axis1.clone().cross(v0).normalize();

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

	var list = [];
	list.push([p01, p01.angleTo(v1)]);
	list.push([p02, p02.angleTo(v1)]);
	list.push([p03, p03.angleTo(v1)]);
	list.push([p04, p04.angleTo(v1)]);
	list.sort(function(a, b)
	{
		return a[1] - b[1];
	});
	if (list[0][1] < 0.0087)
		return p0;

	return findBest(list[0][0], alpha / 2, --maxRec, false);
}

function drawPoints(p1, p2, p3, p4, p5, p6, p7, p8, p9, p01, p02, p03, p04, full)
{
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
	s2.position.set(p2.x, p2.y, p2.z);
	s4.position.set(p4.x, p4.y, p4.z);
	s6.position.set(p6.x, p6.y, p6.z);
	s8.position.set(p8.x, p8.y, p8.z);
	s01.position.set(p01.x, p01.y, p01.z);
	s02.position.set(p02.x, p02.y, p02.z);
	s03.position.set(p03.x, p03.y, p03.z);
	s04.position.set(p04.x, p04.y, p04.z);
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
		s1.position.set(p1.x, p1.y, p1.z);
		s3.position.set(p3.x, p3.y, p3.z);
//		s5.position.set(p5.x, p5.y, p5.z);
		s7.position.set(p7.x, p7.y, p7.z);
		s9.position.set(p9.x, p9.y, p9.z);
		scene.add(s1);
		scene.add(s3);
//		scene.add(s5);
		scene.add(s7);
		scene.add(s9);
	}
}
