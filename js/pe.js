/*! Определения:
 - объявление - создание переменной
 - инициализация - присвоение переменной значения
 - элемент - любой объект, который отображается (помещение(комната), дверь, проем(соединение помещение, как-будто это одно помещение))

Главная переменная element. Вариации el, elem, els, elems. Все завязано на ней.

Входные данные и отображение не должно совпадать. Не нужно ставить коэффициенты преобразования
пикселей в метры. Пользователь изначально все вводит в метрах.
Нужно метры преобразовывать в пиксели, для приближения к геометрии здания.

 !!!Определить примыкание комнат
*/

// Глобальные переменные
var nameProject;
var canv;
var ctx;
var el = {};
el.obj;
el.list = [];
el.counter;
el.type = {room:'room', hole:'hole', door:'door'};

/* Функция создания нового проекта */
function createNewProject(){
  var wds = $('.wrap-dialog-start');
  wds.dialog({
    title: 'Укажите имя нового проекта',
	position: 'top',
	height: 125,
	width: 250,
    buttons: {
	  'Создать':function(){
		wds.dialog('close'); // закрытие диалогового окна
		nameProject = $('#np').val(); // получение имени проекта
		$('#nameProject').text('<'+nameProject+'>');
		canv = document.getElementById('planEditor');
		if (!canv){alert('Ошибка! Canvas элемент не найден!'); return;}
		if (!canv.getContext){alert('Ошибка! Context не поддерживается!'); return;}
		ctx = canv.getContext('2d');
		
	    disableSelection(document.body); //запрет выделение текста на странице
        eventListener('#planEditor'); //обработка событий на канвас
	    createNewElement();  // добавление элемента
		
        tool = new draggable(canv, ctx);
		
		el.list = [];
		el.obj;
		el.counter = 0;
		ctx.clearRect(0, 0, canv.width, canv.height);
		
	  },
      'Отменить':function(){
	    wds.dialog('close');
	  }
	}
  });
}

/* Функция обработки событий на канвас
Обработка событий:
 - mousedown - нажатие кнопки на canvas
 - mousedraggable - движение на canvas
 - mouseup - отпускание кнопки 
*/
function eventListener(selector){
  $(selector).on("mousedown", s);
  $(selector).on("mousemove", s);
  $(selector).on("mouseup", s);
  function s(e){if(tool[e.type])tool[e.type](e)}
}

/* Функция параметров комнаты*/
function Room (){
  this.x = 50;
  this.y = 100;
  this.z = 0; // определяет этаж
  
  this.w = 70;
  this.l = 70;
  this.h = 70;
  
  this.c = "yellow";
  this.type = el.type.room;
}
/* Функция параметров двери*/
function Door (){
  this.x = 20;
  this.y = 20;
  this.z = 0;
  
  this.w = 40;
  this.l = 15;
  this.h = 15;
  
  this.c = "black";
  this.type = el.type.door;
}
/* Функция параметров проема*/
function Hole (){
  this.x = 30;
  this.y = 10;
  this.z = 0;
  
  this.w = 70;
  this.h = 6;
  this.l = 0;
  
  this.c = "green";
  this.type = el.type.hole;
}

/* функция добавления элементов
 - Room - комната
 - Door - дверь
 - Hole - проем
*/
function createNewElement(){
  $('#room').click(function() {
	var r = new Room();
	el.list.push(new Element(el.type.room, r.x, r.y, r.w, r.h, r.c, el.counter++, null, null, 0));
	redrawing(canv, ctx, el.list);
	if(el.obj)el.obj.s=false;
  });
  $('#door').click(function() {
	if (!el.obj) return;
	if (el.obj.s && el.obj.type == 'room'){
	  var d = new Door();
	  el.list.push(new Element(el.type.door, d.x, d.y, d.w, d.h, d.c, el.counter++));
	  redrawing(canv, ctx, el.list);
	  el.obj.s=false;
	}
  });
  $('#hole').click(function() {
	if (!el.obj) return;
	if (el.obj.s && el.obj.type == 'room'){
	  var h = new Hole();
	  el.list.push(new Element(el.type.hole, h.x, h.y, h.w, h.h, h.c, el.counter++));
	  redrawing(canv, ctx, el.list);
	  el.obj.s=false;
	}
  });
}

/* Функция перерисовки холста */
function redrawing(canvas, context, arrElem){
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i in arrElem){
	var e = arrElem[i];
	context.fillStyle = e.c; // цвет заливки
	context.fillRect(e.x, e.y, e.w, e.h);
	if (!e.s) continue;
	context.lineWidth = (e.type=='room')?3:2; // толщина линии обводки
	context.strokeStyle = 'brown'; // цвет обводки
	context.strokeRect(e.x+2, e.y+2, e.w-4, e.h-4); 
  }
  context.drawImage(canvas, 0, 0);
}

/* Свойства элемента */
function Element(type, x, y, w, h, color, counter, xSlide, ySlide, childElems){
  // тип элемента
  this.type = type;
  // координаты верхнего левого угла
  this.x = x;
  this.y = y;
  this.z = 0;
  // размеры элемента
  this.w = w;
  this.l = 0;
  this.h = h;
  // цвет элемента
  this.c = color;
  // идентификатор элемента
  this.id = counter;
  // флаг выделения элемента
  this.s = false; // select
  // смещение элемента при перемещении
  this.offsetX = 0;
  this.offsetY = 0;
  // блокированная координата
  // запрет на перемещение вдоль оси
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
function f (ev, p){
  return (p=='x')?ev.pageX-canv.offsetLeft:ev.pageY-canv.offsetTop;
}

/* Функция перемещения элемента*/
function draggable(canvas, ctx){
  // курсор в режиме рисования (по умолчанию)
  canvas.style.cursor = 'default';
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
	el.obj = findElemenet(x, y);
	if (el.obj){
	  // положение мышки на объкте
	  el.obj.offsetX = x - el.obj.x;
	  el.obj.offsetY = y - el.obj.y;
	  // старт перемещения
	  if (!drag) drag = true;
	  // выделение элемента
	  el.obj.s = true;
	  /*! Перерисовка производится только для отображения выделения элемента
	  Возможно, это замедлит работу, но пока исправить это не могу*/
	  redrawing(canvas, ctx, el.list);
	  // запись выбранного элемента во временную переменную
	  // для передачи ее в функцию создания элемента в выбранном направлении
	  this.obj = el.obj;
	}
  };

  this.mousemove = function (ev) {
    // координаты в момент перемещения мышки
	x = f(ev, 'x');
	y = f(ev, 'y');

	if (!drag) return;
	//изменение координат фигуры
	el.obj.x = el.obj.xSlide?el.obj.x:(x - el.obj.offsetX);
	el.obj.y = el.obj.ySlide?el.obj.y:(y - el.obj.offsetY);
	
	el.obj.A = {'x': el.obj.x, 'y': el.obj.y};
    el.obj.B = {'x': el.obj.x+el.obj.w, 'y': el.obj.y};
    el.obj.C = {'x': el.obj.x+el.obj.w, 'y': el.obj.y+el.obj.h};
    el.obj.D = {'x': el.obj.x, 'y': el.obj.y+el.obj.h};

	// перерисовка канваса
	redrawing(canvas, ctx, el.list);
  };

  this.mouseup = function (ev) {
    // прекращение перемещения
    if (drag) drag = false;
	// перезапись параметров элемента
	el.list[el.obj.id] = new Element(el.obj.type, el.obj.x, el.obj.y, el.obj.w, el.obj.h, el.obj.c, el.obj.id, el.obj.xSlide, el.obj.ySlide);
	// добавление элементов
	addElement(this.obj, ev);
  };
}

/* Функция поиска элемента на холсте мышкой*/
function findElemenet(x, y){
  for (var i in el.list){
    var e = el.list[i];
    if (x > e.A['x'] && x < e.C['x'])
    if (y > e.A['y'] && y < e.C['y'])
	  return e;
  }
  return false;
}

/* Функция создания элемента в выбранном направлении */
function addElement(obj, ev){
  if (!obj) return;
  if (!obj.s) return;
  var x = f(ev, 'x');  // идентификация координаты Х
  var y = f(ev, 'y');  // идентификация координаты Y
  var posXY = [x, y];
  var side = s();
  var room = new Room();
  var selector = '#wrapRoomForm';
  if (obj.type == el.type.room){ // будут добавляться только двери и проёмы
	if(side)createHoleOrDoor(posXY, side, obj);
  }else { // будут добавляться только комнаты
	if (side=='l'||side=='r'){
	  if (obj.h > obj.w) form(posXY, selector, {side:side, obj:obj, element:room});
	}else if (side=='t'||side=='b')
	  if (obj.h < obj.w) form(posXY, selector, {side:side, obj:obj, element:room});
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
	return false;
  }
}

/* Функция модального окна выбора Двери или Проема */
function createHoleOrDoor(posXY, side, obj){
  $('#modalWindow').dialog({
    title: 'Выберете элемент',
	position: posXY,
	height: 110,
	width: 250,
    buttons: {
	  'Проем':function(){
	    $('#modalWindow').dialog('close');
		form(posXY, '#wrapHoleForm', {side:side, obj:obj, element:new Hole});
	  },
      'Дверь':function(){
	    $('#modalWindow').dialog('close');
		form(posXY, '#wrapDoorForm', {side:side, obj:obj, element:new Door});
	  }
	}
  });
}

/* Функция отображения формы для ввода информации об элементе */
function form(posXY, selector, listParameters){
  var jq = $(selector);
  var v = {};
  var wH, wD, wR;
  var hD, hR;
  var lD, lR;
  var n, t, st, p;
  wH = $('#widthHole');
  wD = $('#widthDoor');
  wR = $('#widthRoom');
  hD = $('#heightDoor');
  hR = $('#heightRoom');
  lD = $('#longDoor');
  lR = $('#longRoom');  
  n = $('#name');
  t = $('#type');
  st = $('#subType');
  p = $('#peopleInRoom');
  
  var lp = listParameters;
  var A = lp.obj.A;
  var B = lp.obj.B;
  var C = lp.obj.C;
  var D = lp.obj.D;
  var els = lp.element;
  var x, y, tmpW;
  
  jq.dialog({
    title: selector=='#wrapDoorForm'?'Новая дверь':selector=='#wrapHoleForm'?'Новый проем':'Новое помещение',
    position: posXY,
	modal: true,
    buttons: {
	  'Добавить':function(){
	    jq.dialog('close');
		switch(selector){
		  case '#wrapDoorForm':
			if (lp.side == 'l'){
			  tmpW = els.w;
		      els.w = els.h;
		      els.h = tmpW;
			  x = A.x-els.w;
			  y = r(A.y, D.y-els.h);
			}else if (lp.side == 'r'){
			  tmpW = els.w;
		      els.w = els.h;
		      els.h = tmpW;
			  x = B.x;
			  y = r(B.y, C.y-els.h);
			}else if (lp.side == 't'){
			  x = r(A.x, B.x-els.w); 
			  y = B.y-els.h;
			}else if (lp.side == 'b'){
			  x = r(D.x, C.x-els.w);
			  y = D.y;
			}
		    break;
		  case '#wrapHoleForm':
			if (lp.side == 'l'){
			  tmpW = els.w;
		      els.w = els.h;
		      els.h = tmpW;
			  x = A.x-els.w;
			  y = r(A.y, D.y-els.h);
			}else if (lp.side == 'r'){
			  tmpW = els.w;
		      els.w = els.h;
		      els.h = tmpW;
			  x = B.x;
			  y = r(B.y, C.y-els.h);
			}else if (lp.side == 't'){
			  x = r(A.x, B.x-els.w); 
			  y = B.y-els.h;
			}else if (lp.side == 'b'){
			  x = r(D.x, C.x-els.w);
			  y = D.y;
			}
		    break;
		  case '#wrapRoomForm':
			if (lp.side == 'l'){
			  x = A.x-els.w;
			  y = r(A.y, D.y-els.h);
			}else if (lp.side == 'r'){
			  x = B.x;
			  y = r(B.y, C.y-els.h);
			}else if (lp.side == 't'){
			  x = r(A.x, B.x-els.w);
			  y = B.y-els.h;
			}else if (lp.side == 'b'){
			  x = r(D.x, C.x-els.w);
			  y = D.y;
			}
		    break;
		}
		elem(x, y, els, lp.xSlide, lp.ySlide);
	    /* переменной выделения приравнивается false
		для исключения добавления элемента к не выделенному*/
		lp.obj.s = false;
	  },
      'Отменить':function(){
	    jq.dialog('close');
		return false;
	  }
	}
  });
  
  /* Функция добавления елемента 
  elemType - тип
  x, y координаты верхнего левого угла 
  p.w, p.h - ширина и высота
  p.c - цвет
  */
  function elem(x, y, p, xSlide, ySlide){
    el.list.push(new Element(p.type, x, y, p.w, p.h, p.c, el.counter++, xSlide, ySlide));
    redrawing(canv, ctx, el.list);
  }
  /* Функция определения случайного числа для задания координаты элемента*/
  function r(min, max){
    var rand = min + Math.random()*(max+1-min);
    return rand^0; // округление битовым оператором
  }
}