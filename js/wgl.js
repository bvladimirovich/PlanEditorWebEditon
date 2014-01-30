var gl;
	
function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {}
	
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "",
		k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var squareVertexPositionBuffer;

function initBuffers() {
	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	vertices = [
		 1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;
}

function drawScene(cam) {
	if (cam.constructor != Camera) {
		throw new Error('Входящий параметр не верного типа. Ожидался экземпляр класса Camera.');
	}
	
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.ortho(cam.get().l, cam.get().r, cam.get().b, cam.get().t, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -0.1]);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

/**
	initScene(elem) - Функция инициализации параметров сцены (рабочего пространства).
	Входной параметр elem - объект страницы над которым происходит изменение положения колёсика мыши.
	функция wheelListener() реализует приближение/отдаление сцены.
	функция dragRight() реализует перемещение сцены правой кнопкой мыши.
	Переменная cam - объект класса Camera. При создании объекта 
устанавливаются начальные параметры смещения и приближения сцены.
	Функция drawScene(cam) отрисовывает сцену. Входной параметр - объект класса Camera.
*/
var cam;

function initScene(elem) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	
	cam = new Camera({
		zoom:10.0,
		dx:0.0,
		dy:0.0,
		left:-1.0,
		right:1.0,
		bottom:-1.0,
		top:1.0
	});
	
	wheelListener();
	dragRight();
	drawScene(cam);
	
	function wheelListener(){
		if (elem.addEventListener) {
			if ('onwheel' in document) {
				elem.addEventListener("wheel", onWheel, false);
			} else if ('onmousewheel' in document) {
				elem.addEventListener("mousewheel", onWheel, false);
			} else {
				elem.addEventListener("MozMousePixelScroll", onWheel, false);
			}
		} else {
			elem.attachEvent("onmousewheel", onWheel);
		}

		function onWheel(e) {
			e = e || window.event;
			var delta = e.deltaY || e.detail || e.wheelDelta;
			cam.setZoom((delta > 0)?1.1:0.9);
			drawScene(cam);
			e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		}
	}

	function dragRight() {
		var selector = '#canvas';
		$(selector).on("mousedown", s);
		$(selector).on("mousemove", s);
		$(selector).on("mouseup", s);
		$(selector).on("contextmenu", function () {
			return false;
		});
		
		var tool = new Draggable();
		function s(e) {
			if (tool[e.type]) {
				tool[e.type](e);
			}
		}
		
		function Draggable() {
			var drag = false,
				prevX,
				prevY;
		    
			this.mousedown = function (ev) {
				if(!fixWhich(ev)) return;
				drag = true;
				prevX = f(ev, 'x');
				prevY = f(ev, 'y');
			}
			this.mousemove = function (ev) {
				if (!drag) return;
				var k = gl.viewportWidth / (cam.get().r - cam.get().l),
					nX = f(ev, 'x'),
					nY = f(ev, 'y'),
					dx = (nX-prevX)/k,
					dy = (nY-prevY)/k;

				prevY = nY;
				prevX = nX;

				cam.setDxDy(dx, dy);
				drawScene(cam);
			}
			this.mouseup = function (ev) {
				if (drag) drag = false;
			}
		}
			
		/* Функция вычисления координаты мыши на холсте */
		function f(ev, p) {
		  var elem = document.getElementById('canvas');
		  return (p=='x') ? ev.pageX-elem.offsetLeft : elem.height-(ev.pageY-elem.offsetTop);
		}
		/* Функция определения нажатой на мыши кнопки */
		function fixWhich(e) {
			if (!e.which && e.button) { // если which нет, но есть button...
				if (e.button & 1) { 
					e.which = 1;        // левая кнопка
				} else if (e.button & 4) {
					e.which = 2; 		// средняя кнопка
				} else if (e.button & 2) {
					e.which = 3; 		// правая кнопка
				}
			}
			if (e.which == 3) {
				return true;
			}
		}
	}
}