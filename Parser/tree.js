var TreeParser = function(string) {
	this.string = string;
	this.currentCharacter = 0;
	this.syntaxTree = { type: 'Beginning', children: [] };
	if (!this.parseNode(this.syntaxTree.children)) {
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

// <узел> ::= (<ветви>)
TreeParser.prototype.parseNode = function(siblings) {
	var syntaxNode = { type: 'Node', children: [] };

	if (this.peek() === '(') { // Альтернатива: (<ветви>)
		this.advance();
		syntaxNode.children.push({ type: 'Opening bracket' });

		if (!this.parseBranches(syntaxNode.children)) {
			throw "Node is invalid";
		}

		if (this.peek() !== ')') {
			throw "Node has unmatched brackets";
		}
		this.advance();
		syntaxNode.children.push({ type: 'Closing bracket' });
	} else { // Не узел
		return false;
	}

	siblings.push(syntaxNode);
	return true;
}

// <ветви> ::= <узел><ветвь справа от узла> | <левый лист>
TreeParser.prototype.parseBranches = function(siblings) {
	var syntaxNode = { type: 'Branches', children: [] };

	if (this.parseNode(syntaxNode.children)) { // Альтернатива: <узел><ветвь справа от узла>
		if (!this.parseBranchRightOfNode(syntaxNode.children)) { // <ветвь справа от узла>
			throw "Node with the left branch being a node has an invalid right branch";
		}
	} else if (this.parseLeftLeaf(syntaxNode.children)) { // Альтернатива: <левый лист>
	} else { // Не ветви
		return false;
	}

	siblings.push(syntaxNode);
	return true;
}

// <ветвь справа от узла> ::= <узел> | l
TreeParser.prototype.parseBranchRightOfNode = function(siblings) {
	var syntaxNode = { type: 'Branch right of node', children: [] };

	if (this.parseNode(syntaxNode.children)) { // Альтернатива: <узел>
	} else if (this.parseLeaf(syntaxNode.children)) { // Альтернатива: l
	} else { // Не распознан
		return false;
	}

	siblings.push(syntaxNode);
	return true;
}

// <левый лист> ::= l<ветвь справа от листа>
TreeParser.prototype.parseLeftLeaf = function(siblings) {
	var syntaxNode = { type: 'Left leaf', children: [] };

	if (this.parseLeaf(syntaxNode.children)) { // Альтернатива: l<ветвь справа от листа>
		this.parseBranchRightOfLeaf(syntaxNode.children);
	} else { // Не левый лист
		return false;
	}

	siblings.push(syntaxNode);
	return true;
}

// <ветвь справа от листа> ::= <узел> | l | пусто
TreeParser.prototype.parseBranchRightOfLeaf = function(siblings) {
	var syntaxNode = { type: 'Branch right of leaf', children: [] };

	if (this.parseNode(syntaxNode.children)) { // Альтернатива: <узел>
	} else if (this.parseLeaf(syntaxNode.children)) { // Альтернатива: l
	} else { // Пустой символ
		syntaxNode.children.push({ type: 'Blank' });
	}

	siblings.push(syntaxNode);
}

// Терминал l
TreeParser.prototype.parseLeaf = function(siblings) {
	if (this.peek() === 'l') { // Распознан
		this.advance();
		siblings.push({ type: 'Leaf' });
		return true;
	} else { // Не распознан
		return false;
	}
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
