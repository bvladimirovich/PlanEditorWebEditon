var Element = {};
Element.Entity = function(){}
Element.Entity.prototype.set = function(args){
  this.type = args.type;  
  this.x = args.x;
  this.y = args.y;
  this.z = args.z;
  this.color = args.color;
  this.w = args._width;
  this.l = args._length;
  this.h = args._height;
}
Element.Entity.prototype.get = function(){
  return{
    type: this.type,
    x: this.x,
    y: this.y,
    z: this.z,
    c: this.color,
    w: this.w,
    l: this.l,
    h: this.h,
	toString: function(){
	  return 'type: '+this.type
      +', coordinates: x-'+this.x+' y-'+this.y+' x-'+this.z
      +', color: '+this.color
      +', size: w-'+this.w+' l-'+this.l+' h-'+this.h
	}
  }
}

Element.UI = function(){}
Element.UI.prototype.find = function(x, y, list){
    for (var i in list){
    var e = list[i];
    if (x > e.A['x'] && x < e.C['x'])
    if (y > e.A['y'] && y < e.C['y'])
	  return e;
  }
  return false;
}
Element.UI.prototype.add = function(obj, ev){
  if (!obj) return;
  if (!obj.s) return;
  var posXY = [f(ev, 'x'), f(ev, 'y')], side = s(posXY);
  if (obj.type == el.type.room){ // будут добавляться только двери и проёмы
	if(side)createHoleOrDoor(posXY, side, obj);
  }else { // будут добавляться только комнаты
	if (side=='l'||side=='r'){
	  if (obj.l > obj.w) form(posXY, '#wrapRoomForm', {side:side, obj:obj, element:$r});
	}else if (side=='t'||side=='b'){
	  if (obj.l < obj.w) form(posXY, '#wrapRoomForm', {side:side, obj:obj, element:$r});
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
Element.UI.prototype.remove = function(obj, canvas, ctx, list){
  // если не выделен ни один объект, удаление не возможно
  if(!obj.s)return;
  // обнуление выделения объектов
  obj.s = false;
  // удаление объекта элемента
  delete list[obj.id];
  // перерисовка холста для красоты и наглядности удаления
  redrawing(canvas, ctx, list);
}
Element.UI.prototype.draggable = function(obj, canvas, ctx, list){
  canvas.style.cursor = 'default'; // курсор в режиме рисования (по умолчанию)
  var x, y; // координаты элемента
  var drag = false; // флаг перемещения
  this.obj = {}; // временное хранилище элемента
  
  this.mousedown = function (ev) {
    // координаты в момент нажатия кнопки мыши
    x = f(ev, 'x');
    y = f(ev, 'y');
	// поиск элемента на холсте
	el.obj = el.get(x, y);
	if (el.obj){
	  // положение мышки на объекте
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
	  // для передачи её в функцию создания элемента в выбранном направлении
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

Element.List = function(){var list = {}; return list}
Element.List.prototype.add = function(object, index){
  var list = {};
  list[index] = object;
  this.list = list;
}
Element.List.prototype.getIndex = function(index){
  var e = this.list;
  if (arguments.length == 1) return e[index];
  else return e;
}
Element.List.prototype.getAll = function(){
  return this.list;
}

Element.Properties = function(){}
Element.Properties.prototype.setProperties = function(type, x, y, z, width, height, length, color, counter, xSlide, ySlide, obj){
  // тип элемента
  this.type = type;
  // координаты верхнего левого угла
  this.x = x;
  this.y = y;
  this.z = z;
  // размеры элемента
  this.w = width;
  this.l = length;
  this.h = color;
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
Element.Properties.prototype.getProperties = function(){
  return{
    type: this.type,
    x: this.x,
    y: this.y,
    z: this.z,
    w: this.width,
    l: this.lenght,
    h: this.height,
    c: this.color,
    id: this.counter,
    s: this.s,
    xSlide: this.xSlide,
    ySlide: this.ySlide,
    A: {'x': this.x, 'y': this.y},
    B: {'x': this.x+this.w, 'y': this.y},
    C: {'x': this.x+this.w, 'y': this.y+this.l},
    D: {'x': this.x, 'y': this.y+this.l},
    obj:this.obj
  }
}
