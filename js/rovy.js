var w = c.width = window.innerWidth,
		h = c.height = window.innerHeight,
		ctx = c.getContext( '2d' ),
		
		hw = w / 1.50, // half-width
		hh = h / 2,
		
		opts = {
			strings: [ 'HAPPY', 'BIRTHDAY','ROVY!' ],
			charSize: 100,
			charSpacing: 95,
			lineHeight: 90,
			
			cx: w / 1,
			cy: h / 1,
			
			fireworkPrevPoints: 10,
			fireworkBaseLineWidth: 5,
			fireworkAddedLineWidth: 8,
			fireworkSpawnTime: 200,
			fireworkBaseReachTime: 30,
			fireworkAddedReachTime: 30,
			fireworkCircleBaseSize: 20,
			fireworkCircleAddedSize: 10,
			fireworkCircleBaseTime: 30,
			fireworkCircleAddedTime: 30,
			fireworkCircleFadeBaseTime: 10,
			fireworkCircleFadeAddedTime: 5,
			fireworkBaseShards: 5,
			fireworkAddedShards: 5,
			fireworkShardPrevPoints: 3,
			fireworkShardBaseVel: 4,
			fireworkShardAddedVel: 2,
			fireworkShardBaseSize: 3,
			fireworkShardAddedSize: 3,
			gravity: .1,
			upFlow: -.1,
			letterContemplatingWaitTime: 360,
			balloonSpawnTime: 50,
			balloonBaseInflateTime: 30,
			balloonAddedInflateTime: 30,
			balloonBaseSize: 30,
			balloonAddedSize: 30,
			balloonBaseVel: .4,
			balloonAddedVel: .4,
			balloonBaseRadian: -( Math.PI / 2 - .5 ),
			balloonAddedRadian: -1,
		},
		calc = {
			totalWidth: opts.charSpacing * Math.max( opts.strings[0].length, opts.strings[1].length )
		},
		
		Tau = Math.PI * 2,
		TauQuarter = Tau / 4,
		
		letters = [];

ctx.font = opts.charSize + 'px Verdana';

function Letter( char, x, y ){
	this.char = char;
	this.x = x;
	this.y = y;
	
	this.dx = -ctx.measureText( char ).width / 2;
	this.dy = +opts.charSize / 2;
	
	this.fireworkDy = this.y - hh;
	
	var hue = x / calc.totalWidth * 360;
	
	this.color = 'hsl(hue,80%,50%)'.replace( 'hue', hue );
	this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace( 'hue', hue );
	this.lightColor = 'hsl(hue,80%,light%)'.replace( 'hue', hue );
	this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace( 'hue', hue );
	
	this.reset();
}
Letter.prototype.reset = function(){
	
	this.phase = 'firework';
	this.tick = 0;
	this.spawned = false;
	this.spawningTime = opts.fireworkSpawnTime * Math.random() |0;
	this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() |0;
	this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
	this.prevPoints = [ [ 0, hh, 0 ] ];
}
Letter.prototype.step = function(){
	
	if( this.phase === 'firework' ){
		
		if( !this.spawned ){
			
			++this.tick;
			if( this.tick >= this.spawningTime ){
				
				this.tick = 0;
				this.spawned = true;
			}
			
		} else {
			
			++this.tick;
			
			var linearProportion = this.tick / this.reachTime,
					armonicProportion = Math.sin( linearProportion * TauQuarter ),
					
					x = linearProportion * this.x,
					y = hh + armonicProportion * this.fireworkDy;
			
			if( this.prevPoints.length > opts.fireworkPrevPoints )
				this.prevPoints.shift();
			
			this.prevPoints.push( [ x, y, linearProportion * this.lineWidth ] );
			
			var lineWidthProportion = 1 / ( this.prevPoints.length - 1 );
			
			for( var i = 1; i < this.prevPoints.length; ++i ){
				
				var point = this.prevPoints[ i ],
						point2 = this.prevPoints[ i - 1 ];
					
				ctx.strokeStyle = this.alphaColor.replace( 'alp', i / this.prevPoints.length );
				ctx.lineWidth = point[ 2 ] * lineWidthProportion * i;
				ctx.beginPath();
				ctx.moveTo( point[ 0 ], point[ 1 ] );
				ctx.lineTo( point2[ 0 ], point2[ 1 ] );
				ctx.stroke();
			
			}
			
			if( this.tick >= this.reachTime ){
				
				this.phase = 'contemplate';
				
				this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
				this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() |0;
				this.circleCreating = true;
				this.circleFading = false;
				
				this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() |0;
				this.tick = 0;
				this.tick2 = 0;
				
				this.shards = [];
				
				var shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() |0,
						angle = Tau / shardCount,
						cos = Math.cos( angle ),
						sin = Math.sin( angle ),
						
						x = 1,
						y = 0;
				
				for( var i = 0; i < shardCount; ++i ){
					var x1 = x;
					x = x * cos - y * sin;
					y = y * cos + x1 * sin;
					
					this.shards.push( new Shard( this.x, this.y, x, y, this.alphaColor ) );
				}
			}
			
		}
	} else if( this.phase === 'contemplate' ){
		
		++this.tick;
		
		if( this.circleCreating ){
			
			++this.tick2;
			var proportion = this.tick2 / this.circleCompleteTime,
					armonic = -Math.cos( proportion * Math.PI ) / 2 + .5;
			
			ctx.beginPath();
			ctx.fillStyle = this.lightAlphaColor.replace( 'light', 50 + 50 * proportion ).replace( 'alp', proportion );
			ctx.beginPath();
			ctx.arc( this.x, this.y, armonic * this.circleFinalSize, 0, Tau );
			ctx.fill();
			
			if( this.tick2 > this.circleCompleteTime ){
				this.tick2 = 0;
				this.circleCreating = false;
				this.circleFading = true;
			}
		} else if( this.circleFading ){
		
			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
			
			++this.tick2;
			var proportion = this.tick2 / this.circleFadeTime,
					armonic = -Math.cos( proportion * Math.PI ) / 2 + .5;
			
			ctx.beginPath();
			ctx.fillStyle = this.lightAlphaColor.replace( 'light', 100 ).replace( 'alp', 1 - armonic );
			ctx.arc( this.x, this.y, this.circleFinalSize, 0, Tau );
			ctx.fill();
			
			if( this.tick2 >= this.circleFadeTime )
				this.circleFading = false;
			
		} else {
			
			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
		}
		
		for( var i = 0; i < this.shards.length; ++i ){
			
			this.shards[ i ].step();
			
			if( !this.shards[ i ].alive ){
				this.shards.splice( i, 1 );
				--i;
			}
		}
		
		if( this.tick > opts.letterContemplatingWaitTime ){
			
			this.phase = 'balloon';
			
			this.tick = 0;
			this.spawning = true;
			this.spawnTime = opts.balloonSpawnTime * Math.random() |0;
			this.inflating = false;
			this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() |0;
			this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() |0;
			
			var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
					vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
			
			this.vx = Math.cos( rad ) * vel;
			this.vy = Math.sin( rad ) * vel;
		}
	} else if( this.phase === 'balloon' ){
			
		ctx.strokeStyle = this.lightColor.replace( 'light', 80 );
		
		if( this.spawning ){
			
			++this.tick;
			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
			
			if( this.tick >= this.spawnTime ){
				this.tick = 0;
				this.spawning = false;
				this.inflating = true;	
			}
		} else if( this.inflating ){
			
			++this.tick;
			
			var proportion = this.tick / this.inflateTime,
			    x = this.cx = this.x,
					y = this.cy = this.y - this.size * proportion;
			
			ctx.fillStyle = this.alphaColor.replace( 'alp', proportion );
			ctx.beginPath();
			generateBalloonPath( x, y, this.size * proportion );
			ctx.fill();
			
			ctx.beginPath();
			ctx.moveTo( x, y );
			ctx.lineTo( x, this.y );
			ctx.stroke();
			
			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
			
			if( this.tick >= this.inflateTime ){
				this.tick = 0;
				this.inflating = false;
			}
			
		} else {
			
			this.cx += this.vx;
			this.cy += this.vy += opts.upFlow;
			
			ctx.fillStyle = this.color;
			ctx.beginPath();
			generateBalloonPath( this.cx, this.cy, this.size );
			ctx.fill();
			
			ctx.beginPath();
			ctx.moveTo( this.cx, this.cy );
			ctx.lineTo( this.cx, this.cy + this.size );
			ctx.stroke();
			
			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.fillText( this.char, this.cx + this.dx, this.cy + this.dy + this.size );
			
			if( this.cy + this.size < -hh || this.cx < -hw || this.cy > hw  )
				this.phase = 'done';
			
		}
	}
}
function Shard( x, y, vx, vy, color ){
	
	var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
	
	this.vx = vx * vel;
	this.vy = vy * vel;
	
	this.x = x;
	this.y = y;
	
	this.prevPoints = [ [ x, y ] ];
	this.color = color;
	
	this.alive = true;
	
	this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function(){
	
	this.x += this.vx;
	this.y += this.vy += opts.gravity;
	
	if( this.prevPoints.length > opts.fireworkShardPrevPoints )
		this.prevPoints.shift();
	
	this.prevPoints.push( [ this.x, this.y ] );
	
	var lineWidthProportion = this.size / this.prevPoints.length;
	
	for( var k = 0; k < this.prevPoints.length - 1; ++k ){
		
		var point = this.prevPoints[ k ],
				point2 = this.prevPoints[ k + 1 ];
		
		ctx.strokeStyle = this.color.replace( 'alp', k / this.prevPoints.length );
		ctx.lineWidth = k * lineWidthProportion;
		ctx.beginPath();
		ctx.moveTo( point[ 0 ], point[ 1 ] );
		ctx.lineTo( point2[ 0 ], point2[ 1 ] );
		ctx.stroke();
		
	}
	
	if( this.prevPoints[ 0 ][ 1 ] > hh )
		this.alive = false;
}
function generateBalloonPath( x, y, size ){
	
	ctx.moveTo( x, y );
	ctx.bezierCurveTo( x - size / 2, y - size / 2,
									 	 x - size / 4, y - size,
									   x,            y - size );
	ctx.bezierCurveTo( x + size / 4, y - size,
									   x + size / 2, y - size / 2,
									   x,            y );
}

function anim(){
	
	window.requestAnimationFrame( anim );
	
	ctx.fillStyle = 'rgb(68, 0, 128)';
	ctx.fillRect( 0, 0, w, h );
	
	ctx.translate( hw, hh );
	
	var done = true;
	for( var l = 0; l < letters.length; ++l ){
		
		letters[ l ].step();
		if( letters[ l ].phase !== 'done' )
			done = false;
	}
	
	ctx.translate( -hw, -hh );
	
	if( done )
		for( var l = 0; l < letters.length; ++l )
			letters[ l ].reset();
}

for( var i = 0; i < opts.strings.length; ++i ){
	for( var j = 0; j < opts.strings[ i ].length; ++j ){
		letters.push( new Letter( opts.strings[ i ][ j ], 
														j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[ i ].length * opts.charSize / 2,
														i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2 ) );
	}
}

anim();

window.addEventListener( 'resize', function(){
	
	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;
	
	hw = w / 2;
	hh = h / 2;
	
	ctx.font = opts.charSize + 'px Verdana';
})



/*carusel*/


 
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
    
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  More about this function - 
  https://codepen.io/rachsmith/post/animation-tip-lerp
*/
function lerp(_ref, _ref2) {
  var x = _ref.x;
  var y = _ref.y;
  var targetX = _ref2.x;
  var targetY = _ref2.y;

  var fraction = 0.2;

  x += (targetX - x) * fraction;
  y += (targetY - y) * fraction;

  return { x: x, y: y };
}

var Slider = function () {
  function Slider(el) {
	_classCallCheck(this, Slider);

	var imgClass = this.IMG_CLASS = 'slider__images-item';
	var textClass = this.TEXT_CLASS = 'slider__text-item';
	var activeImgClass = this.ACTIVE_IMG_CLASS = imgClass + '--active';
	var activeTextClass = this.ACTIVE_TEXT_CLASS = textClass + '--active';

	this.el = el;
	this.contentEl = document.getElementById('slider-content');
	this.onMouseMove = this.onMouseMove.bind(this);

	// taking advantage of the live nature of 'getElement...' methods
	this.activeImg = el.getElementsByClassName(activeImgClass);
	this.activeText = el.getElementsByClassName(activeTextClass);
	this.images = el.getElementsByTagName('img');

	document.getElementById('slider-dots').addEventListener('click', this.onDotClick.bind(this));

	document.getElementById('left').addEventListener('click', this.prev.bind(this));

	document.getElementById('right').addEventListener('click', this.next.bind(this));

	window.addEventListener('resize', this.onResize.bind(this));

	this.onResize();

	this.length = this.images.length;
	this.lastX = this.lastY = this.targetX = this.targetY = 0;
  }

  Slider.prototype.onResize = function onResize() {
	var htmlStyles = getComputedStyle(document.documentElement);
	var mobileBreakpoint = htmlStyles.getPropertyValue('--mobile-bkp');

	var isMobile = this.isMobile = matchMedia('only screen and (max-width: ' + mobileBreakpoint + ')').matches;

	this.halfWidth = innerWidth / 2;
	this.halfHeight = innerHeight / 2;
	this.zDistance = htmlStyles.getPropertyValue('--z-distance');

	if (!isMobile && !this.mouseWatched) {
	  this.mouseWatched = true;
	  this.el.addEventListener('mousemove', this.onMouseMove);
	  this.el.style.setProperty('--img-prev', 'url(' + this.images[+this.activeImg[0].dataset.id - 1].src + ')');
	  this.contentEl.style.setProperty('transform', 'translateZ(' + this.zDistance + ')');
	} else if (isMobile && this.mouseWatched) {
	  this.mouseWatched = false;
	  this.el.removeEventListener('mousemove', this.onMouseMove);
	  this.contentEl.style.setProperty('transform', 'none');
	}
  };

  Slider.prototype.getMouseCoefficients = function getMouseCoefficients() {
	var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	var pageX = _ref3.pageX;
	var pageY = _ref3.pageY;

	var halfWidth = this.halfWidth;
	var halfHeight = this.halfHeight;
	var xCoeff = ((pageX || this.targetX) - halfWidth) / halfWidth;
	var yCoeff = (halfHeight - (pageY || this.targetY)) / halfHeight;

	return { xCoeff: xCoeff, yCoeff: yCoeff };
  };

  Slider.prototype.onMouseMove = function onMouseMove(_ref4) {
	var pageX = _ref4.pageX;
	var pageY = _ref4.pageY;

	this.targetX = pageX;
	this.targetY = pageY;

	if (!this.animationRunning) {
	  this.animationRunning = true;
	  this.runAnimation();
	}
  };

  Slider.prototype.runAnimation = function runAnimation() {
	if (this.animationStopped) {
	  this.animationRunning = false;
	  return;
	}

	var maxX = 10;
	var maxY = 10;

	var newPos = lerp({
	  x: this.lastX,
	  y: this.lastY
	}, {
	  x: this.targetX,
	  y: this.targetY
	});

	var _getMouseCoefficients = this.getMouseCoefficients({
	  pageX: newPos.x,
	  pageY: newPos.y
	});

	var xCoeff = _getMouseCoefficients.xCoeff;
	var yCoeff = _getMouseCoefficients.yCoeff;

	this.lastX = newPos.x;
	this.lastY = newPos.y;

	this.positionImage({ xCoeff: xCoeff, yCoeff: yCoeff });

	this.contentEl.style.setProperty('transform', '\n      translateZ(' + this.zDistance + ')\n      rotateX(' + maxY * yCoeff + 'deg)\n      rotateY(' + maxX * xCoeff + 'deg)\n    ');

	if (this.reachedFinalPoint) {
	  this.animationRunning = false;
	} else {
	  requestAnimationFrame(this.runAnimation.bind(this));
	}
  };

  Slider.prototype.positionImage = function positionImage(_ref5) {
	var xCoeff = _ref5.xCoeff;
	var yCoeff = _ref5.yCoeff;

	var maxImgOffset = 1;
	var currentImage = this.activeImg[0].children[0];

	currentImage.style.setProperty('transform', '\n      translateX(' + maxImgOffset * -xCoeff + 'em)\n      translateY(' + maxImgOffset * yCoeff + 'em)\n    ');
  };

  Slider.prototype.onDotClick = function onDotClick(_ref6) {
	var target = _ref6.target;

	if (this.inTransit) return;

	var dot = target.closest('.slider__nav-dot');

	if (!dot) return;

	var nextId = dot.dataset.id;
	var currentId = this.activeImg[0].dataset.id;

	if (currentId == nextId) return;

	this.startTransition(nextId);
  };

  Slider.prototype.transitionItem = function transitionItem(nextId) {
	var _this = this;

	function onImageTransitionEnd(e) {
	  e.stopPropagation();

	  nextImg.classList.remove(transitClass);

	  self.inTransit = false;

	  this.className = imgClass;
	  this.removeEventListener('transitionend', onImageTransitionEnd);
	}

	var self = this;
	var el = this.el;
	var currentImg = this.activeImg[0];
	var currentId = currentImg.dataset.id;
	var imgClass = this.IMG_CLASS;
	var textClass = this.TEXT_CLASS;
	var activeImgClass = this.ACTIVE_IMG_CLASS;
	var activeTextClass = this.ACTIVE_TEXT_CLASS;
	var subActiveClass = imgClass + '--subactive';
	var transitClass = imgClass + '--transit';
	var nextImg = el.querySelector('.' + imgClass + '[data-id=\'' + nextId + '\']');
	var nextText = el.querySelector('.' + textClass + '[data-id=\'' + nextId + '\']');

	var outClass = '';
	var inClass = '';

	this.animationStopped = true;

	nextText.classList.add(activeTextClass);

	el.style.setProperty('--from-left', nextId);

	currentImg.classList.remove(activeImgClass);
	currentImg.classList.add(subActiveClass);

	if (currentId < nextId) {
	  outClass = imgClass + '--next';
	  inClass = imgClass + '--prev';
	} else {
	  outClass = imgClass + '--prev';
	  inClass = imgClass + '--next';
	}

	nextImg.classList.add(outClass);

	requestAnimationFrame(function () {
	  nextImg.classList.add(transitClass, activeImgClass);
	  nextImg.classList.remove(outClass);

	  _this.animationStopped = false;
	  _this.positionImage(_this.getMouseCoefficients());

	  currentImg.classList.add(transitClass, inClass);
	  currentImg.addEventListener('transitionend', onImageTransitionEnd);
	});

	if (!this.isMobile) this.switchBackgroundImage(nextId);
  };

  Slider.prototype.startTransition = function startTransition(nextId) {
	function onTextTransitionEnd(e) {
	  if (!e.pseudoElement) {
		e.stopPropagation();

		requestAnimationFrame(function () {
		  self.transitionItem(nextId);
		});

		this.removeEventListener('transitionend', onTextTransitionEnd);
	  }
	}

	if (this.inTransit) return;

	var activeText = this.activeText[0];
	var backwardsClass = this.TEXT_CLASS + '--backwards';
	var self = this;

	this.inTransit = true;

	activeText.classList.add(backwardsClass);
	activeText.classList.remove(this.ACTIVE_TEXT_CLASS);
	activeText.addEventListener('transitionend', onTextTransitionEnd);

	requestAnimationFrame(function () {
	  activeText.classList.remove(backwardsClass);
	});
  };

  Slider.prototype.next = function next() {
	if (this.inTransit) return;

	var nextId = +this.activeImg[0].dataset.id + 1;

	if (nextId > this.length) nextId = 1;

	this.startTransition(nextId);
  };

  Slider.prototype.prev = function prev() {
	if (this.inTransit) return;

	var nextId = +this.activeImg[0].dataset.id - 1;

	if (nextId < 1) nextId = this.length;

	this.startTransition(nextId);
  };

  Slider.prototype.switchBackgroundImage = function switchBackgroundImage(nextId) {
	function onBackgroundTransitionEnd(e) {
	  if (e.target === this) {
		this.style.setProperty('--img-prev', imageUrl);
		this.classList.remove(bgClass);
		this.removeEventListener('transitionend', onBackgroundTransitionEnd);
	  }
	}

	var bgClass = 'slider--bg-next';
	var el = this.el;
	var imageUrl = 'url(' + this.images[+nextId - 1].src + ')';

	el.style.setProperty('--img-next', imageUrl);
	el.addEventListener('transitionend', onBackgroundTransitionEnd);
	el.classList.add(bgClass);
  };

  _createClass(Slider, [{
	key: 'reachedFinalPoint',
	get: function get() {
	  var lastX = ~ ~this.lastX;
	  var lastY = ~ ~this.lastY;
	  var targetX = this.targetX;
	  var targetY = this.targetY;

	  return (lastX == targetX || lastX - 1 == targetX || lastX + 1 == targetX) && (lastY == targetY || lastY - 1 == targetY || lastY + 1 == targetY);
	}
  }]);

  return Slider;
}();

var sliderEl = document.getElementById('slider');
var slider = new Slider(sliderEl);

// ------------------ Demo stuff ------------------------ //

var timer = 0;

function autoSlide() {
  requestAnimationFrame(function () {
	slider.next();
  });

  timer = setTimeout(autoSlide, 1000);
}

function stopAutoSlide() {
  clearTimeout(timer);

  this.removeEventListener('touchstart', stopAutoSlide);
  this.removeEventListener('mousemove', stopAutoSlide);
}

sliderEl.addEventListener('mousemove', stopAutoSlide);
sliderEl.addEventListener('touchstart', stopAutoSlide);

timer = setTimeout(autoSlide, 2000);
//# sourceURL=pen.js

