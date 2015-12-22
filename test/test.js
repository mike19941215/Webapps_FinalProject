var assert = require('assert');
var board_set = 9;
var rule = {
	canvassize:280,
	boardsize:240,
	unitlength:30,
	rad:15,
	widthsize:20
};
var chess = {
	x:0,
	y:0,
	who:1,
	iswin:false,
	chesswin:false,
	stepcount:0,
	chessstepX:new Array(board_set*board_set),
	chessstepY:new Array(board_set*board_set),
	checkloc:false,
	checkX:0,
	checkY:0
};
var timer = {
	timerun:false,
	minuteset:0,
	secondset:0,
	minute:0,
	second:0
};

var chessstatus = new Array(board_set); //棋盤狀況 初始狀況全為0(ex:9*9 Array)
for(var i = 0 ; i < board_set ; i++) {
	chessstatus[i] = new Array(board_set);
	for (var j = 0; j < board_set; j++) {
		chessstatus[i][j] = 0;
	}
}

describe('Gomoku',function(){
	describe('player',function(){
		describe('Set redchess',function(){
			it('redchess',function(){
				chess.x = 1;
				chess.y = 1;
				player();
				assert.equal('1',chessstatus[chess.x][chess.y]);
			})
			it('next player',function(){
				assert.equal('2',chess.who);
			})
		})
		describe('Set bluechess',function(){
			it('bluechess',function(){
				chess.x = 2;
				chess.y = 1;
				player();
				assert.equal('2',chessstatus[chess.x][chess.y]);
			})
			it('next player',function(){
				assert.equal('1',chess.who);
			})
		})
		describe('repeat place',function(){
			it('place status',function(){
				chess.x = 2;
				chess.y = 1;
				player();
				assert.equal('2',chessstatus[chess.x][chess.y]);
			})
			it('next player',function(){
				assert.equal('1',chess.who);
			})
		})
	})

	describe('chessstep',function(){
		it('chessnumber',function(){
			assert.equal('2',chess.stepcount);
		})
		describe('save chessstep',function(){
			it('first chessstep',function(){
				assert.equal('1',chess.chessstepX[0]);
				assert.equal('1',chess.chessstepY[0]);
			})
			it('second chessstep',function(){
				assert.equal('2',chess.chessstepX[1]);
				assert.equal('1',chess.chessstepY[1]);
			})
		})
	})
	
	describe('regret',function(){
		it('place status',function(){
			regret();
			var x = chess.chessstepX[chess.stepcount];
			var y = chess.chessstepY[chess.stepcount];
			assert.equal('0',chessstatus[x][y]);
		})
		it('next player',function(){
			assert.equal('2',chess.who);
		})
	})

	describe('checkwin',function(){
		it('iswin',function(){
			chess.x = 2;chess.y = 1;player();
			chess.x = 2;chess.y = 2;player();
			chess.x = 3;chess.y = 1;player();
			chess.x = 3;chess.y = 3;player();
			chess.x = 4;chess.y = 1;player();
			chess.x = 4;chess.y = 4;player();
			chess.x = 5;chess.y = 1;player();
			chess.x = 5;chess.y = 5;player();
			assert.equal(true,chess.iswin);
		})
		it('winner',function(){
			assert.equal('1',chess.who);
		})
		it('game end',function(){
			chess.x = 6;chess.y = 6;player();
			assert.equal('0',chessstatus[chess.x][chess.y]);
		})
	})
	
	describe('restart',function(){
		it('next player',function(){
            restart();
            assert.equal('1',chess.who);
        })
        it('iswin',function(){
            assert.equal(false,chess.iswin);
        })
        it('chessnumber',function(){
            assert.equal('0',chess.stepcount);
        })
	})

    describe('time dropping',function(){
        it('time rum',function(){
            timesetting(0,10);
            timerset();
            dropping();
            assert.equal(true,timer.timerun);
            assert.equal('0',timer.minute);
            assert.equal('9',timer.second);
        })
        describe('time up',function(){
            it('time stop',function(){
                timer.minute = 0;
                timer.second = 0;
                dropping();
                assert.equal(false,timer.timerun);
            })
            it('iswin',function(){
                assert.equal(true,chess.iswin)
            })
        })
    })
});

var player = function(){
	if(chess.iswin == false) {
		if (chessstatus[chess.x][chess.y] !== 0) {
			//alert("此處已有棋子，不可在此下棋");
		} else if (chess.who == 1) {
			chessstatus[chess.x][chess.y] = 1;
			chessstep(chess.x,chess.y);
			checkwin(chess.x,chess.y);
			if(chess.iswin == false){
				chess.who = 2;
			}
		} else if (chess.who == 2) {
			chessstatus[chess.x][chess.y] = 2;
			chessstep(chess.x,chess.y);
			checkwin(chess.x,chess.y);
			if(chess.iswin == false){
				chess.who = 1;
			}
		}
	}
};

var chessstep = function(x,y){
	chess.chessstepX[chess.stepcount] = x;
	chess.chessstepY[chess.stepcount] = y;
	chess.stepcount += 1;
};

var regret = function(){
    if(chess.stepcount !== 0 && chess.iswin == false){
        chess.stepcount -= 1;
        var x = chess.chessstepX[chess.stepcount];
        var y = chess.chessstepY[chess.stepcount];
        chessstatus[x][y] = 0;
        if(chess.who == 1){
            chess.who = 2;
        }else if(chess.who == 2){
            chess.who = 1;
        }
    }
};

var checkwin = function(x,y){
	var levelcount = 0;
	var verticalcount = 0;
	var rightslopecount = 0;
	var leftslopecount = 0;

	//水平
	for(var i = x ; i >= 0 ; i--){
		if(chessstatus[i][y] != chess.who) {
			break;
		}
		levelcount++;
	}

	for(var i = x+1 ; i < board_set ; i++){
		if(chessstatus[i][y] != chess.who){
			break;
		}
		levelcount++;
	}

	//垂直
	for(var j = y ; j >=0 ; j--){
		if(chessstatus[x][j] != chess.who){
			break;
		}
		verticalcount++;
	}

	for(var j = y+1 ; j < board_set ; j++){
		if(chessstatus[x][j] != chess.who){
			break;
		}
		verticalcount++;
	}

	//右斜
	for(var i = x, j = y ; i >= 0 && j < board_set ; i--,j++){
		if(chessstatus[i][j] != chess.who){
			break;
		}
		rightslopecount++;
	}

	for(var i = x+1, j = y-1 ; i < board_set && j >= 0 ; i++,j--){
		if(chessstatus[i][j] != chess.who){
			break;
		}
		rightslopecount++;
	}

	//左斜
	for(var i = x, j = y ; i >= 0 && j >= 0 ; i--,j--){
		if(chessstatus[i][j] != chess.who){
			break;
		}
		leftslopecount++;
	}

	for(var i = x+1, j = y+1 ; i < board_set && j < board_set ; i++,j++){
		if(chessstatus[i][j] != chess.who){
			break;
		}
		leftslopecount++;
	}

	if(levelcount >=5 || verticalcount >=5 || rightslopecount >=5 || leftslopecount >=5){
		chess.iswin = true;
		chess.chesswin = true;
	}
};

var restart = function(){
    //棋盤狀況 初始狀況全為0(ex:9*9 Array)
    for(var i = 0 ; i < board_set ; i++) {
        for (var j = 0; j < board_set; j++) {
            chessstatus[i][j] = 0;
        }
    }
    chess.who = 1;
    chess.checkloc = false;
    chess.iswin = false;
    chess.chesswin = false;
    chess.checkloc = false;
    chess.stepcount = 0;
};


var timesetting = function(min,sec){
    timer.minuteset = min;
    timer.secondset = sec;
};

var timerset = function(){
    if(timer.minuteset == 0 && timer.secondset == 0){
        timer.timerun = false;
        timer.minute = 0;
        timer.second = 0;
    }else{
        timer.minute = timer.minuteset;
        timer.second = timer.secondset;
        timer.timerun = true;
    }
};
var dropping = function(){
    if(timer.timerun == true & chess.iswin == false){
        if(timer.second == 0 && timer.minute == 0){
            timer.timerun = false;
            chess.iswin = true;
        }else if(timer.second == 0 && timer.minute > 0){
            timer.minute -= 1;
            timer.second = 59;
        }else {
            timer.second -= 1;
        }
    }
};