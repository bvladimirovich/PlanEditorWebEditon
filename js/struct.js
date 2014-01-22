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

var List = function(){List.counter=0; List.items={}}
List.prototype.add = function(/*Element*/e){
  List.items[List.counter] = e;
  List.counter++;
}
List.prototype.getAll = function(){
  return List.items;
}
List.prototype.getItem = function(index){
  return List.items[index];
}
List.prototype.length = function(){
  return List.counter;
}

  for (var i in List){
    var e = List[i];
    if (x > e.A['x'] && x < e.C['x'])
    if (y > e.A['y'] && y < e.C['y'])
	  return e;
  }
  return false;