var ActiveElement = function(){}
ActiveElement.prototype = {
  set: function(activeElement){this.e = activeElement},
  get: function(){return this.e}
}

var EntityElement = function(){}
EntityElement.prototype = {
  room: function(){return {
    type:'room',
	x: 50,
    y: 100,
    z: 0,
    w: 70,
    l: 70,
    h: 70,
    c: "#FFEA73"
  }},
  door: function(){return {
    type:'door',
	x: 20,
    y: 20,
    z: 0,
    w: 40,
    l: 20,
    h: 20,
    c: "#476BD6"
  }},
  hole: function(){return {
    type:'hole',
	x: 30,
    y: 10,
    z: 0,
    w: 70,
    l: 20,
    h: 20,
    c: "#FF7A00"
  }}
}

var Canva = function(selector){
    this.canvas = document.getElementById(selector);
    if (!this.canvas){alert('Ошибка! Canvas элемент не найден!'); return;}
	if (!this.canvas.getContext){alert('Ошибка! Context не поддерживается!'); return;}
	return this.canvas;
}