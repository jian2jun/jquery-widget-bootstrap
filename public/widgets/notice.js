define(['jquery', 'base', 'dialog'], function($){

    $.widget('ui.notice', $.ui.base, {
    	
    	templates: {    		

			main: '\
				<span class="icon ${icon}"></span>\
				<div class="message">{{html message}}</div>'
    	},
    	
    	options: {
			type: 'info', //类型，success/info/warning/danger
			message: '', //内容，字符串或jquery对象
			fade: false,	//动画效果
			time: 3000,	//自动关闭时间

			complete: null	//关闭后回调事件
        },

        _create: function(){
			this.options.classes[this.widgetFullName] = this.options.type;
			this._addClass(this.widgetFullName);
        },
        
        _init: function(){
            this._handleOptions();

            this.element.dialog({
            	title:　'',
    			size: 'sm',
				fade: this.options.fade,
    			content: this._tmpl('main', this.options), 
    			backdrop: false,
            	keyboard: false
            });

            this._setAutoClose();
        },

		_handleOptions: function(){
			switch(this.options.type){
				case 'success':
					this.options.icon = 'glyphicon glyphicon-ok-sign';
					break;
				case 'info':
					this.options.icon = 'glyphicon glyphicon-info-sign';
					break;
				case 'warning':
					this.options.icon = 'glyphicon glyphicon-exclamation-sign';
					break;
				case 'danger':
					this.options.icon = 'glyphicon glyphicon-remove-sign';
					break;
			}

			if(this.options.message.jquery){
				this.options.message = this._outerHtml(this.options.message);
			}
        },
        
        _setAutoClose: function(){
        	
        	var that = this; 
        	var interval, time;
        	
        	if(this.options.time <= 0){
				this._trigger('complete');
				this.close();
        	}else{
				time = Math.ceil(this.options.time / 500);
				interval = setInterval(function(){
					time--;
					if(time <= 0){
						clearInterval(interval);
						that._trigger('complete');
						that.close();
					}
				}, 500);
        	}
        },

		close: function(){
        	this.element.dialog('close');
        }
    	
    });

});