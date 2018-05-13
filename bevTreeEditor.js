//Detect resize of an element
;(function($){
	let panel = {};

	//Dot Representation
	function Dot(pos){
		this.UI = {}
		switch (pos){
			case 'top':
				this.UI.left = 50;
				this.UI.top = 0;					
				break;
			case 'bot':
				this.UI.left = 50;
				this.UI.top = 100;
				break;
			case 'left':
				this.UI.left = 0;
				this.UI.top = 50;
				break;				
			case 'right':
				this.UI.left = 100;
				this.UI.top = 50;
				break;				
		}

		let dotStyle = {
			'position':'absolute',
			'width':'6px','height':'6px',	
			'border':'1px solid #000000',
			'border-radius':'50%',
			'background-color':'#FFFFFF',
			'left':'calc('+ this.UI.left + '% - 4px)',
			'top':'calc('+ this.UI.top + '% - 4px)'
		}

		this.UI.element = $('<div/>').css(dotStyle);
		
		return this;
	}

	//Node Representation
	function Node(id,type){
		let node = this;

		this.type = type;
		this.id = id;
		
		this.UI = {};		
		this.UI.element = $('<div/>').css({'position':'relative','width':'100%','height':'50px','background-color':'#66ccff'});

		this.UI.element.append(new Dot('top').UI.element);
		this.UI.element.append(new Dot('left').UI.element);
		this.UI.element.append(new Dot('bot').UI.element);
		this.UI.element.append(new Dot('right').UI.element);

	}

	//Node container representation
	function NodeContainer(id,type){
		this.UI = {}
		this.UI.element = $('<div/>').css({'width':'10%','position':'absolute','padding':'8px'})
		this.UI.element.append(new Node(id,'type').UI.element);

		this.UI.pos = {};
		this.UI.pos.X = 0;
		this.UI.pos.Y = 0;

		let node = this;
		this.UI.element[0].onmousedown = function (e) {
		    e.stopPropagation();
		    //various setting
		    $(this).css({'border':'1px #000000 dashed'});
		    if (panel.currentActivate)
		    	panel.currentActivate.UI.element.css('border','');
		    panel.currentActivate = node;

		    //calculate position and set it
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

		this.UI.element[0].onmouseenter = function(e){
			this.style.cursor = 'move';
		}		

		this.UI.element[0].onmouseup = function(e){
			node.UI.element.parent()[0].onmousemove = null;
			this.style.cursor = 'default';
		}
		return this;
	}

	
	panel.UI = {};
	panel.UI.element = $('<div/>').css({'width':'60%','height':'150%','float':'left'});

	let nodePool = [];
	$.fn.bevTreeEditor = function() {
		for (i = 0; i < 100 ; ++i)
			nodePool.push(new NodeContainer(i,'Composite'));
		
		let top = $('<div/>').css({'width':'100%','height':'320px','float':'left'});
		let other = $('<div/>').css({'width':'10%','height':'150%','float':'left'});
		
		let manual = $('<div/>').css({'width':'30%','height':'150%', 'float':'left',});
		$(this).append(top);
		$(this).append(other);
		$(this).append(panel.UI.element);
		$(this).append(manual);
		for (x in nodePool)
			panel.UI.element.append(nodePool[x].UI.element);
	}
})(jQuery);

