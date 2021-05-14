// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Autumn Moulios ~ 4/25/2021 ~ CSE 160
// amoulios
// 
// Assignment 4
// Camera Movement
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class Camera {

    eye;
    center;

    constructor() {
        this.eye = new Vector3([0.0, 0.0, 3.0]);
        this.center = new Vector3([0, 0, 0]);
    }

    moveForward() {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.div(10);

        this.eye.add(forward);
        this.center.add(forward);
    }

    moveBackward() {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.div(10);

        this.eye.sub(forward);
        this.center.sub(forward);
    }

    moveSideways(dir) {
        return 0;
    }

    tilt(angle) {
        return 0;
    }

    pan(angle) {
        return 0;
    }
}