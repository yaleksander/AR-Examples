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

var uvx = new THREE.Vector3(1, 0, 0);
var uvy = new THREE.Vector3(0, 1, 0);
var v0 = new THREE.Vector3(0, 0, 0);
var v1 = new THREE.Vector3(0, 0, 0);
var zero = new THREE.Vector3(0, 0, 0);
var alpha = Math.PI / 8;

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
			var axis1 = new THREE.Vector3(0, 1, 0).cross(v0).normalize();
			var axis2 = axis1.clone().cross(v0).normalize();

			var aux1 = v0.clone();
			var aux2 = v0.clone();
			var aux3 = v0.clone();
			var aux4 = v0.clone();
			var aux6 = v0.clone();
			var aux7 = v0.clone();
			var aux8 = v0.clone();
			var aux9 = v0.clone();

			var q1 = new THREE.Quaternion();
			var q2 = new THREE.Quaternion();
			var q3 = new THREE.Quaternion();
			var q4 = new THREE.Quaternion();
			var q6 = new THREE.Quaternion();
			var q7 = new THREE.Quaternion();
			var q8 = new THREE.Quaternion();
			var q9 = new THREE.Quaternion();
			q2.setFromAxisAngle(axis1,  alpha);
			q4.setFromAxisAngle(axis2, -alpha);
			q6.setFromAxisAngle(axis2,  alpha);
			q8.setFromAxisAngle(axis1, -alpha);
			q1.multiplyQuaternions(q2, q4);
			q3.multiplyQuaternions(q2, q6);
			q7.multiplyQuaternions(q4, q8);
			q9.multiplyQuaternions(q6, q8);

			aux1.applyQuaternion(q1);
			aux2.applyQuaternion(q2);
			aux3.applyQuaternion(q3);
			aux4.applyQuaternion(q4);
			aux6.applyQuaternion(q6);
			aux7.applyQuaternion(q7);
			aux8.applyQuaternion(q8);
			aux9.applyQuaternion(q9);
/*
			var q5 = new THREE.Quaternion();
			q5.setFromUnitVectors(uvx, v0);
*/
			var smallGeo = new THREE.SphereGeometry(0.04);
			var mat = new THREE.MeshBasicMaterial({ color: 0x0099ee });
			var s1 = new THREE.Mesh(smallGeo, mat);
			var s2 = new THREE.Mesh(smallGeo, mat);
			var s3 = new THREE.Mesh(smallGeo, mat);
			var s4 = new THREE.Mesh(smallGeo, mat);
			var s6 = new THREE.Mesh(smallGeo, mat);
			var s7 = new THREE.Mesh(smallGeo, mat);
			var s8 = new THREE.Mesh(smallGeo, mat);
			var s9 = new THREE.Mesh(smallGeo, mat);
			s1.position.set(aux1.x, aux1.y, aux1.z);
			s2.position.set(aux2.x, aux2.y, aux2.z);
			s3.position.set(aux3.x, aux3.y, aux3.z);
			s4.position.set(aux4.x, aux4.y, aux4.z);
			s6.position.set(aux6.x, aux6.y, aux6.z);
			s7.position.set(aux7.x, aux7.y, aux7.z);
			s8.position.set(aux8.x, aux8.y, aux8.z);
			s9.position.set(aux9.x, aux9.y, aux9.z);
			scene.add(s1);
			scene.add(s2);
			scene.add(s3);
			scene.add(s4);
			scene.add(s6);
			scene.add(s7);
			scene.add(s8);
			scene.add(s9);
		}
		else if (v1.equals(zero))
		{
			v1 = i[0].point.clone();
			sphere1.position.set(v1.x, v1.y, v1.z);
		}
	}
}
