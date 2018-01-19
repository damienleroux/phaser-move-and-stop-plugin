# phaser-move-and-stop-plugin

phaser plugin to move an object and stop it at an exact position.

## Motivation

As I didn't find a way in the phaser core function to move an item to stop at a given position, I made this plugin. It just wrap the phaser core function `moveToXY` to have the displayed object stop when the x/y position is reached.

## Installation

```bash
$ npm install phaser-move-and-stop-plugin
```

## Usage

First add the plugin to `game` in your main `create()` function of your phaser state:

```javascript
import MoveAndStopPlugin from "phaser-move-and-stop-plugin";

export default game => ({
	create: () => {
		game.moveAndStop = game.plugins.add(MoveAndStopPlugin);
	},
	update: () => {
		//...
	}
});
```

Then call one the the following api:

## API

### `game.moveAndStop.toXY(displayObject, x, y, speed, maxTime, events)`

It it same as [phaserJS moveToXY](https://photonstorm.github.io/phaser-ce/Phaser.Physics.Arcade.html#moveToXY) except that the object will stop at the exact x/y position.

#### Arguments

* [`displayObject(state, [ownProps]): any`]:  	The display object to move.
* [`x: number`]: The x coordinate to reach.
* [`y: number`]: The y coordinate to reach.
* [`speed: number (optional)`]: The speed it will move, in pixels per second (default is 60 pixels/sec)
* [`maxTime: number (optional)`]: Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
* [`events: object (optional)`]: List of [events](https://github.com/damienleroux/phaser-move-and-stop-plugin#function-events) to trigger.

#### Example

```javascript
game.moveAndStop.toXY(item, x, y, 5000, null, {
  onStopped: () => {
    console.log('stopped before reaching position!');
  },
  onPositionReached: () => {
    console.log('position reached!');
  }
});
```

###  `game.moveAndStop.toObject(displayObject, destination, speed, maxTime, events)`

It it same as [phaserJS moveToObject](https://photonstorm.github.io/phaser-ce/Phaser.Physics.Arcade.html#moveToObject) except that the object will stop at the exact destination position.

#### Arguments

* [`displayObject(state, [ownProps]): any`]:  	The display object to move.
* [`destination: any`]: The display object to move towards. Can be any object but must have visible x/y properties.
* [`speed: number (optional)`]: The speed it will move, in pixels per second (default is 60 pixels/sec)
* [`maxTime: number (optional)`]: Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
* [`events: object (optional)`]: List of [events](https://github.com/damienleroux/phaser-move-and-stop-plugin#function-events) to trigger.

#### Example

```javascript
game.moveAndStop.toObject(item, dest, 5000, null, {
  onPositionReached: () => {
    console.log('position reached!');
  }
});
```

### `game.moveAndStop.stop(displayObject)`

Stop the object

### `game.moveAndStop.isItemMoving(displayObject)`

return `true` is the object is moving

## Function Events

### `onStopped(displayObject){}`

Function called when the object stopped. This function is call if the object stopped at the targetted position or stopped before reaching it.

### `onPositionReached(displayObject){}`

Function called when the object reach the targetted position


