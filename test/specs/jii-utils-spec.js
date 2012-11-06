describe("Jii utils",function(){
	var u;
	
	beforeEach(function(){
		u = jii.utils;
	});

	it("should have a createObject method",function(){
		expect(u).toHaveMethods('createObject');
	});


	it("createObject should make a clone of",function(){
		var User = function(id){this.id=id;};
		User.prototype.method = function(){return 'hello';};
		User.prototype.variable = 'world';

		var user = new User(1);
		var clone = u.createObject(user);

		expect(clone).toBeCloneOf(user);

		var clone2 = Object.create(user);
		expect(clone2).toBeCloneOf(clone);

		var NoUser = function(id){this.id=id;};

		NoUser.prototype.method = function(){return '';};
		NoUser.prototype.variable = 'world';

		var noUser = new NoUser(2);
		var cNoUser = u.createObject(noUser);

		expect(cNoUser).toNotBeCloneOf(user);
	});


	it("should have method isEmpty",function(){
		expect(u).toHaveMethods('isEmpty');
	});


	it("isEmpty should check for empty values",function(){
		expect(u.isEmpty({})).toBeTruthy();
		expect(u.isEmpty([])).toBeTruthy();
		expect(u.isEmpty('')).toBeTruthy();
		var empty;
		expect(u.isEmpty(empty)).toBeTruthy();
	});


	it("should have a method hasAttributes",function(){
		expect(u).toHaveMethods('hasAttributes');
	});

	it("hasAttributes should test if an object has attributes",function(){
		var attributes = ['var1','var2'];
		var scope = {var1:1,var2:2};
		expect(u.hasAttributes(scope,'var1','var2')).toBeTruthy();
		expect(u.hasAttributes(scope,attributes)).toBeTruthy();

		expect(u.hasAttributes(scope,'none','none2')).toBeFalsy();
		expect(u.hasAttributes(scope,['none','none2'])).toBeFalsy();
	});


	it("should have a method isFunc",function(){
		expect(u).toHaveMethods('isFunc');
	});


	it("isFunc should test for a funcion in an object",function(){
		var scope = {method:function(){}};
		expect(u.isFunc(scope.method)).toBeTruthy();
		expect(u.isFunc(scope, 'method')).toBeTruthy();
	});


	it("should have a method isArray",function(){
		expect(u).toHaveMethods('isArray');
	});

	it("isArray should test for arrays",function(){
		expect(u.isArray([])).toBeTruthy();
	});


	it("should have method getKeys",function(){
		expect(u).toHaveMethods('getKeys');
	});

	it("getKeys should return the keys of a hash",function(){
		var scope = {a:1,b:null,c:'pepe'};
		expect(u.getKeys(scope)).toMatchObject(['a','b','c']);
	});

	it("should have method getKeysAll",function(){
		expect(u).toHaveMethods('getKeysAll');
	});

	it("getKeys should return the keys of a hash",function(){
		var scope = {a:1,b:null,c:'pepe'};
		expect(u.getKeysAll(scope)).toMatchObject({ 0 : 'a', 1 : 'b', 2 : 'c' });

		scope = {a:1,b:null,c:'pepe',d:{d1:1,d2:2, d3:[1,2],d4:{e1:1}}};
		var expected = { 0 : 'a', 1 : 'b', 2 : 'c', d : { 0 : 'd1', 1 : 'd2', 2 : 'd3', d4 : { 0 : 'e1' } } };
		expect(u.getKeysAll(scope)).toMatchObject(expected);
	});


	it("should have a result method",function(){
		expect(u).toHaveMethods('result');
	});


	it("result should get the value of a propertie or method",function(){
		var scope = {a:1,b:function(){return 1;}};

		expect(u.result(scope,'a')).toBe(1);
		expect(u.result(scope,'b')).toBe(1);
	});


	it("should have a method capitalize",function(){
		expect(u).toHaveMethods('capitalize');
	});

	it("capitalize should uppercase first letter of word",function(){
		expect(u.capitalize('helloWorld')).toBe('HelloWorld');
		expect(u.capitalize('HelloWorld')).toBe('HelloWorld');
		expect(u.capitalize('hello World')).toBe('Hello World');
	});


	it("should have a map method",function(){
		expect(u).toHaveMethods('map');
	});

	it("map should run a suplied callback on each item of an array",function(){
		var mapped   = [];
		var source   = [0,1,2,3,4,5];
		var expected = [10,11,12,13,14,15];

		var scope = {};
		scope.callback = function(item, index, source){
			return item + 10;
		};
		var spy = sinon.spy(scope, 'callback');

		mapped = u.map(source, scope.callback, scope);
		expect(mapped).toMatch(expected);
		expect(spy).toHaveBeenCalled();
		expect(spy).toHaveBeenCalledXTimes(source.length);
		expect(spy.args[0]).toHaveLength(3);
	});


	it("should have a merge method",function(){
		expect(u).toHaveMethods('merge');
	});

	it("merge method should merge own properties of b into a",function(){
		var a = {over:false,name:'pepe'};
		var b = {over:true, age:23};
		var e = {over:true,name:'pepe',age:23};

		expect(u.merge(a,b)).toMatchObject(e);
	});


	it("shold have a intersect method",function(){
		expect(u).toHaveMethods('intersect');
	});

	it("intersect should return an array containing items in two arrays",function(){
		var a = [1,2,3];
		var b = [1,4,5];
		var e = [1];
		expect(u.intersect(a,b)).toMatch(e);
		//u.intersect(a,b);
	});


	it("should have a firstToLowerCase method",function(){
		expect(u).toHaveMethods('firstToLowerCase');
	});

	it("firstToLowerCase should turn first char to lowercase",function(){
		var source = 'HelloWorld';
		var expctd = 'helloWorld';
		expect(u.firstToLowerCase(source)).toBe(expctd);
	});


	it("should have a ensureNamespace method",function(){
		expect(u).toHaveMethods('ensureNamespace');
	});


	it("ensureNamespace should create a namespace out of a chain string",function(){
		var namespace = 'a.b.c';
		var scope = {};
		var exp = {a:{b:{c:{}}}};
		u.ensureNamespace(namespace,scope);
		expect(scope).toMatchObject(exp);
	});

	it("should have a resolvePropertyChain method",function(){
		expect(u).toHaveMethods('resolvePropertyChain');
	});

	it("resolvePropertyChain given a scope and a chain string, return its value",function(){
		var scope = {a:{b:{c:{d:3}}}};
		var chain = 'a.b.c.d';
		var expct = 3;
		expect(u.resolvePropertyChain(scope,chain)).toBe(expct);
	});

	it("should have a hasOwn method",function(){
		// expect(u).toHaveMethods('hasOwn');
	});


	it("hasOwn should work as hasOwnProperty",function(){
		//TODO: This method should go, no real gain here.
	});
});