import debugLogger from 'debug';
const debug = debugLogger('phaser-move-and-stop-plugin:moveAndStop');
const debugObjectToMove = (objectsToMove, objectToMove, label) => debug(`${objectsToMove.indexOf(objectToMove)}: ${label}`);

const STATE = {
	isMoving: 'isMoving',
	hasStopped: 'hasStopped'
};

function findObjectToMove(objectsToMove, displayObject) {
	if (displayObject) {
		return objectsToMove.find(objectToMove => objectToMove.displayObject === displayObject);
	}
	return undefined;
}

function addDisplayObjectToList(objectsToMove, displayObject, info = {}) {
	const objectToMove = {
		displayObject,
		info
	};
	objectsToMove.push(objectToMove);
	debugObjectToMove(objectsToMove, objectToMove, `addDisplayObjectToList x:${info.x} y:${info.y} speed:${info.speed} maxTime:${info.maxTime} events:${info.events ? Object.keys(info.events) : info.events}`);
}

function removeObjectToMove(objectsToMove, objectToMove) {
	debugObjectToMove(objectsToMove, objectToMove, "removeObjectToMove");
	if (objectToMove) {
		const index = objectsToMove.indexOf(objectToMove);
		if (index > -1) {
			objectsToMove.splice(index, 1);
		}
	}
}

function stopObjectMovement(objectToMove) {
	const { displayObject, info } = objectToMove;
	displayObject.body.velocity.x = 0;
	displayObject.body.velocity.y = 0;

	if (info.events) {
		if (info.events.onPositionReached) {
			info.events.onPositionReached(displayObject);
		}
		if (info.events.onStopped) {
			info.events.onStopped(displayObject);
		}
	}

	info.move = STATE.hasStopped;
}

function updateObjectMovement(game, objectToMove) {
	const { displayObject, info } = objectToMove;
	if (displayObject.alive && info.moveDistFromTarget && displayObject.body) {

		if (isMoving(objectToMove)) {
			const updatedDist = game.physics.arcade.distanceToXY(displayObject, info.x, info.y);
			if (updatedDist === 0 || updatedDist > info.moveDistFromTarget) {
				// if displayObject is still moving, we ask to pahser to stop it (stop velocity)
				stopObjectMovement(objectToMove);
				// update coordinates
				displayObject.x = info.x;
				displayObject.y = info.y;
			} else {
				//if not stopped, or no need to stop, we update last distance between current displayObject and targetted corrdinates
				info.moveDistFromTarget = updatedDist;
			}
		}
	}
}

function isMoving(objectToMove) {
	const { info } = objectToMove;
	return info.move === STATE.isMoving;
}

function hasStopped(objectToMove) {
	const { info } = objectToMove;
	return info.move === STATE.hasStopped;
}

export function postUpdate(objectsToMove, game) {
	const objectsNotAlive = [];
	objectsToMove.forEach(objectToMove => {
		const { displayObject, info } = objectToMove;
		if (!displayObject || !displayObject.alive || hasStopped(objectToMove)) {
			if (info && info.events) {
				if (info.events.onStopped) {
					info.events.onStopped(displayObject);
				}
			}
			objectsNotAlive.push(objectToMove);
		} else {
			updateObjectMovement(game, objectToMove);
			if (hasStopped(objectToMove)) {
				objectsNotAlive.push(objectToMove);
			}
		}
	});

	objectsNotAlive.forEach(objectToMove => {
		removeObjectToMove(objectsToMove, objectToMove);
	});
}

export function isItemMoving(displayObject) {
	if (!displayObject) {
		throw new Error("object is undefined");
	}
	return displayObject.body
		&& displayObject.body.velocity
		&& (displayObject.body.velocity.x || displayObject.body.velocity.y);
}

export function moveToXY(objectsToMove, game, displayObject, x, y, speed, maxTime, events) {
	if (displayObject && displayObject.alive && displayObject.body) {
		const objectToMove = findObjectToMove(objectsToMove, displayObject);

		if (!objectToMove || (
			objectToMove.info.x !== x ||
			objectToMove.info.y !== y ||
			objectToMove.info.speed !== speed ||
			objectToMove.info.maxTime !== maxTime ||
			objectToMove.info.events !== events
		)) {
			if (objectToMove) {
				removeObjectToMove(objectsToMove, objectToMove);
			}
			const moveDistFromTarget = game.physics.arcade.distanceToXY(displayObject, x, y);
			addDisplayObjectToList(objectsToMove, displayObject, {
				move: STATE.isMoving,
				x,
				y,
				speed,
				maxTime,
				events,
				moveDistFromTarget,
				moveDistFromTargetOrigin: moveDistFromTarget
			});
			game.physics.arcade.moveToXY(displayObject, x, y, speed, maxTime);
		}
	}
}

export function moveToObject(objectsToMove, game, displayObject, destination, speed, maxTime, events) {
	moveToXY(objectsToMove, game, displayObject, destination.x, destination.y, speed, maxTime, events);
}

export function stopToMove(objectsToMove, displayObject) {
	const objectToMove = findObjectToMove(objectsToMove, displayObject);
	if (objectToMove) {
		if (isMoving(objectToMove)) {
			stopObjectMovement(objectToMove);
		}
	}
}
