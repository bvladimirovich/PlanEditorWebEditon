/*! Определения:
 - объявление - создание переменной
 - инициализация - присвоение переменной значения
 - элемент - любой объект, который отображается (помещение(комната), дверь, проем(соединение помещение, как-будто это одно помещение))

Главная переменная element. Вариации el, elem, els, elems. Все завязано на ней.

Входные данные и отображение не должно совпадать. Не нужно ставить коэффициенты преобразования
пикселей в метры. Пользователь изначально все вводит в метрах.
Нужно метры преобразовывать в пиксели, для приближения к геометрии здания.

 !!! Определить примыкание комнат
 !! Изменение параметров элемента по двойному клику
 ! Возможность добавления подложки => прозрачные элементы
*/

// Глобальные переменные
var nameProject;
var canv;
var ctx;

var el = {};  // элемент
el.obj = {};  // последний элемент
el.list = {}; // список всех элементов
el.counter = 0; // счётчик элементов
el.type = {room:'room', hole:'hole', door:'door'};

/* Свойства элемента */
el.set = function(type, x, y, w, h, l, color, counter, xSlide, ySlide, obj){
  // тип элемента
  this.type = type;
  // координаты верхнего левого угла
  this.x = x;
  this.y = y;
  this.z = 0;
  // размеры элемента
  this.w = w;
  this.l = l;
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
  this.C = {'x': this.x+this.w, 'y': this.y+this.l};
  this.D = {'x': this.x, 'y': this.y+this.l};
  
  this.obj = obj;
}

/* Функция поиска элемента на холсте мышкой */
el.get = function(x, y){
  for (var i in el.list){
    var e = el.list[i];
    if (x > e.A['x'] && x < e.C['x'])
    if (y > e.A['y'] && y < e.C['y'])
	  return e;
  }
  return false;
}

/* Параметры комнаты */
el.room = function(){
  this.x = 50;
  this.y = 100;
  this.z = 0; // определяет этаж
  
  this.w = 70;
  this.l = 70;
  this.h = 70;
  
  this.c = "#FFEA73";
  this.type = el.type.room;
}
/* Параметры двери */
el.door = function(){
  this.x = 20;
  this.y = 20;
  this.z = 0;
  
  this.w = 40;
  this.l = 20;
  this.h = 20;
  
  this.c = "#476BD6";
  this.type = el.type.door;
}
/* Параметры проёма */
el.hole = function(){
  this.x = 30;
  this.y = 10;
  this.z = 0;
  
  this.w = 70;
  this.h = 10;
  this.l = 20;
  
  this.c = "#FF7A00";
  this.type = el.type.hole;
}

/* Функция создания элемента в выбранном направлении */
el.add = function(obj, ev){
  if (!obj) return;
  if (!obj.s) return;
  var posXY = [f(ev, 'x'), f(ev, 'y')], side = s(posXY);
  if (obj.type == el.type.room){ // будут добавляться только двери и проёмы
	if(side)createHoleOrDoor(posXY, side, obj);
  }else { // будут добавляться только комнаты
	if (side=='l'||side=='r'){
	  if (obj.l > obj.w) form(posXY, '#wrapRoomForm', {side:side, obj:obj, element:new el.room()});
	}else if (side=='t'||side=='b'){
	  if (obj.l < obj.w) form(posXY, '#wrapRoomForm', {side:side, obj:obj, element:new el.room()});
	}
  }
  /* Функция определения выбора стороны создания нового элемента */
  function s(posXY) { // s = side
    var x = posXY[0], y = posXY[1];	
    if (x < obj.A['x'] && y > obj.A['y'] && y < obj.D['y']) 
	  return 'l'; //left
	if (x > obj.B['x'] && y > obj.B['y'] && y < obj.C['y'])
	  return 'r'; //right
	if (x > obj.A['x'] && x < obj.B['x'] && y < obj.A['y'])
	  return 't'; //top
	if (x > obj.D['x'] && x < obj.C['x'] && y > obj.D['y'])
	  return 'b'; //bottom
	return false;
  }
}

/* Функция удаления элемента */
el.del = function(){
  // если не выделен ни один объект, удаление не возможно
  if(!el.obj.s)return;
  // обнуление выделения объектов
  el.obj.s = false;
  var a = el.obj.obj;
  el.list[a.id] = new el.set(a.type, a.x, a.y, a.w, a.h, a.l, a.c, a.id, a.xSlide, a.ySlide, a);
  // удаление объекта элемента
  delete el.list[el.obj.id];
  // перерисовка холста для красоты и наглядности удаления
  redrawing(canv, ctx, el.list);
}

/* Функция перемещения элемента */
el.draggable = function(canvas, ctx){
  // курсор в режиме рисования (по умолчанию)
  canvas.style.cursor = 'default';
  // координаты элемента
  var x, y;
  // флаг перемещения
  var drag = false;
  // временное хранилище элемента
  this.obj = {};
  
  this.mousedown = function (ev) {
    // координаты в момент нажатия кнопки мыши
    x = f(ev, 'x');
    y = f(ev, 'y');
	// поиск элемента на холсте
	el.obj = el.get(x, y);
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
    el.obj.C = {'x': el.obj.x+el.obj.w, 'y': el.obj.y+el.obj.l};
    el.obj.D = {'x': el.obj.x, 'y': el.obj.y+el.obj.l};

	// перерисовка холста
	redrawing(canvas, ctx, el.list);
  };

  this.mouseup = function (ev) {
    // прекращение перемещения
    if (drag) drag = false;
	// перезапись параметров элемента
	el.list[el.obj.id] = new el.set(el.obj.type, el.obj.x, el.obj.y, el.obj.w, el.obj.h, el.obj.l, el.obj.c, el.obj.id, el.obj.xSlide, el.obj.ySlide, el.obj);
	// добавление элементов
	el.add(this.obj, ev);
  };
}
  
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
        eventListener();
		
        tool = new el.draggable(canv, ctx);
		
		el.list = [];
		el.obj;
		el.counter = 0;
		ctx.clearRect(0, 0, canv.width, canv.height);
		
		var r = new el.room();
	    el.list[el.counter] = new el.set(el.type.room, r.x, r.y, r.w, r.h, r.l, r.c, el.counter++, null);
	    redrawing(canv, ctx, el.list);
	  },
      'Отменить':function(){
	    wds.dialog('close');
	  }
	}
  });
}

/* Функция обработки событий на холсте
Обработка событий:
 - mousedown - нажатие кнопки на canvas
 - mousedraggable - движение на canvas
 - mouseup - отпускание кнопки 
*/
function eventListener(){
  var selector = '#planEditor';
  $(selector).on("mousedown", s);
  $(selector).on("mousemove", s);
  $(selector).on("mouseup", s);
  $('#delete').on("click", el.del); // Обработка нажатия кнопки "Удалить"
  function s(e){if(tool[e.type])tool[e.type](e)}
}

/* Функция перерисовки холста */
function redrawing(canvas, context, arrElem){
  if(!canvas || !context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i in arrElem){
	var e = arrElem[i];
	context.fillStyle = e.c; // цвет заливки
	context.fillRect(e.x, e.y, e.w, e.l);
	context.lineWidth = (e.type=='room')?2:1; // толщина линии обводки
	if (!e.s) context.strokeStyle = 'black'; // цвет обводки
	else context.strokeStyle = 'brown'; // цвет обводки
	context.strokeRect(e.x+1, e.y+1, e.w-2, e.l-2); 
  }
  context.drawImage(canvas, 0, 0);
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

/* Функция вычисления координаты мыши на холсте */
function f(ev, p){
  return (p=='x')?ev.pageX-canv.offsetLeft:ev.pageY-canv.offsetTop;
}

/* Функция модального окна выбора Двери или Проёма */
function createHoleOrDoor(posXY, side, obj){
  $('#modalWindow').dialog({
    title: 'Выберете элемент',
	position: posXY,
	height: 110,
	width: 250,
    buttons: {
	  'Проем':function(){
	    $('#modalWindow').dialog('close');
		form(posXY, '#wrapHoleForm', {side:side, obj:obj, element:new el.hole});
	  },
      'Дверь':function(){
	    $('#modalWindow').dialog('close');
		form(posXY, '#wrapDoorForm', {side:side, obj:obj, element:new el.door});
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
  var x, y, tmpW = els.w;
  
  jq.dialog({
    title: selector=='#wrapDoorForm'?'Новая дверь':selector=='#wrapHoleForm'?'Новый проем':'Новое помещение',
    position: posXY,
	modal: true,
    buttons: {
	  'Добавить':function(){
	    jq.dialog('close');
		
		/* Поворот элемента, если это дверь или проем */
		if(selector=='#wrapDoorForm'||'#wrapHoleForm')
		if(lp.side=='l'||lp.side=='r'){
		  els.w = els.l;
		  els.l = tmpW;
		} 
		/*Определение положения нового элемента */
		if (lp.side == 'l'){
		  x = A.x-els.w;
		  y = r(A.y, D.y-els.l);
		}else if (lp.side == 'r'){
		  x = B.x;
		  y = r(B.y, C.y-els.l);
		}else if (lp.side == 't'){
		  x = r(A.x, B.x-els.w);
		  y = B.y-els.l;
		}else if (lp.side == 'b'){
		  x = r(D.x, C.x-els.w);
		  y = D.y;
		}
		/* Изменение параметров перемещения относительно другого элемента */
		if (lp.side=='l'||lp.side=='r'){
		  // запрет перемещений по оси X
		  lp.xSlide = true;
		  lp.obj.xSlide = true;
		}else if (lp.side=='t'||lp.side=='b'){
		  // запрет перемещений по оси Y
		  lp.ySlide = true;
		  lp.obj.ySlide = true;
		}

		el.list[el.counter] = new el.set(els.type, x, y, els.w, els.h, els.l, els.c, el.counter++, lp.xSlide, lp.ySlide, lp.obj);
	    /* переменной выделения приравнивается false
		для исключения добавления элемента к не выделенному*/
		lp.obj.s = false;
		// перезапись элемента с новыми параметрами xSlide и ySlide
		el.list[lp.obj.id] = new el.set(lp.obj.type, lp.obj.x, lp.obj.y, lp.obj.w, lp.obj.h, lp.obj.l, lp.obj.c, lp.obj.id, lp.obj.xSlide, lp.obj.ySlide, lp.obj.obj);
		redrawing(canv, ctx, el.list);
	  },
      'Отменить':function(){
	    jq.dialog('close');
		return false;
	  }
	}
  });

  /* Функция определения случайного числа для задания координаты элемента*/
  function r(min, max){
	return ((min+max)/2)^0;
  }
}