var elements = {};
elements[1] = new Struct().set(1,'A',1,0,1, 2,0,2);
elements[2] = new Struct().set(2,'B',4,0,1, 1,0,2);
elements[3] = new Struct().set(3,'C',1,0,4, 4,0,1);
elements[4] = new Struct().set(4,'D',6,0,1, 4,0,4);
elements[5] = new Struct().set(5,'E',9,0,2, 3,0,2);
elements[6] = new Struct().set(6,'F',7,0,2, 1,0,2);
elements[7] = new Struct().set(7,'G',6,0,4, 1,0,2);
elements[8] = new Struct().set(8,'H',8,0,4, 1,0,2);

var e = new List();
e.add(elements[1]);
e.add(elements[2]);
e.add(elements[3]);
e.add(elements[4]);
e.add(elements[5]);
e.add(elements[6]);
e.add(elements[7]);
e.add(elements[8]);

alert(e.length());
