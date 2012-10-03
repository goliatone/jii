(function(namespace,exportName){
	/**
	 * PubSub mixin.
	 * Use:
	 * Class.include(PubSub);
	 */
	var PubSub = {
	    _slice: (function(){return [].slice})(),
	    _makeArray:function(args){
	        return this._slice.call(args,0);
	        
	    },
		subscribe: function(ev, callback){
			//Create _callbacks, unless we have it
			var calls = this._callbacks || (this._callbacks = {});
			var event = this._callbacks[ev] || (this._callbacks[ev] = []);
			//Create an array for the given event key, unless we have it,
			//then append the callback to the array
	        event.push(callback);
	        
			return this;
		},

		publish:function(){
			//Turn args obj into real array
			var args = this._slice.call(arguments, 0);
	        
			//get the first arg, event name
			var ev = args.shift();
	        
			//return if no callback
			var list, calls, i, l;
			if(!(calls = this._callbacks)) return this;
			if(!(list  = this._callbacks[ev])) return this;
	        
			//Invoke callbacks
	        var callback;
			for(i = 0, l = list.length; i < l; i++){
				callback = list[i];
	            if(!callback) continue;
	            callback.apply(this, args);
			}
			return this;
		},
		unsubscribe:function(ev, callback){
			var list, calls, i, l;
			if(!(calls = this._callbacks)) return this;
			if(!(list = this._callbacks[ev])) return this;

			for(i = 0, l = list.length; i < l; i++){
				if(list[i] === callback)
					delete list[i];
			}

			return this;
		}
	};

//	------------------------------------------------------------
//	Make our Class available to the provided namespace.
    namespace  = namespace || this;
    exportName = exportName || 'PubSub';
    namespace[exportName] = PubSub;

}).call(this/*,goliatone,'GClass'*/);