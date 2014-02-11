function initGraph () {
    // console.log('Testing graph');
    // var g = new Graph();
    // g.add('a', 1, 2);
    // g.add('b', 1, 3);
    // g.add('c', 3, 4);
    // g.add('d', 3, 5);
	// g.add('e', 2, 6);
    
    // console.log(g.getEdge());
    // console.log(g.getNode());
    
    // console.log('Edge 3:', g.getEdge(3));
    // console.log('Node "b":', g.getNode('b'));
	
	// console.log('OppositeNode:', g.getOppositeNode(1, 'b'));
	
	// console.log('---Обход по графу---');
	// console.log('set:', roundGraph(3, g));
	// console.log(g.getGraph(3));
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

