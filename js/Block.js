(function(){
	var Block = window.Block = function(row,col,color){
		//行，0、1、2、3、4、5、6、7
		this.row = row;
		//列，0、1、2、3、4、5、6、7
		this.col = col;
		//颜色，0、1、2、3、4、5
		this.color = color;
		//自己的位置
		this.x = this.col * 40;
		this.y = 180 + this.row * 40;
		//小帧计数器
		this.f = 0;
		//指示爆炸的小动画
		this.bombStep = 0;
		//自己是否正处于爆炸动画中
		this.isBomb = false;
		//自己是否正处于运动动画中
		this.isAnimate = false;
 
	}
	//更新，这个函数每帧执行
	Block.prototype.update = function(){
		//小帧计数器++
		this.f ++;

		//如果自己在运动，那么x、y有增量
		if(this.isAnimate && this.f <= this.endf){
			this.x += this.dx;
			this.y += this.dy;
		}
 
		//爆炸动画
		if(this.isBomb && this.f % 2 == 0){
			this.bombStep ++;
			if(this.bombStep > 9){
				this.hide = true;
			}
		}
	}

	//渲染
	Block.prototype.render = function(){
		//渲染在画布的指定位置
		//图片，切片x，切片y，切片w，切片h，画布位置x，画布位置y，画布位置w，画布位置h
		var qiepianx = this.color % 3 * 76;
		var qiepiany = (this.color < 3) ? 0 : 76;
		//如果自己已经消失了，那么后面的两条渲染，都不执行
		if(this.hide){
			return;
		}
		//根据是否爆炸来渲染不同的情形
		if(!this.isBomb){
			//渲染普通小图
			g.ctx.drawImage(g.Robj["icons"],qiepianx,qiepiany,76,76,this.x,this.y,40,40);
		}else if(this.isBomb){
			//渲染爆炸图
			g.ctx.drawImage(g.Robj["baozha"],this.bombStep % 5 * 192 , parseInt(this.bombStep / 5) * 192,192,192,this.x,this.y,40,40);
		}
	}
	//命令它爆炸！
	Block.prototype.bomb = function(){
		this.isBomb = true;
		//
		this.endbomb = this.f + 10;
	}

	//移动
	Block.prototype.moveTo = function(row , col , frame){
		var frame = frame || 20;
		//写标记
		this.isAnimate = true;
		//增量
		this.dx = (col - this.col) * 40 / frame;
		this.dy = (row - this.row) * 40 / frame;
		//应该结束动画的帧编号
		this.endf = this.f + frame;
		//更改自己的行、列属性
		this.row = row;
		this.col = col;
	}
})();