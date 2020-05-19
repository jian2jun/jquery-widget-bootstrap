define(['jquery', 'base', 'validate'], function($){
	
	$.widget('ui.stepspage', $.ui.base, {
		
		templates: {

			main: '\
                {{tmpl "layoutTitle"}}\
                <div class="layout-detail">\
                    <div class="row">\
                    	<div class="col-md-9">\
                    		<div class="content"></div>\
						</div>\
						<div class="col-md-3">\
							{{tmpl "steps"}}\
							<div class="buttons">\
                    			<button type="button" class="btn btn-default btn-lg hide prev">上一步</button>\
                    			<button type="button" class="btn btn-primary btn-lg next">下一步</button>\
                    		</div>\
						</div>\
                    </div>\
                </div>',

			layoutTitle: '\
                <div class="layout-title">\
                    <span>${title}</span>\
                </div>',

			steps: '\
				<div class="list-group">\
					{{tmpl(steps) "step"}}\
				</div>',

			step: '\
				<a href="javascript:;" class="list-group-item step">\
					<h5 class="list-group-item-heading">${step} <i class="glyphicon glyphicon-menu-right"></i> ${heading}</h5>\
					<p class="list-group-item-text">${text}</p>\
				</a>'
	        
	    },

        options: {

			title: '',
        	
            steps: [
				/*
				{
					step: 1,
					heading: '设置活动目标',
					text: '设置活动目标用于申请资源审批以及活动落实成效追踪',
					widget: 'active_create_1',
					options: {}
				},
				{
					step: 2,
					heading: '活动基础内容',
					text: '设置活动基础信息以及可参与对象',
					widget: 'active_create_2'
				},
				{
					step: 3,
					heading: '活动方案设置',
					text: '设置活动前置条件以及实施方案',
					widgets: {
						step2-flag1: {
							widget: ''active_create_3_1',
							options: {}
						},
						step2-flag2: {
							widget: ''active_create_3_2',
							options: {}
						}
				},
				{
					step: 4,
					heading: '提交活动申请',
					text: '提请财务以及相关负责人审批',
					widget: 'active_create_4'
				}
				*/
            ],

			activeStep: 0
        },
        
        _create: function(){
        	
        	this._addClass(this.widgetFullName);

			this._on({
				'click .btn.prev': '_clickBtnPrev',
				'click .btn.next': '_clickBtnNext'
			});
        },
        
        _init: function(){
			//this._setGlobal('stepspage', null);
			this.element.html(this._tmpl('main', this.options));
        	
        	this.step = this.element.find('.step');
        	this.content = this.element.find('.content');
			this.prevBtn = this.element.find('.prev');
			this.nextBtn = this.element.find('.next');

			this.jump(this.options.activeStep);
        },
        
        jump: function(n){
			var that = this;
			var step = this.options.steps[n];
			var wt = this._getNextWidget(step);

			this.step.attr('class', 'list-group-item')
            	.filter(':lt(' + n + ')').addClass('visited').end()
            	.filter(':eq(' + n + ')').addClass('active');

			require([wt[0]], function(){
				var data = that.content.data();
				$.each(data, function(key, value){
					if(/ui/.test(key)){
						that.content[value.widgetName]('destroy').empty();
					}
				});
				that.content[wt[0]](wt[1]);
			});

			if(n === this.options.steps.length - 1){
				this._hideBtns();
			}else{
				this._handleBtnPrev(n);
				this._handleBtnCurr(n);
			}
        },

		_getNextWidget: function(step){
			var widget, options;
			if(this.nextWidget && step.widgets){
				widget = step.widgets[this.nextWidget].widget;
				options = step.widgets[this.nextWidget].options;
			}else{
				widget = step.widget;
				options = step.options;
			}
			return [widget, options];
		},

		_handleBtnPrev: function(n){
			if(n > 0){
				this.prevBtn.removeClass('hide');
			}else{
				this.prevBtn.addClass('hide');
			}
		},

		_handleBtnCurr: function(n){
			if(n >= this.options.steps.length - 2){
				this.nextBtn.addClass('complete').text('提交');
			}else{
				this.nextBtn.removeClass('complete').text('下一步');
			}
		},

		_hideBtns: function(){
			this.prevBtn.addClass('hide');
			this.nextBtn.addClass('hide');
		},

		_clickBtnNext: function(event){
			var that = this;
			var target = $(event.currentTarget);
			var step = this.options.steps[this.options.activeStep];
			var steps;
			var wt = this._getNextWidget(step);
			this.content[wt[0]]('validate', function(b, data, nextWidget){
				if(b){
					if(target.hasClass('complete')){
						that._setGlobal('stepspage', null);
					}else{
						steps = that._getGlobal('stepspage') || [];
						steps[step.step] = data;
						that._setGlobal('stepspage', steps);
						that.nextWidget = nextWidget;
					}
					that.jump(++that.options.activeStep);
				}
			});
		},

		_clickBtnPrev: function(event){
			this.jump(--this.options.activeStep);
		}

	});

});