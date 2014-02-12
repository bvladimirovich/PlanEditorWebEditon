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
var borderVertexPositionBuffer;

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

function initBuffersBorder() {
	borderVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, borderVertexPositionBuffer);
	vertices = [
		 1.0, 0.0,  1.0,
		-1.0, 0.0,  1.0,
		-1.0, 0.0, -1.0,
		 1.0, 0.0, -1.0,
		 1.0, 0.0,  1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	borderVertexPositionBuffer.itemSize = 3;
	borderVertexPositionBuffer.numItems = 5;
}

function drawScene(cam, sel) {
	if (cam.constructor != Camera) {
		throw new Error('Входящий параметр не верного типа. Ожидался экземпляр класса Camera.');
	}
	
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    mat4.ortho(cam.get().l, cam.get().r, cam.get().b, cam.get().t, 0.1, 100.0, pvMatrix);
	mat4.rotateX(pvMatrix, Math.PI/2.0);
	
	for (var i = 0; i < build.numberOfItems(); i++){
		var item = build.getItem(i);
		var	dx = item.x + item.lx * 0.5,
			dz = item.z + item.lz * 0.5,
			sx = item.lx * 0.5,
			sz = item.lz * 0.5;
		
		if (item.type == 'door') {
			var uColor = [1.0, 0.5, 0.0, 1.0];
		} else {
			var uColor = [1.0, 1.0, 0.7, 1.0];
		}
		
		mat4.identity(mMatrix);
		mat4.translate(mMatrix, [dx, -0.2, dz]);
		mat4.scale(mMatrix, [sx, 1.0, sz]);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(shaderProgram.pvMatrixUniform, false, pvMatrix);
		gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
		gl.uniform4fv(shaderProgram.uColor, uColor);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
		
		if (sel.get().length != 0) {
			for (var k in sel.get().list) {
				if (sel.get().list[k].id !== undefined && sel.get(k) == item.id) {
					mat4.identity(mMatrix);
					mat4.translate(mMatrix, [dx, -0.1, dz]);
					mat4.scale(mMatrix, [sx, 1.0, sz]);
					
					gl.bindBuffer(gl.ARRAY_BUFFER, borderVertexPositionBuffer);
					gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, borderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
					gl.uniformMatrix4fv(shaderProgram.pvMatrixUniform, false, pvMatrix);
					gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
					gl.uniform4fv(shaderProgram.uColor, sel.getColor());
					gl.drawArrays(gl.LINE_STRIP, 0, borderVertexPositionBuffer.numItems);
				}
			}
		}
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
var sel;
var build;
function initScene(elem) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	
	sel = new Select();
	sel.setColor();
	cam = new Camera({
		zoom: 10.0,
		dx: 0.0,
		dz: 0.0,
		left: -1.0,
		right: 1.0,
		bottom: -1.0,
		top: 1.0
	});
	
	build = new Building();
	build.addRoom(0.0,0.0,0.0, 2.0,0.1,2.0);
	build.addRoom(5.0,0.0,0.0, 2.0,0.1,2.0);
	build.addRoom(0.0,0.0,5.0, 2.0,0.1,2.0);
	build.addRoom(5.0,0.0,5.0, 2.0,0.1,2.0);
	
	wheelListener(elem);
	mouseListener(elem);
	drawScene(cam, sel);
	
	function wheelListener (elem){
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
			cam.setZoom((delta > 0) ? 1.1 : 0.9);
			drawScene(cam, sel);
			e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		}
	}
		
	function mouseListener(elem) {
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
		
		var key = new Keyboard();
		var oldItem = new OldItem();
		var graph = new Graph();
		var NOMIVE = [];
		
		function Draggable() {
			var drag = false,
				move = false,
				resize = undefined,
				item,
				prevXd,
				prevZd,
				prevXm,
				prevZm;
			
			var SHIFT = 16,
				CTRL = 17;
				
			this.mousedown = function (ev) {
				if (fixWhich(ev)) {
					prevXd = fs(ev, 'x');
					prevZd = gl.viewportHeight - fs(ev, 'z');
					drag = true;
				} else {
					var x = fs(ev, 'x')*(cam.get().r-cam.get().l)/gl.viewportWidth + cam.get().l,
						z = (gl.viewportWidth-fs(ev, 'z'))*(cam.get().b-cam.get().t)/gl.viewportHeight - cam.get().b;
					
					if (key.getKeyCode() == CTRL) {
						move = false;
						var lx = 2.0,
							ly = 0.1,
							lz = 2.0;
						build.addRoom(x-lx/2.0,0.0,z-lz/2.0, lx, ly, lz);
					}

					item = findElement(x, z, build.getItem());
					if (item != false) {
						isMoveItem();
						isResizeItem();
						oldItem.setOldItem(item);
						
						if (key.getKeyCode() == SHIFT) {
							sel.set(item.id);
							var door = build.addDoor(build.getItem(sel.get(0)), item);
							if (!door) return;
							sel.set(door.id);
							graph.add(door.id, sel.get(0), item.id);
						} else {
							if (sel.get().length > 0) {
								sel.reset();
							}
							sel.set(item.id);
							
							if (graph.getGraph(item.id).length > 1 || item.type === 'door') {
								for (var j in graph.getNode(item.id)) {
									if (graph.getGraph(graph.getNode(item.id)[j]).length > 1) {
										for (var i in graph.getGraph(graph.getNode(item.id)[j])) {
											sel.set(graph.getGraph(graph.getNode(item.id)[j])[i]);
											sel.set(graph.getEdge(graph.getGraph(graph.getNode(item.id)[j])[i]));
										}
									}
								}
								for (var i in graph.getGraph(item.id)) {
									sel.set(graph.getGraph(item.id)[i]);
									sel.set(graph.getEdge(graph.getGraph(item.id)[i]));
								}
								move = false;
							}
						}
					} else {
						sel.reset();
					}
					
					drawScene(cam, sel);
					
					function isMoveItem () {
						move = true;
						prevXm = x - item.x; // координаты мышки на элементе
						prevZm = z - item.z;
					}
					
					function isResizeItem () {
						var r = findBorder(x, z, build.getItem(item.id), cam.getZoom());
						if (r != undefined) {
							resize = r;
							move = false;
						}
					}
				}
			}
			this.mousemove = function (ev) {
				var x = fs(ev, 'x')*(cam.get().r-cam.get().l)/gl.viewportWidth + cam.get().l,
					z = (gl.viewportWidth-fs(ev, 'z'))*(cam.get().b-cam.get().t)/gl.viewportHeight - cam.get().b;
					
				if (drag){
					var k = gl.viewportWidth / (cam.get().r - cam.get().l),
						nX = fs(ev, 'x'),
						nZ = gl.viewportHeight - fs(ev, 'z');
						
					cam.setDxDz((nX-prevXd)/k, (nZ-prevZd)/k);
					prevXd = nX;
					prevZd = nZ;
					drawScene(cam, sel);
				} else if (move) {
					item.x = x - prevXm,
					item.z = z - prevZm;
					sel.setColor(build.updateItem(item) ? 'error' : 'default');
					drawScene(cam, sel);
				} else if (resize != undefined) {
					var minSize = {
						lx: 0.6,
						lz: 0.6
					}, dlx, dlz;
					switch (resize) {
						case 'left': // изменяем размер влево
							dlx = item.lx + (item.x - x);
							if (dlx > minSize.lx) {
								item.lx = dlx;
								item.x = x;
							}
							break;
						case 'right': // изменяем размер вправо
							dlx = item.lx + (x - item.x1);
							if (dlx > minSize.lx) {
								item.lx = dlx;
								item.x1 = x;
							}
							break;
						case 'top': // изменяем размер вверх
							dlz = item.lz + (item.z - z);
							if (dlz > minSize.lz) {
								item.lz = dlz;
								item.z = z;
							}
							break;
						case 'bottom': // изменяем размер вниз
							dlz = item.lz + (z - item.z1);
							if (dlz > minSize.lz) {
								item.lz = dlz;
								item.z1 = z;
							}
							break;
						case 'topLeft':
							dlx = item.lx + (item.x - x);
							dlz = item.lz + (item.z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								item.lx = dlx;
								item.lz = dlz;
								item.x = x;
								item.z = z;
							}
							break;
						case 'bottomLeft':
							dlx = item.lx + (item.x - x);
							dlz = item.lz + (z - item.z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								item.lx = dlx;
								item.lz = dlz;
								item.x = x;
								item.z1 = z;
							}
							break;
						case 'topRight':
							dlx = item.lx + (x - item.x1);
							dlz = item.lz + (item.z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								item.lx = dlx;
								item.lz = dlz;
								item.x1 = x;
								item.z = z;
							}
							break;
						case 'bottomRight':
							dlx = item.lx + (x - item.x1);
							dlz = item.lz + (z - item.z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								item.lx = dlx;
								item.lz = dlz;
								item.x1 = x;
								item.z1 = z;
							}
							break;
					}
					sel.setColor(build.updateItem(item) ? 'error' : 'default');
					drawScene(cam, sel);
				} else {
					if (sel.get().length > 0) {
						findBorder(x, z, build.getItem(sel.get(sel.get().length-1)), cam.getZoom());
					}
				}
			}
			this.mouseup = function (ev) {
				if (drag) {
					drag = false;
				} else if (move) {
					move = false;
					if (build.updateItem(item)) {
						build.updateItem(oldItem.getOldItem());
						sel.setColor('default');
						drawScene(cam, sel);
					}
				} else if (resize != undefined) {
					resize = undefined;
					if (build.updateItem(item)) {
						build.updateItem(oldItem.getOldItem());
						sel.setColor('default');
						drawScene(cam, sel);
					}
				}
			}
		}
		
		/* Функция определения координат мыши на холсте */
		function fs(ev, p) {
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
		function findElement(x, y, obj){
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
		
		function findBorder(x, y, e, zoom) {
			if (e === undefined) return;
			var dx = (zoom <= 1.2) ? 0.04 : 0.18;
				
			e.x1 = e.x + e.lx;
			e.z1 = e.z + e.lz;
			if ((x < e.x+dx && x > e.x) && (y > e.z+dx && y < e.z1-dx)) {
				elem.style.cursor = 'w-resize';
				return 'left';
			} else if ((x > e.x1-dx && x < e.x1) && (y > e.z+dx && y < e.z1-dx)) {
				elem.style.cursor = 'w-resize';
				return 'right';
			} else if ((x > e.x+dx && x < e.x1-dx) && (y < e.z+dx && y > e.z)) {
				elem.style.cursor = 's-resize';
				return 'top';
			} else if ((x > e.x+dx && x < e.x1-dx) && (y > e.z1-dx && y < e.z1)) {
				elem.style.cursor = 's-resize';
				return 'bottom';
			} else if ((x < e.x+dx && x > e.x) && (y < e.z+dx && y > e.z)){
				elem.style.cursor = 'se-resize';
				return 'topLeft';
			} else if ((x < e.x+dx && x > e.x) && (y > e.z1-dx && y < e.z1)){
				elem.style.cursor = 'sw-resize';
				return 'bottomLeft';
			} else if ((y < e.z+dx && y > e.z) && (x > e.x1-dx && x < e.x1)){
				elem.style.cursor = 'sw-resize';
				return 'topRight';
			} else if ((y > e.z1-dx && y < e.z1) && (x > e.x1-dx && x < e.x1)){
				elem.style.cursor = 'se-resize';
				return 'bottomRight';
			} else {
				elem.style.cursor = 'default';
				return undefined;
			}
		}
	}
}