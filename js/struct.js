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

var Section = function(){};
/* Поиск плоскости перекрытия элементов */
Section.prototype.get = function(a, b, arr){
  if(isIntersects(a, b)) return;
  a.x1 = a.x + a.lx;
  a.z1 = a.z + a.lz;
  a.y1 = a.y + a.ly;
  b.x1 = b.x + b.lx;
  b.z1 = b.z + b.lz;
  b.y1 = b.y + b.ly;
  var c = { // default value
    x:-1, y:-1, z:-1,
	lx:-1, ly:-1, lz:-1
  };
  var lx = Math.abs(Math.abs(a.x-a.x1) - Math.abs(b.x-b.x1)),
      ly = Math.abs(Math.abs(a.y-a.y1) - Math.abs(b.y-b.y1)),
	  lz = Math.abs(Math.abs(a.z-a.z1) - Math.abs(b.z-b.z1));

  var h = 0;
  // проекция на ось X
  if(b.x>=a.x && b.x<=a.x1 || b.x1>=a.x && b.x1<=a.x1){
	c.lx = lx==0?Math.abs(a.x-a.x1):Math.abs(a.x-a.x1)-lx;
	c.x = Math.max(a.x, b.x);
  }else{
	if(b.x>=a.x1) c.x = a.x1;
	else if(a.x>=b.x1) c.x = b.x1;
    c.lx = distance(a,b,'x');
	console.log('c.lx '+c.lx);
	h++;
  }
  // проекция на ось Y
  if(b.y>=a.y && b.y<=a.y1 || b.y1>=a.y && b.y1<=a.y1){
    c.ly = ly==0?Math.abs(a.y-a.y1):Math.abs(a.y-a.y1)-ly;
	c.y = Math.max(a.y, b.y);
  }else{
	if(b.y>=a.y1) c.y = a.y1;
	else if(a.y>=b.y1) c.y = b.y1;
    c.ly = distance(a,b,'y');
	console.log('c.ly '+c.ly);
	h++;
  }
  // проекция на ось Z
  if(b.z>=a.z && b.z<=a.z1 || b.z1>=a.z && b.z1<=a.z1){
    c.lz = lz==0?Math.abs(a.z-a.z1):Math.abs(a.z-a.z1)-lz;
	c.z = Math.max(a.z, b.z);
  }else{
	if(b.z>=a.z1) c.z = a.z1;
	else if(a.z>=b.z1) c.z = b.z1;
    c.lz = distance(a,b,'z');
	console.log('c.lz '+c.lz);
	h++;
  }
  if(h==0)c='Элементы прикасаются';
  if(h>1)c='Элементы не скрещиваются';
  if(c.lx>=1 || c.ly>=1 || c.lz>=1)
    for(var i in arr) 
	if(isIntersects(c, arr[i]))c=arr[i];
	else if(isIntersects(arr[i], c))c=arr[i];
  return c;
}

var distance = function(a,b, axis){
  a[axis+'1'] = a[axis] + a['l'+axis];
  b[axis+'1'] = b[axis] + b['l'+axis];
  return Math.sqrt(Math.pow(Math.max(a[axis], b[axis])-Math.min(a[axis+'1'], b[axis+'1']),2));
}
