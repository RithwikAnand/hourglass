(function(un) {
	var Hourglass = function(options) {
		options = options || {};
		this.options = {
			size: options.size || 500,
			margin: {
				outer: {
					h: options.margin && options.margin.outer && options.margin.outer.h || 50,
					v: options.margin && options.margin.outer && options.margin.outer.v || 20
				},
				inner: {
					h: options.margin && options.margin.inner && options.margin.inner.h || 50,
					v: options.margin && options.margin.inner && options.margin.inner.v || 10
				}
			},
			height: {
				glass: options.height && options.height.glass || options.size && options.size * 0.6 || 500 * 0.6,
				sand: options.height && options.height.sand || options.size && options.size * 0.45 || 500 * 0.45
			},
			curve: {
				glass: {
					h: options.curve && options.curve.glass && options.curve.glass.h || 0.5,
					v: options.curve && options.curve.glass && options.curve.glass.v || 0.9
				},
				sand: {
					h: options.curve && options.curve.sand && options.curve.sand.h || 0.5,
					v: options.curve && options.curve.sand && options.curve.sand.v || 0.9
				}
			},
			showSandTrail: options.showSandTrail !== un ? options.showSandTrail : true
		};
		this.refs = {
			container: null,
			svg: null,
			path: {
				glass: {
					top: null,
					bottom: null
				},
				sand: {
					top: null,
					bottom: null
				},
				sandTrail: null
			}
		};
		this.id = {
			animationFrame: null
		};
		this.time = {
			duration: 60000,
			flipTimePercent: 2/60,
		};
		this._initialize();
	};

	Hourglass.prototype = {
		/*
			Initializes the svg with glass and sand.
		*/
		_initialize: function() {
			this.refs.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			this.refs.svg.setAttribute('width', this.options.size);
			this.refs.svg.setAttribute('height', this.options.size);
			// this.refs.svg.classList.add('hg-svg');
			this.refs.svg.className.baseVal = 'hg-svg';
			this._drawGlass();
			this._drawSand();
		},
		/*
			Draws the outline of glass on the svg.
		*/
		_drawGlass: function() {
			var glassPathTop = document.createElementNS("http://www.w3.org/2000/svg", "path"),
				glassPathBottom = document.createElementNS("http://www.w3.org/2000/svg", "path"),
				size = this.options.size,
				margin = this.options.margin.outer,
				height = this.options.height.glass,
				curve = this.options.curve.glass,
				dStringTop = [
					'M', margin.h, ',', margin.v,
					' q', ((size / 2) - margin.h) * curve.h, ',', (height - margin.v) * curve.v, ' ', (size / 2) - margin.h, ',', (height - margin.v),
					' q', ((size / 2) - margin.h) * (1 - curve.h), ',', -(height - margin.v) * (1 - curve.v), ' ', (size / 2) - margin.h, ',', -(height - margin.v),
					' z',
				].join(''),
				dStringBottom = [
					'M', margin.h, ',', (size - margin.v),
					' q', ((size / 2) - margin.h) * curve.h, ',', -(height - margin.v) * curve.v, ' ', (size / 2) - margin.h, ',', -(height - margin.v),
					' q', ((size / 2) - margin.h) * (1 - curve.h), ',', (height - margin.v) * (1 - curve.v), ' ', ((size / 2) - margin.h), ',', (height - margin.v),
					' z'
				].join('');
			/* Top */
			glassPathTop.setAttribute('d', dStringTop);
			// glassPathTop.classList.add('hg-path', 'hg-glass', 'hg-glass-top');
			glassPathTop.className.baseVal = 'hg-path hg-glass hg-glass-top';
			this.refs.path.glass.top = glassPathTop;
			this.refs.svg.appendChild(glassPathTop);
			/* Bottom */
			glassPathBottom.setAttribute('d', dStringBottom);
			// glassPathBottom.classList.add('hg-path', 'hg-glass', 'hg-glass-bottom');
			glassPathBottom.className.baseVal = 'hg-path hg-glass hg-glass-bottom';
			this.refs.path.glass.bottom = glassPathBottom;
			this.refs.svg.appendChild(glassPathBottom);
		},
		/*
			Draws dummy sand on the svg.
		*/
		_drawSand: function() {
			var sandPathTop = document.createElementNS("http://www.w3.org/2000/svg", "path"),
				sandPathBottom = document.createElementNS("http://www.w3.org/2000/svg", "path");
			/* Top */
			// sandPathTop.classList.add('hg-path', 'hg-sand', 'hg-sand-top');
			sandPathTop.className.baseVal = 'hg-path hg-sand hg-sand-top';
			this.refs.path.sand.top = sandPathTop;
			this.refs.svg.appendChild(sandPathTop);
			/* Bottom */
			// sandPathBottom.classList.add('hg-path', 'hg-sand', 'hg-sand-bottom');
			sandPathBottom.className.baseVal = 'hg-path hg-sand hg-sand-bottom';
			this.refs.path.sand.bottom = sandPathBottom;
			this.refs.svg.appendChild(sandPathBottom);
			/* Sand Trail */
			if(this.options.showSandTrail) {
				var sandTrailPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
				// sandTrailPath.classList.add('hg-path', 'hg-sand-trail');
				sandTrailPath.className.baseVal = 'hg-path hg-sand-trail';
				this.refs.path.sandTrail = sandTrailPath;
				this.refs.svg.appendChild(sandTrailPath);
			}
		},
		/*
			Places svg at the container specified.
		*/
		placeAt: function(id) {
			this.refs.container = document.getElementById(id);
			this.refs.container.appendChild(this.refs.svg);
		},
		/*
			Start/Resume the countdown animation with the duration specified.
		*/
		start: function(duration) {
			window.cancelAnimationFrame(this.id.animationFrame);
			this.time.duration  = duration || this.time.duration;
			this._tick();
		},
		/*
			Triggers animation frame to animate the sand.
		*/
		_tick: function() {
			this.id.animationFrame = window.requestAnimationFrame(function() {
				var currentTime = new Date(),
					currentSecond = currentTime.getSeconds(),
					currentMillisecond = currentTime.getMilliseconds(),
					millisecondsIncludingSecond = currentSecond * 1000 + currentMillisecond;
				this._animateSand(millisecondsIncludingSecond);
				this._tick();
			}.bind(this));
		},
		/*
			Core animation function which accepts time and draws the state of sand.
		*/
		_animateSand: function(t) {
			var Td = this.time.duration,
				Te = Td * (1 - this.time.flipTimePercent),
				totalMargin = {
					h: this.options.margin.outer.h + this.options.margin.inner.h,
					v: this.options.margin.outer.v + this.options.margin.inner.v
				},
				W = this.options.size - (2 * totalMargin.h),
				H = this.options.height.sand - totalMargin.v,
				G = this.options.size - (2 * this.options.height.sand),
				curve = this.options.curve.sand;
			// Animate Sand
			if((t % Td) < Te) {
				var ta = ((t % Td) % Te) / Te;
				// Errect hour glass
				this.refs.svg.style.cssText += 'transform: rotateZ(0deg);';
				// Animate upper part
				var xTop = (W / 2) * ta,
					yTop = H * ta,
					dStringTop = [
						'M', totalMargin.h, ',', totalMargin.v,
						' m', xTop, ',', yTop,
						' q', ((W/2) - xTop) * curve.h, ',', (H - yTop) * curve.v, ' ', ((W/2) - xTop), ',', (H - yTop),
						' q', (W/2 - xTop) * (1 - curve.h), ',', -(H - yTop) * (1 - curve.v), ' ', (W/2 - xTop), ',', -(H - yTop),
						' z'
					].join('');
					this.refs.path.sand.top.setAttribute('d', dStringTop);
				//Animate Lower part
				var xBottom = -(W/2) * ta * (ta - 2),
					yBottom = H * ta * ta,
					dStringBottom = [
						' M', totalMargin.h, ',', (totalMargin.v + 2 * H + G),
						' m', (W/2 - xBottom), ',', 0,
						' q', xBottom * curve.h, ',', -yBottom * curve.v, ' ', xBottom, ',', -yBottom,
						' q', xBottom * (1 - curve.h), ',', yBottom * (1 - curve.v), ' ', xBottom, ',', yBottom,
						' z'
					].join('');
					this.refs.path.sand.bottom.setAttribute('d', dStringBottom);
				//Animate Sand trail
				if(this.options.showSandTrail) {
					var dString = [
						'M', (W/2 + totalMargin.h), ',', (H + totalMargin.v),
						' l0,', (H + G)
					].join('');
					this.refs.path.sandTrail.setAttribute('d', dString);
					this.refs.path.sandTrail.style.cssText += 'display: block; stroke-dashoffset: -' + t + 'px';
				}
			}
			// Animate hour glas flip
			else {
				var degree = 180 * ((t % Td) - Te)/ (Td - Te);
				this.refs.svg.style.cssText += 'transform: rotateZ(-' + degree + 'deg);';
				if(this.options.showSandTrail) {
					this.refs.path.sandTrail.style.cssText += 'display: none';
				}
			}
		}
	};
	window.Hourglass = Hourglass;
}())