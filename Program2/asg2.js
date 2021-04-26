// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 2
// 3D World
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Shaders (GLSL)
// Takes vertex inputs (and can transform them)
var VSHADER = `
	precision mediump float;

	attribute vec3 a_Position; // (x,y,z)
	attribute vec3 a_Normal;
	
	uniform float u_FlatShading; // bool for whether to render flat shading
	uniform mat4 u_Model;
	uniform vec3 u_LightColor;
	uniform vec3 u_LightDirection;
	uniform vec3 u_Color;

	varying vec4 v_Color;

	// compute diffuse for flat shading
	void flatShading() {
		vec3 normal = (u_Model * vec4(a_Normal, 1.0)).xyz;
		normal = normalize(normal);

		vec3 lightDir = normalize(u_LightDirection);

        float nDotL = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = u_LightColor * u_Color * nDotL;

        v_Color = vec4(diffuse, 1.0);
	}

	// wireframe without shading
	void wireFrame() {
		v_Color = vec4(u_Color, 1.0);
	}

	void main() {
		if (u_FlatShading == 1.0) {	flatShading(); } 
		else if (u_FlatShading == 0.0) { wireFrame(); }

		gl_Position = u_Model * vec4(a_Position, 1.0);
	}
`;

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

	defineLightParameters();
	drawPowerLines(); // draw my custom model
}

// set light direction/color
function defineLightParameters() {
	// grab variables from shaders
	let u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
	let u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");

	gl.uniform3f(u_LightDirection, 1.0, 1.0, -1.0);
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

}

// draw my custom model
function drawPowerLines() {
	// define cylinder inputs
	let n;
	let endcaps = "True";
	let color;
	let modelMatrix;
	let scaleCoefficient = 20;
	let translateCoefficient = 100;

	// create selection options in ui
	let cylinders = document.getElementById("objnum");
	for (let i = 0; i < 4; i++) {
		let newCyl = document.createElement("option");
		newCyl.text = i.toString();
		newCyl.value = i;
		cylinders.add(newCyl);
		cylinders.value = Objects.length;
	}



	// create cylinders
	n = 10;
	color = [92 / 255, 64 / 255, 51 / 255];
	modelMatrix = new Matrix4();
	modelMatrix.rotate(90, 1, 0, 0);
	modelMatrix.rotate(0, 0, 1, 0);
	modelMatrix.rotate(0, 0, 0, 1);
	modelMatrix.scale(0.1, 0.1, 1.5);
	modelMatrix.translate(0, 0, 0);
	let cylinder1 = new Cylinder(n, endcaps, color, modelMatrix);
	cylinder1.colorHex = "#5c4033"
	cylinder1.transformations = [
		90, 0, 0, //rotateX, rotateY, rotateZ
		0.1 * scaleCoefficient, 0.1 * scaleCoefficient, 1.5 * scaleCoefficient, // scaleX, scaleY, scaleZ
		0, 0, 0 // translateX, translateY, translateZ
	];


	n = 10;
	color = [92 / 255, 64 / 255, 51 / 255];
	modelMatrix = new Matrix4();
	modelMatrix.rotate(0, 1, 0, 0);
	modelMatrix.rotate(90, 0, 1, 0);
	modelMatrix.rotate(0, 0, 0, 1);
	modelMatrix.scale(0.05, 0.05, 1);
	modelMatrix.translate(0, 13, 0);
	let cylinder2 = new Cylinder(n, endcaps, color, modelMatrix);
	cylinder2.colorHex = "#5c4033";
	cylinder2.transformations = [
		0, 90, 0, //rotateX, rotateY, rotateZ
		0.05 * scaleCoefficient, 0.05 * scaleCoefficient, 1 * scaleCoefficient, // scaleX, scaleY, scaleZ
		0, 13 * translateCoefficient, 0 // translateX, translateY, translateZ
	];

	n = 10;
	color = [92 / 255, 64 / 255, 51 / 255];
	modelMatrix = new Matrix4();
	modelMatrix.rotate(0, 1, 0, 0);
	modelMatrix.rotate(90, 0, 1, 0);
	modelMatrix.rotate(0, 0, 0, 1);
	modelMatrix.scale(0.05, 0.05, 1);
	modelMatrix.translate(0, 8, 0);
	let cylinder3 = new Cylinder(n, endcaps, color, modelMatrix);
	cylinder3.colorHex = "#5c4033";
	cylinder3.transformations = [
		0, 90, 0, //rotateX, rotateY, rotateZ
		0.05 * scaleCoefficient, 0.05 * scaleCoefficient, 1 * scaleCoefficient, // scaleX, scaleY, scaleZ
		0, 8 * translateCoefficient, 0 // translateX, translateY, translateZ
	];

	n = 10;
	color = [0.5, 0.5, 0.5];
	modelMatrix = new Matrix4();
	modelMatrix.rotate(90, 1, 0, 0);
	modelMatrix.rotate(0, 0, 1, 0);
	modelMatrix.rotate(0, 0, 0, 1);
	modelMatrix.scale(0.1, 0.1, 0.3);
	modelMatrix.translate(2, 0.3, -0.5);
	let cylinder4 = new Cylinder(n, endcaps, color, modelMatrix);
	cylinder4.colorHex = "#808080";
	cylinder4.transformations = [
		90, 0, 0, //rotateX, rotateY, rotateZ
		0.1 * scaleCoefficient, 0.1 * scaleCoefficient, 0.3 * scaleCoefficient, // scaleX, scaleY, scaleZ
		2 * translateCoefficient, 0.3 * translateCoefficient, -0.5 * translateCoefficient // translateX, translateY, translateZ
	];

	// add cylinders to the Objects array for drawing
	Objects.push(cylinder1);
	Objects.push(cylinder2);
	Objects.push(cylinder3);
	Objects.push(cylinder4);

	// draw
	drawAll();
}

// loop through the Objects array and draw each
function drawAll() {
	// clear screen
	gl.clear(gl.COLOR_BUFFER_BIT);
	// set global drawmode variable
	drawMode = document.getElementById("mode").value;

	for (let obj of Objects) {
		draw(obj);
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

// initialize a standard array buffer
// return the created buffer
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

// draw an object using WebGL
function draw(obj) {
	// create triangle in cpu memory
	let vertices = new Float32Array(obj.vertices);
	// create normals array in cpu memory
	let normals = new Float32Array(obj.normals);
	// create indices array in cpu memory
	let indices = new Uint16Array(obj.polygons);
	// create indices buffer in gpu
	let indicesBuffer = gl.createBuffer();
	if (!indicesBuffer) {
		console.log("Failed to create buffer");
		return false;
	}

	// set fragment shader color
	defineFragColor(obj.color);
	let u_Model = gl.getUniformLocation(gl.program, "u_Model");
	gl.uniformMatrix4fv(u_Model, false, obj.modelMatrix.elements);

	// init array buffers
	let vertexBuffer = initBuffer("a_Position", 3);
	let normalBuffer = initBuffer("a_Normal", 3);

	// send data from cpu arrays
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	let u_FlatShading = gl.getUniformLocation(gl.program, "u_FlatShading");
	if (drawMode == "WireFrame") {
		gl.uniform1f(u_FlatShading, 0.0); // pass false to the vshader
		gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
	} else if (drawMode == "Solid") {
		gl.uniform1f(u_FlatShading, 1.0); // pass true to the vshader
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	}
}

// call drawUnitCylinder using the input from the user
function createCylinderFromInput() {
	// grab the inputs
	n = document.getElementById("n").value;
	let endcaps = document.getElementById("endcaps").value;
	drawMode = document.getElementById("mode").value;

	// create identity matrix
	let modelMatrix = new Matrix4();
	// grab the cylinders selection dropdown menu
	let cylinders = document.getElementById("objnum");
	// create a new entry for the menu
	let newCyl = document.createElement("option");
	newCyl.text = Objects.length.toString();
	newCyl.value = Objects.length;
	// add the new entry and switch to it
	cylinders.add(newCyl);
	cylinders.value = Objects.length;

	// create new cylinder object and push it into the Objects array
	cylinder = new Cylinder(n, endcaps, color, modelMatrix);
	Objects.push(cylinder);

	// apply the user input transformations to the new cylinder
	transformObj();
}

// remove a cylinder from the scene
function removeCylinder() {
	// remove last option from the selection input
	// later we refactor the array to match with the remaining nums
	let objnum = document.getElementById("objnum");
	if (objnum.value == Objects.length - 1) {
		objnum.value = Objects.length - 2;
	}
	changeSelectedObj();

	objnum.remove(Objects.length - 1);


	// remove cylinder from Objects array
	Objects.splice(objnum.value, 1);

	// redraw
	drawAll();
}

// load the selected cylinder's attributes/transformations into the user input
function changeSelectedObj() {
	// get the relevant object's number in the Objects array
	let objnum = document.getElementById("objnum").value;

	// pull values from the cylinder object
	document.getElementById("rotationx").value = Objects[objnum].transformations[0];
	document.getElementById("rotationy").value = Objects[objnum].transformations[1];
	document.getElementById("rotationz").value = Objects[objnum].transformations[2];
	document.getElementById("scalex").value = Objects[objnum].transformations[3];
	document.getElementById("scaley").value = Objects[objnum].transformations[4];
	document.getElementById("scalez").value = Objects[objnum].transformations[5];
	document.getElementById("translationx").value = Objects[objnum].transformations[6];
	document.getElementById("translationy").value = Objects[objnum].transformations[7];
	document.getElementById("translationz").value = Objects[objnum].transformations[8];
	document.getElementById("color").value = Objects[objnum].colorHex;
}

// transform the selected cylinder using user input
function transformObj() {
	// grab all of the inputs
	let rotateX = document.getElementById("rotationx").value;
	let rotateY = document.getElementById("rotationy").value;
	let rotateZ = document.getElementById("rotationz").value;
	let scaleX = document.getElementById("scalex").value;
	let scaleY = document.getElementById("scaley").value;
	let scaleZ = document.getElementById("scalez").value;
	let translateX = document.getElementById("translationx").value;
	let translateY = document.getElementById("translationy").value;
	let translateZ = document.getElementById("translationz").value;
	let hex = document.getElementById("color").value;
	let objnum = document.getElementById("objnum").value;

	// create transformation matrix
	let modelMatrix = new Matrix4();
	modelMatrix.rotate(rotateX, 1, 0, 0);
	modelMatrix.rotate(rotateY, 0, 1, 0);
	modelMatrix.rotate(rotateZ, 0, 0, 1);
	modelMatrix.scale(scaleX / 20, scaleY / 20, scaleZ / 20);
	modelMatrix.translate(translateX / 100, translateY / 100, translateZ / 100);

	// convert from hex to rgb
	let color = hexToRGB(hex);

	// apply matrix/color
	Objects[objnum].modelMatrix = modelMatrix;
	Objects[objnum].transformations = [ //for loading later
		rotateX, rotateY, rotateZ,
		scaleX, scaleY, scaleZ,
		translateX, translateY, translateZ
	]
	Objects[objnum].colorHex = hex;
	Objects[objnum].color = color;

	// redraw
	drawAll();
}

// converts #RRGGBB into [r, g, b]
// for 0.0 <= r,g,b <= 1.0
function hexToRGB(hex) {
	result = [0, 0, 0]; // [r, g, b]
	nums = []; // numbers of the hex chars in order #RRGGBB

	for (let i = 0; i < 6; i++) {
		switch (hex[i + 1]) {
			case "a":
				nums[i] = 10;
				break;
			case "b":
				nums[i] = 11;
				break;
			case "c":
				nums[i] = 12;
				break;
			case "d":
				nums[i] = 13;
				break;
			case "e":
				nums[i] = 14;
				break;
			case "f":
				nums[i] = 15;
				break;
			default:
				nums[i] = parseInt(hex[i + 1]);
		}
	}

	result[0] = (nums[0] * 16 + nums[1]) / 255;
	result[1] = (nums[2] * 16 + nums[3]) / 255;
	result[2] = (nums[4] * 16 + nums[5]) / 255;

	return result
}

// save .coor and .poly files for the given vertices and polygons
// currently only works for one cylinder without transformations
function saveObj() {
	let filenameCoor = "cylinder" + n + ".coor";
	let filenamePoly = "cylinder" + n + ".poly";

	// create the data to be saved in .coor
	let coorData = "#" + filenameCoor + "\n"
	coorData += objVertices.length + "\n"
	for (i = 0; i < objVertices.length; i++) {
		coorData += (i + 1) + ", " + objVertices[i][0] + ", " + objVertices[i][1] + ", " + objVertices[i][2] + "\n";
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
		polyData += "tri" + (i + 1) + " " + objPolygons[i][0] + " " + objPolygons[i][1] + " " + objPolygons[i][2] + "\n";
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
