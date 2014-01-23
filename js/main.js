var elements = {};
var a = new Struct().set(10, 'a' ,0,0,0, 10,1,10);
var b1 = new Struct().set(11,'b1',0,1,0, 7,1,7);
var b2 = new Struct().set(12,'b2',0,2,0, 3,1,3);
                               
var e = new List();

console.log('Длина списка '+e.length());
e.add(a);
e.add(b1);
e.add(b2);
console.log('Длина списка '+e.length());

var s = new Section(e.get);
var ab1 = s.get(e.get(0), e.get(1));
var ab2 = s.get(e.get(0), e.get(2));
console.log(ab1);
console.log(ab2);

