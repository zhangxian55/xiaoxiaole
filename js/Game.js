(function(){
	var Game = window.Game = function(){
		//得到canvas
		this.canvas = document.getElementsByTagName("canvas")[0];
		//上下文
		this.ctx = this.canvas.getContext("2d");
		//帧编号
		this.f = 0;
		//当前游戏状态
		this.STATE = "爆破检查";  //爆破检查、爆破动画、下落动画、补充新的、静稳状态

		//加载所有资源，资源都load之后，定时器开启
		this.R = {
			"bg" : "images/bg.png",
			"icons" : "images/icons.png",
			"baozha" : "images/baozha.png"
		}
		//把所有的图片放到一个对象中
		this.Robj = {};	//两个对象有相同的k
		//图片总数
		var amount = _.keys(this.R).length;
		//已经加载好的图片数量
		var already = 0;
		//备份
		var self = this;
		//是否触发拖拽
		this.istuozhuai = false;

		//遍历R对象，把真实image对象，让如this.Robj中
		for(var k in this.R){
			this.Robj[k] = new Image();
			this.Robj[k].src = this.R[k];
			this.Robj[k].onload = function(){
				already++;
				//清屏
				self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
				//显示当前加载了都少张
				self.ctx.fillText("正在加载资源" + already + "/" + amount , 10, 20);
				//当已经加载好的图片个数，和所有图片个数一样，说明都好了，开始游戏
				if(already == amount){
					self.start();
				}
			}
		}
	}

	//绑定监听
	Game.prototype.bindEvent = function(){
		var self = this;
		//鼠标按下
		g.canvas.onmousedown = function(event){
			//记录鼠标按下时候的位置
			self.col1 = parseInt(event.offsetX / 40);
			self.row1 = parseInt((event.offsetY - 180) / 40);

			//鼠标移动
			g.canvas.onmousemove = function(event){
				event.preventDefault();

				if(self.STATE != "静稳状态"){
					return;
				}
				//实时记录鼠标移动的位置
				self.col2 = parseInt(event.offsetX / 40);
				self.row2 = parseInt((event.offsetY - 180) / 40);

				g.map.createBlocksByQR();
				//判定谁滑动向谁
				if(self.col2 != self.col1 || self.row2 != self.row1){
					//console.log("从" + row1 + "," + col1 + "滑到了" + row2 + "," + col2);
					//删除自己的监听，防止再次触发
					self.canvas.onmousemove = null;
					//命令元素交换位置
					self.map.blocks[self.row1][self.col1].moveTo(self.row2,self.col2,6);
					self.map.blocks[self.row2][self.col2].moveTo(self.row1,self.col1,6);
					// //命令试探是否能消除
					// g.map.test(row1,col1,row2,col2);

					//改变标记
					self.istuozhuai = true;
					//写当前帧
					self.starttuozhuai = self.f;
				}
			}
		}

		g.canvas.onmouseup = function(){
			g.canvas.onmousemove = null;
		}
	}
	//游戏开始
	Game.prototype.start = function(){
		//地图，唯一的实例
		this.map = new Map();
		//添加监听
		this.bindEvent();
		//主循环开始
		this.timer = setInterval(function(){
			g.mainloop();
		},20);
	}
	//主循环，每帧执行
	Game.prototype.mainloop = function(){
		//清屏
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		//帧编号
		this.f++;
		//绘制背景。背景没动,也要每帧擦除，重绘
		this.ctx.drawImage(this.Robj["bg"], 0,0,this.canvas.width, this.canvas.height);
		//打印帧编号
		this.ctx.fillText(this.f , 10 ,20);
		//打印游戏状态
		this.ctx.fillText(this.STATE , 50 ,20);
		//绘制地图
		this.map.render();

		//有限状态机！！！
		if(this.STATE == "爆破检查"){
			if(this.map.check()){
				//打一个标记
				this.startBomb = this.f;
				//瞬间变为爆破动画
				this.STATE = "爆破动画";
			}else{
				this.STATE = "静稳状态";
			}
			//20帧之后，调用补充新的
		}else if(this.STATE == "爆破动画" && this.f > this.startBomb + 21){
			this.STATE = "下落动画";
			this.map.dropDown();
			this.startDropDown = this.f
		}else if(this.STATE == "下落动画" && this.f > this.startDropDown + 5){
			this.STATE = "补充新的";
			this.map.supplement();
			this.startSupple = this.f;
		}else if(this.STATE == "补充新的" && this.f > this.startSupple + 11){
			this.STATE = "爆破检查"
			this.map.check();
		}else if(this.STATE == "静稳状态"){
			//console.log(this.istuozhuai , this.starttuozhuai)
			if(this.istuozhuai && this.f == this.starttuozhuai + 6){
				if(this.map.test(this.row1,this.col1,this.row2,this.col2)){
					this.STATE = "爆破检查";
				} 
				this.istuozhuai = false;
			}
		} 
	}
})();