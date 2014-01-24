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
  var dx = a.center.x - b.center.x,
      dy = a.center.y - b.center.y,
      dz = a.center.z - b.center.z;
  if (dx < 0.0) dx *= -1.0;
  if (dy < 0.0) dy *= -1.0;
  if (dz < 0.0) dz *= -1.0;
  
  return (dx <= (a.lx/2.0 + b.lx/2.0)) &&
		 (dy <= (a.ly/2.0 + b.ly/2.0)) &&
		 (dz <= (a.lz/2.0 + b.lz/2.0));
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
	lx:-1, ly:-1, lz:-1,
	info:0
  };
  
  new Overlap(a, b, c);
  for(var i in c){if(c[i]==-1)new Overlap(b, a, c);}
  for(var i in c){
    if(c[i]==-1) c.info=1; // Элементы не имеют общих плоскостей
	if(c.lx==0 || c.ly==0 || c.lz==0) c.info=2; // Расстояние между элементами равно 0
  }
  for(var k in arr){
	if(arr[k].id!=a.id&&arr[k].id!=b.id)
	if(isIntersects(c, arr[k]))
	  c.info=3; // Расстояние между элементами занято другим элементом
	  c.intersectsID = arr[k].id;
  }
  return c;
}

var Overlap = function(a,b,c){
  if(a.x<=b.x && b.x<=a.x1 && b.x1>=a.x1 || a.x>=b.x && b.x1<=a.x1 && b.x1>=a.x || a.x<=b.x && a.x1>=b.x1 || a.x>=b.x && a.x1<=b.x1){
    c.x = Math.max(b.x, a.x);
	c.lx = Math.pow(Math.pow(Math.min(b.x1, a.x1)-c.x,2),0.5);
  }else{
    if(a.x1<b.x){
 	  c.lx = Math.pow(Math.pow(b.x-a.x1,2),0.5);
	  c.x = a.x1;
	}else if(a.x<b.x1){
	  c.lx = Math.pow(Math.pow(a.x-b.x1,2),0.5);
	  c.x = b.x1;
	}else if(a.x1==b.x || a.x==b.x1){
	  c.lx = 0;
	  c.x = Math.max(a.x,b.x);
	}
  }
  
  if(a.y<=b.y && b.y<=a.y1 && b.y1>=a.y1 || a.y>=b.y && b.y1<=a.y1 && b.y1>=a.y || a.y<=b.y && a.y1>=b.y1 || a.y>=b.y && a.y1<=b.y1){
    c.y = Math.max(b.y, a.y);
	c.ly = Math.pow(Math.pow(Math.min(b.y1, a.y1)-c.y,2),0.5);
  }else{
    if(a.y1<b.y){
 	  c.ly = Math.pow(Math.pow(b.y-a.y1,2),0.5);
	  c.y = a.y1;
	}else if(a.y<b.y1){
	  c.ly = Math.pow(Math.pow(a.y-b.y1,2),0.5);
	  c.y = b.y1;
	}else if(a.y1==b.y || a.y==b.y1){
	  c.ly = 0;
	  c.y = Math.may(a.y,b.y);
	}
  }
  
  if(a.z<=b.z && b.z<=a.z1 && b.z1>=a.z1 || a.z>=b.z && b.z1<=a.z1 && b.z1>=a.z || a.z<=b.z && a.z1>=b.z1 || a.z>=b.z && a.z1<=b.z1){
    c.z = Math.max(b.z, a.z);
	c.lz = Math.pow(Math.pow(Math.min(b.z1, a.z1)-c.z,2),0.5);
  }else{
   if(a.z1<b.z){
 	  c.lz = Math.pow(Math.pow(b.z-a.z1,2),0.5);
	  c.z = a.z1;
	}else if(a.z<b.z1){
	  c.lz = Math.pow(Math.pow(a.z-b.z1,2),0.5);
	  c.z = b.z1;
	}else if(a.z1==b.z || a.z==b.z1){
	  c.lz = 0;
	  c.z = Math.maz(a.z,b.z);
	}
  }
}

var Building = function(){
  var list = new List;
};
Building.prototype.addSpace = function(id,type,x,y,z,lx,ly,lz){
  list.add(new Struct().set(id,type,x,y,z,lx,ly,lz));
}
Building.prototype.addDoor = function(a,b){
  var c = new Section().get(a,b,list.get());
  if(c.info == 0){
	c.id = list.length() + 1;
	c.type = 'door';
	list.add(new Struct().set(c.id,c.type,c.x,c.y,c.z,c.lx,c.ly,c.lz));
	c.res = '100';
  }else{
	c.res = '200';
  }
  return c;
}