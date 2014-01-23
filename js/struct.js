var Struct = function(){}
Struct.prototype.set = function(id,type,x,y,z,lx,ly,lz){
  return{
    id: id,
	type: type,
	x: x,
	y: y,
	z: z,
	lx: lx,
	ly: ly,
	lz: lz
  }
}

var List = function(){
  List.counter=0;
  List.items={};
}
List.prototype.add = function(/*element*/e){
    var bool = true;
    for(var i in List.items){
	  if(isIntersects(e, List.items[i])) {
	    bool=false;
		console.log('1 MSG: элемент '+e.type+' не добавлен');
	  }else if(isIntersects(List.items[i], e)){
	    bool=false;
		console.log('2 MSG: элемент '+e.type+' не добавлен');
	  }else bool=true;
    }
	if(bool){
	  List.items[List.counter] = e;
      List.counter++;
	}
}
List.prototype.get = function(/*index*/){
  if(arguments.length > 1) throw new Error('Количество индексов не должно превышать 1');
  if(arguments.length == 1){
    if(arguments[0]>List.counter) throw new Error('Элемент с таким индексом не существует');
	return List.items[arguments[0]];
  }else return List.items;
}
List.prototype.remove = function(){
  if(arguments.length > 1) throw new Error('Количество индексов не должно превышать 1');
  if(arguments.length == 1) delete List.items[arguments[0]];
  else List.items={};
}
List.prototype.replace = function(item1, item2){
  List.items[item1.id] = item2;
}
List.prototype.length = function(){
  return List.counter;
}

var isIntersects = function (a, /*New element*/b){
  a.x1 = a.x + a.lx;
  a.z1 = a.z + a.lz;
  a.y1 = a.y + a.ly;
  b.x1 = b.x + b.lx;
  b.z1 = b.z + b.lz;
  b.y1 = b.y + b.ly;
  return !(b.x1<=a.x || b.x>=a.x1 || b.z1<=a.z || b.z>=a.z1 || b.y>=a.y1 || b.y1<=a.y);
}

var Section = function(arr){Section.arr = arr};
/* Поиск плоскости перекрытия элементов */
Section.prototype.get = function(a, b){
  if(isIntersects(a, b)) return;
  a.x1 = a.x + a.lx;
  a.z1 = a.z + a.lz;
  a.y1 = a.y + a.ly;
  b.x1 = b.x + b.lx;
  b.z1 = b.z + b.lz;
  b.y1 = b.y + b.ly;
  var c = { // default value
    x:0, y:0, z:0,
	lx:0, ly:0, lz:0
  };
  var l = {}; // расстояние между элементами
  var lx = Math.abs(Math.abs(a.x-a.x1) - Math.abs(b.x-b.x1)),
      ly = Math.abs(Math.abs(a.y-a.y1) - Math.abs(b.y-b.y1)),
	  lz = Math.abs(Math.abs(a.z-a.z1) - Math.abs(b.z-b.z1));
  // проекция на ось X
  if(b.x>=a.x && b.x<=a.x1 || b.x1>=a.x && b.x1<=a.x1){
	c.lx = lx==0?Math.abs(a.x-a.x1):Math.abs(a.x-a.x1)-lx;
	if(b.x>=a.x && b.x<=a.x1) c.x = b.x;
	else if(b.x1>=a.x && b.x<=a.x) c.x = a.x;
  }else{
    l.x = a.x>b.x1?Math.pow(Math.pow(a.x-b.x1,2),0.5)-(a.lx+b.lx):Math.pow(Math.pow(b.x-a.x1,2),0.5)-(a.lx+b.lx);
  }
  // проекция на ось Y
  if(b.y>=a.y && b.y<=a.y1 || b.y1>=a.y && b.y1<=a.y1){
    c.ly = ly==0?Math.abs(a.y-a.y1):Math.abs(a.y-a.y1)-ly;
	if(b.y>=a.y && b.y<=a.y1) c.y = b.y;
	else if(b.y1>=a.y && b.y<=a.y) c.y = a.y;
  }else{
    l.y = a.y>b.y1?Math.pow(Math.pow(a.y-b.y1,2),0.5)-(a.ly+b.ly):Math.pow(Math.pow(b.y-a.y1,2),0.5)-(a.ly+b.ly);
  }
  // проекция на ось Z
  if(b.z>=a.z && b.z<=a.z1 || b.z1>=a.z && b.z1<=a.z1){
    c.lz = lz==0?Math.abs(a.z-a.z1):Math.abs(a.z-a.z1)-lz;
	if(b.z>=a.z && b.z<=a.z1) c.z = b.z;
	else if(b.z1>=a.z && b.z<=a.z) c.z = a.z;
  }else{
    l.z = a.z>b.z1?Math.pow(Math.pow(a.z-b.z1,2),0.5)-(a.lz+b.lz):Math.pow(Math.pow(b.z-a.z1,2),0.5)-(a.lz+b.lz);
  }
  
  return {c: c, l:l};
}
