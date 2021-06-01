// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 2
// 3D World
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class Cylinder {

	vertices;
	polygons;
	normals;
	color;
	modelMatrix;

	//hex version of the color for loading data into the ui
	colorHex;
	// save transformation inputs outsie of matrix
	// used for loading
	transformations = [
		0, 0, 0, // rotateX, rotateY, rotateZ
		1, 1, 1, // scaleX, scaleY, scaleZ
		0, 0, 0 // translateX, translateY, translateZ
	];

	constructor(n, endcaps, color, modelMatrix) {
		this.color = color;
		this.modelMatrix = modelMatrix;
		

		// represent these as 2d arrays for easy reading during bugfixing
		objVertices = []; // an array of 3D points
		objPolygons = []; // an array of triangles in terms of 3 points
		let centerTop = [0.0, 0.0, 0.5];
		let centerBot = [0.0, 0.0, -0.5];

		// define the n points of each circle using an angle value (theta)
		// each point of the circles is defined by <cos(theta), sin(theta)>
		// theta increases by 360/n for each point
		let theta = 0;
		for (let i = 0; i < n; i++) {
			let x = Math.cos(theta);
			let y = Math.sin(theta);

			objVertices.push([x, y, 0.5]);
			objVertices.push([x, y, -0.5]);

			theta += 2 * Math.PI / n;
		}
		// push centerpoints of each circle for endcaps
		objVertices.push(centerTop);
		objVertices.push(centerBot);

		// draw the cylinder using indices representing triangles
		// the vertices array is ordered so that every even index is for the top circle
		// and every odd index is for the bottom circle
		// 2*n and 2*n + 1 are the centerpoints for the top and bottom circle respectively
		// i increases by 2 each loop
		for (let i = 0; i < 2 * (n - 1); i += 2) {
			objPolygons.push([i, i + 1, i + 2]); // top vertex, bot vertex, next top vertex (facing side)
			objPolygons.push([i + 1, i + 3, i + 2]); // bot vertex, next bot vertex, next top vertex (facing side)
			if (endcaps == "True") { //endcaps:
				objPolygons.push([i, i + 2, 2 * n]); // top vertex, next top vertex, top center (facing top)
				objPolygons.push([2 * n + 1, i + 3, i + 1]); // bot center, next bot vertex, bot vertex (facing bottom)
			}
		}
		// connect the final 2 vertices of the circles
		// (involves wrapping around the arrays)
		objPolygons.push([2 * n - 2, 2 * n - 1, 0]); // top vertex, bot vertex, next top vertex (facing side)
		objPolygons.push([2 * n - 1, 1, 0]); // bot vertex, next bot vertex, next top vertex (facing side)
		if (endcaps == "True") { //final endcaps:
			objPolygons.push([2 * n - 2, 0, 2 * n]); // top vertex, next top vertex, top center (facing top)
			objPolygons.push([2 * n + 1, 1, 2 * n - 1]); // bot center, next bot vertex, bot vertex (facing bottom)
		}
		
		//reset arrays
		this.vertices = [];
		this.polygons = [];
		this.normals = [];

		// calculate normals
		for (let i = 0; i < objPolygons.length; i++) {
			// get the vertices that make up the ith polygon
			//console.log(objVertices[objPolygons[i][0]])
			let vertex1 = new Vector3(objVertices[objPolygons[i][0]]);
			let vertex2 = new Vector3(objVertices[objPolygons[i][1]]);
			let vertex3 = new Vector3(objVertices[objPolygons[i][2]]);
			//console.log(vertex1);

			// cross product
			let v1 = new Vector3(vertex2.elements);
			v1.sub(vertex1);
			let v2 = new Vector3(vertex3.elements);
			v2.sub(vertex1);
			let normal = Vector3.cross(v1, v2);

			// push into the final arrays (with repetition)
			for (let j = 0; j < vertex1.elements.length; j++) {
				this.vertices.push(vertex1.elements[j]);
			}
			for (let j = 0; j < normal.elements.length; j++)
				this.normals.push(normal.elements[j]);
			this.polygons.push(3 * i);

			for (let j = 0; j < vertex2.elements.length; j++)
				this.vertices.push(vertex2.elements[j]);
			for (let j = 0; j < normal.elements.length; j++)
				this.normals.push(normal.elements[j]);
			this.polygons.push(3 * i + 1);

			for (let j = 0; j < vertex3.elements.length; j++)
				this.vertices.push(vertex3.elements[j]);
			for (let j = 0; j < normal.elements.length; j++)
				this.normals.push(normal.elements[j]);
			this.polygons.push(3 * i + 2);
			//polygons.push(3*i);
		}

	}
}