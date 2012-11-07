/*
	WARNING
	THIS SOFTWARE PURPOSE IS TO DEMO COCOS2D WITH CBOX(Chrome Box) 
	AT GOOGLE HACKFAIR KOREA '12.

	THIS SOURCE CODE BASED BREAKOUT NODE.JS VERSION EXAMPLE.[1] WE WERE PORTING 
	DEMO CODE BY USING COCOS2D STANDARD-ALONE VERSION AND HAD MODIFICATION 
	TO OUR DEMO. SO ALL RIGHT RESERVED @ryanwilliams, OWNER OF ORIGINAL 
	SOURCE AND DEMO SOURCE CODE.

	[1]: https://github.com/ryanwilliams/cocos2d-breakout
*/
	
(function(window, undefined) {
	var assets = window.Assets();

	// SPRITE APIs	
	function CreateSprite(x, y, w, h) {
		return new cc.Sprite({
			url: assets.sprite,
			rect: new cc.Rect(x, y, w, h)	
		});
	}

	//
	// BAT
	//
	function Bat () {
		Bat.superclass.constructor.call(this);
	  var sprite = CreateSprite(0, 0, 64, 16);
		sprite.anchorPoint = new cc.Point(0, 0);
		this.addChild({child: sprite});
		this.contentSize = sprite.contentSize;
	}

	Bat.inherit(cc.Node);

	//
	// BALL
	//
	function Ball () {
		Ball.superclass.constructor.call(this)

		var sprite = CreateSprite(64, 0, 16, 16);
		sprite.anchorPoint = new cc.Point(0, 0);
		this.addChild({child: sprite});
		this.contentSize = sprite.contentSize;

		this.velocity = new cc.Point(60, 120);
		this.scheduleUpdate();
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
      if (hitBlocks.length > 0) {vel[axis] *= -1;}

      this.velocity = vel

      // Remove the blocks we hit
      for (var i=0; i<hitBlocks.length; i++) {
				this.parent.trigger('hitblock', {x:hitBlocks[i].x, y:hitBlocks[i].y});
				mapLayer.removeTile(hitBlocks[i])
      }

      return (hitBlocks.length > 0)
    }
	});

	//
	// BREAKOUT
	//
	function Breakout (cb) {
	  // You must always call the super class version of init
	  Breakout.superclass.constructor.call(this)

	  // Put callback
	  this.callback = cb;

	  // Enabled keyboard control
	  this.isKeyboardEnabled = true;

	  // Get size of canvas
	  var s = cc.Director.sharedDirector.winSize;

	  // Add Map
		this.map = new cc.TMXTiledMap({url: assets.map});
		this.bat = new Bat();
		this.ball = new Ball();
		
	  // If games is running by standalone, We have to give a few minutes 
	  // for while to build the map. 
	  var self = this;
	  setTimeout(function() {
		  self.map.position = new cc.Point(0, s.height - self.map.contentSize.height);
		  self.setpos();

		  self.addChild(self.map);
		  self.addChild(self.bat);
		  self.addChild(self.ball);

		  delete self;
	  }, 100);
	}

	Breakout.inherit(cc.Layer, {
		offset:12,
		movebat: function(e) {
			var offset = e.which == 39 ? this.offset : -(this.offset)
				,	pos = util.copy(this.bat.position);
			pos.x += offset;
		  this.bat.position = pos;
		},
		keyRepeat: function(e) {
			this.movebat(e);
		},
		keyDown: function(e) {
		  this.movebat(e);
		},
		trigger: function(e, param) {
			this.callback(e, param);
		},
		setpos: function() {
			var s = cc.Director.sharedDirector.winSize;
			this.ball.position = new cc.Point(assets.pos.ball.x * 32, s.height - assets.pos.ball.y * 16);
			this.bat.position = new cc.Point(assets.pos.bat.x * 32, s.height - assets.pos.bat.y * 16);
		}
	});

	//
	// EXPORTS BREAKOUT
	//
	window.Breakout = function(opt) {
		this.opt = opt;
		this.breakout = undefined;

		this.start = function() {
			var director = cc.Director.sharedDirector;
			director.attachInView(opt.view)
			director.displayFPS = opt.fps;
			
			this.breakout = new Breakout(opt.callback)
			
			// Create a scene, Add our layer to the scene
			var scene = new cc.Scene();
			scene.addChild(this.breakout);

			// run with scene
			director.runWithScene(scene)
		}

		this.restart = function () {
			if (this.breakout) delete this.breakout;
 			this.breakout = new Breakout(opt.callback);

		  // Create a scene, Add our layer to the scene
		  var scene = new cc.Scene()
		  scene.addChild(this.breakout);

		  // replace scene
		  cc.Director.sharedDirector.replaceScene(scene)
		}

		this.setpos = function() {
			this.breakout.setpos();
		};

		this.stop = function() {
			cc.Director.sharedDirector.stopAnimation();
		};
	}

})(window)