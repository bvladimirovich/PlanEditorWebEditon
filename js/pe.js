var ProjectName;
var Canvas;
var Ctx;
var tool;
var list = {}; // список
list.elements = []; // список элементов
var count = list.elements.length; // счетчик элементов
var obj;// объявление объекта

/* Функция диалога при создании нового проекта*/
function dialog(){
  if (confirm("Создать новый проект?")) { 
    ProjectName = prompt("Укажите имя проекта:");
	if (ProjectName == null || ProjectName == ""){
	  ProjectName = "Новый проект";
	}
	$("#nameProject").html("*"+ProjectName+"*");
	
	Canvas = document.getElementById("planEditor");
    if (!Canvas){alert("Ошибка! Canvas элемент не найден!"); return;}
    Ctx = Canvas.getContext("2d");
    
	disableSelection(document.body); //запрет выделение текста на странице
    eventListener("#planEditor");    //обработка событий на канвас
	addElem();  // добавление элемента
    tool = new move(Canvas, Ctx);  
  }
}

function select(e){if(tool[e.type])tool[e.type](e);}

/* Функция обработки событий на канвас
Обработка событий:
 - dblclick - двойной клик
 - mousedown - нажатие кнопки на canvas
 - mousemove - движение на canvas
 - mouseup - отпускание кнопки 
*/
function eventListener(element){
  $(element).dblclick(
    function(event){
      $("#msgBox").html(event.type);
    }
  );
  $(element).on("mousedown", select);
  $(element).on("mousemove", select);
  $(element).on("mouseup", select);
}

/* функция добавления элементов
 - Room - комната
 - Door - дверь
 - Hole - проем
*/
function addElem(){
  count = 0;
  var elem;
  $('#room').click(function() {
    elem = 'room';
	var r = new Room();
	list.elements.push(new Element(elem, r.x, r.y, r.w, r.h, r.c, count, null, null, 0));
	count++;
	update(Canvas, Ctx, list.elements);
	if(obj)obj.s=false;
  });
  $('#door').click(function() {
    elem = 'door';
	if (!obj) return;
	if (obj.s && obj.type == 'room'){
	  var d = new Door();
	  list.elements.push(new Element(elem, d.x, d.y, d.w, d.h, d.c, count));
	  count++;
	  update(Canvas, Ctx, list.elements);
	  obj.s=false;
	}
  });
  $('#hole').click(function() {
    elem = 'hole';
	if (!obj) return;
	if (obj.s && obj.type == 'room'){
	  var h = new Hole();
	  list.elements.push(new Element(elem, h.x, h.y, h.w, h.h, h.c, count));
	  count++;
	  update(Canvas, Ctx, list.elements);
	  obj.s=false;
	}
  });
}

/* Функция параметров комнаты*/
function Room (){
  this.x = 50;
  this.y = 100;
  this.w = 70;
  this.h = 70;
  this.c = "yellow";
  function number() {
    confirm("Введите номер комнаты");
  }
}
/* Функция параметров двери*/
function Door (){
  this.x = 20;
  this.y = 20;
  this.w = 40;
  this.h = 15;
  this.c = "black";
}
/* Функция параметров проема*/
function Hole (){
  this.x = 30;
  this.y = 10;
  this.w = 70;
  this.h = 6;
  this.c = "green";
}

/* Функция обновления холста */
function update(canvas, context, arrElem){
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i in arrElem){
	var e = arrElem[i];
	context.fillStyle = e.c; // цвет заливки
	context.fillRect(e.x, e.y, e.w, e.h);
	if (!e.s) continue;
	context.lineWidth = (e.type=='room')?4:2; // толщина линии обводки
	context.strokeStyle = 'brown'; // цвет обводки
	context.strokeRect(e.x+2, e.y+2, e.w-4, e.h-4); 
  }
  context.drawImage(canvas, 0, 0);
}

/* Свойства элемента*/
function Element(type, x, y, w, h, color, count, xSlide, ySlide, childElems){
  // тип элемента
  this.type = type;
  // координаты верхнего левого угла
  this.x = x;
  this.y = y;
  // размеры элемента
  this.w = w;
  this.h = h;
  // цвет элемента
  this.c = color;
  // идентификатор элемента
  this.id = count;
  // флаг выделения элемента
  this.s = false; // select
  // смещение елемента при перемещении
  this.offsetX = 0;
  this.offsetY = 0;
  // блокированная координата
  // запрет на перемещени вдоль оси
  // false - перемещение разрешено
  this.xSlide = xSlide;
  this.ySlide = ySlide;
  // координаты квадрата
  this.A = {'x': this.x, 'y': this.y};
  this.B = {'x': this.x+this.w, 'y': this.y};
  this.C = {'x': this.x+this.w, 'y': this.y+this.h};
  this.D = {'x': this.x, 'y': this.y+this.h};
}

/* Функция отключения выделения текста
Чтоб придвойном щелчке не выделялся текст на странице
*/
function disableSelection(target){
  if (typeof target.onselectstart!="undefined") // для IE:
    target.onselectstart=function(){return false}
  else if (typeof target.style.MozUserSelect!="undefined") //для Firefox:
    target.style.MozUserSelect="none"
  else // для всех других (типа Оперы):
    target.onmousedown=function(){return false}
  target.style.cursor = "default"
}

/* Функция вычесления координаты мыши на холсте */
function f (ev, param){
  switch (param){
    case 'x':
	  return ev.pageX - Canvas.offsetLeft;
	  break;
    case 'y':
	  return ev.pageY - Canvas.offsetTop;
	  break;
  }
}

/* Функция перемещения элемента*/
function move(c, ctx){
  // курсор в режиме рисования (по умолчанию)
  c.style.cursor = 'default';
  // координаты элемента
  var x, y;
  // флаг перемещения
  var drag = false;
  // временное хранилище элемента
  this.obj;
  
  this.mousedown = function (ev) {
    // координаты в момент нажатия кнопки мыши
    x = f(ev, 'x');
    y = f(ev, 'y');
	// поиск элемента на холсте
	obj = findElemenet(x, y);
	if (obj){
	  // положение мышки на объкте
	  obj.offsetX = x - obj.x;
	  obj.offsetY = y - obj.y;
	  // старт перемещения
	  if (!drag) drag = true;
	  // выделение элемента
	  obj.s = true;
	  /*! Перерисовка производится только для отображения выделения элемента
	  Возможно, это замедлит работу, но пока исправить это не могу*/
	  update(Canvas, Ctx, list.elements);
	  // запись выбранного элемента во временную переменную
	  // для передачи ее в функцию создания элемента в выбранном направлении
	  this.obj = obj;
	}
  };

  this.mousemove = function (ev) {
    // координаты в момент перемещения мышки
	x = f(ev, 'x');
	y = f(ev, 'y');
	// информационное сообщение
	var e = findElemenet(x, y);
	$("#msgBox").html(e?e.type:'canvas');
	
	if (!drag) return;
	//изменение координат фигуры
	obj.x = obj.xSlide?obj.x:(x - obj.offsetX);
	obj.y = obj.ySlide?obj.y:(y - obj.offsetY);
	
	obj.A = {'x': obj.x, 'y': obj.y};
    obj.B = {'x': obj.x+obj.w, 'y': obj.y};
    obj.C = {'x': obj.x+obj.w, 'y': obj.y+obj.h};
    obj.D = {'x': obj.x, 'y': obj.y+obj.h};

	// перерисовка канваса
	update(Canvas, Ctx, list.elements);
  };

  this.mouseup = function (ev) {
    // прекращение перемещения
    if (drag) drag = false;
	// перезапись параметров элемента
	list.elements[obj.id] = new Element(obj.type, obj.x, obj.y, obj.w, obj.h, obj.c, obj.id, obj.xSlide, obj.ySlide);
	// добваление элементов
	findSide(this.obj, ev);
  };
}

/* Функция поиска элемента на холсте мышкой*/
function findElemenet(x, y){
  for (var i in list.elements){
    var e = list.elements[i];
    if (x > e.A['x'] && x < e.C['x'])
    if (y > e.A['y'] && y < e.C['y'])
	  return e;
  }
  return false;
}

/* Функция добавления елемента 
elemType - тип
x, y координаты верхнего левого угла 
p.w, p.h - ширина и высота
p.c - цвет
count - порядковый номер
obj - субъект пристыковки
*/
function addElement(x, y, p, elemType, obj, xSlide, ySlide){
  list.elements.push(new Element(elemType, x, y, p.w, p.h, p.c, count, xSlide, ySlide));
  count++;
  /* переменной выделения приравнивается false
  для исключения добавления элемента к не выделенному*/
  obj.s = false;
  //list.elements[obj.id] = new Element(obj.type, obj.x, obj.y, obj.w, obj.h, 'blue', obj.id, obj.xSlide, obj.ySlide);
  update(Canvas, Ctx, list.elements);
}

/* Функция создания элемента в выбранном направлении */
function findSide(obj, e){
  var x = f(e, 'x');  // идентификация координаты Х
  var y = f(e, 'y');  // идентификация координаты Y
  var posXY = [x, y];
  if (!obj) return;
  if (!obj.s) return;
  if (obj.type == 'room'){ // будут добавляться только двери и проемы
    var d = new Door();  // идентификация двери
	var h = new Hole();  // идентификация проема (ВРЕМЕННО НЕ ИСПОЛЬЗУЕТСЯ)
	var tmpW;
	switch(s()){
	  case 'l':  // левая стенка
	    modalWindow(posXY, {
		  door: function(){
			// изменение размеров элемента для поворота
	        tmpW = d.w;
		    d.w = d.h;
		    d.h = tmpW;
	        addElement(obj.A.x-d.w, r(obj.A.y, obj.D.y-d.h), d, 'door', obj, true, false);
		  },		
		  hole: function(){
			tmpW = h.w;
		    h.w = h.h;
		    h.h = tmpW;
	        addElement(obj.A.x-h.w, r(obj.A.y, obj.D.y-h.h), h, 'hole', obj, true, false);
		  }
		}); 
	    break;
	  case 'r': // правая стенка
		modalWindow(posXY, {
		  door: function(){
	        tmpW = d.w;
		    d.w = d.h;
		    d.h = tmpW;
	       addElement(obj.B.x, r(obj.B.y, obj.C.y-d.h), d, 'door', obj, true, false);
		  },		
		  hole: function(){
			tmpW = h.w;
		    h.w = h.h;
		    h.h = tmpW;
	        addElement(obj.B.x, r(obj.B.y, obj.C.y-h.h), h, 'hole', obj, true, false);
		  }
		}); 
	    break;
	  case 't': // верхняя стенка
		modalWindow(posXY, {
		  door: function(){
	        addElement(r(obj.A.x, obj.B.x-d.w), obj.B.y-d.h, d, 'door', obj, false, true);
		  },		
		  hole: function(){
	        addElement(r(obj.A.x, obj.B.x-h.w), obj.B.y-h.h, h, 'hole', obj, false, true);
		  }
		});
	    break;
	  case 'b':  // нижняя стенка
		modalWindow(posXY, {
		  door: function(){
		    addElement(r(obj.D.x, obj.C.x-d.w), obj.D.y, d, 'door', obj, false, true);
		  },
		  hole: function(){
		    addElement(r(obj.D.x, obj.C.x-h.w), obj.D.y, h, 'hole', obj, false, true);
		  }
		});
	    break;
	}
  }else { // будут добавляться только комнаты
    var room = new Room();
    switch(s()){
	  case 'l':
	    if (obj.h < obj.w) break; // запрет добавления комнаты с торцевой стороны
		form([x, y], function(){
  	      addElement(obj.A.x-room.w, r(obj.A.y, obj.D.y-room.h), room, 'room', obj, true, false);
		}, '#wrapRoomForm');
	    break;
	  case 'r':
	    if (obj.h < obj.w) break;
		form([x, y], function(){
	      addElement(obj.B.x, r(obj.B.y, obj.C.y-room.h), room, 'room', obj, true, false);
		}, '#wrapRoomForm');
	    break;
	  case 't':
	    if (obj.h > obj.w) break;
		form([x, y], function(){
	      addElement(r(obj.A.x, obj.B.x-room.w), obj.B.y-room.h, room, 'room', obj, false, true);
		}, '#wrapRoomForm');
	    break;
	  case 'b':
	    if (obj.h > obj.w) break;
		form([x, y], function(){
	      addElement(r(obj.D.x, obj.C.x-room.w), obj.D.y, room, 'room', obj, false, true);
		}, '#wrapRoomForm');
	    break;
	}
  }
  /* Функция определения случайного числа для задания координаты элемента*/
  function r(min, max){
    var rand = min + Math.random()*(max+1-min);
    return rand^0; // округление битовым оператором
  }
  
  /* Функция определения выбора стороны создания нового элемента */
  function s() { // s = side
    if (x < obj.A['x'])
    if (y > obj.A['y'] && y < obj.D['y'])
	  return 'l'; //left
	if (x > obj.B['x'])
    if (y > obj.B['y'] && y < obj.C['y'])
	  return 'r'; //right
	if (x > obj.A['x'] && x < obj.B['x'])
    if (y < obj.A['y'])
	  return 't'; //top
	if (x > obj.D['x'] && x < obj.C['x'])
    if (y > obj.D['y'])
	  return 'b'; //bottom
  }
}

/* Функция определения заползания (перекрывания) элементов друг на друга */
function overlap(/*Element*/obj){
  var e;
  if (e=findElemenet(obj.A.x, obj.A.y)) return e;
  if (e=findElemenet(obj.B.x, obj.B.y)) return e;
  if (e=findElemenet(obj.C.x, obj.C.y)) return e;
  if (e=findElemenet(obj.D.x, obj.D.y)) return e;
}

/* Функция модального окна выбора Двери или Проема */
function modalWindow(posXY, holeAndDoor){
  $('#modalWindow').dialog({
    title: 'Выберете элемент',
	position: posXY,
	height: 110,
	width: 250,
    buttons: {
	  'Проем':function(){
	    $('#modalWindow').dialog('close');
		form(posXY, function(){holeAndDoor.hole()}, '#wrapHoleForm');
	  },
      'Дверь':function(){
	    $('#modalWindow').dialog('close');
		form(posXY, function(){holeAndDoor.door()}, '#wrapDoorForm');
	  }
	}
  });
}

/* Функция отображения формы для ввода информации об элементе */
function form(posXY, element, selector){
  var jq = $(selector);
  var selectors = {};
  selectors.hole = {w: 'widthHole'};
  selectors.door = {w: 'widthDoor', l: 'longDoor', h: 'heightDoor'};
  selectors.room = {n: 'name', t: 'type', st: 'subType', p: 'peopleInRoom', w: 'widthRoom', l: 'longRoom', h: 'heightRoom'};
  var w = selector=='wrapDoorForm'?$('#widthDoor'):selector=='wrapHoleForm'?$('#widthHole'):$('#widthRoom');
  var h = selector=='wrapDoorForm'?$('#heightDoor'):$('#heightRoom');
  var l = selector=='wrapDoorForm'?$('#longDoor'):$('#longRoom');
  
  var n = $('#heightDoor');
  var t = $('#heightDoor');
  var st = $('#heightDoor');
  var p = $('#heightDoor');  
  
  jq.dialog({
    title: selector=='wrapDoorForm'?'Новая дверь':selector=='wrapHoleForm'?'Новый проем':'Новое помещение',
    position: posXY,
	modal: true,
    buttons: {
	  'Добавить':function(){
	    jq.dialog('close');
		alert(nameElem.w.val());
		element();
	  },
      'Отменить':function(){
	    jq.dialog('close');
		return false;
	  }
	}
  });
}
