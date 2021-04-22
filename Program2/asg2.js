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

var WIREFRAMEVSHADER = `
	precision mediump float;

	attribute vec3 a_Position;

	uniform mat4 u_Model;
	uniform vec3 u_Color

	varying vec4 v_Color;

	void main() {
		v_Color = vec4(u_Color, 1.0);
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
	
}

function defineParameters() {
	// grab variables from shaders
	let u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
	let u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");

	gl.uniform3f(u_LightDirection, 1.0, 0.0, -2.0);
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

}

function drawAll() {
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

// draw a triangle from 3 points using WebGL
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

	gl.clear(gl.COLOR_BUFFER_BIT);

	// set fragment shader color
	//defineFragColor(obj.color);
	defineFragColor([1.0, 0.0, 0.0]);
	let u_Model = gl.getUniformLocation(gl.program, "u_Model");
	gl.uniformMatrix4fv(u_Model, false, obj.modelMatrix.elements);
	
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
	if (drawMode == "WireFrame") {
		gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
	} else {
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	}
}

// call drawUnitCylinder using the input from the user
function createCylinderFromInput() {
	// grab the inputs
	n = document.getElementById("n").value;
	let endcaps = document.getElementById("endcaps").value;
	drawMode = document.getElementById("mode").value;
	let color = document.getElementById("color").value;
	console.log(color)

	//createUnitCylinder(n, endcaps);
	Objects = [];
	let modelMatrix = new Matrix4();

	cylinder = new Cylinder(n, endcaps, color, modelMatrix);
	Objects.push(cylinder);
	console.log(cylinder);

	transformObj();
}

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
	//let objnum = document.getElementById("objnum").value;
	let objnum = 0;

	// create transformation matrix
	let modelMatrix = new Matrix4();
	modelMatrix.rotate(rotateX, 1, 0, 0);
	modelMatrix.rotate(rotateY, 0, 1, 0);
	modelMatrix.rotate(rotateZ, 0, 0, 1);
	modelMatrix.scale(scaleX / 20, scaleY / 20, scaleZ / 20);
	modelMatrix.translate(translateX / 100, translateY / 100, translateZ / 100);
	
	// apply matrix
	Objects[objnum].modelMatrix = modelMatrix;

	drawAll();
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
