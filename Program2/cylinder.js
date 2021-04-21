class Cylinder {
	constructor(n, endcaps) {
		// represent these as 2d arrays for easy reading during bugfixing
		objVertices = []; // an array of 3D points
		objPolygons = []; // an array of triangles in terms of 3 points
		let centerTop = [0.0, 0.0, 1.0];
		let centerBot = [0.0, 0.0, 0.0];

		// define the n points of each circle using an angle value (theta)
		// each point of the circles is defined by <cos(theta), sin(theta)>
		// theta increases by 360/n for each point
		let theta = 0;
		for (i = 0; i < n; i++) {
			let x = Math.cos(theta);
			let y = Math.sin(theta);

			objVertices.push([x, y, 1]);
			objVertices.push([x, y, 0]);

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
		for (i = 0; i < 2 * (n - 1); i += 2) {
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

		calculateNormals(objVertices, objPolygons)
	}

	static calculateNormals(objVertices, objPolygons) {
		//reset arrays
		vertices = [];
		polygons = [];
		normals = [];
	
		// calculate normals
		for (i = 0; i < objPolygons.length; i++) {
			// get the vertices that make up the ith polygon
			//console.log(objVertices[objPolygons[i][0]])
			vertex1 = new Vector3(objVertices[objPolygons[i][0]]);
			vertex2 = new Vector3(objVertices[objPolygons[i][1]]);
			vertex3 = new Vector3(objVertices[objPolygons[i][2]]);
			//console.log(vertex1);
	
			// cross product
			v1 = new Vector3(vertex2.elements);
			v1.sub(vertex1);
			v2 = new Vector3(vertex3.elements);
			v2.sub(vertex1);
			normal = Vector3.cross(v1, v2);
	
			// push into the final arrays (with repetition)
			for (j = 0; j < vertex1.elements.length; j++){
				vertices.push(vertex1.elements[j]);
			}
			for (j = 0; j < normal.elements.length; j++)
				normals.push(normal.elements[j]);
			polygons.push(3*i);
	
			for (j = 0; j < vertex2.elements.length; j++)
				vertices.push(vertex2.elements[j]);
			for (j = 0; j < normal.elements.length; j++)
				normals.push(normal.elements[j]);
			polygons.push(3*i + 1);
	
			for (j = 0; j < vertex3.elements.length; j++)
				vertices.push(vertex3.elements[j]);
			for (j = 0; j < normal.elements.length; j++)
				normals.push(normal.elements[j]);
			polygons.push(3*i + 2);
			//polygons.push(3*i);
		}
	}
}