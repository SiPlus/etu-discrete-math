var BigInteger = {};

BigInteger.parse = function(numberString, radix) {
	var num = {};
	num.radix = radix;
	num.sign = (numberString.startsWith("-") ? -1 : 1);
	num.digits = [];
	var i;
	for (i = numberString.length; i-- > 0; ) {
		var digit = parseInt(numberString.charAt(i), radix);
		if (!isNaN(digit)) {
			num.digits.push(digit);
		}
	}

	// Truncate leading zeroes
	for (i = num.digits.length; i-- > 0; ) {
		if (num.digits[i] != 0) {
			break;
		}
		num.digits.pop();
	}
	return num;
}

BigInteger.toString = function(num) {
	var output = [];
	if (num.sign < 0) {
		output.push("-");
	}
	if (num.digits.length != 0) {
		for (var i = num.digits.length; i-- > 0; ) {
			output.push(num.digits[i].toString(num.radix));
		}
	} else {
		output.push("0");
	}
	return output.join("");
};

BigInteger.compareAbs = function(num1, num2) {
	if (num1.digits.length < num2.digits.length) {
		return -1;
	}
	if (num1.digits.length > num2.digits.length) {
		return 1;
	}
	for (var i = num1.digits.length; i-- > 0; ) {
		if (num1.digits[i] < num2.digits[i]) {
			return -1;
		}
		if (num1.digits[i] > num2.digits[i]) {
			return 1;
		}
	}
	return 0;
};

BigInteger.addImplementation = function(num1, num2) {
	var i, carry = 0, digits = [];

	for (i = 0; i < num2.digits.length; ++i) {
		var digit1 = num1.digits[i];
		var digit2 = num2.digits[i];
		if (digit1 == null) {
			digit1 = 0;
		}
		var sum = digit1 + digit2 + carry;
		carry = 0;
		if (sum >= num1.radix) {
			sum -= num1.radix;
			carry = 1;
		}
		digits.push(sum);
	}

	if (carry != 0) {
		var digit = num1.digits[i];
		if (digit == null) {
			digit = 0;
		}
		var sum = digit + 1;
		carry = 0;
		if (sum >= num1.radix) {
			sum -= num1.radix;
		}
		digits.push(sum);
	}

	return digits;
};

BigInteger.subImplementation = function(num1, num2) {
	var i, borrow = 0, digits = [];

	for (i = 0; i < num2.digits.length; ++i) {
		var digit1 = num1.digits[i];
		var digit2 = num2.digits[i];
		if (digit1 == null) {
			digit1 = 0;
		}
		var diff = digit1 - digit2 - borrow;
		carry = 0;
		if (diff < 0) {
			diff += num1.radix;
			borrow = 1;
		}
		digits.push(diff);
	}

	if (borrow != 0) {
		var digit = num1.digits[i];
		if (digit == null) {
			digit = 0;
		}
		var diff = digit - 1;
		borrow = 0;
		if (diff < 0) {
			diff += num1.radix;
		}
		digits.push(diff);
	}

	// Truncate leading zeroes
	for (i = digits.length; i-- > 0; ) {
		if (digits[i] != 0) {
			break;
		}
		digits.pop();
	}

	return digits;
};

BigInteger.add = function(num1, num2) {
	if (num1.radix != num2.radix) {
		throw "Numbers have different radices";
	}

	var ret = {};
	ret.radix = num1.radix;

	if (num1.sign == num2.sign) {
		ret.sign = num1.sign;
		ret.digits = BigInteger.addImplementation(num1, num2);
		return ret;
	}

	var absCompare = BigInteger.compareAbs(num1, num2);
	if (absCompare == 0) {
		ret.sign = 1;
		ret.digits = [];
		return ret;
	}

	var sub1, sub2;
	if (absCompare > 0) {
		sub1 = num1;
		sub2 = num2;
	} else {
		sub1 = num2;
		sub2 = num1;
	}
	ret.sign = sub1.sign;
	ret.digits = BigInteger.subImplementation(sub1, sub2);
	return ret;
};

BigInteger.sub = function(num1, num2) {
	return BigInteger.add(num1, { radix: num2.radix, sign: -num2.sign, digits: num2.digits });
};
