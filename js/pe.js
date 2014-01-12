var ProjectName;
var Canvas;
var Ctx;
var tool;
var list = {}; // список
list.elements = []; // список элементов
var count = list.elements.length; // счетчик элементов

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
	list.elements.push(new Element(elem, r.x, r.y, r.w, r.h, r.c, count));
	count++;
	update(Canvas, Ctx, list.elements);
  });
  $('#door').click(function() {
    elem = 'door';
	var d = new Door();
	list.elements.push(new Element(elem, d.x, d.y, d.w, d.h, d.c, count));
	count++;
	update(Canvas, Ctx, list.elements);
  });
  $('#hole').click(function() {
    elem = 'hole';
	var h = new Hole();
	list.elements.push(new Element(elem, h.x, h.y, h.w, h.h, h.c, count));
	count++;
	update(Canvas, Ctx, list.elements);
  });
}

/* Функция параметров комнаты*/
function Room (){
  this.x = 50;
  this.y = 100;
  this.w = 50;
  this.h = 50;
  this.c = "yellow";
  function number() {
    confirm("Введите номер комнаты");
  }
}
/* Функция параметров двери*/
function Door (){
  this.x = 20;
  this.y = 20;
  this.w = 30;
  this.h = 10;
  this.c = "black";
}
/* Функция параметров проема*/
function Hole (){
  this.x = 30;
  this.y = 10;
  this.w = 50;
  this.h = 6;
  this.c = "green";
}

/* Функция обновления холста*/
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
function Element(type, x, y, w, h, color, count){
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

  // координаты квадрата
  this.A = {'x': this.x, 'y': this.y};
  this.B = {'x': this.x+this.w, 'y': this.y};
  this.C = {'x': this.x+this.w, 'y': this.y+this.h};
  this.D = {'x':this.x, 'y': this.y+this.h};
  
  this.point = function(P1, P2, mouseX, mouseY) {
	// коэффициенты уравнения прямой
	var AA = Math.round(P2['y'] - P1['y']);
	var BB = Math.round(P1['x'] - P2['x']);
	var CC = Math.round(-P1['x']*(P2['y'] - P1['y']) + P1['y']*(P2['x'] - P1['x']));
	// расстояние от точки до прямой
	return Math.round(Math.abs((AA*mouseX + BB*mouseY + CC))/(Math.sqrt(Math.pow(AA, 2) + Math.pow(BB, 2))));
  }
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

/* Функция перемещения элемента*/
function move(c, ctx){
  // курсор в режиме рисования (по умолчанию)
  c.style.cursor = 'default';
  // координаты элемента
  var x, y;
  // флаг перемещения
  var drag = false;
  // объявление объекта
  var obj;
  
  // функция вычесления координаты мыши на холсте
  var f = function(ev, param){
    switch (param){
	  case 'x':
        return ev.pageX - c.offsetLeft;
	    break;
	  case 'y':
	    return ev.pageY - c.offsetTop;
	    break;
	}
  }
  
  this.mousedown = function (ev) {
    // координаты в момент нажатия ЛКМ
    x = f(ev, 'x');
    y = f(ev, 'y');
	// поиск элемента на холсте
	obj = findElemenet(x, y);
	if (!obj) return;
	// положение мышки на объкте
	obj.offsetX = x - obj.x;
	obj.offsetY = y - obj.y;
	// старт перемещения
	if (!drag) drag = true;
	// выделение элемента
	obj.s = true;
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
    obj.x = x - obj.offsetX;
    obj.y = y - obj.offsetY;
	// перерисовка канваса 
	update(Canvas, Ctx, list.elements);
  };

  this.mouseup = function (ev) {
    // прекращение перемещения
    if (drag) drag = false;
	// перезапись параметров элемента
	list.elements[obj.id] = new Element(obj.type, obj.x, obj.y, obj.w, obj.h, obj.c, obj.id);
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

/* Функция изменения параметров элемента
*/

/* Функция определения заползания (перекрывания) элементов друг на друга*/
function overlap(){
}

/* Функция выделения элемента*/
function selectElem(e, flag) {
}