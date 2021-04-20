//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Autumn Moulios ~ 4/4/2021 ~ CSE 160
//
//Assignment 0
//Modified DrawRectangle.js
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function main() {
	// Retrieve the <canvas> element
	canvas = document.getElementById("example");
	if (!canvas) {
		console.log("Failed to retrieve the <canvas> element");
		return false;
	}

	// Get the rendering context for 2DCG
	ctx = canvas.getContext("2d");

	clear("black"); 

	// define a vector, v1, and draw it in red
	let v1 = new Vector3([2.25, 2.25, 0.0]);
	console.log(v1.elements[0]);
	drawVector(v1, "red");
}


// fill the canvas with a color
function clear(color) {
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}


// draw a defined vector with a specified color
function drawVector(v, color) {
	const scale = 20;
	ctx.strokeStyle = color;

	// find the center of the canvas
	let centerX = canvas.width/2;
	let centerY = canvas.height/2;

	ctx.beginPath();
	ctx.moveTo(centerX, centerY); // starting point
	ctx.lineTo(centerX + (v.elements[0] * scale), centerY - (v.elements[1] * scale)); // scale endpoint for ease of seeing
	ctx.stroke();
}


// draws a red and a blue vector using the coordinates specified by the user
function handleDrawEvent() {
	clear("black"); // clear canvas

	// grab v1's coordinates from the inputs
	let v1_x = document.getElementById("v1_x").value;
	let v1_y = document.getElementById("v1_y").value;
	v1 = new Vector3([v1_x, v1_y, 0]);

	drawVector(v1, "red");

	// repeat for v2
	let v2_x = document.getElementById("v2_x").value;
	let v2_y = document.getElementById("v2_y").value;
	v2 = new Vector3([v2_x, v2_y, 0]);

	drawVector(v2, "blue");
}


// Carries out a different operation on the drawn vectors
// depending on the option selected
function handleDrawOperationEvent() {
	// draw the two specified vectors
	handleDrawEvent();

	// grab the operation selection and scalar value
	let operation = document.getElementById("operation").value;
	let scalar = document.getElementById("scalar").value;
	//console.log(scalar);

	switch (operation) {
		case "Add":
			console.log("Add");

			v3 = v1.add(v2);
			drawVector(v3, "green");

			break;

		case "Subtract":
			console.log("Subtract");

			v3 = v1.sub(v2);
			drawVector(v3, "green");

			break;

		case "Multiply":
			console.log("Multiply");

			v3 = v1.mul(scalar);
			drawVector(v3, "green");
			v4 = v2.mul(scalar);
			drawVector(v4, "green");

			break;

		case "Divide":
			console.log("Divide");

			v3 = v1.div(scalar);
			drawVector(v3, "green");
			v4 = v2.div(scalar);
			drawVector(v4, "green");

			break;

		case "Magnitude":
			mag1 = v1.magnitude();
			console.log("Magnitude v1: " + mag1);
			mag2 = v2.magnitude();
			console.log("Magnitude v2: " + mag2);

			break;

		case "Normalize":
			console.log("Normalize");

			v3 = v1.normalize();
			drawVector(v3, "green");
			v4 = v2.normalize();
			drawVector(v4, "green");

			break;

		case "Angle":
			console.log("Angle between v1 and v2: " + angleBetween(v1, v2));

			break;

		case "Area":
			console.log("Area of the triangle formed by v1 and v2: " + areaTriangle(v1, v2));
			
			break;

	}

}


// returns the angle between the two specified Vector3s
function angleBetween(v1, v2) {
	let angle = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude())); // angle between in radians
	angle *= 180/Math.PI; // convert to degrees

	return angle;
}


// returns the area of the triangle formed by the two specified Vector3s
function areaTriangle(v1, v2) {
	let cross = Vector3.cross(v1, v2);
	let area = cross.magnitude() / 2;

	return area;
}