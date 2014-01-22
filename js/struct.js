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
		alert('1 '+e.type);
	  }else if(isIntersects(List.items[i], e)){
	    bool=false;
		alert('2 '+e.type);
	  }else bool=true;
    }
	if(bool){
	  List.items[List.counter] = e;
      List.counter++;
	}
}
List.prototype.getItem = function(/*index*/){
  if(arguments.length == 1) return List.items[arguments[0]];
  else return List.items;
}
List.prototype.length = function(){
  return List.counter;
}
List.prototype.remove = function(){
  if(arguments.length == 1) delete List.items[arguments[0]];
  else List.items={};
}

var isIntersects = function (a, /*New element*/b) {
  a.x1 = a.x + a.lx;
  a.z1 = a.z + a.lz;
  b.x1 = b.x + b.lx;
  b.z1 = b.z + b.lz;
  var res = true;
  if(b.x1<a.x || b.x>a.x1) res = false
  if(res != false)
  if(b.z<a.z || b.z1>a.z1) res = false;
  return res;
}