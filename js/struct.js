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
  
  return (dx < (a.lx/2.0 + b.lx/2.0)) &&
		 (dy < (a.ly/2.0 + b.ly/2.0)) &&
		 (dz < (a.lz/2.0 + b.lz/2.0));
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
	if(isIntersects(c, arr[k])){
	  c.info=3; // Расстояние между элементами занято другим элементом
	  c.intersectsID = arr[k].id;
	}
  }
  return c;
}

var Overlap = function(a,b,c){
  c.distance = {
    x: 0, y:0, z:0
  }; // расстояние между элементами
  if(a.x<=b.x && b.x<=a.x1 && b.x1>=a.x1 || a.x>=b.x && b.x1<=a.x1 && b.x1>=a.x || a.x<=b.x && a.x1>=b.x1 || a.x>=b.x && a.x1<=b.x1){
    c.x = Math.max(b.x, a.x);
	c.lx = Math.pow(Math.pow(Math.min(b.x1, a.x1)-c.x,2),0.5);
  }else{
    if(a.x1<b.x){
 	  c.distance.x = c.lx = Math.pow(Math.pow(b.x-a.x1,2),0.5);
	  c.x = a.x1;
	}else if(a.x<b.x1){
	  c.distance.x = c.lx = Math.pow(Math.pow(a.x-b.x1,2),0.5);
	  c.x = b.x1;
	}else if(a.x1==b.x || a.x==b.x1){
	  c.distance.x = c.lx = 0;
	  c.x = Math.max(a.x,b.x);
	}
  }
  
  if(a.y<=b.y && b.y<=a.y1 && b.y1>=a.y1 || a.y>=b.y && b.y1<=a.y1 && b.y1>=a.y || a.y<=b.y && a.y1>=b.y1 || a.y>=b.y && a.y1<=b.y1){
    c.y = Math.max(b.y, a.y);
	c.ly = Math.pow(Math.pow(Math.min(b.y1, a.y1)-c.y,2),0.5);
  }else{
    if(a.y1<b.y){
 	  c.distance.y = c.ly = Math.pow(Math.pow(b.y-a.y1,2),0.5);
	  c.y = a.y1;
	}else if(a.y<b.y1){
	  c.distance.y = c.ly = Math.pow(Math.pow(a.y-b.y1,2),0.5);
	  c.y = b.y1;
	}else if(a.y1==b.y || a.y==b.y1){
	  c.distance.ye = c.ly = 0;
	  c.y = Math.may(a.y,b.y);
	}
  }
  
  if(a.z<=b.z && b.z<=a.z1 && b.z1>=a.z1 || a.z>=b.z && b.z1<=a.z1 && b.z1>=a.z || a.z<=b.z && a.z1>=b.z1 || a.z>=b.z && a.z1<=b.z1){
    c.z = Math.max(b.z, a.z);
	c.lz = Math.pow(Math.pow(Math.min(b.z1, a.z1)-c.z,2),0.5);
  }else{
   if(a.z1<b.z){
 	  c.distance.z = c.lz = Math.pow(Math.pow(b.z-a.z1,2),0.5);
	  c.z = a.z1;
	}else if(a.z<b.z1){
	  c.distance.z = c.lz = Math.pow(Math.pow(a.z-b.z1,2),0.5);
	  c.z = b.z1;
	}else if(a.z1==b.z || a.z==b.z1){
	  c.distance.z = c.lz = 0;
	  c.z = Math.maz(a.z,b.z);
	}
  }
}

var Building = function(){
  Building.ID = 0;
  Building.list = {};
}
Building.prototype.addRoom = function(x,y,z,lx,ly,lz){
  var b = new Struct().set(Building.ID,'room',x,y,z,lx,ly,lz);
  if(Building.ID==0){
	Building.list[Building.ID] = b;
	Building.ID++;
	return b;
  }else if(Building.ID>0){	
	var isIntersect = false;
	for(var i in Building.list)	if(isIntersects(Building.list[i], b)) isIntersect = true;
	if(isIntersect == false){
	  Building.list[Building.ID] = b;
	  Building.ID++;
	  return b;
	}
  }
}
Building.prototype.addDoor = function(a,b, lx, ly, lz){
  var c = new Section().get(a,b,Building.list),
      q = new Struct().set(Building.ID,'door',c.x,c.y,c.z,lx,ly,lz);
  q.link = {};
  q.limit = {};
  q.distance = {};
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
	  console.log('Невозможно установить размер');
	  return 'undefined';
	}
  }
}
Building.prototype.modify = function(id){
  var c = Building.list[id],
      q = {},
	  isIntersect = false;
  return{
    size: function(lx,ly,lz){
	  q = new Struct().set(id,c.type,c.x,c.y,c.z,lx,ly,lz);
	  for(var i in Building.list){
	    if(i==id)continue;
	    if(isIntersects(q, Building.list[i])) isIntersect = true;
	  }
	  if(isIntersect == false){
	    Building.list[id] = q;
		Building.list[id].info = 'Размеры были изменены';
		return q;
	  }else{
	    Building.list[id].info = 'Невозможно изменить размеры элемента';
		return Building.list[id];
	  }
	},
	position: function(x,y,z){
	  q = new Struct().set(id,c.type,x,y,z,c.lx,c.ly,c.lz);
	  q.distance = {};
	  c.x1 = c.x + c.lx;
      c.z1 = c.z + c.lz;
  	  c.y1 = c.y + c.ly;
	  for(var i in c.distance){
		q.distance[i] = c.distance[i];
	    if(c.distance[i] != 0) q[i] = c[i];
	    if(q[i]<=c[i]||q[i]+q['l'+i]<=c[i]+c['l'+i]) q[i]=c[i];
	  }
	  Building.list[id] = q;
	  return q;
	},
	type: function(type){
	  Building.list[id] = new Struct().set(id,type,c.x,c.y,c.z,c.lx,c.ly,c.lz);
	  return Building.list[id];
	}
  }
}
Building.prototype.remove = function(id){
  var i = Building.list[id];
  delete Building.list[id];
  return i;
}
Building.prototype.length = function(){
  return Building.ID;
}
Building.prototype.getItem = function(){
  var b = Building.list;
  if(arguments.length == 0) return b;
  else return b[arguments[0]];
}
Building.prototype.numberOf = function(type){
  var counter = 0;
  for(var i in Building.list){
    if(Building.list[i].type == type) counter++;
  }
  return counter;
}