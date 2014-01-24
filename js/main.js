var build = new Building();
console.log('Добавление комнат');
var r1 = build.addRoom(0,0,0, 3,1,3)
var r2 = build.addRoom(4,0,0, 4,1,4)
var r3 = build.addRoom(15,0,0, 2,1,2)
console.log(r1);
console.log(r2);
console.log(r3);
console.log('Добавление двери между комнатами');
console.log(build.addDoor(r2, r1));
console.log('Изменение размеров');
build.modify(0).size(3,2,3);
console.log(build.getItem(0));