# phaser-move-and-stop-plugin

phaser plugin to move an object and stop it at an exact position.

## Motivation

As I didn't find a way in the phaser core function to move an item to stop at a given position, I made this plugin. It just wrap the phaser core function `moveToXY` to have the displayed object stop when the x/y position is reached.

## Installation

```bash
$ npm install phaser-move-and-stop-plugin
```

## Usage

First add the plugin in your main `create()` function of your phaser state:

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

### toXY

*comming soon*

### toObject

*comming soon*

### stop

*comming soon*

### isItemMoving