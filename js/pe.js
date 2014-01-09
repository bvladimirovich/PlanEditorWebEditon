﻿var ProjectName;
var Canvas;
var Ctx;
var tool;
var list = {}; // список
list.elements = []; // список элементов
var count = list.elements; // счетчик элементов

/* Функция инициализации канваса
Дожидается готовности страницы и создает экземпляр канваса
Включает в работу функции:
 - запрет выделение текста на странице
 - обработка событий на канвас
*/
function init(){
  
}

function select(event){if(tool[event.type])tool[event.type](event);}

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

/* Функция вывода диалога при создании нового проекта
Так же включает функцию init()
*/
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
	addElem();
	
    tool = new move(Canvas);
  }
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

/* Функция параметров комнаты
*/
function Room (){
  this.x = 10;
  this.y = 10;
  this.w = 50;
  this.h = 50;
  this.c = "yellow";
  function number() {
    confirm("Введите номер комнаты");
  }
}
/* Функция параметров двери
*/
function Door (){
  this.x = 20;
  this.y = 20;
  this.w = 30;
  this.h = 10;
  this.c = "black";
}
/* Функция параметров проема
*/
function Hole (){
  this.x = 30;
  this.y = 10;
  this.w = 50;
  this.h = 6;
  this.c = "green";
}

/* Функция обновления холста
*/
function update(canvas, context, arrElem){
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i in arrElem){
	var e = arrElem[i];
	context.fillStyle = e.c; //Цвет заливки
	context.fillRect(e.x, e.x, e.w, e.h);
  }
  context.drawImage(canvas, 0, 0);
}

/* Свойства элемента
*/
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
  
  // смещение елемента при перемещении
  this.offsetX = 0;
  this.offsetY = 0;
	  
	  //коэффициенты уравнения прямой
	  //this.A = Math.round(this.y2 - this.y1);
	  //this.B = Math.round(this.x1 - this.x2);
	  //this.C = Math.round(-this.x1*(this.y2 - this.y1) + this.y1*(this.x2 - this.x1));
	  //минимальное расстояние от точки до прямой
	  //this.normal_eq = function(mouseX, mouseY){
	    //return Math.round(Math.abs((this.A*mouseX + this.B*mouseY + this.C))/
		  //(Math.sqrt(Math.pow(this.A, 2) + Math.pow(this.B, 2))));
	  //};
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

/* Функция перемещения элемента
*/
function move(Draw){
  var lineArr = [];
  //курсор в режиме рисования
  Draw.style.cursor = 'default';
  //создание контекста канваса Draw
  var context = Draw.getContext('2d');
  //координаты начала и конца линии
  var x1, x2; 
  var y1, y2;
  //флаг начала рисования
  var started = false;
  //идентификатор (номер) линии
  var id = lineArr.length;
  //смещение холста
  var top = Draw.offsetTop;
  var left = Draw.offsetLeft;
  
  this.mousedown = function (ev) {
    started = true;
    x1 = ev.pageX - left;
    y1 = ev.pageY - top;
  };

  this.mousemove = function (ev) {
    if (!started) return;
	x2 = ev.pageX - left;
	y2 = ev.pageY - top;
  };

  this.mouseup = function (ev) {
    if (!started) return;
    this.mousemove(ev);
    started = false;
  };
}

/* Функция поиска элемента на холсте
*/

/* Функция изменения параметров элемента
*/