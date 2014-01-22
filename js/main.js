var elements = {};
elements[1] = new Struct().set(1,'element1',1,0,1, 2,0,2);
elements[2] = new Struct().set(2,'element2',4,0,1, 1,0,2);
elements[3] = new Struct().set(3,'element3',1,0,4, 4,0,1);

var e = new List();
e.add(elements[1]);
e.add(elements[2]);
e.add(elements[3]);

alert(e.length());
for(var i in e.getAll()){
  alert(e.getAll()[i].type);
}


