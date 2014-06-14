
/**
 * @author Harrison Mendonça / github.com/euharrison
 * @author Pedror Rezende / github.com/pedrorezende
 */

var Note = function(letter, posX, posY)
{
	// properties

	this.material;
	this.geometry;
	this.mesh;
	this.vertices = [];

	// geometry

	this.geometry = new THREE.TextGeometry( letter, {

		size: 30,
		height: 8,
		curveSegments: 5,
	
		font: "helvetiker",
		weight: "bold",
		style: "normal",
	
		bevelThickness: 0,
		bevelSize: 0,
		bevelEnabled: true,

		material: 0,
		extrudeMaterial: 1

	});

	// center

	var halfWidth = 0;
	var halfHeight = 0;
	for (var i = 0; i < this.geometry.vertices.length; i++) {
		halfWidth = Math.max( this.geometry.vertices[i].x, halfWidth);
		halfHeight = Math.max( this.geometry.vertices[i].y, halfHeight);
	}
	halfWidth /= 2;
	halfHeight /= 2;
	for (var i = 0; i < this.geometry.vertices.length; i++) {
		this.geometry.vertices[i].x += posX - halfWidth;
		this.geometry.vertices[i].y += posY - halfHeight;
	}

	// vertices

	for (var i = 0; i < this.geometry.vertices.length; i++) {
		this.vertices.push( this.geometry.vertices[i].clone() );
	}

	// material

	this.material = new THREE.MeshPhongMaterial( );

	// mesh

	this.mesh = new THREE.Mesh( this.geometry, this.material );

};