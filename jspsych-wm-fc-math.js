/**
 * jspsych-wm-fc
 * plugin for change detection with colors
  */

var wm_fc_css_added = false;

jsPsych.plugins['wm-fc-math'] = (function() {

  var plugin = {};
  jsPsych.pluginAPI.registerPreload('wm-fc-math', 'stimuli', 'image');
	jsPsych.pluginAPI.registerPreload('wm-fc-math', 'test_items', 'image');
	
	plugin.info = {
		name: 'wm-fc-math',
		description: 'plugin for change detection with arithmetic task',
		parameters: {
			stimuli: {
			  type: jsPsych.plugins.parameterType.STRING,
			  pretty_name: 'Stimuli',
			  default: undefined,
			  array: true,
			  description: 'Images to be displayed in the memory array'
			},
			test_items: {
			  type: jsPsych.plugins.parameterType.STRING,
			  pretty_name: 'Test Items',
			  default: undefined,
			  array: true,
			  description: 'Images to be displayed in the forced-choice test'
			},
			arithmetic_equation: {
			  type: jsPsych.plugins.parameterType.STRING,
			  pretty_name: 'Arithmetic Equation',
			  default: null,
			  description: 'The arithmetic equation shown as a distraction task'
			},
			num_placeholders: {
			  type: jsPsych.plugins.parameterType.INT,
			  pretty_name: 'Number of placeholders',
			  default: 4,
			  description: 'Number of locations for items in the memory array'
			},
			stim_width: {
			  type: jsPsych.plugins.parameterType.INT,
			  pretty_name: 'Stimulus Width',
			  default: 120,
			  description: 'Width of each stimulus in pixels.'
			},
			memory_display_duration: {
			  type: jsPsych.plugins.parameterType.INT,
			  pretty_name: 'Memory Display Duration',
			  default: 1000,
			  description: 'Duration (ms) to display the memory array before clearing.'
			},
			delay_time: {
			  type: jsPsych.plugins.parameterType.INT,
			  pretty_name: 'Delay Time',
			  default: 800,
			  description: 'Time delay (ms) before showing the test items after the arithmetic equation.'
			},
			test_location: {
			  type: jsPsych.plugins.parameterType.INT,
			  pretty_name: 'Test Location',
			  default: 0,
			  description: 'Location of forced-choice test items: 0 for center, 1 for bottom.'
			},
			circle_radius: {
			  type: jsPsych.plugins.parameterType.INT,
			  pretty_name: 'Circle Radius',
			  default: 240,
			  description: 'Radius in pixels for the circular arrangement of memory array items.'
			}
		  }
		};
	  
		plugin.trial = function(display_element, trial) {
		  const enlargedSizeFactor = 1.2;
		  trial.stim_width *= enlargedSizeFactor;
		 // trial.circle_radius *= enlargedSizeFactor;
	  
		  const centerStyle = 'display: flex; align-items: center; justify-content: center;';
		  display_element.style = centerStyle;
	  
		  // Define fixed positions in a cross shape
		  const placeholderPositions = [
			{ x: 0, y: -trial.circle_radius },
			{ x: trial.circle_radius, y: 0 },
			{ x: 0, y: trial.circle_radius },
			{ x: -trial.circle_radius, y: 0 }
		  ];
	  
		  // Randomly select a position as the target and map with indices
		  const target_position = Math.floor(Math.random() * placeholderPositions.length);
		  const itemPositions = placeholderPositions.slice(0, trial.stimuli.length);
	  
		  
		  // Track each image’s location, marking target
		  let memoryArrayData = itemPositions.map((pos, index) => ({
			pos,
			image: trial.stimuli[index],
			isTarget: index === target_position
		  }));
	  
		  function showFixationCross() {
			display_element.innerHTML = `<p id="fixation-cross" style="font-size: 24px; text-align: center; cursor: pointer;">+</p>`;
			document.getElementById('fixation-cross').addEventListener('click', startMemoryArray);
		  }
	  
		  function startMemoryArray() {
			display_element.innerHTML = '<div id="memory-array" style="position: relative; width: 100%; height: 100%;"></div>';
			const memoryArrayDiv = document.getElementById('memory-array');
	  
			memoryArrayData.forEach(({ pos, image }) => {
			  const placeholder = document.createElement('div');
			  placeholder.className = 'placeholder';
			  placeholder.style = `
				position: absolute;
				width: ${trial.stim_width + 10}px;
				height: ${trial.stim_width + 10}px;
				border: 2px solid #000;
				border-radius: 5px;
				left: calc(50% + ${pos.x}px - ${(trial.stim_width + 10) / 2}px);
				top: calc(50% + ${pos.y}px - ${(trial.stim_width + 10) / 2}px);
			  `;
			  memoryArrayDiv.appendChild(placeholder);
	  
			  const img = document.createElement('img');
			  img.src = image;
			  img.style = `
				width: ${trial.stim_width}px;
				height: auto;
				position: absolute;
				top: 5px;
				left: 5px;
			  `;
			  placeholder.appendChild(img);
			});
	  
			setTimeout(() => {
			  display_element.innerHTML = '';
			  showArithmeticTask();
			}, trial.memory_display_duration);
		  }
	  
		  function showArithmeticTask() {
			display_element.innerHTML = `<p style="font-size: 24px; text-align: center;">${trial.arithmetic_equation}</p>`;
			document.addEventListener('keydown', handleArithmeticResponse);
		  }
	  
		  function handleArithmeticResponse(event) {
			if (event.key === 'z' || event.key === 'c') {
			  document.removeEventListener('keydown', handleArithmeticResponse);
			  display_element.innerHTML = '';
			  setTimeout(showTestPhase, trial.delay_time);
			}
		  }
	  
		  function showTestPhase() {
			display_element.innerHTML = '<div id="fcReportDiv" style="' + centerStyle + '"></div>';
			const testDiv = document.getElementById('fcReportDiv');
		
			// Display the placeholders with a thick border around the target position
			memoryArrayData.forEach(({ pos, isTarget }) => {
				const testPlaceholder = document.createElement('div');
				testPlaceholder.className = 'test-placeholder';
				testPlaceholder.style = `
					position: absolute;
					width: ${trial.stim_width + 10}px;
					height: ${trial.stim_width + 10}px;
					border: ${isTarget ? '4px solid #FF0000' : '2px solid #000'};
					border-radius: 5px;
					left: calc(50% + ${pos.x}px - ${(trial.stim_width + 10) / 2}px);
					top: calc(50% + ${pos.y}px - ${(trial.stim_width + 10) / 2}px);
				`;
				testDiv.appendChild(testPlaceholder);
			});
		
			// Ensure the target image is in the test options and assign "isCorrect" to the target
			const targetImage = memoryArrayData[target_position].image;
			let testImages = [...trial.test_items];
		
			// Replace one of the test images with the target if it's not already included
			if (!testImages.includes(targetImage)) {
				testImages[0] = targetImage;  // Ensure the target is in the test images
			}
			
			// Shuffle to randomize order and display each image
			testImages = jsPsych.randomization.shuffle(testImages);
			testImages.forEach((testImage) => {
				const testImg = document.createElement('img');
				testImg.src = testImage;
				testImg.style = `cursor: pointer; width: ${trial.stim_width}px; height: auto; margin: 0 10px;`;
				
				// Set isCorrect for the target image
				const isCorrect = testImage === targetImage ? '1' : '0';
				testImg.setAttribute('isCorrect', isCorrect);
		
				// Add click event for response handling
				testImg.addEventListener('click', handleClickResponse);
				testDiv.appendChild(testImg);
			});
		}
	  
		  function handleClickResponse(event) {
			const correct = event.target.getAttribute('isCorrect') === '1';
			console.log(correct)
			const trial_data = {
			  correct: correct,
			  selected_image: event.target.src,
			  target_position: target_position,
			  memoryArrayData
			};
			display_element.innerHTML = '';
			jsPsych.finishTrial(trial_data);
		  }
	  
		  showFixationCross();
		};
	  
		return plugin;
	  })();
/* Confetti */
!function(t,e){!function t(e,n,a,o){var i=!!(e.Worker&&e.Blob&&e.Promise&&e.OffscreenCanvas&&e.HTMLCanvasElement&&e.HTMLCanvasElement.prototype.transferControlToOffscreen&&e.URL&&e.URL.createObjectURL);function r(){}function l(t){var a=n.exports.Promise,o=void 0!==a?a:e.Promise;return"function"==typeof o?new o(t):(t(r,r),null)}var c,s,u,h,d,f,g,m,b=(u=Math.floor(1e3/60),h={},d=0,"function"==typeof requestAnimationFrame&&"function"==typeof cancelAnimationFrame?(c=function(t){var e=Math.random();return h[e]=requestAnimationFrame((function n(a){d===a||d+u-1<a?(d=a,delete h[e],t()):h[e]=requestAnimationFrame(n)})),e},s=function(t){h[t]&&cancelAnimationFrame(h[t])}):(c=function(t){return setTimeout(t,u)},s=function(t){return clearTimeout(t)}),{frame:c,cancel:s}),v=(m={},function(){if(f)return f;if(!a&&i){var e=["var CONFETTI, SIZE = {}, module = {};","("+t.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join("\n");try{f=new Worker(URL.createObjectURL(new Blob([e])))}catch(t){return void 0!==typeof console&&"function"==typeof console.warn&&console.warn("🎊 Could not load worker",t),null}!function(t){function e(e,n){t.postMessage({options:e||{},callback:n})}t.init=function(e){var n=e.transferControlToOffscreen();t.postMessage({canvas:n},[n])},t.fire=function(n,a,o){if(g)return e(n,null),g;var i=Math.random().toString(36).slice(2);return g=l((function(a){function r(e){e.data.callback===i&&(delete m[i],t.removeEventListener("message",r),g=null,o(),a())}t.addEventListener("message",r),e(n,i),m[i]=r.bind(null,{data:{callback:i}})}))},t.reset=function(){for(var e in t.postMessage({reset:!0}),m)m[e](),delete m[e]}}(f)}return f}),y={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function p(t,e,n){return function(t,e){return e?e(t):t}(t&&null!=t[e]?t[e]:y[e],n)}function M(t){return t<0?0:Math.floor(t)}function w(t){return parseInt(t,16)}function x(t){t.width=document.documentElement.clientWidth,t.height=document.documentElement.clientHeight}function C(t){var e=t.getBoundingClientRect();t.width=e.width,t.height=e.height}function k(t,e,n,i,r){var c,s,u=e.slice(),h=t.getContext("2d"),d=l((function(e){function l(){c=s=null,h.clearRect(0,0,i.width,i.height),r(),e()}c=b.frame((function e(){!a||i.width===o.width&&i.height===o.height||(i.width=t.width=o.width,i.height=t.height=o.height),i.width||i.height||(n(t),i.width=t.width,i.height=t.height),h.clearRect(0,0,i.width,i.height),(u=u.filter((function(t){return function(t,e){e.x+=Math.cos(e.angle2D)*e.velocity,e.y+=Math.sin(e.angle2D)*e.velocity+e.gravity,e.wobble+=.1,e.velocity*=e.decay,e.tiltAngle+=.1,e.tiltSin=Math.sin(e.tiltAngle),e.tiltCos=Math.cos(e.tiltAngle),e.random=Math.random()+5,e.wobbleX=e.x+10*e.scalar*Math.cos(e.wobble),e.wobbleY=e.y+10*e.scalar*Math.sin(e.wobble);var n=e.tick++/e.totalTicks,a=e.x+e.random*e.tiltCos,o=e.y+e.random*e.tiltSin,i=e.wobbleX+e.random*e.tiltCos,r=e.wobbleY+e.random*e.tiltSin;return t.fillStyle="rgba("+e.color.r+", "+e.color.g+", "+e.color.b+", "+(1-n)+")",t.beginPath(),"circle"===e.shape?t.ellipse?t.ellipse(e.x,e.y,Math.abs(i-a)*e.ovalScalar,Math.abs(r-o)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):function(t,e,n,a,o,i,r,l,c){t.save(),t.translate(e,n),t.rotate(i),t.scale(a,o),t.arc(0,0,1,r,l,c),t.restore()}(t,e.x,e.y,Math.abs(i-a)*e.ovalScalar,Math.abs(r-o)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):(t.moveTo(Math.floor(e.x),Math.floor(e.y)),t.lineTo(Math.floor(e.wobbleX),Math.floor(o)),t.lineTo(Math.floor(i),Math.floor(r)),t.lineTo(Math.floor(a),Math.floor(e.wobbleY))),t.closePath(),t.fill(),e.tick<e.totalTicks}(h,t)}))).length?c=b.frame(e):l()})),s=l}));return{addFettis:function(t){return u=u.concat(t),d},canvas:t,promise:d,reset:function(){c&&b.cancel(c),s&&s()}}}function I(t,n){var a,o=!t,r=!!p(n||{},"resize"),c=p(n,"disableForReducedMotion",Boolean),s=i&&!!p(n||{},"useWorker")?v():null,u=o?x:C,h=!(!t||!s)&&!!t.__confetti_initialized,d="function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion)").matches;function f(e,n,o){for(var i,r,l,c,s,h,d,f=p(e,"particleCount",M),g=p(e,"angle",Number),m=p(e,"spread",Number),b=p(e,"startVelocity",Number),v=p(e,"decay",Number),y=p(e,"gravity",Number),x=p(e,"colors"),C=p(e,"ticks",Number),I=p(e,"shapes"),T=p(e,"scalar"),E=function(t){var e=p(t,"origin",Object);return e.x=p(e,"x",Number),e.y=p(e,"y",Number),e}(e),S=f,F=[],z=t.width*E.x,N=t.height*E.y;S--;)F.push((i={x:z,y:N,angle:g,spread:m,startVelocity:b,color:x[S%x.length],shape:I[(h=0,d=I.length,Math.floor(Math.random()*(d-h))+h)],ticks:C,decay:v,gravity:y,scalar:T},r=void 0,l=void 0,c=void 0,s=void 0,c=i.angle*(Math.PI/180),s=i.spread*(Math.PI/180),{x:i.x,y:i.y,wobble:10*Math.random(),velocity:.5*i.startVelocity+Math.random()*i.startVelocity,angle2D:-c+(.5*s-Math.random()*s),tiltAngle:Math.random()*Math.PI,color:(r=i.color,l=String(r).replace(/[^0-9a-f]/gi,""),l.length<6&&(l=l[0]+l[0]+l[1]+l[1]+l[2]+l[2]),{r:w(l.substring(0,2)),g:w(l.substring(2,4)),b:w(l.substring(4,6))}),shape:i.shape,tick:0,totalTicks:i.ticks,decay:i.decay,random:Math.random()+5,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:3*i.gravity,ovalScalar:.6,scalar:i.scalar}));return a?a.addFettis(F):(a=k(t,F,u,n,o)).promise}function g(n){var i=c||p(n,"disableForReducedMotion",Boolean),g=p(n,"zIndex",Number);if(i&&d)return l((function(t){t()}));o&&a?t=a.canvas:o&&!t&&(t=function(t){var e=document.createElement("canvas");return e.style.position="fixed",e.style.top="0px",e.style.left="0px",e.style.pointerEvents="none",e.style.zIndex=t,e}(g),document.body.appendChild(t)),r&&!h&&u(t);var m={width:t.width,height:t.height};function b(){if(s){var e={getBoundingClientRect:function(){if(!o)return t.getBoundingClientRect()}};return u(e),void s.postMessage({resize:{width:e.width,height:e.height}})}m.width=m.height=null}function v(){a=null,r&&e.removeEventListener("resize",b),o&&t&&(document.body.removeChild(t),t=null,h=!1)}return s&&!h&&s.init(t),h=!0,s&&(t.__confetti_initialized=!0),r&&e.addEventListener("resize",b,!1),s?s.fire(n,m,v):f(n,m,v)}return g.reset=function(){s&&s.reset(),a&&a.reset()},g}n.exports=I(null,{useWorker:!0,resize:!0}),n.exports.create=I}(function(){return void 0!==t?t:"undefined"!=typeof self?self:this}(),e,!1),t.confetti=e.exports}(window,{});
//# sourceMappingURL=/sm/5c4c384a877f185bbb4cd2f62e2dca662c08cd13717f7ae6834f44d38375bb05.map
