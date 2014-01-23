var elements = {};
var a = new Struct().set(1, 'a' ,2,0,2, 3,0,3);
var b1 = new Struct().set(2,'b1',6,0,1, 4,0,5);
var b2 = new Struct().set(3,'b2',4,0,7, 4,0,2);
var b3 = new Struct().set(3,'b2',3,0,0, 1,0,1);

var e1 = new Struct().set(4,'e1',9,0,2, 2,0,2);
var e2 = new Struct().set(5,'e2',9,0,5, 2,0,2);
                               
var e = new List();

console.log('Длина списка '+e.length());
e.add(a);
e.add(b1);
e.add(b2);
e.add(b3);
e.add(e1);
e.add(e2);
console.log('Длина списка '+e.length());

var s = new Section();
var ab1 = s.get(e.get(1), e.get(0), e.get());
var ab2 = s.get(e.get(0), e.get(2), e.get());
var ab3 = s.get(e.get(1), e.get(2), e.get());
var ab4 = s.get(e.get(3), e.get(0), e.get());
console.log(ab1);
console.log(ab2);
console.log(ab3);
console.log(ab4);

console.log(a);
console.log(b1);
console.log(b2);
