(function(){
	var Map = window.Map = function(){
		//二维码
		this.QRcode = [
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)]
		];
		//存放真实block元素的矩阵
		this.blocks = [[],[],[],[],[],[],[],[]];
		//临时用一下的小矩阵
		//所有需要爆炸的元素的标记
		this.needToBomb = [[],[],[],[],[],[],[],[]];
		//下落行数阵
		this.downRow = [[],[],[],[],[],[],[],[]];
		
		this.createBlocksByQR();
	}
	Map.prototype.createBlocksByQR = function(){
		this.blocks = [[],[],[],[],[],[],[],[]];
		//根据QRcode，把blocks里面填值
		for(var r = 0 ; r < 8 ; r++){
			for(var c = 0 ; c < 8 ; c++){
				this.blocks[r][c] = new Block(r,c,this.QRcode[r][c]);
			}
		}
	}
	//渲染，这个函数每帧执行
	Map.prototype.render = function(){
		//渲染地图就是渲染自己的所有转头
		for(var r = 0 ; r < 8 ; r++){
			for(var c = 0 ; c < 8 ; c++){
				//更新所有转块
				this.blocks[r][c].update();
				//渲染所有转块
				this.blocks[r][c].render();
				//打印地图矩阵
				g.ctx.fillText(this.QRcode[r][c], c * 10 ,60 + r * 10);
				//打印自己needToBomb阵
				if(this.needToBomb[r][c]){
					g.ctx.fillText(this.needToBomb[r][c],100 + c * 10 , 60 + r * 10);
				}
				//打印自己的downRow阵
				if(this.downRow[r][c]){
					g.ctx.fillText(this.downRow[r][c], 200 + c * 10 ,60 + r * 10);
				}
			}
		}
 	}

 	//检测是否爆炸
 	Map.prototype.check = function(){
 		var result = false;
 		//按行、列，分别遍历一遍。
 		for(var r = 0 ; r < 8 ; r++){
	 		var i = 0;
			var j = 1;
			
			while(i < 8){
				if(this.QRcode[r][i] == this.QRcode[r][j]){
					j++;
				}else{
					//把i和j之前的位，推入结果数组
					if(j - i >= 3){
						for(var m = i ; m < j ; m++){
							//命令该爆炸的矩阵，这一位是X
							this.needToBomb[r][m] = "X";
							//爆了
							this.blocks[r][m].bomb();
							result = true;
						}
					}
					i = j ;
					j++;
				}
			}
		}


		//按行、列，分别遍历一遍。
 		for(var c = 0 ; c < 8 ; c++){
	 		var i = 0;
			var j = 1;
			
			while(i < 8){
				if(j < 8 && this.QRcode[i][c] == this.QRcode[j][c]){
					j++;
				}else{
					//把i和j之前的位，推入结果数组
					if(j - i >= 3){
						for(var m = i ; m < j ; m++){
							//命令该爆炸的矩阵，这一位是X
							this.needToBomb[m][c] = "X";
							//爆了
							this.blocks[m][c].bomb();
							result = true;
						}
					}
					i = j ;
					j++;
				}
			}
		}

		return result;
 	}


 	//规整
 	Map.prototype.dropDown = function(){
 		//现在要现提出一个矩阵，这个矩阵表示每一个元素要下落多少行
 		for(var r = 0 ; r < 7 ; r++){
 			for(var c = 0 ; c < 8 ; c++){
 				if(this.needToBomb[r][c] != "X"){
 					 var sum = 0;
 					 for(var m = r + 1 ; m < 8 ; m++){
 					 	if(this.needToBomb[m][c] == "X"){
 					 		sum ++;
 					 	}
 					 }

 					//矩阵上维持这个增量
					this.downRow[r][c] = sum;

					//命令这个元素下落
 					this.blocks[r][c].moveTo(r + sum , c,4);
 				}
 			}
 		}

 		//整理出新的QR矩阵，清空整个QR矩阵
 		for(var r = 0 ; r < 8 ; r++){
 			for(var c = 0 ; c < 8 ; c++){
 				this.QRcode[r][c] = "*";
 			}
 		}
 		//从block阵反推QR阵
 		for(var r = 0 ; r < 8 ; r++){
 			for(var c = 0 ; c < 8 ; c++){
				var theblock = this.blocks[r][c];
				 //如果隐藏了
				if(!this.blocks[r][c].hide){
					this.QRcode[theblock.row][theblock.col] = theblock.color;
				}
 			}
 		}
 	}
 	//补充新的
 	Map.prototype.supplement = function(){
 		//规整一下blocks
 		this.createBlocksByQR();
 		//遍历QR帧，如果这个位置是*，那么就new出一个新的，从-9行往这一行移动
 		for(var r = 0 ; r < 8 ; r++){
 			for(var c = 0 ; c < 8 ; c++){
				if(this.QRcode[r][c] == "*"){
					var color = _.random(0,5);
					this.blocks[r][c] = new Block(-9,c,color);
					this.blocks[r][c].moveTo(r,c,10);
					this.QRcode[r][c] = color;
				}

				//借这个位置，复原一下needToBomb、downRow两个阵
				this.needToBomb[r][c] = undefined;
				this.downRow[r][c] = undefined;
 			}
 		}
 	}

 	//测试把row1,col1和row2,col2两个元素交换位置，能不能进行消行。
 	//如果能，则返回true，并执行动画
 	//如果不能，则返回false。
 	Map.prototype.test = function(row1,col1,row2,col2){
 		//备份当前的QRcode阵
 		var oldQRcode = [[],[],[],[],[],[],[],[]];
 		for(var i = 0; i < 8 ; i++){
 			for(var j = 0 ; j < 8 ; j++){
 				oldQRcode[i][j] = this.QRcode[i][j];
 			}
 		}
 		 
 		//换
 		var c = this.QRcode[row1][col1];
 		this.QRcode[row1][col1] = this.QRcode[row2][col2];
 		this.QRcode[row2][col2] = c;

 		this.createBlocksByQR();
 		//然后check
 		if(this.check()){
 			return true;
 		}else{
 			console.log("B",oldQRcode);
 			//alert("执行了")
			this.QRcode = oldQRcode;
			
 			this.blocks[row1][col1].moveTo(row2,col2);
			this.blocks[row2][col2].moveTo(row1,col1);

 			return false;
 		}
 	}
})();