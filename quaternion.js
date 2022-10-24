var scene, camera, renderer, clock, deltaTime, totalTime;

var mesh, shaderMaterial;

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
				
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set(0, 2, 4);
	camera.lookAt( scene.position );	
	scene.add( camera );

	let ambientLight = new THREE.AmbientLight( 0xcccccc, 1.00 );
	scene.add( ambientLight );
	
	// let pointLight = new THREE.PointLight();
	// camera.add( pointLight );
	
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
	
	let geometry = new THREE.BoxGeometry(1,1,1);
	
	let loader = new THREE.TextureLoader();
	let texture = loader.load( 'images/color-grid.png', render );
	
	/*
	// Basic, unlit material
	let basicMaterial = new THREE.MeshBasicMaterial({ 
		color: 0x0000ff,
		wireframe: false,
	});
	*/
	
	// Basic, lit material
	let material = new THREE.MeshLambertMaterial({ 
		map: texture
	});
	
	/*
	// Shader-based material
	let shaderMaterial = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: 1.0 },
			baseTexture: { value: texture }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	});
	*/
	
	mesh = new THREE.Mesh( geometry, material );
	
	scene.add( mesh );
}

function update()
{
	mesh.rotation.y += 0.01;
	// shaderMaterial.uniforms.time.value += deltaTime;
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
