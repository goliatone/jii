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

	it("should have a hasOwn method",function(){
		// expect(u).toHaveMethods('hasOwn');
	});


	it("hasOwn should work as hasOwnProperty",function(){
		//TODO: This method should go, no real gain here.
	});
});