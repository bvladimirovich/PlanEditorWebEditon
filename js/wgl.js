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

function drawScene(cam, selectedItems, highlightColor) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    mat4.ortho(cam.get().l, cam.get().r, cam.get().b, cam.get().t, 0.1, 100.0, pvMatrix);
	mat4.rotateX(pvMatrix, Math.PI/2.0);
	
	for (var i in build.getItem()){
		var item = build.getItem(i);
		if (item === undefined) continue;
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
		
		if (selectedItems.has(item.id)) {
			mat4.identity(mMatrix);
			mat4.translate(mMatrix, [dx, -0.1, dz]);
			mat4.scale(mMatrix, [sx, 1.0, sz]);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, borderVertexPositionBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, borderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.uniformMatrix4fv(shaderProgram.pvMatrixUniform, false, pvMatrix);
			gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
			gl.uniform4fv(shaderProgram.uColor, highlightColor.get());
			gl.drawArrays(gl.LINE_STRIP, 0, borderVertexPositionBuffer.numItems);
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
var selectedItems;
var highlightColor;
var build;
function initScene(elem) {
	console.time('Загрузка initScene()');
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	
	selectedItems = new Set();
	highlightColor = new Color();
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
	build.addRoom(0.0,0.1,0.0, 0.6,1.0,0.6);
	build.addRoom(5.0,0.1,0.0, 0.6,1.0,0.6);
	build.addRoom(0.0,0.1,5.0, 2.0,1.0,2.0);
	build.addRoom(5.0,0.1,5.0, 2.0,1.0,2.0);
	
	var build_1 = new Building();
	build_1.addRoom(0.0,0.1,0.0, 1.6,1.0,1.6);
	build_1.addRoom(5.0,0.1,0.0, 1.6,1.0,1.6);
	build_1.addRoom(0.0,0.1,5.0, 2.0,1.0,2.0);
	build_1.addRoom(5.0,0.1,5.0, 2.0,1.0,2.0);
	
	build = build_1;
	
	var key = new Keyboard();
	
	wheelListener(elem);
	mouseListener(elem);
	drawScene(cam, selectedItems, highlightColor);

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
			drawScene(cam, selectedItems, highlightColor);
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
		
		var oldItem = new OldItem();
		var graph = new Graph();

		function Draggable() {
			var	item = new Item();
			
			var drag = false,
				move = false,
				resize = false,
				attachment = false;
			
			var prevXd,
				prevZd,
				prevXm,
				prevZm;
				
			var SHIFT = 16,
				CTRL = 17,
				ALT = 18,
				DELETE = 46;
				
			var color = {
				RED: [1.0, 0.0, 0.0, 1.0],
				TURQUOISE: [0.0, 1.0, 1.0, 1.0]
			};
			highlightColor.set(color.TURQUOISE);
			
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
							ly = 1.0,
							lz = 2.0;
						build.addRoom(x-lx/2.0,0.1,z-lz/2.0, lx, ly, lz);
					}
					
					item.set(findElement(x, z, build.getItem()));
					
					if (item.is()) {
						isMoveItem();
						isResizeItem();
						oldItem.setOldItem(item.get());
						
						if (key.getKeyCode() == SHIFT) {
							if (selectedItems.valueOf().length == 0) return;
							
							move = false;
							resize = false;
							
							var item0 = build.getItem(selectedItems.valueOf()[0]);
							var spaceBetweenRooms = new Section().get(item0, item.get(), build.getItem());
							
							if (spaceBetweenRooms !== undefined) {
								var msg = null;
								var MIN_SIZE_DOOR = {
									x: 0.5, y: 0.5, z: 0.5
								};
								var MAX_SIZE_DOOR = {
									x: 3.0, y: 3.0, z: 3.0
								};
								
								for (var i in spaceBetweenRooms.distance) {
									if (spaceBetweenRooms['l'+i] < MIN_SIZE_DOOR[i]) {
										msg = 'Размер двери не соответствует требованиям. l' + i + ' меньше '+ MIN_SIZE_DOOR[i];
										break;
									} else if (spaceBetweenRooms.distance[i] >= MAX_SIZE_DOOR[i]) {
										msg = 'Размер двери не соответствует требованиям. Расстояние между комнатами больше '+ MAX_SIZE_DOOR[i];
										break;
									}
								}
								if (msg === null) {
									var door = build.addDoor(item0, item.get());
									selectedItems.add(door.id);
									graph.add(door.id, item0.id, item.get().id);
								} else {
									selectedItems.clear();
									console.error(msg);
								}
								selectedItems.add(item.get().id);
							} else {
								console.error('Непредвиденная ошибка!. spaceBetweenRooms == undefined');
							}
						} else if (key.getKeyCode() == ALT){	// прилипание комнат
							// if (selectedItems.valueOf().length == 0) return;
							
							// move = false;
							// resize = false;
							
							// var item0 = build.getItem(selectedItems.valueOf()[0]);
							// var spaceBetweenRooms = new Section().get(item0, item, build.getItem());
							
							// if (spaceBetweenRooms !== undefined) {
								// var msg = null;
								// var MAX_SIZE_DOOR = {
									// x: 0.3, y: 0.3, z: 0.3
								// };
								
								// for (var i in spaceBetweenRooms.distance) {
									// if (spaceBetweenRooms.distance[i] >= MAX_SIZE_DOOR[i]) {
										// msg = 'Размер двери не соответствует требованиям. Расстояние между комнатами больше '+ MAX_SIZE_DOOR[i];
										// break;
									// }
								// }
								
								// if (msg === null) {
									// var door = build.addDoor(item0, item);
									// selectedItems.add(door.id);
									// graph.add(door.id, item0.id, item.id);
								// } else {
									// selectedItems.clear();
									// console.error(msg);
								// }
								// selectedItems.add(item.id);
							// }
						} else {
							if (selectedItems.valueOf().length > 0) {
								selectedItems.clear();
							}

							selectedItems.add(item.get().id);							
							selectedGraph(item.get(), graph);
						}
						
						$("#lx").val(item.get().lx);
						$("#ly").val(item.get().ly);
						$("#lz").val(item.get().lz);
						
					} else {
						selectedItems.clear();
					}
					
					drawScene(cam, selectedItems, highlightColor);
					
					function isMoveItem () {
						move = true;
						prevXm = x - item.get().x; // координаты мышки на элементе
						prevZm = z - item.get().z;
					}
					
					function isResizeItem () {
						var r = findBorder(x, z, build.getItem(item.get().id), cam.getZoom());
						if (r != undefined) {
							resize = r;
							move = false;
						}
					}
				
					function selectedGraph (item, graph) {
						console.time('TimeWorkGraph');
						var id = item.id;
						if (graph.isEdge(id)) {
							id = graph.getNode(id)[1];
							if (graph.getGraph(id).length == 1) {
								id = graph.getNode(id)[0];
							}
						}
						var g = graph.getGraph(id);
						if (g.length != 1) {
							for (var i = g.length; --i >= 0;) {
								if (!selectedItems.has(g[i])) {
									selectedItems.add(g[i]);
								}
							}
							for (var i = g.length; --i >= 0;) {
								var e = graph.getEdge(g[i]);
								for (var j in e) {
									if (!selectedItems.has(e[j])) {
										selectedItems.add(e[j]);
									}
								}
							}
							move = false;
						}
						console.timeEnd('TimeWorkGraph');
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
					drawScene(cam, selectedItems, highlightColor);
				} else if (move) {
					item.change('x', x - prevXm);
					item.change('z', z - prevZm);
					if (build.updateItem(item.get())) {
						highlightColor.set(color.RED);
					} else {
						highlightColor.set(color.TURQUOISE);
					}
					drawScene(cam, selectedItems, highlightColor);
				} else if (resize) {
					var minSize = {
						lx: 0.6,
						lz: 0.6
					};
					var dlx, dlz;
					switch (resize) {
						case 'left': // изменяем размер влево
							dlx = item.get().lx + (item.get().x - x);
							if (dlx > minSize.lx) {
								if (item.get().type == 'door') {
									var borderDoor = getSpaceBetweenRooms(item.get().id, graph, build);
									console.log(borderDoor.distance.x);
									if (borderDoor.distance.x == 0) {
										if (x > borderDoor.x) {
											item.change('x', x);
											item.change('lx', dlx);
										}
									}
								} else {
									item.change('x', x);
									item.change('lx', dlx);
								}
							}
							break;
						case 'right': // изменяем размер вправо
							dlx = item.get().lx + (x - item.get().x1);
							if (dlx > minSize.lx) {
								if (item.get().type == 'door') {
									var borderDoor = getSpaceBetweenRooms(item.get().id, graph, build);
									if (borderDoor.distance.x == 0) {
										if (x < borderDoor.x + borderDoor.lx) {
											item.change('x1', x);
											item.change('lx', dlx);
										}
									}
								} else {
									item.change('x1', x);
									item.change('lx', dlx);
								}
							}
							break;
						case 'top': // изменяем размер вверх
							dlz = item.get().lz + (item.get().z - z);
							if (dlz > minSize.lz) {
								if (item.type == 'door') {
									var borderDoor = getSpaceBetweenRooms(item.get().id, graph, build);
									if (borderDoor.distance.z == 0) {
										if (z > borderDoor.z) {
											item.change('z', z);
											item.change('lz', dlz);
										}
									}
								} else {
									item.change('z', z);
									item.change('lz', dlz);
								}
							}
							break;
						case 'bottom': // изменяем размер вниз
							dlz = item.get().lz + (z - item.get().z1);
							if (dlz > minSize.lz) {
								if (item.type == 'door') {
									var borderDoor = getSpaceBetweenRooms(item.get().id, graph, build);
									if (borderDoor.distance.z == 0) {
										if (z < borderDoor.z + borderDoor.lz) {
											item.change('z1', z);
											item.change('lz', dlz);
										}
									}
								} else {
									item.change('z1', z);
									item.change('lz', dlz);
								}
							}
							break;
						case 'topLeft':
							dlx = item.get().lx + (item.get().x - x);
							dlz = item.get().lz + (item.get().z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (item.type != 'door') {
									item.change('x', x);
									item.change('lx', dlx);
									item.change('z', z);
									item.change('lz', dlz);
								}
							}
							break;
						case 'bottomLeft':
							dlx = item.get().lx + (item.get().x - x);
							dlz = item.get().lz + (z - item.get().z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (item.type != 'door') {
									item.change('x', x);
									item.change('lx', dlx);
									item.change('z1', z);
									item.change('lz', dlz);
								}
							}
							break;
						case 'topRight':
							dlx = item.get().lx + (x - item.get().x1);
							dlz = item.get().lz + (item.get().z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (item.type != 'door') {
									item.change('x1', x);
									item.change('lx', dlx);
									item.change('z', z);
									item.change('lz', dlz);
								}
							}
							break;
						case 'bottomRight':
							dlx = item.get().lx + (x - item.get().x1);
							dlz = item.get().lz + (z - item.get().z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (item.type != 'door') {
									item.change('x1', x);
									item.change('lx', dlx);
									item.change('z1', z);
									item.change('lz', dlz);
								}
							}
							break;
						default:
							console.log('Непонятки');
							break;
					}
					if (build.updateItem(item.get())) {
						highlightColor.set(color.RED);
					} else {
						highlightColor.set(color.TURQUOISE);
					}
					
					drawScene(cam, selectedItems, highlightColor);
				} else {
					if (selectedItems.valueOf().length > 0 && key.getKeyCode() === undefined) {
						item.set(findElement(x, z, build.getItem()));
						if (item.is()) {
							if (selectedItems.has(item.get().id)) {
								findBorder(x, z, item.get(), cam.getZoom());
							}
						} else {
							findBorder(x, z, build.getItem(selectedItems.valueOf()[0]), cam.getZoom());
						}
					}
				}
				
				if (move || resize) {
					$("#lx").val(item.get().lx);
					$("#ly").val(item.get().ly);
					$("#lz").val(item.get().lz);
				}
			}
			this.mouseup = function (ev) {
				if (drag) {
					drag = false;
				} else if (move) {
					move = false;
					returnPreviousValue();
				} else if (resize) {
					resize = false;
					returnPreviousValue();
				}
				
				if (key.getKeyCode() == DELETE) {
					if (item.is()) {
						var deletedItem = build.removeItem(item.get().id);
						if (graph.remove(item.get().id)) {
							console.info('Удален элеменет "' + deletedItem.type + '"', deletedItem);
						}
					}
				}
				
				drawScene(cam, selectedItems, highlightColor);
				
				//var str = JSON.stringify(build.getItem(), "", 4);
				//console.log(str);
				
				function returnPreviousValue () {
					if (build.updateItem(item.get())) {
						build.updateItem(oldItem.getOldItem());
						highlightColor.set(color.TURQUOISE);
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
		  return undefined;
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
		
		function getSpaceBetweenRooms(itemId, graph, build) {
			var e = graph.getNode(itemId);
			var item0 = build.getItem(e[0]);
			var item1 = build.getItem(e[1]);
			var borderDoor = new Section().get(item0, item1, build.getItem());
			return borderDoor;
		}
	}
	console.timeEnd('Загрузка initScene()');
}

function ititFile() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
		console.info('FileAPI O\'k');
	} else {
		alert('The File APIs are not fully supported in this browser.');
		console.error('FileAPI No');
	}
}