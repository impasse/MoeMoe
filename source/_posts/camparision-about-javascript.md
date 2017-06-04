---
title: Camparision about JavaScript
s: camparision-about-javascript
date: 2017-01-03 07:57:44
tags:
  - JavaScript
---
## SameValue (x,y)

The internal comparison abstract operation SameValue(x, y), where x and y are ECMAScript language values, produces true
or false. Such a comparison is performed as follows:
1. If Type(x) is different from Type(y), return false.
2. If Type(x) is Number, then
a. If x is NaN and y is NaN, return true.
b. If x is +0 and y is ‑0, return false.
c. If x is ‑0 and y is +0, return false.
d. If x is the same Number value as y, return true.
e. Return false.
3. Return SameValueNonNumber(x, y).
<!--more-->
## SameValueZero (x,y)

The internal comparison abstract operation SameValueZero(x, y), where x and y are ECMAScript language values, produces
true or false. Such a comparison is performed as follows:
1. If Type(x) is different from Type(y), return false.
2. If Type(x) is Number, then
a. If x is NaN and y is NaN, return true.
b. If x is +0 and y is ‑0, return true.
c. If x is ‑0 and y is +0, return true.
7.2.6 IsInteger ( argument )
7.2.7 IsPropertyKey ( argument )
7.2.8 IsRegExp ( argument )
7.2.9 SameValue (x, y)
7.2.10 SameValueZero (x, y)
NOTE
d. If x is the same Number value as y, return true.
e. Return false.
3. Return SameValueNonNumber(x, y).

## SameValueNonNumber (x, y)

The internal comparison abstract operation SameValueNonNumber(x, y), where neither x nor y are Number values, produces
true or false. Such a comparison is performed as follows:
1. Assert: Type(x) is not Number.
2. Assert: Type(x) is the same as Type(y).
3. If Type(x) is Undefined, return true.
4. If Type(x) is Null, return true.
5. If Type(x) is String, then
a. If x and y are exactly the same sequence of code units (same length and same code units at corresponding indices),
return true; otherwise, return false.
6. If Type(x) is Boolean, then
a. If x and y are both true or both false, return true; otherwise, return false.
7. If Type(x) is Symbol, then
a. If x and y are both the same Symbol value, return true; otherwise, return false.
8. Return true if x and y are the same Object value. Otherwise, return false.

## Abstract Relational Comparison

The comparison x < y, where x and y are values, produces true, false, or undefined (which indicates that at least one
operand is NaN). In addition to x and y the algorithm takes a Boolean flag named LeftFirst as a parameter. The flag is used to
control the order in which operations with potentially visible side‑effects are performed upon x and y. It is necessary because
ECMAScript specifies left to right evaluation of expressions. The default value of LeftFirst is true and indicates that the x
parameter corresponds to an expression that occurs to the left of the y parameter's corresponding expression. If LeftFirst is
false, the reverse is the case and operations must be performed upon y before x. Such a comparison is performed as follows:
1. If the LeftFirst flag is true, then
a. Let px be ? ToPrimitive(x, hint Number).
b. Let py be ? ToPrimitive(y, hint Number).
2. Else the order of evaluation needs to be reversed to preserve left to right evaluation
a. Let py be ? ToPrimitive(y, hint Number).
b. Let px be ? ToPrimitive(x, hint Number).
3. If both px and py are Strings, then
a. If py is a prefix of px, return false. (A String value p is a prefix of String value q if q can be the result of
concatenating p and some other String r. Note that any String is a prefix of itself, because r may be the empty
String.)
b. If px is a prefix of py, return true.
c. Let k be the smallest nonnegative integer such that the code unit at index k within px is different from the code unit
at index k within py. (There must be such a k, for neither String is a prefix of the other.)
d. Let m be the integer that is the code unit value at index k within px.
e. Let n be the integer that is the code unit value at index k within py.
f. If m < n, return true. Otherwise, return false.
4. Else,
a. Let nx be ? ToNumber(px). Because px and py are primitive values evaluation order is not important.
b. Let ny be ? ToNumber(py).
c. If nx is NaN, return undefined.
d. If ny is NaN, return undefined.
e. If nx and ny are the same Number value, return false.
f. If nx is +0 and ny is ‑0, return false.
7.2.11 SameValueNonNumber (x, y)
7.2.12 Abstract Relational Comparison
NOTE 1
NOTE 2
NOTE
g. If nx is ‑0 and ny is +0, return false.
h. If nx is +∞, return false.
i. If ny is +∞, return true.
j. If ny is ‑∞, return false.
k. If nx is ‑∞, return true.
l. If the mathematical value of nx is less than the mathematical value of ny —note that these mathematical values are
both finite and not both zero—return true. Otherwise, return false.

## Abstract Equality Comparison

The comparison x == y, where x and y are values, produces true or false. Such a comparison is performed as follows:
1. If Type(x) is the same as Type(y), then
a. Return the result of performing Strict Equality Comparison x === y.
2. If x is null and y is undeᲪined, return true.
3. If x is undeᲪined and y is null, return true.
4. If Type(x) is Number and Type(y) is String, return the result of the comparison x == ToNumber(y).
5. If Type(x) is String and Type(y) is Number, return the result of the comparison ToNumber(x) == y.
6. If Type(x) is Boolean, return the result of the comparison ToNumber(x) == y.
7. If Type(y) is Boolean, return the result of the comparison x == ToNumber(y).
8. If Type(x) is either String, Number, or Symbol and Type(y) is Object, return the result of the comparison x ==
ToPrimitive(y).
9. If Type(x) is Object and Type(y) is either String, Number, or Symbol, return the result of the comparison ToPrimitive(x)
== y.
10. Return false.


## Strict Equality Comparison

The comparison x === y, where x and y are values, produces true or false. Such a comparison is performed as follows:
1. If Type(x) is different from Type(y), return false.
2. If Type(x) is Number, then
a. If x is NaN, return false.
b. If y is NaN, return false.
c. If x is the same Number value as y, return true.
d. If x is +0 and y is ‑0, return true.
e. If x is ‑0 and y is +0, return true.
f. Return false.
3. Return SameValueNonNumber(x, y).
