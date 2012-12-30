
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
	this.state = 0; //surrounding mines counter -1
	
	analytics.Log("New Mine "+this.x+" x "+this.y);
}


Mine.prototype.paint = function(){
	if(mines_ctx!=null){
		ctx = mines_ctx;
		ctx.strokeRect(this.x*mines_size+2,this.y*mines_size+2,mines_size-4,mines_size-4);
	}else{
		analytics.Log("Mine.paint() ERROR CTX = null ("+this.x+" x "+this.y+")");		
	}
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//Board Objects 

function Board(){
    this.changed = false;
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
	fullheight = browserHeight();

	//Check for Canvas support...
	if (canvasNode.getContext){
		 mines_ctx = canvasNode.getContext('2d');
	} else {
		analytics.Log("MakeCanvas(): Canvas not supported.");
		return false;
	}

	
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




function DrawMineField(){
	analytics.Log("DrawMineField(): Board = "+mines_x+" x "+mines_y);
	
	mines_board = new Board();
}



function MinesReady(){
	analytics.Log("MinesReady(): START");
	
	if(MakeCanvas()){
		//Only draw if the canvas is created succesfully
		DrawMineField();
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

