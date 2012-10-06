describe("PubSub", function(){
	var item;
	beforeEach(function(){
		item = Class().extend(PubSub.mixins.pubsub,{});
	});

	it("We can extend simple objects with pubsub cap.",function(){
		expect(item).toBeTruthy();
		expect(item).toHaveMethods('publish','unsubscribe','subscribe');
	});

	it("objects can subscribe to a pubsub instance",function(){
		var subscriber = function(){};
		item.subscribe('topic',subscriber);
		expect(item.subscribers('topic')).toBeTruthy();
		expect(item.subscribers('non-topic')).toBeFalsy();
	});

	it("objects can unsubscribe from a pubsub instance",function(){
		var subscriber = function subscriber(){};
		item.subscribe('topic',subscriber);
		item.subscribe('topic-two',subscriber);
		expect(item.subscribers('topic')).toBeTruthy();
		item.unsubscribe('topic',subscriber);
		expect(item.subscribers('topic')).toBeFalsy();
	});

	it("objects get notified of publisehd topics",function(){
		var spy = sinon.spy();
		item.subscribe('topic',spy);
		item.publish('topic');
		expect(spy).toHaveBeenCalled();
	});

	it("objects get notified of publisehd topics",function(){
		var spy = sinon.spy();
		var options = {options:true};
		item.subscribe('topic',spy);
		item.publish('topic',options);
		expect(spy).toHaveBeenCalledWith(options);
		expect(spy).not.toHaveBeenCalledWith({});
	});

	it("a handler can abort the publish loop",function(){
		var test = {};
		test.handler = function(){return false;};
		
		var spyB = sinon.spy();
		var spyC = sinon.spy();
		var spyA = sinon.spy(test, 'handler');

		//here it works cose we have the same order.
		item.subscribe('topic',spyA);
		item.subscribe('topic',spyB);
		item.subscribe('topic',spyC);

		item.publish('topic');
		expect(spyA).toHaveBeenCalled();
		expect(spyB).not.toHaveBeenCalled();
		expect(spyC).not.toHaveBeenCalled();
	});

	it("should route all notices to a single handler if subscribed to the * channel",function(){
		var single   = sinon.spy();
		var multiple = sinon.spy();

		var options = {options:true};
		item.subscribe('all',multiple);
		item.subscribe('topic',single);

		item.publish('topic',options);
		item.publish('topic2',options);
		item.publish('topic3',options);

		expect(single).toHaveBeenCalledOnce();
		expect(single).toHaveBeenCalledWith(options);


		expect(multiple).toHaveBeenCalledThrice();
		expect(multiple.args[0]).toMatchObject(['topic',options]);
	});

	it("should have a fluid interface",function(){
		var single   = sinon.spy();
		var multiple = sinon.spy();
		var opt = {options:true};
		item.subscribe('all',multiple).subscribe('t2',single);

		item.publish('t1',opt).publish('t2',opt).publish('t3',opt);

		expect(single).toHaveBeenCalledOnce();
		expect(single).toHaveBeenCalledWith(opt);

		expect(multiple).toHaveBeenCalledThrice();
		expect(multiple.args[0]).toMatchObject(['t1',opt]);
	});

	it("should execute in the context of the publisher",function(){
		var test = {};
		test.handler = function(){return this;};
		var spy = sinon.spy(test,'handler');
		item.subscribe('topic',test.handler);

		item.publish('topic');
		
		expect(spy.returned(item)).toBeTruthy();
	});


});