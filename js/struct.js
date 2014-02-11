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

/**
 Функция 'isIntersects'.
 Определяет пересечение двух элементов.
 Разрешено касание элементов вершинами, гранями и плоскостями.
 На входе экземпляр класса 'Struct'.
 @param {Struct} a,b
 @returns false - нет пересечения, true - есть пересечение.
*/
var isIntersects = function (a, b){
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
  	    c['l'+m] = Math.pow(Math.pow(Math.min(b[m+'1'], a[m+'1'])-c[m],2.0),0.5);
  	  } else {
  	    if(a[m+'1']<b[m]){
  	      c.distance[m] = c['l'+m] = Math.pow(Math.pow(b[m]-a[m+'1'],2.0),0.5);
  	      c[m] = a[m+'1'];
  	    }else if(a[m]<b[m+'1']){
  	      c.distance[m] = c['l'+m] = Math.pow(Math.pow(a[m]-b[m+'1'],2.0),0.5);
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
	if (Building.ID == 0) {
		Building.list[Building.ID] = b;
		Building.ID++;
		return b;
	/* Если имеется хотя бы один, проверяется пересечение с существующими */
	/** TODO - Добавить генерацию ошибок */
	} else if (Building.ID > 0) {
		var isIntersect = false;
		for (var i in Building.list) {
			if (isIntersects(Building.list[i], b)) {
				isIntersect = true;
			}
		}
		if (isIntersect == false) {
			Building.list[Building.ID] = b;
			Building.ID++;
			return b;
		} else if (isIntersect == true) {
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
Building.prototype.addDoor = function(a, b, lx, ly, lz){	// добавление двери
	if (a.type == 'door' || b.type == 'door') {	// если элементы, между которыми нужно создать дверь, являются дверями
		return false;	// функция возвращает false
	}
	
	var c = new Section().get(a, b, Building.list);	// определение пространства между выбранными элементами
	lx = lx || c.lx;
	ly = ly || c.ly;
	lz = lz || c.lz;
	var q = new Struct().set(Building.ID, 'door', c.x, c.y, c.z, lx, ly, lz);	// создание нового элемента с типом дверь

	/** Проверка на отсутствие ошибок*/
	/*** TODO - Применить Error и try/catch **/
	if (c.info == 0) {
		if (q.lx <= c.lx && q.ly <= c.ly && q.lz <= c.lz) {	// проверка размеров нового элемента, 
															// чтоб они не превышали размеров свободного пространства 
															// между выделенными элементами
			Building.list[Building.ID] = q;	// добавление элемента в список
			Building.ID++
			return q;	// возврат нового элемента
		} else {
			throw 'Невозможно установить размеры двери';
		}
	} else if (c.info == 1) {
		throw 'Невозможно добавить дверь. Элементы не скрещиваются';
	} else if (c.info == 2) {
		throw 'Невозможно добавить дверь. Расстояние между элементами равно нулю';
	} else if (c.info == 3) {
		throw 'Невозможно добавить дверь. Между элементами находится другой элемент';
	}
}
Building.prototype.removeItem = function(id){	// удаление элемента по его идентификатору
	var i = Building.list[id];
	delete Building.list[id]; // удаляет
	return i;	// и возвращает удалённый элемент
}
Building.prototype.numberOfItems = function(){	// общее количество элементов 
	var counter = 0;
	for (var i in Building.list) {
		counter++;
	}
	return counter;
}
Building.prototype.getItem = function(idItem){	// получение списка элементов или одного по id
	return idItem === undefined ? Building.list : Building.list[idItem];
}
Building.prototype.updateItem = function (item) {	// обновление параметров элементов
	Building.list[item.id] = new Struct().set(item.id, item.type, item.x, item.y, item.z, item.lx, item.ly, item.lz);
	for (var i in Building.list) {
		if (item.id != i && isIntersects(item, Building.list[i])) {	// проверка, не создаёт ли помех элемент с новыми параметрами существующим
			return true; // возвращает true, если элемент создаёт помехи
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
	Входные параметры для setDxDz() - коэффициенты для изменения положения по осям.
	Метод update() возвращает параметры положения центра координатной системы.
*/
var Camera = function (obj) {
	this.zoom = obj.zoom;
	this.dx = obj.dx;
	this.dz = obj.dz;

	this.l = obj.left;	// левая граница камеры
	this.r = obj.right;	// правая граница камеры
	this.b = obj.bottom;	// нижняя граница камеры
	this.t = obj.top;	// верхняя граница камеры
};
Camera.prototype.setZoom = function (a) {	// установка масштабирования 
	this.zoom = Math.max(Math.min(this.zoom * a, 40.0), 1.0);
};
Camera.prototype.getZoom = function (a) {	// получение текущего масштаба
	return this.zoom;
};
Camera.prototype.setDxDz = function (a, b) {	// установка смещения по осям
	this.dx -= a;
	this.dz -= b;
};
Camera.prototype.get = function () {	// получение параметров камеры
	return{
		l: this.l*this.zoom + this.dx,
		r: this.r*this.zoom + this.dx,
		b: this.b*this.zoom + this.dz,
		t: this.t*this.zoom + this.dz
	}
};

/** Выделение объектов */
var Select = function () {
	Select.counter = 0;	// счётчик выделенных объектов
	Select.list = {};	// список выделенных объектов
};
Select.prototype.set = function (idItem) {	// установка выделения
	Select.list[Select.counter] = {id: idItem, flag: true};	// создание элемента в списке с идентификатором элемента
	Select.counter++;
};
Select.prototype.get = function (idItem) {	// получение данных о выделенных элементах или элемента по id
	if (idItem === undefined) {	// если идентификатор элемента не указан
		return {
			length: Select.counter,	// выводится длина списка
			list: Select.list	// список элементов
		};
	} else {
		return Select.list[idItem].id;	// иначе функция возвращает идентификатор выделенного элемента
	}
};
Select.prototype.setColor = function (color) {	// установка цвета выделения
	if (color == 'error') {	// если указано ключевое слово error
		this.color = [1.0, 0.0, 0.0, 1.0];	// цвет выделения - красный
	} else if (color == 'default' || color === undefined) {	// если указан default или не указан
		this.color = [0.0, 1.0, 1.0, 1.0];	// цвет выделения бирюзовый
	} else {
		this.color = color;	// иначе цвет равен указанному в RGBA виде
	}
};
Select.prototype.getColor = function () {	// получение цвета
	return this.color;	// функция возвращает текущий цвет
};
Select.prototype.reset = function () {	// сброс выделения
	for (var i in Select.list) {
		delete Select.list[i];	// удаляются все элементы списка
	}
	Select.counter = 0;	// и обнуляется счётчик объектов
};

/** Прослушивание нажатий клавиш */
var Keyboard = function () {
	window.addEventListener('keydown', function (e) {	// определение нажатие клавиши
		Keyboard.key = e.keyCode;	// сохранение кода нажатой клавиши
	}, false);
	window.addEventListener('keyup', function (e) {	// определения поднятия клавиши
		Keyboard.key = undefined;	// удаление ранее записанных данных
	}, false);
};
Keyboard.prototype.getKeyCode = function () {	// получение кода клавиши
	return Keyboard.key; // возвращает код клавиши или undefined
};

/**	Хранение/копирование элемента */
var OldItem = function () {
	this.oldItem = {};	// новый элемент
};
OldItem.prototype.setOldItem = function (item) {	// установка элемента
	for (var i in item) {
		this.oldItem[i] = item[i];	// перезапись всех свойств входящего элемента в новый.
	}
};
OldItem.prototype.getOldItem =  function () {	// получение элемента
	return this.oldItem;
};