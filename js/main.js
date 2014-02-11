function initGraph () {
    console.log('Testing graph');
    var g = new Graph();
    g.add('a', 1, 2);
    g.add('b', 1, 3);
    g.add('c', 3, 4);
    g.add('d', 3, 5);
	g.add('e', 2, 6);
    
    console.log(g.getEdge());
    console.log(g.getNode());
    
    console.log('Edge 3:', g.getEdge(3));
    console.log('Node "b":', g.getNode('b'));
	
	console.log('OppositeNode:', g.getOppositeNode(1, 'b'));
	
	console.log('---Обход по графу---');
	console.log('set:', roundGraph(3, g));
	console.log(g.getGraph(3));
}

function roundGraph(N, g) {
	var set = new Set();
	var tmp = new Set();
	var tmp2 = new Set();
	set.add(N);
	tmp.add(N);
	
	while (tmp.valueOf().length != 0) {
		for (var n in tmp.valueOf()) {
			var n1 = tmp.valueOf()[n];	// вершина из списка
			for (var r in g.getEdge(n1)) {				
				var n2 = g.getOppositeNode(n1, g.getEdge(n1)[r]);
				console.log(n1, g.getEdge(n1)[r], n2);	
				if (set.has(n2) == false) {
					set.add(n2);
					tmp2.add(n2);
				}
			}
		}
		tmp = tmp2;
		tmp2 = new Set();
	}

	return set.valueOf();
}

/* Граф */
var Graph = function () {
    this.listOfNodes = {};	// список вершин с рёбрами
    this.listOfEdges = {};	// список рёбер с вершинами
};
Graph.prototype.add = function (edge, node1, node2) {	// добавление ребра и его вершин в граф
    this.listOfEdges[edge] = [node1, node2];	// помещение ребра с его вершинами в список 

    this.listOfNodes[node1] = this.listOfNodes[node1] || [];	// если массив вершин не создан, то создаётся
    this.listOfNodes[node2] = this.listOfNodes[node2] || [];
    
    this.listOfNodes[node1].push(edge);		// добавление ребра к списку вершин
    this.listOfNodes[node2].push(edge);
};
Graph.prototype.getNode = function (idEdge) {	// получение вершин указанного ребра или списка всех вершин
	return idEdge === undefined ? this.listOfNodes : this.listOfEdges[idEdge];
};
Graph.prototype.getEdge = function (idNode) {	// получение рёбер указанной вершины или списка всех рёбер
	return idNode === undefined ? this.listOfEdges : this.listOfNodes[idNode];
};
Graph.prototype.getOppositeNode = function (idNode, idEdge) {	// получение противоположных вершин указанной
	var arr = undefined;	// список вершин
	for (var n in this.listOfNodes) {	// обход по всем вершинам
		if (idNode != n) continue;	// если входящая вершина не равна вершине из списка, выполняется переход к следующей
		for (var e in this.listOfEdges) {	// иначе выполняется обход по всем рёбрам графа
			if (idEdge != e) continue;	// если входящее ребро не равно ребру из списка, выполняется переход к следующему
			if (this.listOfEdges[e][0] == idNode) {	// если вершина ребра равна входящей вершине
				arr = this.listOfEdges[e][1];	// то вершина с другого конца ребра добавляется в массив
			} else if (this.listOfEdges[e][1] == idNode) {
				arr = this.listOfEdges[e][0];
			}
		}
	}
	return arr;	// функция возвращает массив
};
Graph.prototype.getGraph = function (N) {
	var set = new Set();
	var tmp = new Set();
	var tmp2 = new Set();
	set.add(N);
	tmp.add(N);
	
	while (tmp.valueOf().length != 0) {
		for (var n in tmp.valueOf()) {
			var n1 = tmp.valueOf()[n];	// вершина из списка
			for (var r in this.listOfEdges) {
				var n2 = this.getOppositeNode(n1, r);
				if (set.has(n2) == false && n2 !== undefined) {
					set.add(n2);
					tmp2.add(n2);
				}
			}
		}
		tmp = tmp2;
		tmp2 = new Set();
	}

	return set.valueOf();
}

/* Множество неповторяющихся элементов */
var Set = function () {
	this.set = [];
};
Set.prototype.add = function (N) {	// добавление элементов во множество
	if (this.set.length == 0) { // если длина массива равна нулю
		this.set.push(N);	// добавляется первый элемент
		return true;	// и функция возвращает true
	} else {	// если длина массива больше нуля
		for (var i = this.set.length; --i >= 0;) {	// выполняется обход массива
			if (N == this.set[i]) {	// если какой-то элемент массива равен новому
				return false;	// функция возвращает false и элемент не попадает в массив
			}
		}
		this.set.push(N);	// если новый элемент не равен ни одному из существующих, он добавляется в массив
		return true;	// и функция возвращает true
	}
};
Set.prototype.delete = function (N) {	// удаление элемента массива, где N - элемент.
	for (var i in this.set) {
		if (N == this.set[i]) {
			this.set.splice(i, 1);	
		}
	}
};
Set.prototype.has = function (N) {	// проверка на присутствие элемента в массиве
	for (var i in this.set) {
		if (N == this.set[i]) {	// если элемент существует
			return true;	// возвращается true
		}
	}
	return false; // иначе - false
};
Set.prototype.clear = function (N) {	// очистка массива
	this.set = [];
};
Set.prototype.valueOf = function () {	// получение всего массива
	return this.set;
};