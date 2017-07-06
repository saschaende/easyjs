var easyjs = (function() {
	
	//============================================================================================
	// Contextmenu
	//============================================================================================	
	
	var contextmenu = (function(){
		
		var set  = function(options){
			
			var defaults = {
				target			:	'#target',
				buttons			:	null
			};
			
			var settings = $.extend({},defaults, options);
			
			$(settings.target).contextmenu(function(event) {
				
				remove();
				event.preventDefault();
				
				var offset = $(this).offset();

				$('body').append('<div id="easyjs-contextmenu"><ul></ul></div>');
				
				// Buttons
				if(settings.buttons != null){
					
					$.each(settings.buttons,function(index,value){
						if(value.divider == true){
							var divider = 'easyjs-contextmenu-divider';
						}else{
							var divider = 'easyjs-contextmenu-nodivider';
						}
						
						var btn = $('#easyjs-contextmenu ul').append('<li class="'+divider+'"><div class="easyjs-contextmenu-left"><i class="'+value.style+'"></i></div><div class="easyjs-contextmenu-right">'+index+'</div></li>');
						btn.click(function(){
							value.action();
						});
					});
					
					// Maximale Breite ermitteln
					var maxwidthl = 0;
					var maxwidthr = 0;
					$('#easyjs-contextmenu li').each(function(){
							if($(this).find('.easyjs-contextmenu-right').width() > maxwidthr){
								maxwidthr = $(this).find('.easyjs-contextmenu-right').width();
							}
							if($(this).find('.easyjs-contextmenu-left').width() > maxwidthl){
								maxwidthl = $(this).find('.easyjs-contextmenu-left').width();
							}	
					});	
					
					$('#easyjs-contextmenu .easyjs-contextmenu-right').width(maxwidthr);
					$('#easyjs-contextmenu .easyjs-contextmenu-left').width(maxwidthl);
				}
				
				
				// Menü verlassen
				$('#easyjs-contextmenu').mouseleave(function(){
					remove();
				});
				
				// Positionieren
				$('#easyjs-contextmenu').css({
					top: easyjs.mouse.gety()-20,
					left: easyjs.mouse.getx()-20
				});
				
				
			});
		};
		
		var remove  = function(){
			$('#easyjs-contextmenu').remove();
		};
		
		
		// Public API
	    return {
	        set		: 	set,
	        remove	:	remove
	    };	
	    
	})();
	
	
	//============================================================================================
	// Draggable (WORKING PROGRESS)
	//============================================================================================	
	
	
	var draggable = (function(){
		
		var drag = function(options){
			
			var defaults = {
				mover			:	'.dragsources',
				dragsource		:	'.dragtargets'
			};
			
			var settings = $.extend({},defaults, options);
			
			$(settings.mover).css('cursor','move');
			
			var $dragging = null;
			
		    $('body').on("mousedown",settings.mover, function(e) {
		    	e.preventDefault();
		        $(this).attr('unselectable', 'on').addClass('draggable');
		        $(this).css('z-index',easyjs.helpers.zindex());
		        
		        var el_w = $(this).outerWidth();
		        var el_h = $(this).outerHeight();
		        
		        $('body').on("mousemove", function(e) {
		            if ($dragging) {
		                $dragging.offset({
		                    top: e.pageY - el_h / 2,
		                    //left: easyjs.mouse.getx()
		                });
		            }
		        });
		        $dragging = $(this);
		        return false;
		    })
		    $('body').on("mouseup", ".draggable", function(e) {
		        $dragging = null;
		        $(this).removeAttr('unselectable').removeClass('draggable');
		    });
		    
	   	};
	   	
		// Public API
	    return {
	        drag		: 	drag
	    };	
	    
	})();	   	
	
	//============================================================================================
	// Cookie
	//============================================================================================
	
	var cookie = (function(){
		
		var set = function(name,value,days){
		    if (days) {
		        var date = new Date();
		        date.setTime(date.getTime()+(days*24*60*60*1000));
		        var expires = "; expires="+date.toGMTString();
		    }
		    else var expires = "";
		    document.cookie = name+"="+value+expires+"; path=/";
		};
		
		var get = function(name){
		    var nameEQ = name + "=";
		    var ca = document.cookie.split(';');
		    for(var i=0;i < ca.length;i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') c = c.substring(1,c.length);
		        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		    }
		    return null;
		};
		
		var exists = function(name){
			if(get(name) == null){
				return false;
			}
			return true;
		};
		
		var remove = function(name){
			createCookie(name,"",-1);
		};
		
		// Public API
	    return {
	        get			: 	get,
	        set			: 	set,
	        remove		: 	remove,
	        exists		:	exists
	    };	
	})();
	
	//============================================================================================
	// Tour
	//============================================================================================
	
	var tour = (function(){
		
		var position = 0;
		var mytour = [];
		
		var settings = {
			padding			: 10, // padding of the tooltip
			txt_next		: 'Next »',
			txt_prev		: '« Prev',
			txt_end			: 'End tour',
			once			: false
		};
		
		var config = function(options){
			settings = $.extend({},settings, options);	
		};		
		
		var start = function(options){
			mytour = options.tour;
		
			if(settings.once){
				var tour_id = 'tour_'+easyjs.helpers.md5(JSON.stringify(mytour));
				if(easyjs.cookie.exists(tour_id)){
					return;
				}else{
					easyjs.cookie.set(tour_id,'y',365);
				}
			}
			
			next();
		};
		
		var showbg = function(element){
			// Element data
			var elmpos = element.offset();
			var elmtop = elmpos.top;
			var elmleft = elmpos.left;
			$('.easyjs-tour-bg').remove();
			
			// Allgemein
        	$('body').append('<div class="easyjs-tour-bg top"></div>');
        	$('body').append('<div class="easyjs-tour-bg left"></div>');
        	$('body').append('<div class="easyjs-tour-bg right"></div>');
        	$('body').append('<div class="easyjs-tour-bg bottom"></div>');
        	$('.easyjs-tour-bg').css('z-index',easyjs.helpers.zindex());
        	// Top
        	var top_top = 0;
        	var top_left = 0;
        	var top_width = $(document).innerWidth();
        	var top_height = elmtop;
        	$('.easyjs-tour-bg.top').css({
        		'top':top_top+'px',
        		'left':top_left+'px',
        		'width':top_width+'px',
        		'height':top_height+'px'
        	});
        	// Left
        	var left_top = elmtop;
        	var left_left = 0;
        	var left_width = elmleft;
        	var left_height = element.outerHeight();
        	$('.easyjs-tour-bg.left').css({
        		'top':left_top+'px',
        		'left':left_left+'px',
        		'width':left_width+'px',
        		'height':left_height+'px'
        	});
         	// Right
        	var right_top = elmtop;
        	var right_left = elmleft+element.outerWidth();
        	var right_width = $(document).innerWidth()-elmleft-element.outerWidth();
        	var right_height = element.outerHeight();
        	$('.easyjs-tour-bg.right').css({
        		'top':right_top+'px',
        		'left':right_left+'px',
        		'width':right_width+'px',
        		'height':right_height+'px'
        	});       	
        	// Bottom
        	var bottom_top = elmtop+element.outerHeight();
        	var bottom_left = 0;
        	var bottom_width = $(document).innerWidth();
        	var bottom_height = $(document).innerHeight()-elmtop;
        	$('.easyjs-tour-bg.bottom').css({
        		'top':bottom_top+'px',
        		'left':bottom_left+'px',
        		'width':bottom_width+'px',
        		'height':bottom_height+'px'
        	});       	
        	
        	$('.easyjs-tour-bg').show();
		};
		
		var prev = function(){
			position = position-2;
			show(position);
			position = position+1;
		};		
		
		var next = function(){
			show(position);
			position = position+1;
		};
		
		var stop = function(){
			position = 0;
			$('.easyjs-tour-bg').fadeOut(500);
			$('.easy-tour-container').fadeOut(500);
			$('html, body').animate({
		        scrollTop: 0
		    },1000);			
		};		
		
		var show = function(id){
			
			if(id > mytour.length-1){
				stop();
				return;
			}
			
			var options = mytour[id];
			
			// Show background
			showbg($(options.element));
			
			$('.easy-tour-container').remove();
			
			var $this = $(options.element);
			var title = '<div class="easy-tour-title">'+options.title+'</div>';
			title += '<div class="easy-tour-content">'+options.content+'</div>';
			title += '<div class="easy-tour-footer">';
			if(id == 0){
				title += '<a href="javascript:void(0);" class="tourbtn prev disabled">'+settings.txt_prev+'</a>';
			}else{
				title += '<a href="javascript:easyjs.tour.prev();" class="tourbtn prev active">'+settings.txt_prev+'</a>';
			}
			if(id+1 > mytour.length-1){
				title += '<a href="javascript:javascript:void(0);" class="tourbtn next disabled">'+settings.txt_next+'</a>';
			}else{
				title += '<a href="javascript:easyjs.tour.next();" class="tourbtn next active">'+settings.txt_next+'</a>';
			}
			title += '<a href="javascript:easyjs.tour.stop();" class="tourbtn end active">'+settings.txt_end+'</a>';
			title += '<div style="clear:both;"></div></p>';
				
			// Make html
			var html = '<div class="easy-tour-container">';
			html += title;
			html += '<div class="easy-tour-arrow"></div>';
			html += '</div>';
			$('body').append(html);
			
			// Position
			// Get x and y of element
			var p = $this.offset();
			var top = p.top;
			var left = p.left+(($this.outerWidth()-$('.easy-tour-container').outerWidth())/2);
			
			if(left < 0){
				left = 0;
			}
			
			// Container verschieben und darüber plazieren
			var tooltip_realpos = top-$('.easy-tour-container').outerHeight()-15-$(document).scrollTop();


			if(tooltip_realpos < 0){
				// Bottom
				top = top+15+$this.outerHeight();
				$('.easy-tour-arrow').addClass('bottom');
			}else{
				// Top
				top = top-15-$('.easy-tour-container').outerHeight();
				$('.easy-tour-arrow').addClass('top');
			}			
			
			
			$('.easy-tour-container').css({
				'top':top+'px',
				'left':left+'px',
				'z-index':easyjs.helpers.zindex()
			});
			
			// Buttons
			$('.easy-tour-arrow').css('left',($('.easy-tour-container').outerWidth()/2)+'px');
			
			$('html, body').animate({
		        scrollTop: top-($(window).innerHeight()/2)
		    },1000);
			
			$('.easy-tour-container').fadeIn(500);
		};
		
		
		
		// Public API
	    return {
	    	start			:	start,
	    	show			:	show,
	    	showbg			:	showbg,
	    	next			:	next,
	    	prev			:	prev,
	    	stop			:	stop,
	    	config			:	config
	    };		
		
		
	})();	
	
	//============================================================================================
	// Popover
	//============================================================================================
	
	var popover = (function(){
		
		var init = function(){
			$('.easyjs-popover').hide();
		};
		
		var show = function(options){
			
			var defaults = {
				target		: $('#popover-target'),
				popover		: $('#popover-content'),
				position	: 'lt',
				content		: false
			};
			
			var settings = $.extend({},defaults, options);

			var position = settings.position;
			var popover = settings.popover;
			var target = settings.target;
			
			if(settings.content != false){
				popover.html(settings.content);
			}
			popover.css('z-index',easyjs.helpers.zindex());
			popover.css('position','absolute');
			popover.css('top','0px');
			popover.css('left','0px');
			popover.appendTo('body');
			popover.show();
			
			// Positions
			var p = target.offset();
			var elm_top = p.top;
			var elm_left = p.left;
			
			// Positionen
			var top = elm_top;
			var left = elm_left;
			
			// Links oben
			if(position == 'lt'){
				top = elm_top;
				left = elm_left-popover.outerWidth();
			}
			// Links unten
			if(position == 'lb'){
				top = elm_top+target.outerHeight()-popover.outerHeight();
				left = elm_left-popover.outerWidth();
			}
			// Rechts oben
			if(position == 'rt'){
				top = elm_top;
				left = elm_left+target.outerWidth();
			}
			// Rechts unten
			if(position == 'rb'){
				top = elm_top+target.outerHeight()-popover.outerHeight();
				left = elm_left+target.outerWidth();
			}
			// Oben Links
			if(position == 'tl'){
				top = elm_top-popover.outerHeight();
				left = elm_left;
			}
			// Oben Rechts
			if(position == 'tr'){
				top = elm_top-popover.outerHeight();
				left = elm_left+target.outerWidth()-popover.outerWidth();
			}
			// Unten links
			if(position == 'bl'){
				top = elm_top+target.outerHeight();
				left = elm_left;
			}
			// Unten Rechts
			if(position == 'br'){
				top = elm_top+target.outerHeight();
				left = elm_left+target.outerWidth()-popover.outerWidth();
			}
			// Oben mitte
			if(position == 't'){
				top = elm_top-popover.outerHeight();
				left = elm_left+((target.outerWidth()-popover.outerWidth())/2);
			}
			// Unten mitte
			if(position == 'b'){
				top = elm_top+target.outerHeight();
				left = elm_left+((target.outerWidth()-popover.outerWidth())/2);
			}
			// Rechts mitte
			if(position == 'r'){
				top = elm_top+((target.outerHeight()-popover.outerHeight())/2);
				left = elm_left+target.outerWidth();
			}
			// Links mitte
			if(position == 'l'){
				top = elm_top+((target.outerHeight()-popover.outerHeight())/2);
				left = elm_left-popover.outerWidth();
			}
			// Links Oben Ecke
			if(position == 'tlc'){
				top = elm_top-popover.outerHeight();
				left = elm_left-popover.outerWidth();
			}
			// Rechts Oben Ecke
			if(position == 'trc'){
				top = elm_top-popover.outerHeight();
				left = elm_left+target.outerWidth();
			}
			// Unten rechts Ecke
			if(position == 'brc'){
				top = elm_top+target.outerHeight();
				left = elm_left+target.outerWidth();
			}
			// Unten rechts Ecke
			if(position == 'blc'){
				top = elm_top+target.outerHeight();
				left = elm_left-popover.outerWidth();
			}
			
			// Set position
			popover.css('top',top);
			popover.css('left',left);
		};
		
		// Public API
	    return {
	    	show			:	show,
	    	init			:	init
	    };		
		
		
	})();
	
	//============================================================================================
	// Foldable Menu
	//============================================================================================	
	
	var menu = (function(){
		
		var fadetime = 0;
		
		var init = function(options){
			
			//return;
			
			// ============================================
			// HORIZONTAL
			// ============================================
			
			var horizontal_hover = false;
			
			// Levels einsetzen
			var level = 1;
			$('.easyjs-menu-horizontal ul').each(function( index,element ) {
				if(this.tagName == 'UL'){
					$(this).attr('data-level',level);
					level = level+1;
				}
			});			
			$('body').delegate('.easyjs-menu-horizontal li','mouseenter',function(){
				var w = $(this).outerWidth();
				var h = $(this).outerHeight();
				var level = $(this).parent().attr('data-level');
				
				$(this).addClass('ishover');
				$(this).css('z-index',easyjs.helpers.zindex());
			
				$(this).find('> ul').css('min-width',w+'px');
				$(this).find('> ul').fadeIn(fadetime);
				
				if(level == 1){
					$(this).find('> ul').css('top',h+'px');
					$(this).find('> ul').css('left','0px');
				}	
				else {
					$(this).find('> ul').css('top','0px');
					$(this).find('> ul').css('left',w+'px');
				}
			});
			
			$('body').delegate('.easyjs-menu-horizontal li','mouseleave',function(){
				$(this).removeClass('ishover');
				var $this = $(this);
				setTimeout(function(){
					if($this.hasClass('ishover') == false){
						$this.find('ul').fadeOut(fadetime);
					}
				},50);
			});
			$('.easyjs-menu-horizontal ul li ul').hide();
			
			
			// ============================================
			// VERTICAL
			// ============================================
			
			var level = 1;
			$('.easyjs-menu-vertical ul').each(function( index,element ) {
				if(this.tagName == 'UL'){
					$(this).attr('data-level',level);
					level = level+1;
				}
			});			
			$('body').delegate('.easyjs-menu-vertical li','mouseenter',function(){
				var w = $(this).outerWidth();
				var h = $(this).outerHeight();
				var level = $(this).parent().attr('data-level');
				
				$(this).addClass('ishover');
				$(this).css('z-index',easyjs.helpers.zindex());
				
				$(this).find('> ul').css('min-width',w+'px');
				$(this).find('> ul').fadeIn(fadetime);
				
				$(this).find('> ul').css('top','0px');
				$(this).find('> ul').css('left',w+'px');
			});
			$('body').delegate('.easyjs-menu-vertical li','mouseleave',function(){
				$(this).removeClass('ishover');
				var $this = $(this);
				setTimeout(function(){
					if($this.hasClass('ishover') == false){
						$this.find('ul').fadeOut(fadetime);
					}
				},50);
			});
			$('.easyjs-menu-vertical ul li ul').hide();			
		};
		
		// Public API
	    return {
	    	init			:	init
	    };
	    
	})();
	
	//============================================================================================
	// Tooltip
	//============================================================================================
	
	var tooltip = (function(){
		
		var title;
		var settings;
		
		var defaults = {
			selector		: '[title]', // selektor for enabling tooltips
			title_attr		: 'title', // attribute that contains the tooltip content
			fade			: 500 // [new, 16.03.2016] Fade in miliseconds
		};
		
		var init = function(options){
			
			settings = $.extend({},defaults, options);
			
			$(document).on('mousemove',settings.selector,mousemove);
			$(document).on('mouseenter',settings.selector,mouseenter);
			$(document).on('mouseleave',settings.selector,mouseleave);

		};
		
		
		var mousemove = function(){
			var left = easyjs.mouse.getx()-($('.easy-tooltip-container').outerWidth()/2);
			if(left < 0){
				left = 0;
			}
			$('.easy-tooltip-container').css('left',left+'px');	
		};
		
		var mouseenter = function(){
			var $this = $(this);
			
			// Title
			title = $this.attr(settings.title_attr);
			$this.attr(settings.title_attr,'');
			
			// Make html
			var html = '<div class="easy-tooltip-container">';
			html += title;
			html += '<div class="easy-tooltip-arrow"></div>';
			html += '</div>';
			$('body').append(html);
			$('.easy-tooltip-container').fadeIn(settings.fade);
			
			// Position
			// Get x and y of element
			var p = $this.offset();
			var top = p.top;
			var left = easyjs.mouse.getx()-($('.easy-tooltip-container').outerWidth()/2);
			
			if(left < 0){
				left = 0;
			}
			
			// Container verschieben und darüber plazieren
			var tooltip_realpos = top-$('.easy-tooltip-container').outerHeight()-15-$(document).scrollTop();


			if(tooltip_realpos < 0){
				// Bottom
				top = top+20+$(this).outerHeight();
				$('.easy-tooltip-arrow').addClass('bottom');
			}else{
				// Top
				top = top-20-$('.easy-tooltip-container').outerHeight();
				$('.easy-tooltip-arrow').addClass('top');
			}			
			
			// Container positionieren
			$('.easy-tooltip-container').css({
				'top':top+'px',
				'left':left+'px',
				'zindex':easyjs.helpers.zindex()
			});
			
			// Arrow positionieren
			$('.easy-tooltip-arrow').css('left',($('.easy-tooltip-container').outerWidth()/2)+'px');	
		};
		
		var mouseleave = function(){
			$('.easy-tooltip-container').remove();
			$(this).attr(settings.title_attr,title);
		};		
		
		// Public API
	    return {
	    	init			:	init
	    };
	    
	})();	
	
	
	//============================================================================================
	// Maus Positionen
	//============================================================================================
	
	var mouse = (function(){
		
		var mousex;
		var mousey;
		
		var init = function(){
			$(document).ready(function(){
				$(document).on("click mousemove touchstart touchmove touchend touchcancel", function(e) {
					setx(e.clientX);
					sety(e.clientY+$(document).scrollTop());
				});
			});
		};

		var setx = function (val) {
			mousex = val;
		};
		
		var sety = function (val) {
			mousey = val;
		};
		
		var getx = function () {
			return mousex;
		};
		
		var gety = function () {
			return mousey
		};
		
		var scroll = function(options){
			
			var defaults = {
					// title
		            element	: '#element', // element to scrollt
		            speed	: 2000, // speed in miliseconds
			};
			
	        // Establish our default settings
			var settings = $.extend({},defaults, options);
			
            $('html, body').animate({
                scrollTop: $(element).offset().top
            }, 2000);
		};
		
		// Public API
	    return {
	    	init			:	init,
	        setx			: 	setx,
	        sety			:	sety,
	        getx			:	getx,
	        gety			:	gety,
	        scroll			:	scroll
	    };
		
	})();	
	
	// ================================================================================================
	// Helpers
	// ================================================================================================
	
	var helpers = (function(){

		var zindex = function () {
			var zmax = 0;
			$('*').each(function() {
				var cur = parseInt($(this).css('z-index'));
				zmax = cur > zmax ? cur : zmax;
			});
			return zmax+1;
		};
		
		var md5 = function(s){
			function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]| (G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()
		};
		
		var once = function(key){
			if(easyjs.cookie.exists(key)){
					return false;
			}else{
					easyjs.cookie.set(key,'y',365);
					return true;
			}
		};
		
		var loadCSS = function(href) {
			var cssLink = $("<link>");
			$("head").append(cssLink); //IE hack: append before setting href
			cssLink.attr({
				rel:  "stylesheet",
				type: "text/css",
				href: href
			});
		};
		
		var scriptPath = function () {
		    var scripts = document.getElementsByTagName('script');
		    var index = scripts.length - 1;
		    var myScript = scripts[index];
		    var url = myScript.src;
		    var res = url.split("/");
		    res.pop();
		    res = res.join('/');
	    	return res;
		};		

		
		// Public API
	    return {
	        zindex			: 	zindex,
	        md5				:	md5,
	        once			:	once,
	        loadCSS			:	loadCSS,
	        scriptPath		: 	scriptPath
	    };
		
	})();	
	
	// ================================================================================================
	// Modal
	// ================================================================================================
	
	var modal = (function(){
		
		var easyjs_modal_defaults;
		var settings;
		
		var config = function(options) {
			easyjs_modal_defaults = options;
		};
		
		var close = function(options) {
			
			try {
				if(settings.onbeforeclose()){
						$('body').off('mousedown');
						$("body").css('overflow','auto');
				
						if(settings.escape){
							$('body').off('keydown');
						}
						if(settings.fade){
							$('.easyjs-modal-bg,.easyjs-modal-modal').fadeOut(500,function(){
								$('.easyjs-modal-bg,.easyjs-modal-modal').remove();
							});
						}else{
							$('.easyjs-modal-bg,.easyjs-modal-modal').remove();
						}
						settings.onclose();
				}
			}catch(err){}
			
			return false;
		};
		
		var show = function(options) {
		
			var defaults = {
					// contents
		            title			: false, // title text
		            content			: false, // content text
		            // close button
		            close			: true,
		            onbeforeclose	: function(){return true;}, // executed before closing, return false if you dont want the modal closed
		            onclose			: function(){}, // executed after the window was closed
		            // iframe
		            iframe			: false, // iframe path/url
		            iframepadding	: 10, // padding
		            iframescroll	: 'no', // scrolling
		            // ajax
		            ajax			: false, // ajax path/url
		            // image
		            image			: false, // image path/url
		            // div
		            container		: false,
		            // modal general
		           	width			: 'auto', // width (5px, full, auto)
		        	height			: 'auto', // height (5px, full, auto)
		            background		: true, // background
		            draggable		: false, // draggable
		            fade			: false, // fade
		            escape			: false, // escape key
		            once			: false, // [new 16.03.2016] show once
		            // Buttons
		            buttons			: null, // buttons
			};
			
	        // Establish our default settings
			var mysettings = $.extend({},easyjs_modal_defaults, options);
	        settings = $.extend({},defaults, mysettings);
	        
	        if(settings.once){
				var modal_id = 'modal_'+easyjs.helpers.md5(JSON.stringify(settings));
				if(easyjs.cookie.exists(modal_id)){
					return;
				}else{
					easyjs.cookie.set(modal_id,'y',365);
				}
			}
	        
	        // ===========================================
	        // HTML generieren
	        // ===========================================
	        
	        // Background
	        if(settings.background){
	        	setbackground();
	        }
	        
	        var modal = '<div class="easyjs-modal-modal">';
	        
	        // Titel
			if(settings.title != false){
				modal += '<div class="easyjs-modal-title">'+settings.title+'</div>';
			}
			else if(settings.container != false && $(settings.container).is("[title]")){
				modal += '<div class="easyjs-modal-title">'+$(settings.container).attr('title')+'</div>';
			}
			
			// Close Button
			if(settings.close){
				modal += '<a href="javascript:void(0);" class="easyjs-modal-close">X</a>';
			}
			
			// Content
			if(settings.iframe != false){
				modal += '<div class="easyjs-modal-iframe"><iframe frameborder="0" allowfullscreen></iframe></div>';
			}else if(settings.content != false){
				modal += '<div class="easyjs-modal-content">'+settings.content+'</div>';
			}
			else if(settings.ajax != false){
				modal += '<div class="easyjs-modal-ajax">Loading</div>';
			}
			else if(settings.image != false){
				modal += '<div class="easyjs-modal-image">';
				modal += '<img src="'+settings.image+'" style="display:block;max-width:100%;height:auto;">';
				modal += '</div>';
			}		
			else if(settings.container != false){
				modal += '<div class="easyjs-modal-containercontent">'+$(settings.container).html()+'</div>';
			}
			
			modal += '<div style="clear:both;"></div></div>';
			
			// Modal einfügen
			$('body').append(modal);
			$('.easyjs-modal-modal').hide();
			
			// Footer?
			if(settings.buttons != null){
				$('.easyjs-modal-modal').append('<div class="easyjs-modal-footer"></div>');
				var buttonids = 1;
				$.each(settings.buttons,function(index,value){
					var buttonid = 'smb'+buttonids;
					$('.easyjs-modal-footer').append('<button type="button" class="'+value.style+'" id="'+buttonid+'">'+index+'</button>');
					$('#'+buttonid).click(function(){
						value.action();
					});
					buttonids++;
				});
			}			
			
			// Problem: Bild wird geladen, hier muss neu positioniert werden nach dem Laden
			if(settings.image != false){
				var myImage = $('.easyjs-modal-image img');
				//check if the image is already on cache
				if(myImage.prop('complete')){ 
				     $('.easyjs-modal-modal').show();
				     // Positionieren
				    setpositioning();
				}else{
				     // wird neu geladen
				     myImage.on('load',function(){
						    // anzeigen
				    	 	$('.easyjs-modal-modal').show();
				          	// Positionieren
				    	 	setpositioning();
				     });
				}
			}
			
			if(settings.image == false){
				if(settings.fade){
					$('.easyjs-modal-bg,.easyjs-modal-modal').fadeIn(500);
				}else{
					$('.easyjs-modal-bg,.easyjs-modal-modal').show();
				}
			}
			
			// ===========================================
			// External
			// ===========================================
			
			if(settings.ajax != false){
				$.post(settings.ajax, function( data ) {
						$('.easyjs-modal-ajax').css('overflow','auto');
						$('.easyjs-modal-ajax').html(data);
					
			          	var modal_left = (doc_width-$('.easyjs-modal-modal').outerWidth())/2;
				        var modal_top = (doc_height-$('.easyjs-modal-modal').outerHeight())/2;
				        modal_top += $(document).scrollTop();
						$('.easyjs-modal-modal').css('left',modal_left+'px');
						$('.easyjs-modal-modal').css('top',modal_top+'px');
						
						var ajax_width = $('.easyjs-modal-modal').outerWidth();
						var ajax_height = $('.easyjs-modal-modal').outerHeight()-$('.easyjs-modal-title').outerHeight()-(settings.iframepadding*2);
						$('.easyjs-modal-ajax').css('width',ajax_width+'px');
						$('.easyjs-modal-ajax').css('height',ajax_height+'px');						
				});
			}		
			
			// ===========================================
			// Design
			// ===========================================
			
			// Schatten
			if(settings.shadow){
				if(settings.background){
					$('.easyjs-modal-modal').addClass('shadow-bg');
				}else{
					$('.easyjs-modal-modal').addClass('shadow-nobg');
				}
			}		
			
			// Set iFrame width and height
			if(settings.iframe != null){
				var iframe_width = $('.easyjs-modal-modal').outerWidth()-(settings.iframepadding*2);
				var iframe_height = $('.easyjs-modal-modal').outerHeight()-$('.easyjs-modal-title').outerHeight()-(settings.iframepadding*2);
				$('.easyjs-modal-iframe').attr('scrolling',settings.iframescroll);
				$('.easyjs-modal-iframe').css('width',iframe_width+'px');
				$('.easyjs-modal-iframe').css('height',iframe_height+'px');
				$('.easyjs-modal-iframe').css('overflow','hidden');
			}
			
			// Events
			$('.easyjs-modal-close').click(function(){close();});
			if(settings.draggable){setdraggable();}
			if(settings.escape){setesc();}
			
			// Positionieren
			if(settings.image == false){
				setpositioning();
			}
			
			// Return
			return this;				
	   	};
	   	
	   	var setpositioning = function(){
			// Position of Modal
	   		var doc_width = $(window).innerWidth();
	        var doc_height = $(window).innerHeight();
	        
        	var modal_width = $('.easyjs-modal-modal').outerWidth();
        	var modal_height = $('.easyjs-modal-modal').outerHeight();
        	
        	var max_width = doc_width*0.9;
        	var max_height = doc_height*0.9;
        	
	        $('.easyjs-modal-modal').css({
	        		'position':'absolute',
	        		'max-width':max_width+'px',
	        		'max-height':max_height+'px'
	        });
	        
	        // Maximale Breite setzen
        	if(settings.width == 'full'){
		        $('.easyjs-modal-modal').css('width',max_width+'px');
        	}
        	if(settings.height == 'full'){
		        $('.easyjs-modal-modal').css('height',max_height+'px');
        	}        	
	        
	        var innerheight = $('.easyjs-modal-modal').outerHeight()-$('.easyjs-modal-footer').outerHeight()-$('.easyjs-modal-title').outerHeight();
	        
	        $('.easyjs-modal-ajax, .easyjs-modal-iframe, .easyjs-modal-image, .easyjs-modal-content, .easyjs-modal-containercontent').css({
	        		'max-width':max_width+'px',
	        		'max-height':innerheight+'px'	
	        });
	        
	        // Images
	        if(settings.image != false){
		        var imgpadding = parseInt(jQuery('.easyjs-modal-image').css('padding'), 10);
		        $('.easyjs-modal-image img').css({
		        		'max-width':(max_width-imgpadding*2)+'px',
		        		'max-height':(innerheight-imgpadding*2)+'px'	
		        });
	        }
	        
	        // IFrames
	        if(settings.iframe != null){
		        var iframepadding = parseInt(jQuery('.easyjs-modal-iframe').css('padding'), 10);
		        $('.easyjs-modal-iframe').css({
		        		'width':max_width+'px',
		        		'height':innerheight+'px'	
		        });	        
		        $('.easyjs-modal-iframe iframe').css({
		        		'width':(max_width-iframepadding*2)+'px',
		        		'height':(innerheight-iframepadding*2)+'px'	
		        });
		        $('.easyjs-modal-iframe iframe').attr('height',(innerheight-iframepadding*2));
		        $('.easyjs-modal-iframe iframe').attr('width',(max_width-iframepadding*2));
		        // Iframe laden
				$('.easyjs-modal-iframe iframe').attr('src',settings.iframe);
			}

	        // Neue Breite holen
	        modal_width = $('.easyjs-modal-modal').outerWidth();
        	modal_height = $('.easyjs-modal-modal').outerHeight();     	
        	        	
	        var modal_left = (doc_width-modal_width)/2;
	        var modal_top = (doc_height-modal_height)/2;
	        modal_top += $(document).scrollTop();
	        $('.easyjs-modal-modal').css({
	        		'position':'absolute',
	        		'z-index':easyjs.helpers.zindex(),
	        		'top':modal_top+'px',
	        		'left':modal_left+'px'
	        });
	   	};
	   		
	   	
	   	var setesc = function(){
			$('body').keydown(function(event) {
			  if(event.which == 27 ) {
			   	event.preventDefault();
			   	close();
			  }
			});
	   	};
	   	
	   	var setdraggable = function(){
			$('.easyjs-modal-title').css('cursor','move');
			var $dragging = null;
		    $('body').on("mousedown",'.easyjs-modal-title', function(e) {
		        $(this).attr('unselectable', 'on').addClass('draggable');
		        var el_w = $('.draggable').outerWidth(),
		            el_h = $('.draggable').outerHeight();
		        $('body').on("mousemove", function(e) {
		            if ($dragging) {
		                $dragging.offset({
		                    top: e.pageY - el_h / 2,
		                    left: e.pageX - el_w / 2
		                });
		            }
		        });
		        $dragging = $('.easyjs-modal-modal');
		    }).on("mouseup", ".draggable", function(e) {
		        $dragging = null;
		        $(this).removeAttr('unselectable').removeClass('draggable');
		    });
	   	};
	   	
	   	var setbackground = function(){
	   		var doc_width = $(window).innerWidth();
	        var doc_height = $(window).innerHeight();	   		
        	$('body').append('<div class="easyjs-modal-bg"></div>');
        	$('.easyjs-modal-bg').css({
        		'z-index':easyjs.helpers.zindex(),
        		'top':$(document).scrollTop(),
        		'width':doc_width,
        		'height':doc_height
        	});
        	$(".easyjs-modal-bg" ).click(function( event ) {
			  event.preventDefault();
			});
        	$("body").css('overflow','hidden');	   		
	   	};
		
		// Public API
	    return {
	        show			: 	show,
	        close			: 	close,
	        config			:	config
	    };		
		
	})();
	
	// ================================================================================================

	// Public API
    return {
        modal			: 	modal,
        helpers			:	helpers,
        mouse			:	mouse,
        tooltip			:	tooltip,
        menu			:	menu,
        popover			:	popover,
        tour			:	tour,
        cookie			:	cookie,
        draggable		:	draggable,
        contextmenu		:	contextmenu
    };
	
})();

// Initialization on load
var easyjs_path = easyjs.helpers.scriptPath();
easyjs.helpers.loadCSS(easyjs_path+'/easy.css');

// On Ready, init
$(document).ready(function() {
	$('.easyjs-hide').hide();
	easyjs.mouse.init();
	easyjs.menu.init();
	easyjs.popover.init();
});