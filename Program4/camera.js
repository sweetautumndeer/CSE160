// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 4
// Camera Movement
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class Camera {

    // camera speed (higher is slower)
    speed = 30;

    // for rendering
    eye;
    center;
    up;

    constructor() {
        this.eye = new Vector3([0.0, 0.0, 3.0]);
        this.center = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);
    }

    moveForward() {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.div(this.speed);

        this.eye.add(forward);
        this.center.add(forward);
    }

    moveBackward() {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.div(this.speed);

        this.eye.sub(forward);
        this.center.sub(forward);
    }

    moveSideways(dir) {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();

        let left = Vector3.cross(this.up, forward);
        left.normalize();
        left.div(this.speed);

        if (dir == "Left") {
            this.eye.add(left);
            this.center.add(left);
        } else if (dir == "Right") {
            this.eye.sub(left);
            this.center.sub(left);
        }

    }

    moveUp() {
        let up = new Vector3(this.up.elements);
        up.div(this.speed);

        this.eye.add(up);
        this.center.add(up);
    }

    moveDown() {
        let up = new Vector3(this.up.elements);
        up.div(this.speed);

        this.eye.sub(up);
        this.center.sub(up);
    }

    // should just be rotating center about the left vector(?)
    tilt(angle) {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();

        let left = Vector3.cross(this.up, forward);
        left.normalize();

        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, left.elements[0], left.elements[1], left.elements[2]);

        // Rotate forward vector around left vector
        let forward_prime = rotMatrix.multiplyVector3(forward);
        forward_prime.normalize();
        this.center.set(this.eye);
        this.center.add(forward_prime);
    }

    // rotate about up
    pan(angle) {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();

        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        // Rotate forward vector around up vector
        let forward_prime = rotMatrix.multiplyVector3(forward);
        forward_prime.normalize();
        this.center.set(this.eye);
        this.center.add(forward_prime);
    }
}