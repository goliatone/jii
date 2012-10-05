soma.EventDispatcher = soma.extend(
	/** @lends soma.EventDispatcher.prototype */
{
	listeners: null,
	constructor: function() {
		this.listeners = [];
	},
	/**
	 * Registers an event listener with an EventDispatcher object so that the listener receives notification of an event.
	 * @param {string} type The type of event.
	 * @param {function} listener The listener function that processes the event. This function must accept an Event object as its only parameter and must return nothing.
	 * @param {int} priority The priority level of the event listener (default 0). The higher the number, the higher the priority (can take negative number).
	 * @example
dispatcher.addEventListener("eventType", eventHandler);
function eventHandler(event) {
// alert(event.type)
}
	 */
	addEventListener: function(type, listener, priority) {
		if (!this.listeners || !type || !listener) throw new Error("Error in EventDispatcher (addEventListener), one of the parameters is null or undefined.");
		if (isNaN(priority)) priority = 0;
		this.listeners.push({type: type, listener: listener, priority: priority,scope:this});
	},
	/**
	 * Removes a listener from the EventDispatcher object. If there is no matching listener registered with the EventDispatcher object, a call to this method has no effect.
	 * @param {string} type The type of event.
	 * @param {function} listener The listener object to remove.
	 * @example
dispatcher.removeEventListener("eventType", eventHandler);
	 */
	removeEventListener: function(type, listener) {
		if (!this.listeners) return false;
		if (!type || !listener) throw new Error("Error in EventDispatcher (removeEventListener), one of the parameters is null or undefined.");
		var i = 0;
		var l = this.listeners.length;
		for (i=l-1; i > -1; i--) {
			var eventObj = this.listeners[i];
			if (eventObj.type == type && eventObj.listener == listener) {
				this.listeners.splice(i, 1);
			}
		}
	},
	/**
	 * Checks whether the EventDispatcher object has any listeners registered for a specific type of event.
	 * @param {string} type The type of event.
	 * @return {boolean}
	 * @example
dispatcher.hasEventListener("eventType");
	 */
	hasEventListener: function(type) {
		if (!this.listeners) return false;
		if (!type) throw new Error("Error in EventDispatcher (hasEventListener), one of the parameters is null or undefined.");
		var i = 0;
		var l = this.listeners.length;
		for (; i < l; ++i) {
			var eventObj = this.listeners[i];
			if (eventObj.type == type) {
				return true;
			}
		}
		return false;
	},
	/**
	 * Dispatches an event into the event flow. The event target is the EventDispatcher object upon which the dispatchEvent() method is called.
	 * @param {soma.Event} event The Event object that is dispatched into the event flow. If the event is being redispatched, a clone of the event is created automatically.
	 * @example
dispatcher.dispatchEvent(new soma.Event("eventType"));
	 */
	dispatchEvent: function(event) {
		if (!this.listeners || !event) throw new Error("Error in EventDispatcher (dispatchEvent), one of the parameters is null or undefined.");
		var events = [];
		var i;
		for (i = 0; i < this.listeners.length; i++) {
			var eventObj = this.listeners[i];
			if (eventObj.type == event.type) {
				events.push(eventObj);
			}
		}
		events.sort(function(a, b) {
			return b.priority - a.priority;
		});

		for (i = 0; i < events.length; i++) {
            events[i].listener.apply((event.srcElement) ? event.srcElement : event.currentTarget, [event]);
		}
	},
	/**
     * Returns a copy of the listener array.
     * @param {Array} listeners
     */
    getListeners: function()
    {
        return this.listeners.slice();
    },
	toString: function() {
		return "[soma.EventDispatcher]";
	},
	/**
	 * Destroy the elements of the instance. The instance still needs to be nullified.
	 * @example
instance.dispose();
instance = null;
	 */
	dispose: function() {
		this.listeners = null;
	}
});
soma.Event = soma.extend(
		/** @lends soma.Event.prototype */
		{
		constructor: function(type, params, bubbles, cancelable) {
			var e = soma.Event.createGenericEvent(type, bubbles, cancelable);
			if (params != null && params != undefined) {
				e.params = params;
			}
		    e.isCloned = false;
		    e.clone = this.clone.bind(e);
		    e.isIE9 = this.isIE9;
	        e.isDefaultPrevented = this.isDefaultPrevented;
		    if (this.isIE9() || !e.preventDefault || (e.getDefaultPrevented == undefined && e.defaultPrevented == undefined ) ) {
			    e.preventDefault = this.preventDefault.bind(e);
		    }
		    if (this.isIE9()) e.IE9PreventDefault = false;
			return e;
		},
		/**
	     * Duplicates an event.
	     * @returns {event} A event instance.
	     */
		clone: function() {
	        var e = soma.Event.createGenericEvent(this.type, this.bubbles, this.cancelable);
			e.params = this.params;
			e.isCloned = true;
			e.clone = this.clone;
	        e.isDefaultPrevented = this.isDefaultPrevented;
		    e.isIE9 = this.isIE9;
		    if (this.isIE9()) e.IE9PreventDefault = this.IE9PreventDefault;
			return e;
		},
		/**
	     * Prevent the default action of an event.
	     */
		preventDefault: function() {
			if (!this.cancelable) return false;
			this.defaultPrevented = true;
			if (this.isIE9()) this.IE9PreventDefault = true;
	        this.returnValue = false;
	        return this;
		},
		/**
	     * Checks whether the preventDefault() method has been called on the event. If the preventDefault() method has been called, returns true; otherwise, returns false.<br/>
	     * This method should be used rather than the native property: event.defaultPrevented, as the latter has different implementations in browsers.
	     * @returns {boolean}
	     */
		isDefaultPrevented: function() {
		    if (!this.cancelable) return false;
		    if (this.isIE9()) {
			    return this.IE9PreventDefault;
		    }
	        if( this.defaultPrevented != undefined ) {
	           return this.defaultPrevented;
	        }else if( this.getDefaultPrevented != undefined ) {
	            return this.getDefaultPrevented();
	        }
	        return false;
		},
		/** @private */
		isIE9: function() {
		    return document.body.style.scrollbar3dLightColor!=undefined && document.body.style.opacity != undefined;
	    },
		toString: function() {
			return "[soma.Event]";
		}
	});

	/**
	 * @static
	 * @param {string} type
	 * @param {boolean} bubbles
	 * @param {boolean} cancelable
	 * @returns {event} a generic event object
	 */
	soma.Event.createGenericEvent = function (type, bubbles, cancelable) {
	    var e;
	    bubbles = bubbles !== undefined ? bubbles : true;
	    if (document.createEvent) {
	        e = document.createEvent("Event");
	        e.initEvent(type, bubbles, !!cancelable);
	    } else {
	        e = document.createEventObject();
	        e.type = type;
	        e.bubbles = !!bubbles;
	        e.cancelable = !!cancelable;
	    }
	    return e;
	};