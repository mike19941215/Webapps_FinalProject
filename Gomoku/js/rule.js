'use strict';
(function(exports){
    //棋盤格式
    var board_set = 9;
    //計時部分的變數
    var timer = {
      timerun:false, //有時間計時為true
      minuteset:0, //時間計時的設定值，初始為0
      secondset:0,
      minute:0, //紀錄計時器剩餘的時間
      second:0
    };

    //棋子部分的變數
    var chess = {
	  x:0,
	  y:0,
      who:1, //輪到誰 1,2為不同方
      iswin:false, //有人贏了為true
      chesswin:false, //有人五子連為true
      stepcount:0, //現在下幾步棋 初始值為0
      chessstepX:new Array(board_set*board_set), //依順序記錄每步棋的位置
      chessstepY:new Array(board_set*board_set),
      checkloc:false, //棋步確認
      checkX:0,
      checkY:0
    };

    //版面和棋盤狀況
    var rule = function(){
		this.canvassize = (window.innerWidth > 0) ? window.innerWidth : screen.width; //畫板大小
		this.boardsize = this.canvassize/65*55; //棋盤大小
		this.unitlength = this.boardsize/(board_set-1); //棋盤間距
		this.rad = this.boardsize/((board_set-1)*2); //棋子大小
		this.widthsize = this.canvassize/13; //調整棋盤位置
    };

    rule.prototype = {
		
		//重新開始和開始
        restart(){
			this.chessstatus = new Array(board_set); //儲存旗子
            //棋盤狀況 初始狀況全為0(ex:9*9 Array)
            for(var i = 0 ; i < board_set ; i++) {
				this.chessstatus[i] = new Array(board_set);
                for (var j = 0; j < board_set; j++) {
                    this.chessstatus[i][j] = 0;
                }
            }
            chess.who = 1;
            $('#who').text("輪到玩家1");
            chess.checkloc = false;
            chess.iswin = false;
            chess.chesswin = false;
            chess.checkloc = false;
            chess.stepcount = 0;
            this.drawArea();
            if(timer.timerun){
                clearInterval(this.interval);
            }
            this.timerset();
        },
		
		//悔棋
        regret(){
            if(chess.stepcount !== 0 && chess.iswin == false){
                chess.stepcount -= 1;
                var x = chess.chessstepX[chess.stepcount];
                var y = chess.chessstepY[chess.stepcount];
                this.chessstatus[x][y] = 0;
                if(chess.who == 1){
                    chess.who = 2;
                    $('#who').text("輪到玩家2");
                }else if(chess.who == 2){
                    chess.who = 1;
                    $('#who').text("輪到玩家1");
                }
                this.drawArea();
                this.redraw();
                if(timer.timerun){
                    clearInterval(this.interval);
                }
                this.timerset();
            }
        },
		
		//回上一頁(即起始介面)
        backer(){
            if(timer.timerun){
                clearInterval(this.interval);
            }
            clearInterval(this.interval1);
            timer.timerun = false;
        },
		
		//判斷兩次點選是否在同一個位置
        checkchess(e){
            if(chess.iswin == false){
                if(chess.checkloc){
                    chess.x = parseInt((e.pageX-this.widthsize+this.rad)/this.unitlength);
                    chess.y = parseInt((e.pageY-30-this.canvassize/12)/this.unitlength);
                    console.log(chess.y);
                    if(chess.x == chess.checkX && chess.y == chess.checkY){
                        this.redraw();
                        this.player();
                    }else{
                        this.redraw();
                        chess.checkX = parseInt((e.pageX-this.widthsize+this.rad)/this.unitlength);
                        chess.checkY = parseInt((e.pageY-30-this.canvassize/12)/this.unitlength);
                        this.drawcheckPoint();
                    }
                }else{
                    chess.checkX = parseInt((e.pageX-this.widthsize+this.rad)/this.unitlength);
                    chess.checkY = parseInt((e.pageY-30-this.canvassize/12)/this.unitlength);
                    chess.checkloc = true;
                    this.drawcheckPoint();
                }
            }
        },
		
		//玩家下棋判斷
        player(){
            if(chess.iswin == false){
                if(this.chessstatus[chess.x][chess.y] !== 0){
                    //alert("此處已有棋子，不可在此下棋");
                }else if(chess.who ==1){
                    if(timer.timerun){
                        clearInterval(this.interval);
                    }
                    this.timerset();
                    this.chessstatus[chess.x][chess.y] = 1;
                    this.chessstep(chess.x,chess.y);
                    this.drawPoint(chess.who,chess.x,chess.y);
                    this.checkwin(chess.x,chess.y);
                    chess.who = 2;
                }else if(chess.who ==2){
                    if(timer.timerun){
                        clearInterval(this.interval);
                    }
                    this.timerset();
                    this.chessstatus[chess.x][chess.y] = 2;
                    this.chessstep(chess.x,chess.y);
                    this.drawPoint(chess.who,chess.x,chess.y);
                    this.checkwin(chess.x,chess.y);
                    chess.who = 1;
                }
            }


            if(chess.iswin == false && chess.who == 1){
                $('#who').text("輪到玩家1");
            }
            if(chess.iswin == false && chess.who == 2){
                $('#who').text("輪到玩家2");
            }
        },
		
		//設定時間
        timesetting(min,sec){
            timer.minuteset = min;
            timer.secondset = sec;
        },
		
		//設定棋盤大小
        boardset(s){
            board_set = s;
            this.setboardsize();
        },
		
		//畫棋盤
        drawArea(){
            this.ctx = $('#canvas')[0].getContext("2d");
            this.ctx.canvas.width = this.canvassize;
            this.ctx.canvas.height = this.canvassize+this.rad;

            this.ctx.lineWidth=1;
            for(var i = this.widthsize ; i <= this.boardsize+(this.widthsize*1.2) ; i += this.unitlength){
                this.ctx.beginPath();
                this.ctx.moveTo(this.widthsize, i+10);
                this.ctx.lineTo(this.boardsize+this.widthsize, i+10);
                this.ctx.closePath();
                this.ctx.strokeStyle = "#FFF";
                
                this.ctx.moveTo(i, this.widthsize+10);
                this.ctx.lineTo(i, this.boardsize+this.widthsize+10);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            $('#who').css("font-size",this.canvassize/12); //字型調整
            $('#time').css("font-size",this.canvassize/14);
        },
		
		//畫第一次點選瞄準的位置
        drawcheckPoint(){
            this.ctx.beginPath();
            this.ctx.lineWidth=2;
            this.ctx.arc(chess.checkX*this.unitlength+this.widthsize,chess.checkY*this.unitlength+this.widthsize+10,this.rad,0,Math.PI*2,true);
            this.ctx.closePath();
            if(chess.who == 1){
                this.ctx.strokeStyle = "#F00";
            }else if(chess.who == 2){
                this.ctx.strokeStyle = "#00F";
            }
            this.ctx.stroke();
        },
		
		//畫出下的棋子
        drawPoint(color,x,y){
            this.ctx.beginPath();
            this.ctx.arc(x*this.unitlength+this.widthsize,y*this.unitlength+this.widthsize+10,this.rad,0,Math.PI*2,true);
            this.ctx.closePath();
            if(color == 1){
                this.ctx.fillStyle = "#F00";
            }else if(color == 2){
                this.ctx.fillStyle = "#00F";
            }
            this.ctx.fill();
        },

		//調整新棋盤
        setboardsize(){
			this.unitlength = this.boardsize/(board_set-1);
			this.rad = this.boardsize/((board_set-1)*2);
        },
		
		//紀錄每次的棋步
        chessstep(x,y){
            chess.chessstepX[chess.stepcount] = x;
            chess.chessstepY[chess.stepcount] = y;
            chess.stepcount += 1;
        },
		
		//計時跑動
        dropping(){
            if(timer.timerun == true & chess.iswin == false){
                if(timer.second == 0 && timer.minute == 0){
                    clearInterval(this.interval);
                    timer.timerun = false;
                    chess.iswin = true;
                    if(chess.who == 1){
                        alert("時間到，玩家2獲勝!!");
                    }else if(chess.who == 2){
                        alert("時間到，玩家1獲勝!!");
                    }
                }else if(timer.second == 0 && timer.minute > 0){
                    timer.minute -= 1;
                    timer.second = 59;
                }else{
                    timer.second -= 1;
                }
                $('#time').text(this.modify(timer.minute)+":"+this.modify(timer.second));
            }else{
                clearInterval(this.interval);
            }
        },
		
		//悔棋的時候，使用的重繪，繪到悔棋前一步
        redraw(){
            this.drawArea();
            for(var i = 0 ; i < chess.stepcount ; i++){
                if(i % 2 == 0){
                    this.drawPoint(1,chess.chessstepX[i],chess.chessstepY[i]);
                }else{
                    this.drawPoint(2,chess.chessstepX[i],chess.chessstepY[i]);
                }
            }
        },
		
		//勝利判斷
        checkwin(x,y){
            var levelcount = 0;
            var verticalcount = 0;
            var rightslopecount = 0;
            var leftslopecount = 0;

            //水平
            for(var i = x ; i >= 0 ; i--){
                if(this.chessstatus[i][y] != chess.who) {
                    break;
                }
                levelcount++;
            }

            for(var i = x+1 ; i < board_set ; i++){
                if(this.chessstatus[i][y] != chess.who){
                    break;
                }
                levelcount++;
            }

            //垂直
            for(var j = y ; j >=0 ; j--){
                if(this.chessstatus[x][j] != chess.who){
                    break;
                }
                verticalcount++;
            }

            for(var j = y+1 ; j < board_set ; j++){
                if(this.chessstatus[x][j] != chess.who){
                    break;
                }
                verticalcount++;
            }

            //右斜
            for(var i = x, j = y ; i >= 0 && j < board_set ; i--,j++){
                if(this.chessstatus[i][j] != chess.who){
                    break;
                }
                rightslopecount++;
            }

            for(var i = x+1, j = y-1 ; i < board_set && j >= 0 ; i++,j--){
                if(this.chessstatus[i][j] != chess.who){
                    break;
                }
                rightslopecount++;
            }

            //左斜
            for(var i = x, j = y ; i >= 0 && j >= 0 ; i--,j--){
                if(this.chessstatus[i][j] != chess.who){
                    break;
                }
                leftslopecount++;
            }

            for(var i = x+1, j = y+1 ; i < board_set && j < board_set ; i++,j++){
                if(this.chessstatus[i][j] != chess.who){
                    break;
                }
                leftslopecount++;
            }

            if(levelcount >=5 || verticalcount >=5 || rightslopecount >=5 || leftslopecount >=5){
                chess.iswin = true;
                chess.chesswin = true;
                if(chess.who == 1){
                    alert("玩家1獲勝!!");
                }
                if(chess.who == 2){
                    alert("玩家2獲勝!!");
                }
                this.drawchessstep();
            }
        },

        //棋譜
        drawchessstep(){
            if(chess.chesswin){
				var font1 = (1.8*this.rad)+"px Arial"; //微幅度調整字型大小
				var font2 = (1.5*this.rad)+"px Arial";
				var font3 = (1.2*this.rad)+"px Arial";
                for(var i = 0 ; i < 9 && i < chess.stepcount ; i ++){
                    this.ctx.font = font1;
                    this.ctx.fillStyle = "#FFF";
                    this.ctx.fillText(i+1,chess.chessstepX[i]*this.unitlength+this.widthsize-(this.rad*0.5),chess.chessstepY[i]*this.unitlength+this.widthsize+10+(this.rad*0.6));
                }
				for(var i = 9; i < 99 && i < chess.stepcount ; i++){
					this.ctx.font = font2;
                    this.ctx.fillStyle = "#FFF";
					this.ctx.fillText(i+1,chess.chessstepX[i]*this.unitlength+this.widthsize-(this.rad*0.8),chess.chessstepY[i]*this.unitlength+this.widthsize+10+(this.rad*0.55));
				}
				for(var i = 99; i < chess.stepcount; i++){
					this.ctx.font = font3;
                    this.ctx.fillStyle = "#FFF";
					this.ctx.fillText(i+1,chess.chessstepX[i]*this.unitlength+this.widthsize-(this.rad*1),chess.chessstepY[i]*this.unitlength+this.widthsize+10+(this.rad*0.50));
				}
            }
        },
		
		//時間設定，控制是否要計時
        timerset(){
            if(timer.minuteset == 0 && timer.secondset == 0){
                clearInterval(this.interval);
                timer.timerun = false;
                timer.minute = 0;
                timer.second = 0;
                $('#time').text(this.modify(timer.minute)+":"+this.modify(timer.second));
            }else{
                timer.minute = timer.minuteset;
                timer.second = timer.secondset;
                $('#time').text(this.modify(timer.minute)+":"+this.modify(timer.second));
                timer.timerun = true;
                this.interval = setInterval(this.dropping.bind(this), 1000);
            }
        },

        modify(num){
            var n = num;
            if (n > 99)
                n = Math.floor(n / 10);
            return n < 10? "0"+ n : n;
        }

    };
    exports.rule = rule;
})(window);
