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
		console.clear();
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


});