// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/11/2021 ~ CSE 160
// amoulios
// 
// Assignment 1
// Drawing a Cylinder
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Shaders (GLSL)
// Takes vertex inputs (and can transform them)
var VSHADER = `
	precision mediump float;
	attribute vec2 a_Position; // (x,y)
	void main() {
		gl_Position = vec4(a_Position, 0.0, 1.0);
	}
`;

// Fragment Shader
// Takes "pixels" rather than vertices and assigns colors
var FSHADER = `
	precision mediump float;
	void main() {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
`;

//global variables
n = 0;
objVertices = [];
objPolygons = [];

//javascript main()
function main() {
	// Retrieve the <canvas> element
	canvas = document.getElementById("cvs1");
	if (!canvas) {
		console.log("Failed to retrieve the <canvas> element");
		return false;
	}

	// Get the rendering context for 2DCG
	gl = canvas.getContext("webgl");
	if (gl == null) {
		console.log("Failed to get webgl context");
		return false;
	}

	// clear the screen
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// compile and send shaders to GPU
	if (!(initShaders(gl, VSHADER, FSHADER))) {
		console.log("Failed to initialize webgl shaders");
		return false;
	}
}

// draw a triangle from 3 points using WebGL
function drawObj(vertexArray, polygonsArray) {
	// create triangle in cpu memory
	let vertices = [];
	for (i = 0; i < vertexArray.length; i ++) { // unwrap the 2d array
		vertices.push(vertexArray[i][0]);
		vertices.push(vertexArray[i][1]);
		vertices.push(vertexArray[i][2]);
	}
	vertices = new Float32Array(vertices);
	//console.log(vertex);

	// create vertex buffer in gpu memory
	let vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log("Failed to create buffer");
		return false;
	}

	// create indices array in cpu memory
	let indices = [];
	for (i = 0; i < polygonsArray.length; i ++) { // unwrap the 2d array
		indices.push(polygonsArray[i][0]);
		indices.push(polygonsArray[i][1]);
		indices.push(polygonsArray[i][2]);
	}
	indices = new Uint16Array(indices);
	//console.log(indices);

	// create indices buffer in gpu
	let indicesBuffer = gl.createBuffer();
	if (!indicesBuffer) {
		console.log("Failed to create buffer");
		return false;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // vertexBuffer assigned to an array buffer in webgl
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer); // same for indicesBuffer

	let a_Position = gl.getAttribLocation(gl.program, "a_Position"); // send triangle to gpu
	                                                                 // gl.program is where the shaders go when compiled
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0); //read points in pairs of floats
	gl.enableVertexAttribArray(a_Position);

	// send data from cpu arrays
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	//gl.drawArrays(gl.LINE_LOOP, 0, vertex.length / 3);
	gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
}

// call drawUnitCylinder using the input from the user
function drawUnitCylinderFromInput() {
	// grab the inputs
	n = document.getElementById("n").value;
	console.log("number of sides: " + n);
	let endcaps = document.getElementById("endcaps").value;
	console.log("endcaps: " + (endcaps == "True"));

	drawUnitCylinder(n, endcaps);
}

// draw a unit cylinder with n-sided circular faces
function drawUnitCylinder(n, endcaps) {
	// clear the canvas
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

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
	for (i = 0; i < 2*(n - 1); i+=2) {
		objPolygons.push([i, i + 1, i + 2]); // top vertex, bot vertex, next top vertex (facing side)
		objPolygons.push([i + 1, i + 3, i + 2]); // bot vertex, next bot vertex, next top vertex (facing side)
		if (endcaps == "True") { //endcaps:
			objPolygons.push([i, i + 2, 2*n]); // top vertex, next top vertex, top center (facing top)
			objPolygons.push([2*n + 1, i + 3, i + 1]); // bot center, next bot vertex, bot vertex (facing bottom)
		}
	}
	// connect the final 2 vertices of the circles
	// (involves wrapping around the arrays)
	objPolygons.push([2*n - 2, 2*n - 1, 0]); // top vertex, bot vertex, next top vertex (facing side)
	objPolygons.push([2*n - 1, 1, 0]); // bot vertex, next bot vertex, next top vertex (facing side)
	if (endcaps == "True") { //final endcaps:
		objPolygons.push([2*n - 2, 0, 2*n]); // top vertex, next top vertex, top center (facing top)
		objPolygons.push([2*n + 1, 1, 2*n - 1]); // bot center, next bot vertex, bot vertex (facing bottom)
	}

	//console.log(vertices);
	//console.log(polygons);

	//save to .coor and .poly
	saveObj(objVertices, objPolygons);
	drawObj(objVertices, objPolygons);

	// print the # of vertices
	console.log("number of vertices: " + (2*n + 2));
	// print the # of triangles
	console.log("number of triangles: " + (4*n));
}

// save .coor and .poly files for the given vertices and polygons
function saveObj(vertices, polygons) {
	let filenameCoor = "cylinder" + n + ".coor";
	let filenamePoly = "cylinder" + n + ".poly";

	// create the data to be saved in .coor
	let coorData = "#" + filenameCoor + "\n"
	coorData += vertices.length + "\n"
	for (i = 0; i < vertices.length; i++) {
		coorData += (i+1) + ", " + vertices[i][0] + ", " + vertices[i][1] + ", " + vertices[i][2] + "\n";
	}

	//console.log(coorData);

	// create the .coor file using vertices
	var savedata = document.createElement('a');
	savedata.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(coorData));
	savedata.setAttribute("download", filenameCoor);
	savedata.style.display = "none";
	document.body.appendChild(savedata);
	savedata.click();
	document.body.removeChild(savedata);

	//console.log("cylinder.coor saved");

	// create the data to be saved in .poly
	let polyData = "#" + filenamePoly + "\n"
	polyData += polygons.length + "\n"
	for (i = 0; i < polygons.length; i++) {
		polyData += "tri" + (i+1) + " " + polygons[i][0] + " " + polygons[i][1] + " " + polygons[i][2] + "\n";
	}

	//console.log(polyData);

	//create the .poly file using polygons
	var savedata = document.createElement('a');
	savedata.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(polyData));
	savedata.setAttribute("download", filenamePoly);
	savedata.style.display = "none";
	document.body.appendChild(savedata);
	savedata.click();
	document.body.removeChild(savedata);

	//console.log("cylinder.poly saved");
}

// read .coor and .poly files into vertices and polygons (unimplemented)
function readObj(vertices, polygons) {

}
