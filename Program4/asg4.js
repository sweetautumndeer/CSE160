// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 4
// Camera Movement
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
	uniform mat4 u_ViewMatrix;
	uniform mat4 u_ProjMatrix;

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

	// pass variables to the frag shader
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
		vec3 r = reflect(-l, n); //reflected light
		vec3 rd = reflect(-ld, n);

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

		gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
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
		vec3 r = reflect(-l, n); //reflected light
		vec3 rd = reflect(-ld, n);

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
Objects = [];

// For Drawing
let normals;
let vertices;
let indices;

let u_ModelMatrix;
let u_NormalMatrix;
let u_ViewMatrix;
let u_ProjMatrix;
let u_ShadingType;

let indicesBuffer;
let vertexBuffer;
let normalBuffer;

// Matrices
let viewMatrix;
let projMatrix;
let normalMatrix;

// Light Variables
let lightDirection = [-1.0, 1.0, -1.0];
let lightPoint = [0.0, 0.0, 0.0];
let sphere;

// Camera Variables
let cam;
let eyePosition = [0.0, 0.0, 3.0];

// Animation Variables
let animationPoints = [[0.0, 0.0, 3.0],
                       [3.0, 1.0, 0.0],
					   [0.0, 2.0, -3.0],
					   [-3.0, 1.0, 0.0],
					   [0.0, 0.0, 3.0]];
let animationPosition = 0;
let t = 0;

// Global DrawMode
let drawModeGlobal = "Solid";

// Scale for the transformation slider values
// So that they can achieve non-integer numbers
let transScale = 100;
let scaleScale = 20;

// for movement calculations
let selected = false;
let lastClientX;
let lastClientY;

// booleans for movement (handled in move())
let w = false;
let a = false;
let s = false;
let d = false;
let shift = false;
let ctrl = false;

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
	gl.clearColor(0.1, 0.1, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// compile and send shaders to GPU
	if (!(initShaders(gl, VSHADER, FSHADER))) {
		console.log("Failed to initialize webgl shaders");
		return false;
	}

	// init camera
	cam = new Camera();
	viewMatrix = new Matrix4();
	projMatrix = new Matrix4();
	normalMatrix = new Matrix4();
	sphereModel = new Matrix4();
	sphere = new Sphere(10, 0.05, [1.0, 1.0, 1.0], sphereModel);
	
	drawPowerLines(); // draw my custom model

	// sphere to make it easy to see lighting effects
	let cylinders = document.getElementById("objnum");
	let newCyl = document.createElement("option");
	newCyl.text = Objects.length.toString();
	newCyl.value = Objects.length;
	cylinders.add(newCyl);
	cylinders.value = Objects.length;

	let sphereModel2 = new Matrix4();
	let sphere2 = new Sphere(10, 0.25, [1.0, 1.0, 1.0], sphereModel2);
	sphere.colorHex = "#FFFFFF";
	Objects.push(sphere2);

	// create transformation matrices from object data
	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");

	// create indices buffer in gpu
	indicesBuffer = gl.createBuffer();
	if (!indicesBuffer) {
		console.log("Failed to create buffer");
		return false;
	}
	// init array buffers
	vertexBuffer = initBuffer("a_Position", 3);
	normalBuffer = initBuffer("a_Normal", 3);
	u_ShadingType = gl.getUniformLocation(gl.program, "u_ShadingType");
	
	drawAll();
	changeSelectedObj();
	loadPoint();
}

// click on canvas = use mouse input
// click again anywhere = cancel mouse input
window.addEventListener("mousedown", function(event) {
	if (event.target.id == "cvs1" && !selected) {
		selected = true;
	}
});

window.addEventListener("mouseup", function(event) {
	selected = false;
});

// tilt/pan when mouse movement
window.addEventListener("mousemove", function(event) {
	if (selected && document.getElementById("animation").value == "none") {
		cam.tilt(event.clientY - lastClientY);
		cam.pan(lastClientX - event.clientX);
	}

	lastClientX = event.clientX;
	lastClientY = event.clientY;
});

// func for keyboard input camera movement
window.addEventListener("keydown", function(event) {
	switch(event.key) {
		case "w": //forward
			w = true;
			break;
		case "a": //left
			a = true;
			break;
		case "s": //backward
			s = true;
			break;
		case "d": //right
			d = true;
			break;
		case "Shift": //up
			shift = true;
			break;
		case "Control": //down
			ctrl = true;
			break;
		case "r":
			// reset camera
			cam.reset();;
			break;
	}
});

// detect when a button is no longer held down
// and cancel movement
window.addEventListener("keyup", function(event) {
	switch(event.key) {
		case "w": //forward
			w = false;
			break;
		case "a": //left
			a = false;
			break;
		case "s": //backward
			s = false;
			break;
		case "d": //right
			d = false;
			break;
		case "Shift": //up
			shift = false;
			break;
		case "Control": //down
			ctrl = false;
			break;
	}
});

// take care of movement (called in drawAll())
function move() {
	if (w)
		cam.moveForward();
	if (a)
		cam.moveSideways("Left");
	if (s)
		cam.moveBackward();
	if (d)
		cam.moveSideways("Right");
	if (shift)
		cam.moveUp();
	if (ctrl)
		cam.moveDown();
}

// change animation points when edited through the ui
function editAnimation() {
	let selectedPoint = parseInt(document.getElementById("animPoint").value);
	animationPoints[selectedPoint][0] = parseInt(document.getElementById("animX").value);
	animationPoints[selectedPoint][1] = parseInt(document.getElementById("animY").value);
	animationPoints[selectedPoint][2] = parseInt(document.getElementById("animZ").value);
	console.log(animationPoints);
}

// load animation points into the ui when selected
function loadPoint() {
	let selectedPoint = parseInt(document.getElementById("animPoint").value);
	document.getElementById("animX").value = animationPoints[selectedPoint][0];
	document.getElementById("animY").value = animationPoints[selectedPoint][1];
	document.getElementById("animZ").value = animationPoints[selectedPoint][2];
}

function addPoint() {
	let points = document.getElementById("animPoint");
	let p = document.createElement("option");
	p.text = animationPoints.length.toString();
	p.value = animationPoints.length;
	// add the new entry and switch to it
	points.add(p);
	points.value = animationPoints.length;

	animationPoints[animationPoints.length] = [0, 0, 0];
	loadPoint();
}

// animation involving linear interpolation between points
function linearAnimation() {
	cam.center.elements = [0.0, 0.0, 0.0];
	t += 0.01; // speed of animation
	if (t <= 1) {
		cam.eye.elements[0] = animationPoints[animationPosition][0] + t * (animationPoints[animationPosition + 1][0] - animationPoints[animationPosition][0]);
		cam.eye.elements[1] = animationPoints[animationPosition][1] + t * (animationPoints[animationPosition + 1][1] - animationPoints[animationPosition][1]);
		cam.eye.elements[2] = animationPoints[animationPosition][2] + t * (animationPoints[animationPosition + 1][2] - animationPoints[animationPosition][2]);
	} else {
		t = 0;
		if (animationPosition == animationPoints.length - 2)
			animationPosition = 0;
		else
			animationPosition++;
	}
}

// simple choose function
function choose(n, k) {
	if (k == 0) return 1;
	return (n * choose(n - 1, k - 1)) / k;
}

// similar animation as above but with cubic curve interpolation
// De Casteljau's Algorithm
function cubicAnimation() {
	cam.center.elements = [0.0, 0.0, 0.0];
	t += 0.0025; // speed of animation

	let x = 0; 
	let y = 0;
	let z = 0;

	if (t <= 1) {
		let n = animationPoints.length - 1;
		for (let i = 0; i <= n; ++i) {
			x += animationPoints[i][0] * choose(n, i) * Math.pow((1 - t), n - i) * Math.pow(t, i);
			y += animationPoints[i][1] * choose(n, i) * Math.pow((1 - t), n - i) * Math.pow(t, i);
			z += animationPoints[i][2] * choose(n, i) * Math.pow((1 - t), n - i) * Math.pow(t, i);
		}
		cam.eye.elements[0] = x;
		cam.eye.elements[1] = y;
		cam.eye.elements[2] = z;
	} else {
		t = 0;
	}
}

// set light direction/color
// and toggle different light effects
function defineLightParameters() {
	drawModeGlobal = document.getElementById("mode").value;

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
	gl.uniform3f(u_EyePosition, cam.eye.elements[0], cam.eye.elements[1], cam.eye.elements[2]);

	gl.uniform3f(u_DiffuseColor, 1.0, 1.0, 1.0);
	gl.uniform3f(u_AmbientColor, 0.2, 0.2, 0.2);
	gl.uniform3f(u_SpecularColor, 0.8, 0.8, 0.8);
	gl.uniform1f(u_SpecularAlpha, 8.0);

	gl.uniform1f(u_DirectionalLightingOn, (document.getElementById("DirLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_PointLightingOn, (document.getElementById("PointLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_DiffuseOn, (document.getElementById("DiffuseLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_AmbientOn, (document.getElementById("AmbientLighting").checked) ? 1.0 : 0.0);
	gl.uniform1f(u_SpecularOn, (document.getElementById("SpecularLighting").checked) ? 1.0 : 0.0);

	// Sphere to represent point light
	if (document.getElementById("PointLighting").checked) {
		sphere.modelMatrix.setTranslate(lightPoint[0], lightPoint[1], lightPoint[2]);
		draw(sphere, "WireFrame");
	}
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
	modelMatrix.translate(0, -4, 0);
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
	modelMatrix.translate(5, 13, 0);
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
	modelMatrix.translate(5, 8, 0);
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
	modelMatrix.translate(2, -3.5, 0.0);
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

	defineLightParameters();

	// draw each object in the objects array
	for (let obj of Objects) {
		draw(obj, drawModeGlobal);
	}
	
	// handle animation mode
	if (document.getElementById("animation").value == "linear") {
		linearAnimation();
	} else if (document.getElementById("animation").value == "cubic") {
		cubicAnimation();
	} else {
		move(); // handle camera movement
	}
	
	requestAnimationFrame(drawAll); // redraw on a cycle
}

// draw an object using WebGL
function draw(obj, drawMode) {
	// define in cpuvertices/normals/indices differently
	// depending on smooth vs flat shading.
	if (drawMode == "Gouraud" || drawMode == "Phong" || drawMode == "WireFrame") {
		vertices = obj.verticesSmooth;
		normals = obj.normalsVertex;
		indices = obj.polygonsSmooth;
	} else {
		vertices = obj.verticesFlat;
		normals = obj.normalsFlat;
		indices = obj.polygonsFlat;
	}

	// set fragment shader color
	defineFragColor(obj.color);

	//Model Matrix (stored in object)
	gl.uniformMatrix4fv(u_ModelMatrix, false, obj.modelMatrix.elements);

	// Normal Matrix
	normalMatrix.setInverseOf(obj.modelMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

	// View Matrix
	viewMatrix.setLookAt(cam.eye.elements[0], cam.eye.elements[1], cam.eye.elements[2], 
		                 cam.center.elements[0], cam.center.elements[1], cam.center.elements[2], // center: [0, 0, 0]
						 0, 1, 0);// vector that defines "up": [0, 1, 0]
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	// Projection Matrix
	// which projection type?
	let zoom = document.getElementById("zoom").value;
	if (document.getElementById("proj").value == "Perspective"){
		projMatrix.setPerspective(zoom, canvas.width/canvas.height, 0.1, 1000); // magic numbers babey!!!!
	} else {
		projMatrix.setOrtho(-1/60 * zoom, 1/60 * zoom, -1/60 * zoom, 1/60 * zoom, 0.1, 1000); // more magic numbers
	}
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

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

// call drawUnitCylinder using the input from the user
function createCylinderFromInput() {
	// grab the inputs
	n = document.getElementById("n").value;
	let endcaps = document.getElementById("endcaps").checked;
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
	modelMatrix.setIdentity();
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
