// var build = new Building();
// console.log('Добавление комнат');
// var r1 = build.addRoom(0,0,0, 3,1,3)
// var r2 = build.addRoom(4,0,0, 4,1,4)
// var r3 = build.addRoom(0,0,5, 6,1,3)
// console.log(r1);
// console.log(r2);
// console.log(r3);
// console.log('Добавление двери между комнатами');
// var door = build.addDoor(r1, r2, 1,1,1);
// console.log(door);
// console.log('Изменение размеров');
// console.log(build.modify(door.id).position(5,2,-2));
// console.log(build.modify(door.id).position(5,2,-1));
// console.log(build.modify(door.id).position(5,2,0));
// console.log(build.modify(door.id).position(5,2,1));
// console.log(build.modify(door.id).position(5,2,2));
// console.log(build.modify(door.id).position(5,2,0));
// console.log(build.modify(door.id).position(5,2,0));
// console.log(build.modify(door.id).position(5,2,3));
// console.log(build.modify(door.id).position(5,2,2));
// console.log(build.modify(door.id).position(5,2,1));
// console.log(build.modify(door.id).position(5,2,0));
// console.log(build.modify(door.id).position(5,2,-2));
// console.log(build.modify(door.id).position(5,2,-1));



function wheelListener(){
	var elem = document.getElementById('canvas');
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
		drawScene();
		e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	}
}

function dragRight(){
	var selector = '#canvas',
		tool = new draggable();
	$(selector).on("mousedown", s);
	$(selector).on("mousemove", s);
	$(selector).on("mouseup", s);
	
	function s(e) {
		if (tool[e.type]) {
			tool[e.type](e);
		}
	}
}

function draggable(func) {
	var elem = document.getElementById('canvas'),
		drag = false,
		dx,
		dy,
		prevX,
		prevY;
  
	this.mousedown = function (ev) {
		if (!drag) drag = true;
		prevX = f(ev, 'x');
		prevY = f(ev, 'y');
	}
	
	this.mousemove = function (ev) {
		if (!drag) return;
		var k = elem.width/(cam.update().r-cam.update().l),
			nX = f(ev, 'x'),
			nY = f(ev, 'y');
		dx = (nX-prevX)/k;
		dy = (nY-prevY)/k;
		prevY = nY;
		prevX = nX;

		cam.setDxy(dx, dy);
		drawScene();
	}

	this.mouseup = function (ev) {
		if (drag) drag = false;
	}
}
	
/* Функция вычисления координаты мыши на холсте */
function f(ev, p) {
  var elem = document.getElementById('canvas');
  return (p=='x')?ev.pageX-elem.offsetLeft:elem.height-(ev.pageY-elem.offsetTop);
}