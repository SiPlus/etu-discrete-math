var TreeParser = function(string) {
	this.string = string;
	this.currentCharacter = 0;
	this.syntaxTree = { type: 'Beginning', children: [] };
	var character = this.peek();
	if (character === '(') {
		this.parseNode(this.syntaxTree);
	} else {
		throw "Couldn't parse the starting node";
	}
	if (this.peek().length !== 0) {
		throw "Additional characters found at the end";
	}
}

TreeParser.prototype.peek = function() {
	return this.string.charAt(this.currentCharacter);
}

TreeParser.prototype.advance = function() {
	++this.currentCharacter;
}

TreeParser.prototype.parseNode = function(parentNode) {
	var syntaxNode = { type: 'Node', children: [] };
	var character = this.peek();
	if (character === '(') {
		syntaxNode.children.push({ type: 'Opening bracket' });
		this.advance();
		this.parseBranches(syntaxNode);
		if (this.peek() !== ')') {
			throw "Node has unmatched brackets";
		}
		syntaxNode.children.push({ type: 'Closing bracket' });
		this.advance();
	} else {
		throw "Node is invalid";
	}
	parentNode.children.push(syntaxNode);
}

TreeParser.prototype.parseBranches = function(parentNode) {
	var syntaxNode = { type: 'Branches', children: [] };
	var character = this.peek();
	if (character === '(') {
		this.parseNode(syntaxNode);
		this.parseBranchRightOfNode(syntaxNode);
	} else if (character === 'l') {
		this.parseLeftLeaf(syntaxNode);
	} else {
		throw "Branches are invalid";
	}
	parentNode.children.push(syntaxNode);
}

TreeParser.prototype.parseBranchRightOfNode = function(parentNode) {
	var syntaxNode = { type: 'Branch right of node', children: [] };
	var character = this.peek();
	if (character === '(') {
		this.parseNode(syntaxNode);
	} else if (character === 'l') {
		syntaxNode.children.push({ type: 'Leaf' });
		this.advance();
	} else {
		throw "Branch right of node is invalid";
	}
	parentNode.children.push(syntaxNode);
}

TreeParser.prototype.parseLeftLeaf = function(parentNode) {
	var syntaxNode = { type: 'Left leaf', children: [] };
	var character = this.peek();
	if (character === 'l') {
		syntaxNode.children.push({ type: 'Leaf' });
		this.advance();
		this.parseBranchRightOfLeaf(syntaxNode);
	} else {
		throw "Left leaf is invalid";
	}
	parentNode.children.push(syntaxNode);
}

TreeParser.prototype.parseBranchRightOfLeaf = function(parentNode) {
	var syntaxNode = { type: 'Branch right of leaf', children: [] };
	var character = this.peek();
	if (character === '(') {
		this.parseNode(syntaxNode);
	} else if (character === 'l') {
		syntaxNode.children.push({ type: 'Leaf' });
		this.advance();
	} else {
		syntaxNode.children.push({ type: 'Blank' });
	}
	parentNode.children.push(syntaxNode);
}

TreeParser.prototype.nodeToHTML = function(node, strings) {
	strings.push('<li>');
	strings.push(node.type);
	var childCount = (node.children != null ? node.children.length : 0);
	if (childCount > 0) {
		strings.push('<ul>');
		for (var child = 0; child < childCount; ++child) {
			this.nodeToHTML(node.children[child], strings);
		}
		strings.push('</ul>');
	}
	strings.push('</li>');
}

TreeParser.prototype.toHTML = function() {
	var strings = ['<ul>'];
	this.nodeToHTML(this.syntaxTree, strings);
	strings.push('</ul>');
	return strings.join('');
}
