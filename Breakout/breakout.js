/*
	breakout with cocos2d standalone version.
	it's based breakoout node.js version.
	original source at https://github.com/ryanwilliams/cocos2d-breakout
 */
 
(function() {
	
	function CreateSprite(x, y, w, h) {
		return new cc.Sprite({
			url: 'assets/sprites.png',
			rect: new cc.Rect(x, y, w, h)	
		});
	}

	// Bat object
	function Bat () {
		Bat.superclass.constructor.call(this);
	  var sprite = CreateSprite(0, 0, 64, 16);
		sprite.anchorPoint = new cc.Point(0, 0);
		this.addChild({child: sprite});
		this.contentSize = sprite.contentSize;
	}

	Bat.inherit(cc.Node);

	// Ball object

	function Ball () {
		Ball.superclass.constructor.call(this)

		var sprite = CreateSprite(64, 0, 16, 16);
		sprite.anchorPoint = new cc.Point(0, 0);
		this.addChild({child: sprite});
		this.contentSize = sprite.contentSize;

		this.velocity = new cc.Point(60, 120);
		this.scheduleUpdate();

		// callback for events
		this.callback
	}

	Ball.inherit(cc.Node, {
    velocity: null,
    accelerate:1.5,
    update: function (dt) {
	    var pos = util.copy(this.position),
	        vel = util.copy(this.velocity),
	        acc = util.copy(this.accelerate);

	    // Test X position
	    if (!this.testBlockCollision('x', dt * vel.x)) {
	        // Adjust X position
	        pos.x += dt * (vel.x * acc);
	        this.position = pos
	    }


	    // Test Y position
	    if (!this.testBlockCollision('y', -dt * vel.y)) {
	        // Adjust Y position
	        pos.y -= dt * (vel.y * acc);
	        this.position = pos
	    }

	    // Test Edges and bat
	    this.testBatCollision()
	    this.testEdgeCollision()
		},
    testBatCollision: function () {
      var vel = util.copy(this.velocity),
          ballBox = this.boundingBox,
          // The parent of the ball is the Breakout Layer, which has a 'bat'
          // property pointing to the player's bat.
          batBox = this.parent.bat.boundingBox

      // If moving down then check for collision with the bat
      if (vel.y > 0) {
          if (cc.rectOverlapsRect(ballBox, batBox)) {
              // Flip Y velocity
              vel.y *= -1
          }
      }

      // Update position and velocity on the ball
      this.velocity = vel
    },

    testEdgeCollision: function () {
		  var vel = util.copy(this.velocity),
		      ballBox = this.boundingBox,
		      // Get size of canvas
		      winSize = cc.Director.sharedDirector.winSize

		  // Moving left and hit left edge
		  if (vel.x < 0 && cc.rectGetMinX(ballBox) < 0) {
		      // Flip Y velocity
		      vel.x *= -1
		  }

		  // Moving right and hit right edge
		  if (vel.x > 0 && cc.rectGetMaxX(ballBox) > winSize.width) {
		      // Flip X velocity
		      vel.x *= -1
		  }

		  // Moving up and hit top edge
		  if (vel.y < 0 && cc.rectGetMaxY(ballBox) > winSize.height) {
		      // Flip X velocity
		      vel.y *= -1
		  }

		  // Moving down and hit bottom edge - DEATH
		  if (vel.y > 0 && cc.rectGetMaxY(ballBox) < 0) {
		      // Restart game
		      // this.parent.restart()
		      this.parent.trigger('outof');
		  }

		  this.velocity = vel
    },
    testBlockCollision: function (axis, dist) {
      var vel = util.copy(this.velocity),
          box = this.boundingBox,
          // A map is made of mulitple layers, but we only have 1.
          mapLayer = this.parent.map.children[0]

      // Get size of canvas
      var s = cc.Director.sharedDirector.winSize

      // Add the amount we're going to move onto the box
      box.origin[axis] += dist

      // Record which blocks were hit
      var hitBlocks = []

      // We will test each corner of the ball for a hit
      var testPoints = {
          nw: util.copy(box.origin),
          sw: new cc.Point(box.origin.x, box.origin.y + box.size.height),
          ne: new cc.Point(box.origin.x + box.size.width, box.origin.y),
          se: new cc.Point(box.origin.x + box.size.width, box.origin.y + box.size.height)
      }

      for (var corner in testPoints) {
          var point = testPoints[corner]

          // All our blocks are 32x16 pixels
          var tileX = Math.floor(point.x / 32),
              tileY = Math.floor((s.height - point.y) / 16),
              tilePos = new cc.Point(tileX, tileY)

          // Tile ID 0 is an empty tile, everything else is a hit
          if (mapLayer.tileGID(tilePos) > 0)
            hitBlocks.push(tilePos);
      }

      // If we hit something, swap directions
      if (hitBlocks.length > 0) {
      	console.log(hitBlocks.length);
          vel[axis] *= -1
      }

      this.velocity = vel

      // Remove the blocks we hit
      for (var i=0; i<hitBlocks.length; i++) {
				this.parent.trigger('hitblock', {x:hitBlocks[i].x, y:hitBlocks[i].y});
				mapLayer.removeTile(hitBlocks[i])
      }

      return (hitBlocks.length > 0)
    }
	});

	function Breakout (cb) {

		this.callback = cb;

	  // You must always call the super class version of init
	  Breakout.superclass.constructor.call(this)

	  var director = cc.Director.sharedDirector
	  

	  this.isKeyboardEnabled = true;

	  // Get size of canvas
	  var s = cc.Director.sharedDirector.winSize

		// Add Map
	  var map = new cc.TMXTiledMap({url: 'assets/google.tmx'})

	  var self = this;
	  setTimeout(function() {
		  map.position = new cc.Point(0, s.height - map.contentSize.height)
		  self.addChild(map)
		  self.map = map

		  // Add Bat
		  var bat = new Bat()
		  // bat.position = new cc.Point(160, s.height - 280)
		  bat.position = new cc.Point(160, s.height - 320)
		  self.addChild(bat)
		  self.bat = bat

		  // Add Ball
		  var ball = new Ball()
		  ball.position = new cc.Point(140, s.height - 240)
		  // ball.position = new cc.Point(140, s.height - 210)
		  self.addChild(ball)
		  self.ball = ball;
	  }, 100);
	}

	Breakout.inherit(cc.Layer, {
		bat: null,
		ball: null,
		offset:5,
		keyRepeat: function(evt) {
			var bat = this.bat
				,	offset = this.offset
				, batPos = bat.position
		  
		  if (evt.which == 39)
		  	batPos.x += offset;
		  else
		  	batPos.x -= offset;
		  bat.position = batPos
		},

		keyDown: function(evt) {
			var bat = this.bat,
			offset = this.offset

		  var batPos = bat.position
		  if (evt.which == 39)
		  	batPos.x += offset;
		  else
		  	batPos.x -= offset;
		  bat.position = batPos
		},

		mouseMoved: function (evt) {
		  var bat = this.bat

		  var batPos = bat.position
		  batPos.x = evt.locationInCanvas.x
		  bat.position = batPos
		},
		trigger: function(e, param) {
			this.callback(e, param);
		}
	});
	
	window.Breakout = function(opt) {
		this.opt = opt;

		this.start = function() {
			var director = cc.Director.sharedDirector;
			director.attachInView(opt.view)
			director.displayFPS = opt.fps;
			
			// Create a scene and layer
			var scene = new cc.Scene()
			, layer = new Breakout(opt.callback)

			// Add our layer to the scene
			scene.addChild(layer)

			director.runWithScene(scene)
		}

		this.restart = function () {
		  var director = cc.Director.sharedDirector

		  // Create a scene
		  var scene = new cc.Scene()

		  // Add our layer to the scene
		  scene.addChild(new Breakout(opt.callback))

		  director.replaceScene(scene)
		}
	}

})()