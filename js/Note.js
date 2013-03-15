
/**
 * @author Harrison Mendonça / github.com/euharrison
 * @author Pedror Rezende / github.com/pedrorezende
 */

var Note = function(letter)
{
	// properties

	this.material;
	this.geometry;
	this.mesh;
	this.vertices = [];

	// geometry

	this.geometry = new THREE.TextGeometry( letter, {

		size: 100,
		height: 20,
		curveSegments: 30,
	
		font: "helvetiker",
		weight: "bold",
		style: "normal",
	
		bevelThickness: 0,
		bevelSize: 0,
		bevelEnabled: true,

		material: 0,
		extrudeMaterial: 1

	});

	this.geometry.computeBoundingBox();
	this.geometry.computeVertexNormals();

	// center

	var diffX = 0;
	var diffY = 0;
	for (var i = 0; i < this.geometry.vertices.length; i++) {
		diffX = Math.max( this.geometry.vertices[i].x, diffX);
		diffY = Math.max( this.geometry.vertices[i].y, diffY);
	}
	diffX /= 2;
	diffY /= 2;
	for (var i = 0; i < this.geometry.vertices.length; i++) {
		this.geometry.vertices[i].x -= diffX;
		this.geometry.vertices[i].y -= diffY;
	}

	// vertices

	for (var i = 0; i < this.geometry.vertices.length; i++) {
		this.vertices.push( this.geometry.vertices[i].clone() );
	}

	// material

	this.material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 10 } );
	
	// mesh

	this.mesh = new THREE.Mesh( this.geometry, this.material );

};