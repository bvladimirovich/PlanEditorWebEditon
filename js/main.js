var elements = {};
var a = new Struct().set(1, 'a' ,0,0,0, 2,2,2);
var b1 = new Struct().set(2,'b1',0,3,2, 2,2,2);
var b2 = new Struct().set(3,'b2',0,0,4, 2,2,2);
                               
var e = new List();

console.log('Длина списка '+e.length());
e.add(a);
e.add(b2);
e.add(b1);
console.log('Длина списка '+e.length());

var s = new Section();
var ab1 = s.get(e.get(0), e.get(1), e.get());
var ab2 = s.get(e.get(0), e.get(2), e.get());
console.log(ab1);
console.log(ab2);
