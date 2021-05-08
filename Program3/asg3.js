// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 3
// Smooth Lighting
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Shaders (GLSL)
// Takes vertex inputs (and can transform them)
var VSHADER = `
	precision mediump float;

	//vertices/normals and their transformations
	attribute vec3 a_Position; // (x,y,z)
	attribute vec3 a_Normal;
	uniform mat4 u_NormalMatrix;
	uniform mat4 u_ModelMatrix;

	// pass to frag shader for phong shading
	varying vec3 v_Normal;
    varying vec3 v_WorldPos;
	
	// "bools" to determine whether to draw certain effects
	uniform float u_ShadingType; 
	uniform float u_DirectionalLightingOn;
	uniform float u_PointLightingOn;
	uniform float u_AmbientOn;
	uniform float u_DiffuseOn;
	uniform float u_SpecularOn;

	// Light Colors
	uniform vec3 u_DiffuseColor;
	uniform vec3 u_AmbientColor;
	uniform vec3 u_SpecularColor;
	uniform float u_SpecularAlpha;

	// Light Vectors
	uniform vec3 u_LightDirection;
	uniform vec3 u_LightPosition;
	uniform vec3 u_EyePosition;

	// Object Color
	uniform vec3 u_Color;
	
	// Final Color
	varying vec4 v_Color;

	void phongPass() {
		v_WorldPos = (u_ModelMatrix * vec4(a_Position, 1.0)).xyz;
        v_Normal = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz; // Normal
	}

	// ambient, diffuse, and specular
	// either smooth or flat depending on the normals passed
	void shading() {
		vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

		vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz;
		vec3 l = normalize(u_LightPosition - worldPos.xyz); //point
		vec3 ld = normalize(u_LightDirection); //directional
		vec3 v = normalize(u_EyePosition - worldPos.xyz);
		vec3 r = reflect(l, n); //reflected light
		vec3 rd = reflect(ld, n);

		// Ambient Light (independent of light)
		vec3 ambient = vec3(0, 0, 0);
		if (u_AmbientOn == 1.0)
			ambient = u_AmbientColor * u_Color;

		// Diffuse Light with Point Light
		vec3 diffuse = vec3(0, 0, 0);
		if (u_DiffuseOn == 1.0 && u_PointLightingOn == 1.0) {
			float nDotL = max(dot(n, l), 0.0);
			diffuse = u_DiffuseColor * u_Color * nDotL;
		}

		// Diffuse Light with Directional Light
		vec3 diffuseDir = vec3(0, 0, 0);
		if (u_DiffuseOn == 1.0 && u_DirectionalLightingOn == 1.0) {
			float nDotLDirectional = max(dot(n, ld), 0.0);
			diffuseDir = u_DiffuseColor * u_Color * nDotLDirectional;
		}

		// Specular Light
		vec3 specular = vec3(0, 0, 0);
		if (u_SpecularOn == 1.0 && u_PointLightingOn == 1.0) {
			float rDotV = max(dot(r, v), 0.0);
			float rDotVPowAlpha = pow(rDotV, u_SpecularAlpha);
			specular = u_SpecularColor * u_Color * rDotVPowAlpha;
		}

		vec3 specularDir = vec3(0, 0, 0);
		if (u_SpecularOn == 1.0 && u_DirectionalLightingOn == 1.0) {
			float rDotV = max(dot(rd, v), 0.0);
			float rDotVPowAlpha = pow(rDotV, u_SpecularAlpha);
			specularDir = u_SpecularColor * u_Color * rDotVPowAlpha;
		}

		// Final Light Color
		v_Color = vec4(ambient + (diffuse + diffuseDir) + (specular + specularDir), 1.0);
	}

	// wireframe without shading
	void wireFrame() {
		v_Color = vec4(u_Color, 1.0);
	}

	void main() {
		if (u_ShadingType == 3.0) { phongPass(); }
		else if (u_ShadingType == 2.0) { shading(); }
		else if (u_ShadingType == 1.0) { shading(); } 
		else if (u_ShadingType == 0.0) { wireFrame(); }

		gl_Position = u_ModelMatrix * vec4(a_Position, 1.0);
	}
`;

// Fragment Shader
// Takes "pixels" rather than vertices and assigns colors
var FSHADER = `
	precision mediump float;

	varying vec3 v_Normal;
    varying vec3 v_WorldPos;

	// "bools" to determine whether to draw certain effects
	uniform float u_ShadingType; 
	uniform float u_DirectionalLightingOn;
	uniform float u_PointLightingOn;
	uniform float u_AmbientOn;
	uniform float u_DiffuseOn;
	uniform float u_SpecularOn;

	// Light Colors
	uniform vec3 u_DiffuseColor;
	uniform vec3 u_AmbientColor;
	uniform vec3 u_SpecularColor;
	uniform float u_SpecularAlpha;

	// Light Vectors
	uniform vec3 u_LightDirection;
	uniform vec3 u_LightPosition;
	uniform vec3 u_EyePosition;
	
	// Object Color
	uniform vec3 u_Color;

	//Final Color
	varying vec4 v_Color;

	// ambient, diffuse, and specular
	// either smooth or flat depending on the normals passed
	vec4 phongShading() {
		vec3 n = v_Normal;
		vec3 l = normalize(u_LightPosition - v_WorldPos); //point
		vec3 ld = normalize(u_LightDirection); //directional
		vec3 v = normalize(u_EyePosition - v_WorldPos);
		vec3 r = reflect(l, n); //reflected light
		vec3 rd = reflect(ld, n);

		// Ambient Light (independent of light)
		vec3 ambient = vec3(0, 0, 0);
		if (u_AmbientOn == 1.0)
			ambient = u_AmbientColor * u_Color;

		// Diffuse Light with Point Light
		vec3 diffuse = vec3(0, 0, 0);
		if (u_DiffuseOn == 1.0 && u_PointLightingOn == 1.0) {
			float nDotL = max(dot(n, l), 0.0);
			diffuse = u_DiffuseColor * u_Color * nDotL;
		}

		// Diffuse Light with Directional Light
		vec3 diffuseDir = vec3(0, 0, 0);
		if (u_DiffuseOn == 1.0 && u_DirectionalLightingOn == 1.0) {
			float nDotLDirectional = max(dot(n, ld), 0.0);
			diffuseDir = u_DiffuseColor * u_Color * nDotLDirectional;
		}

		// Specular Light
		vec3 specular = vec3(0, 0, 0);
		if (u_SpecularOn == 1.0 && u_PointLightingOn == 1.0) {
			float rDotV = max(dot(r, v), 0.0);
			float rDotVPowAlpha = pow(rDotV, u_SpecularAlpha);
			specular = u_SpecularColor * u_Color * rDotVPowAlpha;
		}

		vec3 specularDir = vec3(0, 0, 0);
		if (u_SpecularOn == 1.0 && u_DirectionalLightingOn == 1.0) {
			float rDotV = max(dot(rd, v), 0.0);
			float rDotVPowAlpha = pow(rDotV, u_SpecularAlpha);
			specularDir = u_SpecularColor * u_Color * rDotVPowAlpha;
		}

		// Final Light Color
		return vec4(ambient + (diffuse + diffuseDir) + (specular + specularDir), 1.0);
	}

	void main() {
		if (u_ShadingType == 3.0) { 
			gl_FragColor = phongShading(); 
		} else { 
			gl_FragColor = v_Color;
		}
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

// Light Variables
let lightDirection = [-1.0, 1.0, -1.0];
let lightPoint = [0.0, 0.0, 0.0];
let eyePosition = [0.0, 0.0, 0.0];
// Global DrawMode
let drawModeGlobal = "Solid";

// Scale for the transformation slider values
// So that they can achieve non-integer numbers
let transScale = 100;
let scaleScale = 20;

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
	
	drawPowerLines(); // draw my custom model

	// sphere to make it easy to see lighting effects
	let cylinders = document.getElementById("objnum");
	let newCyl = document.createElement("option");
	newCyl.text = Objects.length.toString();
	newCyl.value = Objects.length;
	cylinders.add(newCyl);
	cylinders.value = Objects.length;

	let sphereModel = new Matrix4();
	let sphere = new Sphere(10, 0.25, [1.0, 1.0, 1.0], sphereModel);
	sphere.colorHex = "#FFFFFF";
	Objects.push(sphere);
	
	defineLightParameters();
	changeSelectedObj();
}

// set light direction/color
// and toggle different light effects
function defineLightParameters() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	// grab variables from shaders
	let u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
	let u_LightPosition = gl.getUniformLocation(gl.program, "u_LightPosition");
	let u_EyePosition = gl.getUniformLocation(gl.program, "u_EyePosition");

	let u_DiffuseColor = gl.getUniformLocation(gl.program, "u_DiffuseColor");
	let u_AmbientColor = gl.getUniformLocation(gl.program, "u_AmbientColor");
	let u_SpecularColor = gl.getUniformLocation(gl.program, "u_SpecularColor");
	let u_SpecularAlpha = gl.getUniformLocation(gl.program, "u_SpecularAlpha");

	let u_DirectionalLightingOn = gl.getUniformLocation(gl.program, "u_DirectionalLightingOn");
	let u_PointLightingOn = gl.getUniformLocation(gl.program, "u_PointLightingOn");
	let u_DiffuseOn = gl.getUniformLocation(gl.program, "u_DiffuseOn");
	let u_AmbientOn = gl.getUniformLocation(gl.program, "u_AmbientOn");
	let u_SpecularOn = gl.getUniformLocation(gl.program, "u_SpecularOn");

	lightPoint = [document.getElementById("px").value,
				  document.getElementById("py").value,
				  document.getElementById("pz").value];

	lightDirection = [document.getElementById("dx").value,
				  	  document.getElementById("dy").value,
				  	  document.getElementById("dz").value];

	gl.uniform3f(u_LightDirection, lightDirection[0], lightDirection[1], lightDirection[2]);
	gl.uniform3f(u_LightPosition, lightPoint[0], lightPoint[1], lightPoint[2]);
	gl.uniform3f(u_EyePosition, eyePosition[0], eyePosition[1], eyePosition[2]);

	gl.uniform3f(u_DiffuseColor, 1.0, 1.0, 1.0);
	gl.uniform3f(u_AmbientColor, 0.2, 0.2, 0.2);
	gl.uniform3f(u_SpecularColor, 0.8, 0.8, 0.8);
	gl.uniform1f(u_SpecularAlpha, 8.0);

	gl.uniform1f(u_DirectionalLightingOn, (document.getElementById("DirLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_PointLightingOn, (document.getElementById("PointLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_DiffuseOn, (document.getElementById("DiffuseLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_AmbientOn, (document.getElementById("AmbientLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_SpecularOn, (document.getElementById("SpecularLighting").checked) ? 1.0 : 0.0);

	drawAll();
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
	modelMatrix.translate(0, 1, 0);
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
	modelMatrix.translate(2, 13, 0);
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
	modelMatrix.translate(2, 8, 0);
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
	modelMatrix.translate(2, -0.5, -0.5);
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
}

// loop through the Objects array and draw each
function drawAll() {
	// clear screen
	gl.clear(gl.COLOR_BUFFER_BIT);
	// set global drawmode variable
	drawModeGlobal = document.getElementById("mode").value;

	// draw each object in the objects array
	for (let obj of Objects) {
		draw(obj, drawModeGlobal);
	}

	// Sphere to represent point light
	if (document.getElementById("PointLighting").checked) {
		let sphereModel = new Matrix4();
		sphereModel.translate(lightPoint[0], lightPoint[1], lightPoint[2]);
		let sphere = new Sphere(10, 0.05, [1.0, 1.0, 1.0], sphereModel);
		draw(sphere, "WireFrame");
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
function draw(obj, drawMode) {
	// define in cpuvertices/normals/indices differently
	// depending on smooth vs flat shading.
	let normals;
	let vertices;
	let indices;
	if (drawMode == "Gouraud" || drawMode == "Phong" || drawMode == "WireFrame") {
		vertices = new Float32Array(obj.verticesSmooth);
		normals = new Float32Array(obj.normalsVertex);
		indices = new Uint16Array(obj.polygonsSmooth);
	} else {
		vertices = new Float32Array(obj.verticesFlat);
		normals = new Float32Array(obj.normalsFlat);
		indices = new Uint16Array(obj.polygonsFlat);
	}

	// create indices buffer in gpu
	let indicesBuffer = gl.createBuffer();
	if (!indicesBuffer) {
		console.log("Failed to create buffer");
		return false;
	}

	// set fragment shader color
	defineFragColor(obj.color);

	// create transformation matrices from object data
	let u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	let u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	gl.uniformMatrix4fv(u_ModelMatrix, false, obj.modelMatrix.elements);
	normalMatrix = new Matrix4(); //normalMatrix = inverse transpose of modelMatrix
	normalMatrix.setInverseOf(obj.modelMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements)

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

	// set the float that determines which shading to carry out
	// 0.0 = none
	// 1.0 = flat shading
	// 2.0 = gouraud
	// 3.0 = phong (unimplemented)
	let u_ShadingType = gl.getUniformLocation(gl.program, "u_ShadingType");
	if (drawMode == "WireFrame") {
		gl.uniform1f(u_ShadingType, 0.0);
		gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
	} else if (drawMode == "Solid") {
		gl.uniform1f(u_ShadingType, 1.0);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	} else if (drawMode == "Gouraud") {
		gl.uniform1f(u_ShadingType, 2.0);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	} else if (drawMode == "Phong") {
		gl.uniform1f(u_ShadingType, 3.0);
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
	if (objnum.value == Objects.length - 1 && Objects.length > 1) {
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
	if (Objects.length == 0)
		return;

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
