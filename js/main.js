function initGraph () {
    console.log('Testing graph');
    var g = new Graph();
    g.add('a', 1, 2);
    g.add('b', 1, 3);
    g.add('c', 3, 4);
    g.add('d', 3, 5);
    
    console.log(g.getEdge());
    console.log(g.getNode());
    
    console.log('Edge 3:', g.getEdge(3));
    console.log('Node "b":', g.getNode('b'));
	
	console.log('OppositeNode:', g.getOppositeNode(2));
	
	//console.log('---Обход по графу---');
	//roundGraph(3, g);
}

function roundGraph(N, g) {
	var set = new Set();
	var tmp = new Set();
	set.add(N);
	tmp.add(N);
	
	// while (tmp.valueOf().length != 0) {
		// for (var n in tmp.valueOf()) {
			// for (var r in g.getEdge(set.valueOf()[n])) {
				
			// }
		// }
	// }
	for (var i in set.valueOf()) {
		console.log('set:', set.valueOf());
		for (var e in g.getEdge(set.valueOf()[i])) {
			console.log('e:', g.getEdge(set.valueOf()[i])[e]);
			for (var j in g.getNode(g.getEdge(set.valueOf()[i])[e])) {
				console.log('	j:', g.getNode(g.getEdge(set.valueOf()[i])[e])[j]);
				set.add(g.getNode(g.getEdge(set.valueOf()[i])[e])[j]);
				tmp.add(g.getNode(g.getEdge(set.valueOf()[i])[e])[j]);
			}
		}
	}
	console.log('set:', set.valueOf());
	console.log('tmp:', tmp.valueOf());
}

var Graph = function () {
    this.listOfNodes = {};
    this.listOfEdges = {};
};
Graph.prototype.add = function (edge, node1, node2) {
	if (typeof arguments[0] != 'string' || 
		typeof arguments[1] != 'number' || 
		typeof arguments[2] != 'number') return false;
	
    this.listOfEdges[edge] = [node1, node2];

    this.listOfNodes[node1] = this.listOfNodes[node1] || [];
    this.listOfNodes[node2] = this.listOfNodes[node2] || [];
    
    this.listOfNodes[node1].push(edge);    
    this.listOfNodes[node2].push(edge);
};
Graph.prototype.getNode = function (idEdge) {
	return idEdge === undefined ? this.listOfNodes : this.listOfEdges[idEdge];
};
Graph.prototype.getEdge = function (idNode) {
	return idNode === undefined ? this.listOfEdges : this.listOfNodes[idNode];
};
Graph.prototype.getOppositeNode = function (idNode) {
	var arr = [];
	for (var n in this.listOfNodes) {
		if (idNode != n) continue;
		for (var ns in this.listOfEdges) {
			if (this.listOfEdges[ns][0] == idNode) {
				arr.push(this.listOfEdges[ns][1]);
			} else if (this.listOfEdges[ns][1] == idNode) {
				arr.push(this.listOfEdges[ns][0]);
			}
		}
	}
	return arr;
};


var Set = function () {
	this.set = [];
};
Set.prototype.add = function (N) {
	if (this.set.length == 0) {
		this.set.push(N);
	} else {
		var c = 0;
		for (var i = 0; i < this.set.length; i++) {
			if (N == this.set[i]) {
				c++;
			}
		}
		if (c == 0) {
			this.set.push(N);
		}
	}
};
Set.prototype.delete = function (N) {
	for (var i in this.set) {
		if (N == this.set[i]) {
			this.set.splice(i, 1);	
		}
	}
};
Set.prototype.has = function (N) {
	for (var i in this.set) {
		if (N == this.set[i]) {
			return true;
		}
	}
};
Set.prototype.clear = function (N) {
	this.set = [];
};
Set.prototype.valueOf = function () {
	return this.set;
};