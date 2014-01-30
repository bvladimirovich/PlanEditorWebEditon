/**
 Класс 'Struct'.
 Описывает структуру элемента.
 @param {number} id, x,y,z,lx,ly,lz
 @param {string} type
 @returns экземпляр класса 'Struct'
*/
var Struct = function () {}
Struct.prototype.set = function(id,type,x,y,z,lx,ly,lz){
	this.id = id;
	this.type = type;
	this.x = x; 
	this.y = y; 
	this.z = z;
	this.lx = lx;
	this.ly = ly;
	this.lz = lz;
	return {
		id: this.id,
		type: this.type,
		x: this.x,
		y: this.y,
		z: this.z,
		lx: this.lx,
		ly: this.ly,
		lz: this.lz
	}
}
Struct.prototype.setPosition = function (x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

/**
 Функция 'isIntersects'.
 Определяет пересечение двух элементов.
 Разрешено касание элементов вершинами, гранями и плоскостями.
 На входе экземпляр класса 'Struct'.
 @param {Struct} a,b
 @returns false - нет пересечения, true - есть пересечение.
*/
var isIntersects = function (a,b){
  /* Координаты центра входящих элементов */
  a.center = {
    x: a.x + a.lx/2.0,
	y: a.y + a.ly/2.0, 
	z: a.z + a.lz/2.0
  };
  b.center = {
    x: b.x + b.lx/2.0,
	y: b.y + b.ly/2.0, 
	z: b.z + b.lz/2.0
  };
  /* Расстояние между центрами элементов */
  var dx = a.center.x - b.center.x,
      dy = a.center.y - b.center.y,
      dz = a.center.z - b.center.z;
  if (dx < 0.0) dx *= -1.0;
  if (dy < 0.0) dy *= -1.0;
  if (dz < 0.0) dz *= -1.0;
  
  return (dx < (a.lx/2.0 + b.lx/2.0)) &&
		 (dy < (a.ly/2.0 + b.ly/2.0)) &&
		 (dz < (a.lz/2.0 + b.lz/2.0));
}

/**
 Класс 'Section'.
 Определяет общую часть скрещиваемых объектов.
 @param {Struct} a,b
 @param {array} arr - массив всех элементов
 @returns c - объект, по содержанию похож на экземпляр 'Struct'
*/
var Section = function(){};
/* Поиск плоскости перекрытия элементов */
Section.prototype.get = function(a, b, arr){
  if(isIntersects(a, b)) return;
  /* Дальняя координата */
  a.x1 = a.x + a.lx;
  a.z1 = a.z + a.lz;
  a.y1 = a.y + a.ly;
  b.x1 = b.x + b.lx;
  b.z1 = b.z + b.lz;
  b.y1 = b.y + b.ly;
  /* default value */
  var c = {
    x:-1, y:-1, z:-1,
	lx:-1, ly:-1, lz:-1,
	info:0
  };
  /* Определение координат и размеров общей зоны */
  overlap(a, b, c);
  for (var i in c) {
    if(c[i]==-1) overlap(b, a, c);
  }
  for (var i in c) {
    /* Элементы не скрещиваются */
    if(c[i]==-1) c.info=1;
	/* Расстояние между элементами равно нулю */
	if(c.lx==0 || c.ly==0 || c.lz==0) c.info=2;
  }
  for (var k in arr) {
	if (arr[k].id!=a.id&&arr[k].id!=b.id)
	if (isIntersects(c, arr[k])) {
	  /* Расстояние между элементами занято другим элементом */
	  c.info=3;
	  /* Возвращается идентификатор инородного элемента */
	  c.intersectsID = arr[k].id;
	}
  }
  
  /**
   Функция определения общего пространства между двумя элементами
   @param {Struct} a,b
   @returns {Object} c - с параметрами общей зоны
  */
  function overlap(a,b,c){
    /* Расстояние между элементами */
    c.distance = {
      x: 0, y:0, z:0
    };
    for (var m in c.distance) {
  	  if ( (a[m]<=b[m] && b[m]<=a[m+'1'] && b[m+'1']>=a[m+'1']) || 
  	    (a[m]>=b[m] && b[m+'1']<=a[m+'1'] && b[m+'1']>=a[m]) || 
  	    (a[m]<=b[m] && a[m+'1']>=b[m+'1']) || 
  	    (a[m]>=b[m] && a[m+'1']<=b[m+'1']) ) {
  	    c[m] = Math.max(b[m], a[m]);
  	    c['l'+m] = Math.pow(Math.pow(Math.min(b[m+'1'], a[m+'1'])-c[m],2),0.5);
  	  } else {
  	    if(a[m+'1']<b[m]){
  	      c.distance[m] = c['l'+m] = Math.pow(Math.pow(b[m]-a[m+'1'],2),0.5);
  	      c[m] = a[m+'1'];
  	    }else if(a[m]<b[m+'1']){
  	      c.distance[m] = c['l'+m] = Math.pow(Math.pow(a[m]-b[m+'1'],2),0.5);
  	      c[m] = b[m+'1'];
  	    }else if(a[m+'1']==b[m] || a[m]==b[m+'1']){
  	      c.distance[m] = c['l'+m] = 0;
  	      c[m] = Math.max(a[m],b[m]);
  	    }
  	  }
    }
  }
  
  return c;
}

/**
 Класс 'Building'.
 Создаёт экземпляр здания
 в который можно добавлять
 комнаты и двери, 
 изменять параметры выбранных элементов,
 удалять и производить подсчёт элементов одного типа
*/
var Building = function(){
  Building.ID = 0;
  /* Список всех элементов */
  Building.list = {};
}
/**
 Метод добавления комнаты.
 @param {number} x,y,z,lx,ly,lz - координаты и размеры комнаты
 @returns экземпляр класса 'Struct'
*/
Building.prototype.addRoom = function (x,y,z,lx,ly,lz) {
  var b = new Struct().set(Building.ID,'room',x,y,z,lx,ly,lz);
  /* Если элементов не существует, добавляется первый элемент */
  if (Building.ID==0) {
	Building.list[Building.ID] = b;
	Building.ID++;
	return b;
  /* Если имеется хотя бы один, проверяется пересечение с существующими */
  /** TODO - Добавить генерацию ошибок */
  } else if (Building.ID>0) {
	var isIntersect = false;
	for (var i in Building.list) {
	  if(isIntersects(Building.list[i], b)) isIntersect = true;
	}
	if(isIntersect == false){
	  Building.list[Building.ID] = b;
	  Building.ID++;
	  return b;
	} else if (isIntersect == true){
	  throw new Error('Невозможно добавить элемент с такими параметрами');
	}
  }
  
  
}

/**
 Метод добавления двери между двумя комнатами.
 @param {Struct} a,b - экземпляры класса 'Struct'
 @param {number} lx,ly,lz - размеры комнаты
 @returns экземпляр класса 'Struct'
*/
Building.prototype.addDoor = function(a,b, lx, ly, lz){
  var c = new Section().get(a,b,Building.list),
      q = new Struct().set(Building.ID,'door',c.x,c.y,c.z,lx,ly,lz);
  /* Идентификаторы элементов между которыми создана дверь */
  q.link = {};
  /* Предел перемещения двери по осям */
  q.limit = {};
  /* Расстояние между объектами */
  q.distance = {};
  /** Проверка на отсутствие ошибок*/
  /*** TODO - Применить класс Error и try/catch **/
  if(c.info == 0){
	q.link.a = a.id;
	q.link.b = b.id;
	if(q.lx<=c.lx && q.ly<=c.ly&&q.lz<=c.lz){
      q.limit.lx = c.lx;
	  q.limit.ly = c.ly;
	  q.limit.lz = c.lz;
	  q.distance.x = c.distance.x;
	  q.distance.y = c.distance.y;
	  q.distance.z = c.distance.z;
	  Building.list[Building.ID] = q;
	  Building.ID++
      return q;
	}else {
	  throw new Error('Невозможно установить размеры двери');
	}
  } else if (c.info == 1) {
    throw new Error('Невозможно добавить дверь. Элементы не скрещиваются');
  } else if (c.info == 2) {
    throw new Error('Невозможно добавить дверь. Расстояние между элементами равно нулю');
  } else if (c.info == 3) {
    throw new Error('Невозможно добавить дверь. Между элементами находится другой элемент');
  }
}
/**
 Метод модификации параметров элемента.
 Заменяется предыдущий экземпляр 'Struct' с идентификатором id
 новым экземпляром 'Struct' с таким же id, но новыми параметрами
 @param {number} id - идентификатор объекта
*/
Building.prototype.modify = function(id){
  var c = Building.list[id],
      q = {},
	  isIntersect = false;
  /** TODO - Применить this вместо return */
  return{
    /* Свойство изменения размера */
	/** TODO - Добавить обработку исключений и вывод сообщений */
    size: function(lx,ly,lz){
	  q = new Struct().set(id,c.type,c.x,c.y,c.z,lx,ly,lz);
	  for(var i in Building.list){
	    if(i==id)continue;
	    if(isIntersects(q, Building.list[i])) isIntersect = true;
	  }
	  if(isIntersect == false){
	    Building.list[id] = q;
		return q;
	  }else{
	    throw new Error('Невозможно изменить размеры элемента');
	  }
	},
	/* Свойство изменения положения */
	position: function(x,y,z){
	  q = new Struct().set(id,c.type,x,y,z,c.lx,c.ly,c.lz);
	  // q.distance = {};
	  // c.x1 = c.x + c.lx;
      // c.z1 = c.z + c.lz;
  	  // c.y1 = c.y + c.ly;
	  // for(var i in c.distance){
		// q.distance[i] = c.distance[i];
	    // if(c.distance[i] != 0) q[i] = c[i];
	    // if(q[i]<=c[i]||q[i]+q['l'+i]<=c[i]+c['l'+i]) q[i]=c[i];
	  // }
	  Building.list[id] = q;
	  return q;
	},
	/* Свойство изменения типа */
	type: function(type){
	  Building.list[id] = new Struct().set(id,type,c.x,c.y,c.z,c.lx,c.ly,c.lz);
	  return Building.list[id];
	}
  }
}
/**
 Метод удаления элемента.
 @param {number} id - идентификатор объекта
 @returns удалённый объект
*/
Building.prototype.remove = function(id){
  var i = Building.list[id];
  delete Building.list[id];
  return i;
}
/**
 Метод возвращает количество существующих элементов
*/
Building.prototype.length = function(){
  var counter = 0;
  for(var i in Building.list) counter++;
  return counter;
}
/**
 Метод возвращает элемент по идентификатору или список всех элементов.
*/
Building.prototype.getItem = function(){
  var b = Building.list;
  if(arguments.length == 0) return b;
  else return b[arguments[0]];
}
/**
 Метод подсчитывает количество элементов определённого типа
*/
Building.prototype.numberOf = function(type){
  var counter = 0;
  for(var i in Building.list){
    if(Building.list[i].type == type) counter++;
  }
  return counter;
}
Building.prototype.set = function (id) {
	return {
		position: function (x, z) {
			var item = Building.list[id];
			Building.list[id] = new Struct().set(id, item.type, x, item.y, z, item.lx, item.ly, item.lz);
		}
	}
}


/**
	Класс Camera.
	Устанавливает положение камеры.
	@param {number} zoom - приближение/отдаление,
					dx, dy - перемещение центра координатной оси,
					l, r, b, t - центр координатной системы.
	Входной параметр для setZoom() - коэффициент изменения приближения/отдаления.
	Входные параметры для setDxDy() - коэффициенты для изменения положения по осям.
	Метод update() возвращает параметры положения центра координатной системы.
*/
var Camera = function (obj) {
	this.zoom = obj.zoom;
	this.dx = obj.dx;
	this.dy = obj.dy;

	this.l = obj.left;
	this.r = obj.right;
	this.b = obj.bottom;
	this.t = obj.top;
}
Camera.prototype.setZoom = function (a) {
	this.zoom = Math.max(Math.min(this.zoom * a, 30.0), 1.0);
}
Camera.prototype.setDxDy = function (a, b) {
	this.dx -= a;
	this.dy -= b;
}
Camera.prototype.get = function () {
	return{
		l: this.l*this.zoom + this.dx,
		r: this.r*this.zoom + this.dx,
		b: this.b*this.zoom + this.dy,
		t: this.t*this.zoom + this.dy
	}
}