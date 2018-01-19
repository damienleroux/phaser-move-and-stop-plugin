import {
	postUpdate,
	isItemMoving,
	moveToXY,
	moveToObject,
	stopToMove
} from './move-and-stop-core';

//Plugin Core definition

function MoveAndStop(game, parent) {
	Phaser.Plugin.call(this, game, parent);
	this.objectsToMove = [];
	this.active = true; //enable reUpdate and update methods called by the parent
}

MoveAndStop.prototype = Object.create(Phaser.Plugin.prototype);

MoveAndStop.prototype.postUpdate = function postUpdate_() {
	return postUpdate(this.objectsToMove, this.game);
};

//Plugin moving functions

MoveAndStop.prototype.toXY = function toXY(displayObject, x, y, speed, maxTime, events) {
	return moveToXY(this.objectsToMove, this.game, displayObject, x, y, speed, maxTime, events);
};

MoveAndStop.prototype.toObject = function toObject(displayObject, destination, speed, maxTime, events) {
	return moveToObject(this.objectsToMove, this.game, displayObject, destination, speed, maxTime, events);
};

MoveAndStop.prototype.stop = function stop(displayObject) {
	return stopToMove(this.objectsToMove, displayObject);
};

// Utils

MoveAndStop.prototype.isItemMoving = (displayObject) => {
	return isItemMoving(displayObject);
};

export default MoveAndStop;
