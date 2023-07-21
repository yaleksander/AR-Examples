var scene, camera, renderer, size, height, material, geometry, light, plane, color, texture, next, box, obj, m, g;
var raycaster = new THREE.Raycaster();
var pointer = new THREE.Vector2();

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
	color = new THREE.Color(0xbbbbbb);
	scene.background = color;
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
	var loader = new THREE.TextureLoader();
	camera.position.set(4, 6, 8);
	camera.lookAt(scene.position);
	scene.add(camera);

	var ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
	light = new THREE.DirectionalLight(0xeeeeee, 1);
	light.castShadow = true;
	light.shadow.mapSize.width  = 2048;
	light.shadow.mapSize.height = 2048;
	light.position.set(4, 8, -6);
	scene.add(light);
	scene.add(ambientLight);

	// var pointLight = new THREE.PointLight();
	// camera.add( pointLight );

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: false
	});
	//renderer.setClearColor(0xbbbbbb, 0);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top  = '0px';
	renderer.domElement.style.left = '0px';
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('pointermove', onPointerMove);
	window.addEventListener('wheel', onScrollWheel);
	window.addEventListener('mousedown', onMouseClick);
	window.addEventListener('contextmenu', onMouseRightClick);
	window.addEventListener('keydown', onKeyDown);

	plane = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.ShadowMaterial());
	plane.receiveShadow = true;
	plane.transparent = true;
	plane.material.opacity = 0.75;
	marker = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshPhongMaterial({map: loader.load("my-images/kanji.png")}));
	plane.rotation.set(-Math.PI / 2, 0, 0);
	plane.position.set(0, 0, -15);
	marker.rotation.set(-Math.PI / 2, 0, 0);
	marker.position.set(0, 0, 1);
	scene.add(plane);
	scene.add(marker);

	material = [];
	material.push(new THREE.MeshPhongMaterial({map: loader.load("my-textures/face/steel.png")}));
	material.push(new THREE.MeshPhongMaterial({map: loader.load("my-textures/face/concrete.png")}));
	material.push(new THREE.MeshPhongMaterial({map: loader.load("my-textures/face/marble.png")}));
	material.push(new THREE.MeshPhongMaterial({map: loader.load("my-textures/face/wood.png")}));
	material.push(new THREE.MeshPhongMaterial({map: loader.load("my-textures/face/asphalt.png")}));
	material.push(new THREE.MeshNormalMaterial());

	geometry = [];
	geometry.push(new THREE.BoxGeometry(1, 1, 1, 15, 15, 15));
	geometry.push(new THREE.BoxGeometry(1, 2, 1));
	geometry.push(new THREE.BoxGeometry(1, 3, 1));
	geometry.push(new THREE.BoxGeometry(2, 2, 2));
	geometry.push(new THREE.CylinderGeometry(0.5, 0.5, 1, 32));
	geometry.push(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32));
	geometry.push(new THREE.CylinderGeometry(1, 1, 1.5, 32));
	geometry.push(new THREE.SphereGeometry(0.5, 32, 32));
	geometry.push(new THREE.SphereGeometry(1, 32, 32));

	height = [0.5, 1, 1.5, 1, 0.5, 0.75, 0.75, 0.5, 1];

	g = 0;
	m = 0;
	obj = [];
	texture = loader.load("my-textures/face/stone.jpg");
	texture.repeat.set(4, 3);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	next = new THREE.Mesh(geometry[g], material[m]);
	box = new THREE.Mesh(geometry[0], material[3]);
	box.position.set(marker.position.x, marker.position.y + 0.5, marker.position.z);
	box.rotation.set(marker.rotation.x, marker.rotation.y, marker.rotation.z);
	next.castShadow = true;
	box.castShadow = true;
	scene.add(next);
	scene.add(box);
	light.target = marker;
	console.log(light.position.clone().sub(marker.position.clone()));
}

function update()
{
	
}

function render()
{
	renderer.render(scene, camera);
}

function animate()
{
	requestAnimationFrame(animate);
	update();
	render();
}

function onPointerMove(event)
{
	pointer.x =  (event.clientX / window.innerWidth)  * 2 - 1;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	intersects = raycaster.intersectObjects([plane]);
	if (intersects.length)
	{
		var p = intersects[0].point;
		next.position.set(p.x, p.y + height[g], p.z);
		next.visible = true;
	}
	else
		next.visible = false;
}

function onMouseClick(event)
{
	if (event.button == 0)
	{
		obj.push(next.clone());
		scene.add(obj[obj.length - 1]);
	}
	else if (event.button == 1)
		box.visible = !box.visible;
}

function onMouseRightClick(event)
{
	event.preventDefault();
	pointer.x =  (event.clientX / window.innerWidth)  * 2 - 1;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	intersects = raycaster.intersectObjects(obj);
	if (intersects.length)
	{
		var o = intersects[0].object;
		var i = obj.indexOf(o);
		if (i >= 0)
		{
			scene.remove(o);
			obj.splice(i, 1);
		}
	}
}

function onKeyDown(event)
{
	if (event.key == "Enter")
	{
		var i = prompt("Novo vetor de luz direcional: ", "0 1 0");
		if (i)
		{
			var v = i.split(" ");
			var x = parseFloat(v[0]) + marker.position.x;
			var y = parseFloat(v[1]) + marker.position.y;
			var z = parseFloat(v[2]) + marker.position.z;
			//light.position.set(parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2]));
			light.position.set(x, y, z);
			console.log(light.position.clone().sub(marker.position.clone()));
		}
	}
	else if (event.key == "-")
		scene.background = color;
	else if (event.key == "+")
		scene.background = texture;
}

function onScrollWheel(event)
{
	if (event.deltaY > 0)
	{
		if (++g >= geometry.length)
			g = 0;
		next.geometry = geometry[g];
	}
	else if (event.deltaY < 0)
	{
		if (++m >= material.length)
			m = 0;
		next.material = material[m];
	}
}

function onWindowResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}