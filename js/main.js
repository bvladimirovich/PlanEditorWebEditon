function initGraph () {
    console.log('Testing graph');
    var g = new Graph();
    g.add('a', 1, 2);
    g.add('b', 1, 3);
    g.add('с', 3, 4);
    g.add('d', 3, 5);
    
    console.log(g.Edge());
    console.log(g.Node());
    
    console.log('Edge "b"', g.Edge('b'));
    console.log('Node 3', g.Node(3));
}

var Graph = function () {
    this.listOfNodes = {};
    this.listOfEdges = {};
};
Graph.prototype.add = function (edge, node1, node2) {
    this.listOfEdges[edge] = [node1, node2];

    this.listOfNodes[node1] = this.listOfNodes[node1] || [];
    this.listOfNodes[node2] = this.listOfNodes[node2] || [];
    
    this.listOfNodes[node1].push(edge);    
    this.listOfNodes[node2].push(edge);
};
Graph.prototype.Edge = function (idEdge) {
    if (idEdge === undefined) {
        return this.listOfEdges;
    } else {
        return this.listOfEdges[idEdge];
    }
};
Graph.prototype.Node = function (idNode) {
    if (idNode === undefined) {
        return this.listOfNodes;
    } else {
        return this.listOfNodes[idNode];
    }
};
