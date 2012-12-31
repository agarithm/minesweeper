
var mines_debug=false;
var mines_size = 64;
var mines_x = 1;
var mines_y = 1;
var mines_ctx = null;
var mines_board = null;

if(analytics==null)	analytics = new Analytics();

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//Mine Objects 

function Mine(x,y){
	this.x = x;
	this.y = y;
	this.isMine = false;
	this.isSteppedOn = false;
	this.neighbours = 0; //surrounding mines counter
}

Mine.prototype.step = function(){
	analytics.Log("Foot Detected "+this.x+" x "+this.y);
	this.isSteppedOn = true;
	this.paint();
}

Mine.prototype.paint = function(){
	/////////////////////////////////////////////////////////////
	// Helpers

	function clear(mine){
		mines_ctx.clearRect(mine.x*mines_size,mine.y*mines_size,mines_size,mines_size);		
	}
	
	function drawNoStep(mine){
		mines_ctx.strokeRect(mine.x*mines_size+2,mine.y*mines_size+2,mines_size-4,mines_size-4);		
	}
	
	function drawStep(mine){
		
		if(mine.neighbours>0){
			//has some surrounding mines, paint the number
			var fontH = mines_size/2;
			mines_ctx.font = fontH +"px Arial";
			mines_ctx.textAlign = "center";
			mines_ctx.fillText(mine.neighbours, mine.x*mines_size+(mines_size/2), mine.y*mines_size+(mines_size/2)+(fontH/2));
		}else{
			//do nothing (leave it cleared)
		}
	}
	
	function drawBoom(mine){
		var fontH = mines_size/2;
		mines_ctx.font = fontH +"px Arial";
		mines_ctx.textAlign = "center";
		mines_ctx.fillText("M", mine.x*mines_size+(mines_size/2), mine.y*mines_size+(mines_size/2)+(fontH/2));
		
	}
	
	/////////////////////////////////////////////////////////////
	// State Machine
	function drawCurrentState(mine){
		if(mine.isSteppedOn){
			if(mine.isMine){
				drawBoom(mine);
				if(!mines_board.dead){
					analytics.Log("Boom!  Game Over");
					mines_board.GameOver();
				}
			}else{
				drawStep(mine);
			}
		}else{
			drawNoStep(mine);
		}
	}

	/////////////////////////////////////////////////////////////
	// Do it
	if(mines_ctx!=null){
		clear(this);
		drawCurrentState(this);
	}else{
		analytics.Log("Mine.paint() ERROR CTX = null ("+this.x+" x "+this.y+")");		
	}
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//Board Objects 

function BoardClick(event){
	//CODE FROM STACK EXCHANGE: http://stackoverflow.com/a/9961416
	
	var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var x = 0;
    var y = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while (currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    // Fix for variable canvas width
    canvasX = Math.round( canvasX * (this.width / this.offsetWidth) );
    canvasY = Math.round( canvasY * (this.height / this.offsetHeight) );

    //Convert canvas xy to cell XY
	x = Math.floor(canvasX/mines_size);
	y = Math.floor(canvasY/mines_size);
	
	//if first step, mine the board around the first step...
	if(!mines_board.mined){
		mines_board.LayMines(x,y);
	}
	
	//if not dead, fire the event at the mine.
	if(!mines_board.dead){
		mines_board.mine[x][y].step();
	}
}


function Board(){
    this.mined = false;
    this.dead = false;
    this.mine = new Array(mines_x);

    //Create the board
    for(i=0;i<mines_x;i++){
        this.mine[i]=new Array(mines_y);
    }
    
    //Put the mines on the board
	for(i=0;i<mines_x;i++){
		for(j=0;j<mines_y;j++){
			this.mine[i][j] = new Mine(i,j);
			this.mine[i][j].paint();
		}
	}

	//Add the listener
	canvasNode = document.getElementById('mines_canvas');
	canvasNode.addEventListener("mousedown", BoardClick, false);
}

Board.prototype.UpdateNeighbours = function(MineX,MineY){
	var nX = 0;
	var nY = 0;
	for(i=-1;i<2;i++){
		nX = MineX + i;
		if(nX>=0 && nX<mines_x){
			//Valid x Index
			for(j=-1;j<2;j++){
				nY = MineY + j;
				if(nY>=0 && nY<mines_y){
					//Valid Y
					this.mine[nX][nY].neighbours += 1;
					analytics.Log("UpdateNeighbours(): "+nX+" x "+nY+" = "+this.mine[nX][nY].neighbours);
				}
			}
		}
	}
}

Board.prototype.LayMines = function(SafeX,SafeY){
	var cellCount = 0;
	var mineCount = 0;
	
	cellCount = mines_x*mines_y;
	mineCount = Math.floor(cellCount/11) + 1;
	
	while(mineCount>0){
		x=Math.floor(Math.random()*mines_x);
		y=Math.floor(Math.random()*mines_y);

		if(x==SafeX || y==SafeY)continue; //don't put a mine under foot
		
		if(!(this.mine[x][y].isMine)){
			//only lay mines on empty cells
			this.mine[x][y].isMine = true;
			mineCount -= 1;
			//Let the neighbours know about it...
			analytics.Log("LayMines(): "+x+" x "+y);
			this.UpdateNeighbours(x,y);
		}
	}
	
	this.mined = true;
}

Board.prototype.Reveal = function(){
	for(i=0;i<mines_x;i++){
		for(j=0;j<mines_y;j++){
			this.mine[i][j].isSteppedOn = true;
			this.mine[i][j].paint();
		}
	}	
}


Board.prototype.GameOver = function(){
	this.dead = true;
	
	var x = new Number();
	var y = new Number();
	var width = new Number();
	var height = new Number();
	
	var step = mines_size/5;
	
	mines_ctx.clearRect(0,0,mines_x*mines_size,mines_y*mines_size);
	
	
	x = y = step;
	width = mines_x * mines_size - step - step;
	height = mines_y * mines_size - step - step;

	//Explode
	while ((width>mines_size)&&(height>mines_size)){
		mines_ctx.strokeRect(x,y,width,height);
		x += step;
		y += step;
		width -= step*2;
		height -= step*2;
	}
	
	
	
	//Draw a Boom!
	var fontH = mines_size*2;
	mines_ctx.font = fontH +"px Arial";
	mines_ctx.textAlign = "center";
	width = mines_ctx.measureText("Boom!").width + mines_size;
	height = fontH + mines_size;
	x = (mines_x*mines_size - width)/2;
	y = (mines_y*mines_size - height)/2
	mines_ctx.clearRect(x,y,width,height);
	mines_ctx.strokeRect(x,y,width,height);
	
	mines_ctx.fillText("Boom!", mines_x*mines_size/2, mines_y*mines_size/2+(fontH/2));

	
	//boom clears in 2 seconds
	window.setTimeout(function(){mines_board.Reveal()},3500);
}



/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//Setup 


function MakeCanvas(){//returns true if successfull and supported
	//Make the canvas fit the window
	boardHTML = '<canvas id="mines_canvas" name="mines_canvas">ERROR: Your browser does not support canvas.  </canvas>';
	UpdateDiv("mines_board",boardHTML);

	//Size the board properly...
	canvasNode = document.getElementById('mines_canvas');
	//Check for Canvas support...
	if (canvasNode.getContext){
		 mines_ctx = canvasNode.getContext('2d');
	} else {
		analytics.Log("MakeCanvas(): Canvas not supported.");
		return false;
	}

	fullheight = browserHeight();

	cw = mines_size * (Math.floor(canvasNode.parentNode.clientWidth/mines_size));
	ch = mines_size * (Math.floor((fullheight * 0.618)/mines_size));
	
	canvasNode.height = ch;  
	canvasNode.width = cw;

	//store the board dimensions in mines
	mines_x = cw / mines_size;
	mines_y = ch / mines_size;

	analytics.Log("MakeCanvas(): Canvas = "+cw+" x "+ch);
	return true;
}




function MinesReady(){
	analytics.Log("MinesReady(): START");
	
	if(MakeCanvas()){
		//Only draw if the canvas is created succesfully
		mines_board = new Board();
	}

	analytics.Log("MinesReady(): END");
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//Call back for when the JS is loaded.

function MinesInit(){
	if(isDiv("mines_board")){
		//Lazy loading protection... can't really start if the page doesn't exist yet.
		MinesReady();
	}else{
		//polling
		window.setTimeout(function(){MinesInit();},200);
	}
	
}

