/*
Использование:
num = BigInteger.parse("-ff", 16) - создание длинного числа.
num = BigInteger.add(num1, num2) - сложение
num = BigInteger.sub(num1, num2) - вычитание
num = BigInteger.mul(num1, num2) - умножение
console.log(BigInteger.toString(num)) - вывод числа
*/

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

	// Отрезание нулей в начале
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

/*
Сравнение модулей чисел.

если длина 1 числа < длина 2 числа
	возврат -1
конец если
если длина 1 числа > длина 2 числа
	возврат 1
конец если
цикл от наибольшего разряда к наименьшему
	если текущий разряд 1 числа < текущий разряд 2 числа
		возврат -1
	конец если
	если текущий разряд 1 числа > текущий разряд 2 числа
		возврат 1
	конец если
конец цикла
возврат 0
*/
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

/*
Сложение натуральных чисел.

перенос := 0
цикл от наименьшего до наибольшего разряда, количество разрядов = max(количество разрядов каждого из чисел)
	// если разряда нет в массиве, считается, что там 0
	сумма разрядов := цифра текущего разряда 1 числа + цифра текущего разряда 2 числа + перенос
	перенос := 0
	если сумма разрядов >= основание
		сумма разрядов -= основание
		перенос := 1
	конец если
	вставить разряд: сумма разрядов
конец цикла
если перенос != 0
	вставить разряд: 1
конец если
*/
BigInteger.addImplementation = function(num1, num2) {
	var i, carry = 0, digits = [];

	var numDigits = Math.max(num1.digits.length, num2.digits.length);
	for (i = 0; i < numDigits; ++i) {
		var digit1 = num1.digits[i];
		var digit2 = num2.digits[i];
		if (digit1 == null) {
			digit1 = 0;
		}
		if (digit2 == null) {
			digit2 = 0;
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
		digits.push(1);
	}

	return digits;
};

/*
Вычитание из большего натурального числа меньшего.

заимствование := 0
цикл от наименьшего до наибольшего разряда, количество разрядов = max(количество разрядов каждого из чисел)
	// если разряда нет в массиве, считается, что там 0
	разность разрядов := цифра текущего разряда 1 числа - цифра текущего разряда 2 числа - заимствование
	заимствование := 0
	если разность разрядов < 0
		разность разрядов += основание
		заимствование := 1
	конец если
	вставить разряд: разность разрядов
конец цикла
цикл от наибольшего разряда получившейся разности до наименьшего
	если цифра в текущем разряде разности != 0
		прервать цикл
	конец если
	убрать текущий разряд
конец если
*/
BigInteger.subImplementation = function(num1, num2) {
	var i, borrow = 0, digits = [];

	for (i = 0; i < num1.digits.length; ++i) {
		var digit1 = num1.digits[i];
		var digit2 = num2.digits[i];
		if (digit1 == null) {
			digit1 = 0;
		}
		if (digit2 == null) {
			digit2 = 0;
		}
		var diff = digit1 - digit2 - borrow;
		borrow = 0;
		if (diff < 0) {
			diff += num1.radix;
			borrow = 1;
		}
		digits.push(diff);
	}

	// Отрезание нулей в начале
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

/*
Умножение.

цикл от наименьшего разряда 1 числа до наибольшего
	произведение := 0
	временный результат умножения текущего разряда := 0
	цикл от 0 до позиции текущего разряда
		вставить разряд 0 во временное число
	конец цикла
	перенос := 0
	цикл от наименьшего разряда 2 числа до наибольшего
		произведение разрядов := цифра текущего разряда 1 числа * цифра текущего разряда 2 числа + перенос
		перенос := произведение разрядов div основание
		произведение разрядов -= перенос * основание
		вставить разряд во временное число: произведение разрядов
	конец цикла
	если перенос > 0
		вставить разряд во временное число: перенос
	конец если
	произведение += временное число
конец цикла
*/
BigInteger.mul = function(num1, num2) {
	if (num1.radix != num2.radix) {
		throw "Numbers have different radices";
	}

	var ret = {
		radix: num1.radix,
		sign: num1.sign * num2.sign,
		digits: []
	};

	var tmp = {
		radix: num1.radix
	};

	for (var i = 0; i < num1.digits.length; ++i) {
		var j;

		tmp.digits = [];
		for (j = 0; j < i; ++j) {
			tmp.digits.push(0);
		}

		var carry = 0;
		for (j = 0; j < num2.digits.length; ++j) {
			var prod = num1.digits[i] * num2.digits[j] + carry;
			carry = Math.floor(prod / num1.radix);
			prod -= carry * num1.radix;
			tmp.digits.push(prod);
		}
		if (carry > 0) {
			tmp.digits.push(carry);
		}

		ret.digits = BigInteger.addImplementation(ret, tmp);
	}

	return ret;
};
