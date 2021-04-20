// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 2
// Drawing a Cylinder
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Shaders (GLSL)
// Takes vertex inputs (and can transform them)
var VSHADER = `
	precision mediump float;

	attribute vec3 a_Position; // (x,y,z)
	attribute vec3 a_Normal;

	uniform mat4 u_Model;
	uniform vec3 u_LightColor;
	uniform vec3 u_LightDirection;
	uniform vec3 u_Color;

	varying vec4 v_Color;

	void main() {
		vec3 normal = (u_Model * vec4(a_Normal, 1.0)).xyz;
		normal = normalize(normal);

		vec3 lightDir = normalize(u_LightDirection);

        float nDotL = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = u_LightColor * u_Color * nDotL;

        v_Color = vec4(diffuse, 1.0);

		gl_Position = u_Model * vec4(a_Position, 1.0);
	}
`;

// gl_Position = u_Scaling * u_Rotation * vec4(a_Position, 1.0) + vec4(u_Translation, 1.0);

// Fragment Shader
// Takes "pixels" rather than vertices and assigns colors
var FSHADER = `
	precision mediump float;
	
	uniform vec3 u_Color;

	varying vec4 v_Color;

	void main() {
		gl_FragColor = v_Color;
	}
`;

// GLOBAL VARIABLES
// vertex depth of the cylinders
let n = 0;
// construction arrays
let Objects = [];
let objVertices = []; // without repetition
let objPolygons = [];

// final arrays
let vertices = []; // with repetition for normals
let normals = [];
let polygons = [];

let light = null;
let drawMode = null;

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
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// compile and send shaders to GPU
	if (!(initShaders(gl, VSHADER, FSHADER))) {
		console.log("Failed to initialize webgl shaders");
		return false;
	}

	light = new Vector3([1.0, 1.0, 1.0]);

	defineParameters();
	//drawAll();
}

function defineParameters() {
	// create model matrix for transformations
	let modelMatrix = new Matrix4();
	modelMatrix.rotate(30, 1, 0, 0);
	modelMatrix.translate(0, 0, 0);
	modelMatrix.scale(0.5, 0.5, 0.5);

	// grab variables from shaders
	let u_Model = gl.getUniformLocation(gl.program, "u_Model");
	let u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
	let u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");

	gl.uniformMatrix4fv(u_Model, false, modelMatrix.elements);
	gl.uniform3f(u_LightDirection, 1.0, 0.0, -2.0);
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

}

function drawAll() {
	while (true) {
		for (let obj of Objects) {
			drawSolid(obj[0], obj[1], obj[2]);
		}
	}
}

// change the Fragment Shader's color
// color = [r, g, b]
function defineFragColor(color) {
    // get u_Color variable from fragment shader
    let u_Color = gl.getUniformLocation(gl.program, "u_Color");
	// set u_Color
	gl.uniform3f(u_Color, color[0], color[1], color[2]);
}

function initBuffer(attributeName, num) {
	let shaderBuffer = gl.createBuffer();
	if (!shaderBuffer) {
		console.log("Can't create buffer.");
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

	let attrib = gl.getAttribLocation(gl.program, attributeName);
	gl.vertexAttribPointer(attrib, num, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(attrib);

	return shaderBuffer;
}

function drawWireframe(vertexArray, polygonsArray) {
	// create triangle in cpu memory
	let vertices = [];
	for (i = 0; i < vertexArray.length; i ++) { // unwrap the 2d array
		vertices.push(vertexArray[i][0]);
		vertices.push(vertexArray[i][1]);
		vertices.push(vertexArray[i][2]);
	}
	vertices = new Float32Array(vertices);

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
		indices.push(polygonsArray[i][0]);
	}
	indices = new Uint16Array(indices);

	// create indices buffer in gpu
	let indicesBuffer = gl.createBuffer();
	if (!indicesBuffer) {
		console.log("Failed to create buffer");
		return false;
	}

	gl.clear(gl.COLOR_BUFFER_BIT);

	// set fragment shader color
	defineFragColor([1.0, 0.0, 0.0]);

	// create model matrix for transformations
	let modelMatrix = new Matrix4();
	modelMatrix.rotate(30, 1, 0, 0);
	modelMatrix.translate(0, 0, 0);
	modelMatrix.scale(0.5, 0.5, 0.5);

	let u_Model = gl.getUniformLocation(gl.program, "u_Model");
	gl.uniformMatrix4fv(u_Model, false, modelMatrix.elements);
	let u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
	gl.uniform3f(u_LightDirection, 1.0, 1.0, 1.0);
	let u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

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

// draw a triangle from 3 points using WebGL
function drawSolid(vertexArray, polygonsArray, normalArray) {
	// create triangle in cpu memory
	let vertices = new Float32Array(vertexArray);
	// create normals array in cpu memory
	let normals = new Float32Array(normalArray);
	// create indices array in cpu memory
	let indices = new Uint16Array(polygonsArray);
	// create indices buffer in gpu
	let indicesBuffer = gl.createBuffer();
	if (!indicesBuffer) {
		console.log("Failed to create buffer");
		return false;
	}

	gl.clear(gl.COLOR_BUFFER_BIT);

	// set fragment shader color
	defineFragColor([1.0, 0.0, 0.0]);
	
	let vertexBuffer = initBuffer("a_Position", 3);
	let normalBuffer = initBuffer("a_Normal", 3);

	// send data from cpu arrays
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	//gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}



// call drawUnitCylinder using the input from the user
function drawUnitCylinderFromInput() {
	// grab the inputs
	n = document.getElementById("n").value;
	console.log("number of sides: " + n);
	let endcaps = document.getElementById("endcaps").value;
	console.log("endcaps: " + (endcaps == "True"));
	drawMode = document.getElementById("mode").value;

	drawUnitCylinder(n, endcaps);
}

function calculateNormals() {
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

// draw a unit cylinder with n-sided circular faces
function drawUnitCylinder(n, endcaps) {
	// clear the canvas

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

	
	// draw
	if (drawMode == "WireFrame")
		drawWireframe(objVertices, objPolygons);
	else{
		//calculate normals
		calculateNormals();
		drawSolid(vertices, polygons, normals);
	}

	// print the # of vertices
	console.log("number of vertices: " + (2*n + 2));
	// print the # of triangles
	console.log("number of triangles: " + (4*n));
}

// save .coor and .poly files for the given vertices and polygons
function saveObj() {
	let filenameCoor = "cylinder" + n + ".coor";
	let filenamePoly = "cylinder" + n + ".poly";

	// create the data to be saved in .coor
	let coorData = "#" + filenameCoor + "\n"
	coorData += objVertices.length + "\n"
	for (i = 0; i < objVertices.length; i++) {
		coorData += (i+1) + ", " + objVertices[i][0] + ", " + objVertices[i][1] + ", " + objVertices[i][2] + "\n";
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
	polyData += objPolygons.length + "\n"
	for (i = 0; i < objPolygons.length; i++) {
		polyData += "tri" + (i+1) + " " + objPolygons[i][0] + " " + objPolygons[i][1] + " " + objPolygons[i][2] + "\n";
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
