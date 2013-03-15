
/**
 * @author Harrison Mendonça / github.com/euharrison
 * @author Pedror Rezende / github.com/pedrorezende
 */

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var container;

var camera, scene, renderer;

var ambientLight, whiteLight, blueLight;

var tuner;

var notes, currentNote;


function init() 
{
	// Sound

	tuner = new Tuner();

	// Camera

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	
	// Scene

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 0, 1000 );

	// Notes

	notes = [];
	var notesLetter = tuner.getNotes();
	for (var i = 0; i < notesLetter.length; i++) {
		notes[i] = new Note(notesLetter[i]);
	}

	changeNote(0);

	// Lights

	ambientLight = new THREE.AmbientLight( 0xffffff );
	scene.add( ambientLight );

	whiteLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	whiteLight.position.y = 100;
	scene.add( whiteLight );

	blueLight = new THREE.DirectionalLight( 0x0000ff, 0.1 );
	blueLight.position.y = -200;
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

	camera.position.x = cos * 300;
	camera.position.z = sin * 300;

	whiteLight.position.x = cos * 300 + sin * (-100);
	whiteLight.position.z = sin * 300 + cos * (-100);

	blueLight.position.x = cos * 100 + sin * 200;
	blueLight.position.z = sin * 100 + cos * -200;

	camera.lookAt( scene.position );
	
	
	if (currentNote)
	{
		//mesh
		for (var i = 0; i < currentNote.vertices.length; i++)
		{
			currentNote.geometry.vertices[i].x -= (currentNote.geometry.vertices[i].x - currentNote.vertices[i].x) * 0.1;
			currentNote.geometry.vertices[i].y -= (currentNote.geometry.vertices[i].y - currentNote.vertices[i].y) * 0.1;
			currentNote.geometry.vertices[i].z -= (currentNote.geometry.vertices[i].z - currentNote.vertices[i].z) * 0.1;
		}
		currentNote.mesh.geometry.verticesNeedUpdate = true;

		//material
		ambientLight.color.r -= (ambientLight.color.r - 0.3) * 0.03;
		ambientLight.color.g -= (ambientLight.color.g - 0.3) * 0.03;
		ambientLight.color.b -= (ambientLight.color.b - 0.3) * 0.03;
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
	
		changeNote(noteIndex);
		testNote(confidence);
	}

}

function changeNote(index)
{
	if (index < 0 || index > notes.length-1) return;

	if (currentNote) {
		scene.remove(currentNote.mesh);	
	}

	currentNote = notes[index];
	scene.add(currentNote.mesh);
}

function testNote(confidence)
{
	var errorPercent = 1 - confidence;
	var intensity = errorPercent * 30;

	for (var i = 0; i < currentNote.vertices.length; i++)
	{
		currentNote.mesh.geometry.vertices[i].x = currentNote.vertices[i].x + (((Math.random()*2)-1) * intensity);
		currentNote.mesh.geometry.vertices[i].y = currentNote.vertices[i].y + (((Math.random()*2)-1) * intensity);
		currentNote.mesh.geometry.vertices[i].z = currentNote.vertices[i].z + (((Math.random()*2)-1) * intensity);
	}

	//color limit
	var max = 0.5;
	ambientLight.color.r = (errorPercent>max) ? 1 : errorPercent/max;
	ambientLight.color.g = (errorPercent>max) ? 0 : 1-(errorPercent/max);
	ambientLight.color.b = 0;
}

init();


