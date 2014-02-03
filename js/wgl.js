var gl;
	
function initGL(canvas) {
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    gl = null;
    for (var i = 0; i < names.length; ++i) {
        try {
            gl = canvas.getContext(names[i]);
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
        } catch(e) {}
        if (gl) {
            break;
        }
    }
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

	shaderProgram.pvMatrixUniform = gl.getUniformLocation(shaderProgram, "uPVMatrix");
	shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
	shaderProgram.uColor = gl.getUniformLocation(shaderProgram, "uColor");
}


var mMatrix = mat4.create();
var pvMatrix = mat4.create();


var squareVertexPositionBuffer;

function initBuffers() {
	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	vertices = [
		 1.0, 0.0,  1.0,
		-1.0, 0.0,  1.0,
		 1.0, 0.0, -1.0,
		-1.0, 0.0, -1.0
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

	
    mat4.ortho(cam.get().l, cam.get().r, cam.get().b, cam.get().t, 0.1, 100.0, pvMatrix);
	mat4.rotateX(pvMatrix, Math.PI/2.0);
	
	for (var i = 0; i < build.numberOfItems(); i++){
		mat4.identity(mMatrix);
		var item = build.getItem(i);
		var	dx = item.x + item.lx * 0.5,
			dz = item.z + item.lz * 0.5,
			sx = item.lx * 0.5,
			sz = item.lz * 0.5;
		
		if (item.type == 'door') {
			var uColor = [1.0, 0.5, 0.0, 1.0];
		} else {
			var uColor = [0.0+sx, 0.0+dx, 0.0+dz, 1.0];
		}
		
		mat4.translate(mMatrix, [dx, -0.1, dz]);
		mat4.scale(mMatrix, [sx, 1.0, sz]);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(shaderProgram.pvMatrixUniform, false, pvMatrix);
		gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
		gl.uniform4fv(shaderProgram.uColor, uColor);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
	}
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
		dz:0.0,
		left:-1.0,
		right:1.0,
		bottom:-1.0,
		top:1.0
	});
	
	wheelListener();
	drag();
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

	function drag() {
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
				move = false,
				item,
				prevXd,
				prevZd,
				prevXm,
				prevZm;
		    
			this.mousedown = function (ev) {
				
				if (fixWhich(ev)) {
					prevXd = fs(ev, 'x');
					prevZd = gl.viewportHeight - fs(ev, 'z');
					drag = true;
				} else {
					var x = fs(ev, 'x')*(cam.get().r-cam.get().l)/gl.viewportWidth + cam.get().l,
						z = (gl.viewportWidth-fs(ev, 'z'))*(cam.get().b-cam.get().t)/gl.viewportHeight - cam.get().b;
					
					item = findElement(x, z, build.getItem());
					if (item != false) {
						move = true;
						prevXm = x - item.x;
						prevZm = z - item.z;
					}
				}
			}
			this.mousemove = function (ev) {
				if (drag){
					var k = gl.viewportWidth / (cam.get().r - cam.get().l),
						nX = fs(ev, 'x'),
						nZ = gl.viewportHeight - fs(ev, 'z');
						
					cam.setDxDz((nX-prevXd)/k, (nZ-prevZd)/k);
					prevXd = nX;
					prevZd = nZ;
				} else if (move) {
					var x = fs(ev, 'x')*(cam.get().r-cam.get().l)/gl.viewportWidth + cam.get().l,
						z = (gl.viewportWidth-fs(ev, 'z'))*(cam.get().b-cam.get().t)/gl.viewportHeight - cam.get().b;
						
					item.x = x - prevXm,
					item.z = z - prevZm;
					build.updateItem(item);
				}
				drawScene(cam);
			}
			this.mouseup = function (ev) {
				if (drag) {
					drag = false;
				} else if (move) {
					move = false;
				}
			}
		}
			
		function fs(ev, p) {
		  var elem = document.getElementById('canvas');
		  return (p=='x') ? ev.pageX-elem.offsetLeft : ev.pageY-elem.offsetTop;
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
		
		/* Функция поиска элемента на холсте мышкой */
		var findElement = function(x, y, obj){
		  for (var i in obj){
			var e = obj[i];
			e.x1 = e.x + e.lx;
			e.z1 = e.z + e.lz;
			if ((x > e.x && x < e.x1) && (y > e.z && y < e.z1)) {
				return e;
			}
		  }
		  return false;
		}
	}
}