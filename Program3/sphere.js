// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 3
// Smooth Lighting
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class Sphere {

	verticesFlat;
	verticesSmooth;
	polygonsFlat;
	polygonsSmooth;

	normalsFlat;
	normalsVertex;

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

	constructor(n, color, modelMatrix) {
		this.color = color;
		this.modelMatrix = modelMatrix;
		
		// represent these as 2d arrays for easy reading during bugfixing
		let objVertices = this.createVertices(n); // an array of 3D points
		let objPolygons = this.createIndices(n); // an array of triangles in terms of 3 points

		this.calcNormalsFlat(objVertices, objPolygons);
		this.calcNormalsSmooth(objVertices, objPolygons);
	}


	createVertices(n) {
		let vertices = [];
		let scaleFactor = 0.05;

		for (let j = 0; j <= n; ++j) {
			let aj = j * Math.PI / n;
			let sj = Math.sin(aj);
			let cj = Math.cos(aj);
			for (let i = 0; i <= n; ++i) {
				let ai = i * 2 * Math.PI / n;
				let si = Math.sin(ai);
				let ci = Math.cos(ai);

				vertices.push([scaleFactor * si * sj, scaleFactor * cj, scaleFactor * ci * sj]);
			}
		}

		return vertices;
	}

	createIndices(n) {
		let indices = [];

		for (let j = 0; j < n; ++j) {
			for (let i = 0; i < n; ++i) {
				let p1 = j * (n+1) + i;
				let p2 = p1 + (n+1);

				indices.push([p1, p2, p1 + 1]);

				indices.push([p1 + 1, p2, p2 + 1]);
			}
		}

		return indices;
	}

	calcNormalsFlat(objVertices, objPolygons) {
		//reset arrays
		this.verticesFlat = [];
		this.polygonsFlat = [];
		this.normalsFlat = [];

		// calculate normals for Flat Shading
		for (let i = 0; i < objPolygons.length; i++) {
			// get the vertices that make up the ith polygon
			let vertex1 = new Vector3(objVertices[objPolygons[i][0]]);
			let vertex2 = new Vector3(objVertices[objPolygons[i][1]]);
			let vertex3 = new Vector3(objVertices[objPolygons[i][2]]);

			// cross product
			let v1 = new Vector3(vertex2.elements);
			v1.sub(vertex1);
			let v2 = new Vector3(vertex3.elements);
			v2.sub(vertex1);
			let normal = Vector3.cross(v1, v2);

			// push into the final arrays (with repetition)
			for (let j = 0; j < vertex1.elements.length; j++) {
				this.verticesFlat.push(vertex1.elements[j]);
			}
			for (let j = 0; j < normal.elements.length; j++)
				this.normalsFlat.push(normal.elements[j]);
			this.polygonsFlat.push(3 * i);

			for (let j = 0; j < vertex2.elements.length; j++)
				this.verticesFlat.push(vertex2.elements[j]);
			for (let j = 0; j < normal.elements.length; j++)
				this.normalsFlat.push(normal.elements[j]);
			this.polygonsFlat.push(3 * i + 1);

			for (let j = 0; j < vertex3.elements.length; j++)
				this.verticesFlat.push(vertex3.elements[j]);
			for (let j = 0; j < normal.elements.length; j++)
				this.normalsFlat.push(normal.elements[j]);
			this.polygonsFlat.push(3 * i + 2);
			//polygons.push(3*i);
		}
	}

	calcNormalsSmooth(objVertices, objPolygons) {
		//reset arrays
		this.verticesSmooth = [];
		this.polygonsSmooth = [];
		this.normalsVertex = [];
		let normalsVertexTemp = [];

		// calculate normals for Smooth Shading
		for (let i = 0; i < objVertices.length; i++) {
			normalsVertexTemp[i] = (new Vector3([0, 0, 0]));
		}
		for (let i = 0; i < objPolygons.length; i++) {
			// get the vertices that make up the ith polygon
			let vertex1 = new Vector3(objVertices[objPolygons[i][0]]);
			let vertex2 = new Vector3(objVertices[objPolygons[i][1]]);
			let vertex3 = new Vector3(objVertices[objPolygons[i][2]]);

			// cross product for all 3 vertices
			let v1 = new Vector3(vertex2.elements);
			v1.sub(vertex1);
			let v2 = new Vector3(vertex3.elements);
			v2.sub(vertex1);
			let normal = Vector3.cross(v1, v2);

			// add to the existing normals for the relevant vertices
			normalsVertexTemp[objPolygons[i][0]].add(normal);
			normalsVertexTemp[objPolygons[i][1]].add(normal);
			normalsVertexTemp[objPolygons[i][2]].add(normal);
		}
		// unpack the array of Vector3s into a 1d array normalsVertex
		for (let i = 0; i < normalsVertexTemp.length; i++) {
			this.normalsVertex.push(normalsVertexTemp[i].elements[0]);
			this.normalsVertex.push(normalsVertexTemp[i].elements[1]);
			this.normalsVertex.push(normalsVertexTemp[i].elements[2]);
		}
		// unpack the 2d array into a 1d array
		// objVertices -> verticesSmooth
		for (let i = 0; i < objVertices.length; i++) {
			this.verticesSmooth.push(objVertices[i][0]);
			this.verticesSmooth.push(objVertices[i][1]);
			this.verticesSmooth.push(objVertices[i][2]);
		}
		// unpack the 2d array into a 1d array
		// objPolygons -> polygonsSmooth
		for (let i = 0; i < objPolygons.length; i++) {
			this.polygonsSmooth.push(objPolygons[i][0]);
			this.polygonsSmooth.push(objPolygons[i][1]);
			this.polygonsSmooth.push(objPolygons[i][2]);
		}
	}
}