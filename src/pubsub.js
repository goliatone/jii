(function(namespace,exportName){
    /**
     * PubSub mixin.
     * Use:
     * Class.include(PubSub);
     * If we need more complex stuff:
     * http://amplifyjs.com/api/pubsub/
     * https://github.com/mroderick/PubSubJS
     * https://github.com/uxder/Radio/blob/master/radio.js
     */
    var mixPubSub = {
        _slice: (function(){return [].slice})(),
        _makeArray:function(args){
            return this._slice.call(args,0);
        },
        subscribe: function(topic, callback){
            //Create _callbacks, unless we have it
            var calls = this._callbacks || (this._callbacks = {});
            var topic = this._callbacks[topic] || (this._callbacks[topic] = []);
            //Create an array for the given topic key, unless we have it,
            //then append the callback to the array
            topic.push(callback);
            return this;
        },
        subscribers:function(topic){
            return this._callbacks.hasOwnProperty(topic) && this._callbacks[topic].length > 0;
        },
        //TODO: Add 'all' support.
        publish:function(){
            //Turn args obj into real array
            var args = this._slice.call(arguments, 0);

            //get the first arg, topic name
            var topic = args.shift();

            //return if no callback
            var list, calls, i, l;
            if(!(calls = this._callbacks)) return this;
            if(!(list = this._callbacks[topic])) return this;

            var callback;
            //Invoke callbacks. We need length on each iter
            //cose it could change, unsubscribe. 
            for(i = 0, l = list.length; i < l; i++){
                callback = list[i];
                if(!callback) continue;
                callback.apply(this, args);
            }
            return this;
        },
        unsubscribe:function(topic, callback){
            var list, calls, i, l;
            if(!(calls = this._callbacks)) return this;
            if(!(list = this._callbacks[topic])) return this;

            for(i = 0, l = list.length; i < l; i++){
                if(list[i] === callback){
                    console.log(topic+'==>', list[i]);
                    console.log(topic+'==>', this._callbacks);
                    // delete this._callbacks[topic] = null;
                    list.splice(i,1);
                    //delete list[i];
                    // console.log(topic+'==>', this._callbacks);
                    // console.log(topic+'==>', this._callbacks[topic]);
                }
            }

            return this;
        }
    };

    var mixins = {mixins:{pubsub:mixPubSub}};
    var PubSub = Class(exportName).include(mixPubSub).extend(mixins);
//  ------------------------------------------------------------
//  Make our Class available to the provided namespace.
    namespace  = namespace || this;
    exportName = exportName || 'PubSub';
    namespace[exportName] = PubSub;

}).call(this/*,goliatone,'GClass'*/);