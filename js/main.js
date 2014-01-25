var build = new Building();
console.log('Добавление комнат');
var r1 = build.addRoom(0,0,0, 3,1,3)
var r2 = build.addRoom(4,0,0, 4,1,4)
var r3 = build.addRoom(0,0,5, 6,1,3)
console.log(r1);
console.log(r2);
console.log(r3);
console.log('Добавление двери между комнатами');
var door = build.addDoor(r1, r2, 1,1,1);
console.log(door);
console.log('Изменение размеров');
console.log(build.modify(door.id).position(5,2,-2));
console.log(build.modify(door.id).position(5,2,-1));
console.log(build.modify(door.id).position(5,2,0));
console.log(build.modify(door.id).position(5,2,1));
console.log(build.modify(door.id).position(5,2,2));
console.log(build.modify(door.id).position(5,2,0));
console.log(build.modify(door.id).position(5,2,0));
console.log(build.modify(door.id).position(5,2,3));
console.log(build.modify(door.id).position(5,2,2));
console.log(build.modify(door.id).position(5,2,1));
console.log(build.modify(door.id).position(5,2,0));
console.log(build.modify(door.id).position(5,2,-2));
console.log(build.modify(door.id).position(5,2,-1));