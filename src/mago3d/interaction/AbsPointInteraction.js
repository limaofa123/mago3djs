'use strict';

/**
 * This is the interaction for draw geometry.
 * @constructor
 * @class AbsPointInteraction
 * 
 * @abstract
 * @param {object} option layer object.
 */
var AbsPointInteraction = function(option) 
{
	if (!(this instanceof AbsPointInteraction)) 
	{
		throw new Error(Messages.CONSTRUCT_ERROR);
	}

	option = option ? option : {};
	Interaction.call(this);
	
	if (option.handleDownEvent)
	{
		this.handleDownEvent = option.handleDownEvent;
	}

	if (option.handleDragEvent)
	{
		this.handleDragEvent = option.handleDragEvent;
	}

	if (option.handleMoveEvent)
	{
		this.handleMoveEvent = option.handleMoveEvent;
	}

	if (option.handleUpEvent)
	{
		this.handleUpEvent = option.handleUpEvent;
	}

	this.begin = false;
	this.dragging = false;
	this.dragtype = undefined;
	this.startPoint = undefined;
	this.endPoint = undefined;
};
AbsPointInteraction.prototype = Object.create(Interaction.prototype);
AbsPointInteraction.prototype.constructor = AbsPointInteraction;

/**
 * interaction init
 */
AbsPointInteraction.prototype.init = function() 
{
	this.begin = false;
	this.dragging = false;
	this.startPoint = undefined;
	this.endPoint = undefined;
};
/**
 * set active. set true, this interaction active, another interaction deactive.
 * @param {boolean} active
 * @fires AbsPointInteraction#ACTIVE
 * @fires AbsPointInteraction#DEACTIVE
 */
AbsPointInteraction.prototype.setActive = function(active) 
{
	if (!this.manager || !(this.manager instanceof MagoManager)) 
	{
		throw new Error(Messages.REQUIRED_EMPTY_ERROR('MagoManager'));
	}

	if (this.active === active) { return; }
    
	var that = this;
	this.active = active;
	if (active) 
	{
		//this.manager.interactionCollection.emit(InteractionCollection.EVENT_TYPE.ACTIVE, that);
		this.emit(this.constructor.EVENT_TYPE.ACTIVE, this);
	}
	else 
	{
		//this.manager.interactionCollection.emit(InteractionCollection.EVENT_TYPE.DEACTIVE);
		this.emit(this.constructor.EVENT_TYPE.DEACTIVE);
	}
};

/**
 * handle event
 * @param {BrowserEvent} browserEvent
 */
AbsPointInteraction.prototype.handle = function(browserEvent) 
{
	var type = browserEvent.type;

	if (this.dragging)
	{
		if (type === MagoManager.EVENT_TYPE.LEFTUP || type === MagoManager.EVENT_TYPE.RIGHTUP || type === MagoManager.EVENT_TYPE.MIDDLEUP)
		{
			this.dragging = false;
			this.dragtype = undefined;
			this.endPoint = browserEvent.point;
			this.handleUpEvent.call(this, browserEvent);
		} 
		else if (type === MagoManager.EVENT_TYPE.MOUSEMOVE)
		{
			this.handleDragEvent.call(this, browserEvent);
		}
	}
	else 
	{
		if (type === MagoManager.EVENT_TYPE.LEFTDOWN || type === MagoManager.EVENT_TYPE.RIGHTDOWN || type === MagoManager.EVENT_TYPE.MIDDLEDOWN)
		{
			this.dragging = true;
			this.dragtype = type;
			this.endPoint = undefined;
			this.startPoint = browserEvent.point;
			this.handleDownEvent.call(this, browserEvent);
		} 
		else if (type === MagoManager.EVENT_TYPE.MOUSEMOVE)
		{
			this.handleMoveEvent.call(this, browserEvent);
		}
	}
};

/**
 * handle event
 * @param {BrowserEvent} browserEvent
 */
AbsPointInteraction.prototype.handleDownEvent = function(browserEvent)
{
	return abstract();
};

/**
 * handle event
 * @param {BrowserEvent} browserEvent
 */
AbsPointInteraction.prototype.handleDragEvent = function(browserEvent)
{
	return abstract();
};

/**
 * handle event
 * @param {BrowserEvent} browserEvent
 */
AbsPointInteraction.prototype.handleMoveEvent = function(browserEvent)
{
	return abstract();
};

/**
 * handle event
 * @param {BrowserEvent} browserEvent
 */
AbsPointInteraction.prototype.handleUpEvent = function(browserEvent)
{
	return abstract();
};