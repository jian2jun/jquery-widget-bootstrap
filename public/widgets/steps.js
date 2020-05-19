define(['jquery', 'base'], function($){
	
	$.widget('ui.steps', $.ui.base, {
		
		templates: {

	        main: [
				'<ol>{{tmpl(steps) "step"}}</ol>'
	        ].join(''),
	        
	        step: [
				'<li>',
					'<span class="bar"></span>',
					'<span class="step">${step}</span>',
					'<span class="title">${title}</span>',
					'{{if $data.remark}}<p class="remark">{{html remark}}</p>{{/if}}',
				'</li>'   
	        ].join('')
	        
	    },

        options: {       	
        	
            steps: [
                /*
                {step: 1, title: '添加商品信息', remark: 'aaaaa'},
                {step: 2, title: '选择运输线路', remark: 'bbbbb'},
                {step: 3, title: '填写收货地址', remark: 'ccccc'},
                {step: 4, title: '完成新增', remark: 'ddddd'}
                */
            ]	
        },
        
        _create: function(){
        	
        	this._addClass(this.widgetFullName);
        	
        },
        
        _init: function(){
        	
        	this._setOptions();
        	
        	this.element.html(this._tmpl('main', this.options));
        	
        	this.ol = this.element.find('ol');
        	this.li = this.ol.find('li');
        	
        	this._setOl();
        },
        
        _setOptions: function(){
        	var steps = this.options.steps;        	
        	if(typeof steps[0] === 'string'){
        		this.options.steps = $.map(steps, function(item ,i){
        			return {step: i + 1, title: item}
        		});
        	}
        },
        
        _setOl: function(){        	
        	var width = this.li.outerWidth(true);
        	this.ol.css('width', width * this.options.steps.length);
        },
        
        jump: function(n){
        	this.li.removeClass()        		
            	.filter(':lt(' + n + ')').addClass('visited').end()
            	.filter(':eq(' + n + ')').addClass('active');
        }
        
	});

});