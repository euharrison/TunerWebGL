
/**
 * @author Harrison Mendonça / github.com/euharrison
 * @author Pedror Rezende / github.com/pedrorezende
 */

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var container;

var camera, scene, renderer;

var ambientLight, whiteLight, blueLight;

var tuner;

var notes;


function init() 
{
	// How to
	$("#howto").click(function() {
		$("#howto_explanation").toggle();
	});

	// Fullscreen

	$("#fullscreen").click(function() {
	    var el = document.documentElement;
	    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
	    rfs.call(el);
	});

	// Sound

	tuner = new Tuner();

	// Camera

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.x = 150;
	camera.position.y = -60;
	camera.position.z = 300;

	// Scene

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 0, 1000 );

	// Notes

	notes = [];
	var notesLetter = tuner.getNotes();
	for (var i = 0; i < notesLetter.length; i++)
	{
		notes[i] = new Note(notesLetter[i], (i%4)*100, -Math.floor(i/4)*60);
		scene.add(notes[i].mesh);
	}

	// Lights

	ambientLight = new THREE.AmbientLight( 0xffffff );
	scene.add( ambientLight );

	whiteLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	whiteLight.position.x = -400;
	whiteLight.position.y = 100;
	whiteLight.position.z = 400;
	scene.add( whiteLight );

	blueLight = new THREE.DirectionalLight( 0x0000ff, 0.1 );
	blueLight.position.x = 100;
	blueLight.position.y = -200;
	blueLight.position.z = 300;
	scene.add( blueLight );

	// Resize

	window.addEventListener( 'resize', onWindowResize, false );

	// Render

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	container = document.getElementById("webgl");
	container.appendChild( renderer.domElement );

	animate();
}

function onWindowResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() 
{
	requestAnimationFrame(animate);
	render();
}

function render()
{
	var timer = Date.now() * 0.0005;
	var sin = Math.sin( timer );
	var cos = Math.cos( timer );
	
	for (var i = 0; i < notes.length; i++)
	{
		var note = notes[i];

		//mesh
		for (var j = 0; j < note.vertices.length; j++)
		{
			note.geometry.vertices[j].x -= (note.geometry.vertices[j].x - note.vertices[j].x) * 0.1;
			note.geometry.vertices[j].y -= (note.geometry.vertices[j].y - note.vertices[j].y) * 0.1;
			note.geometry.vertices[j].z -= (note.geometry.vertices[j].z - note.vertices[j].z) * 0.1;
		}
		note.mesh.geometry.verticesNeedUpdate = true;

		//material
		note.material.ambient.r -= (note.material.ambient.r - 0.3) * 0.06;
		note.material.ambient.g -= (note.material.ambient.g - 0.3) * 0.06;
		note.material.ambient.b -= (note.material.ambient.b - 0.3) * 0.06;
	}

	renderer.render(scene, camera);


	// analisar a nota
	var noteIndex = tuner.getCurrentNoteIndex();
	var confidence = tuner.getCurrentConfidence();
	var min = 80;
	var max = 97;
	if (confidence && confidence > min) 
	{
		confidence = (confidence - min) / (max - min);
		if (confidence < 0) confidence = 0;
		if (confidence > 1) confidence = 1;
	
		testNote(noteIndex, confidence);
	}

}

function testNote(noteIndex, confidence)
{
	var errorPercent = 1 - confidence;
	var intensity = errorPercent * 30;
	var note = notes[noteIndex];

	for (var i = 0; i < note.vertices.length; i++)
	{
		note.mesh.geometry.vertices[i].x = note.vertices[i].x + (((Math.random()*2)-1) * intensity);
		note.mesh.geometry.vertices[i].y = note.vertices[i].y + (((Math.random()*2)-1) * intensity);
		note.mesh.geometry.vertices[i].z = note.vertices[i].z + (((Math.random()*2)-1) * intensity);
	}

	//color limit
	var max = 0.5;
	note.material.ambient.r = (errorPercent>max) ? 1 : errorPercent/max;
	note.material.ambient.g = (errorPercent>max) ? 0 : 1-(errorPercent/max);
	note.material.ambient.b = 0;
}

init();


