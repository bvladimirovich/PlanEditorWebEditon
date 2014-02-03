
//console.log(r1);
//console.log(r2);
//console.log(r3);
//console.log('--------------Добавление двери между комнатами-----------');
//var door = build.addDoor(r1, r2);
//console.log(door);

var build = new Building();
function initTest(){

	var r1 = build.addRoom(0.0,0.0,0.0, 2.0,1.0,2.0);
	var r2 = build.addRoom(5.0,0.0,0.0, 2.0,1.0,2.0);
	var r3 = build.addRoom(0.0,0.0,5.0, 2.0,1.0,2.0);
			 build.addRoom(5.0,0.0,5.0, 2.0,1.0,2.0);
			 
	$('#addRoom').click(function () {
		console.log('start');
		var lx = parseInt($('#lx').val());
		var ly = parseInt($('#ly').val()) || 0.0;
		var lz = parseInt($('#lz').val());
		
		build.addRoom(-5.0,0.0,-5.0, lx,ly,lz);
		drawScene(cam);
	});
}
