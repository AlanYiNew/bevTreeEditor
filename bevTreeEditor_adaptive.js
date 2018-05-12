//Detect resize of an element
;(function(){
  var attachEvent = document.attachEvent;
  var isIE = navigator.userAgent.match(/Trident/);
  var requestFrame = (function(){
    var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
        function(fn){ return window.setTimeout(fn, 20); };
    return function(fn){ return raf(fn); };
  })();
  
  var cancelFrame = (function(){
    var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
           window.clearTimeout;
    return function(id){ return cancel(id); };
  })();
  
  function resizeListener(e){
    var win = e.target || e.srcElement;
    if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
    win.__resizeRAF__ = requestFrame(function(){
      var trigger = win.__resizeTrigger__;
      trigger.__resizeListeners__.forEach(function(fn){
        fn.call(trigger, e);
      });
    });
  }
  
  function objectLoad(e){
    this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
    this.contentDocument.defaultView.addEventListener('resize', resizeListener);
    this.contentDocument.defaultView.dispatchEvent(new Event('resize'));
  }
  
  window.addResizeListener = function(element, fn){
    if (!element.__resizeListeners__) {
      element.__resizeListeners__ = [];
      if (attachEvent) {
        element.__resizeTrigger__ = element;
        element.attachEvent('onresize', resizeListener);
      }
      else {
        if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
        var obj = element.__resizeTrigger__ = document.createElement('object'); 
        obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        obj.__resizeElement__ = element;
        obj.onload = objectLoad;
        obj.type = 'text/html';
        if (isIE) element.appendChild(obj);
        obj.data = 'about:blank';
        if (!isIE) element.appendChild(obj);
      }
    }
    element.__resizeListeners__.push(fn);
  };
  
  window.removeResizeListener = function(element, fn){
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
      if (attachEvent) element.detachEvent('onresize', resizeListener);
      else {
        element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
        element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
      }
    }
  }
})()

;(function($){
	//Dot Representation
	function Dot(pos){
		this.UI = {}
		switch (pos){
			case 'top':
				this.UI.left = 47.5;
				this.UI.top = 0;					
				break;
			case 'bot':
				this.UI.left = 47.5;
				this.UI.top = 100;
				break;
			case 'left':
				this.UI.left = -2.5;
				this.UI.top = 50;
				break;				
			case 'right':
				this.UI.left = 97.5;
				this.UI.top = 50;
				break;				
		}

		let dotStyle = {
			'position':'absolute',
			'width':'5%','height':'0',
			'padding-bottom':'5%',	
			'border':'1px solid #000000',
			'border-radius':'50%',
			'background-color':'#FFFFFF',
			'left':'calc('+ this.UI.left + '% - 1px)',
			'top':'calc('+ this.UI.top + '%)'
		}

		this.UI.element = $('<div/>').css(dotStyle);


		let dot = this;
 		this.onResizeListener =  function(){
			dot.UI.element.css({'top':'calc(' + dot.UI.top + '% - ' + (dot.UI.element.width()/2 + 1) +'px)'}) 
		};

		addResizeListener(this.UI.element[0],this.onResizeListener);
		//removeResizeListener(this.UI.element[0]);		
		return this;
	}


	//Node Representation
	function Node(id,type){
		let node = this;

		this.type = type;
		this.id = id;
		
		this.UI = {};
		this.UI.pos = {};
		this.UI.element = $('<div/>').css({'position':'absolute','width':'12%','height':'50px','background-color':'#66ccff'});
		this.UI.pos.X = 0;
		this.UI.pos.Y = 0;		
		
		this.UI.element.append(new Dot('top').UI.element);
		this.UI.element.append(new Dot('left').UI.element);
		this.UI.element.append(new Dot('bot').UI.element);
		this.UI.element.append(new Dot('right').UI.element);

		this.UI.element[0].onmousedown = function (e) {
		    e.stopPropagation();
		    node.UI.pos.X = e.clientX - this.offsetLeft;
		    node.UI.pos.Y = e.clientY - this.offsetTop;
			node.UI.element.parent()[0].onmousemove = function (e) {
				
				if (e.clientX - node.UI.pos.X >= this.offsetLeft && 
					e.clientX - node.UI.pos.X <= this.offsetLeft + 
					                             parseInt(window.getComputedStyle(this).width) - 
					                             parseInt(window.getComputedStyle(node.UI.element[0]).width))
		        	node.UI.element[0].style.left = e.clientX - node.UI.pos.X + "px";
		    
		        if (e.clientY - node.UI.pos.Y >= this.offsetTop &&
		        	e.clientY - node.UI.pos.Y <= this.offsetTop + 
		        	                             parseInt(window.getComputedStyle(this).height) -
		        	                             parseInt(window.getComputedStyle(node.UI.element[0]).height))
		        	node.UI.element[0].style.top  = e.clientY - node.UI.pos.Y + "px";
		        node.UI.element[0].style.cursor = 'move';
			};
		};
		
		this.UI.element[0].onmouseup = function(e){
			node.UI.element.parent()[0].onmousemove = null;
			this.style.cursor = 'default';
		}
	}

	let nodePool = [];
	$.fn.bevTreeEditor = function() {
		for (i = 0; i < 80 ; ++i)
			nodePool.push(new Node(i,'Composite'));
		
		let top = $('<div/>').css({'width':'100%','height':'320px','float':'left'});
		let other = $('<div/>').css({'width':'10%','height':'150%','float':'left'});
		let panel = $('<div/>').css({'width':'60%','height':'150%','float':'left'});
		let manual = $('<div/>').css({'width':'30%','height':'150%', 'float':'left',});
		$(this).append(top);
		$(this).append(other);
		$(this).append(panel);
		$(this).append(manual);
		for (x in nodePool)
			panel.append(nodePool[x].UI.element);
	}
})(jQuery);

