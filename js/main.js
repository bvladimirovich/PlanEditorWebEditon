var elements = {};
var a = new Struct().set(1, 'a' ,0,0,0, 3,1,3);
var b1 = new Struct().set(2,'b1',5,0,0, 4,1,5);
var b2 = new Struct().set(3,'b2',12,0,0, 4,1,2);
                               
var e = new List();

console.log('Длина списка '+e.length());
e.add(a);
e.add(b1);
e.add(b2);
console.log('Длина списка '+e.length());

var s = new Section();
var ab1 = s.get(e.get(0), e.get(1), e.get());
var ab2 = s.get(e.get(0), e.get(2), e.get());
console.log('*********');
console.log(ab1);
console.log(ab2);
console.log('*********');
console.log(s.get(e.get(2), e.get(0), e.get()));
console.log(s.get(e.get(2), e.get(1), e.get()));
console.log('*********');
console.log(s.get(e.get(1), e.get(0), e.get()));
console.log(s.get(e.get(1), e.get(2), e.get()));
console.log('*********');
console.log('Дано');
console.log(a);
console.log(b1);
console.log(b2);
console.log('Дано2');
var build = new Building();
var s1 = build.addSpace('s1',0,0,0, 4,1,2);
var s2 = build.addSpace('s2',7,0,0, 4,1,5);
console.log(s1);
console.log(s2);
build.addDoor(s1, s2);
