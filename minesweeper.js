
var sudoku_debug=false;
var sudoku_animation_depth = 5; //bigger is more animation and longer running times
var currentG=4;
var currentP=4;

function BoardData(){
    this.changed = false;
    this.arr = new Array(9);
    
    for(i=0;i<9;i++){
        this.arr[i]=new Array(9);
    }
}

function GetCell(g,p){
    var cell;
    var collect;
    collect = document.getElementsByName(g+'_'+p);
    cell = collect.item(0);
    return cell;
}

function IsInvalidCellContents(cell){
    var invalid = false;
    var num=cell.value;
    //check length bigger than 1
    if(cell.length>1){
        invalid=true;
    }
    //check for invalid charachters
    num = cell.value;
    if (isNaN(num)||num<1||num>9){
        invalid=true;
    }
    return invalid;
}        


/***************************************************************************

Hint: address lookup of (g,p)
    (0,0)   (0,1)   (0,2)   (1,0)   (1,1)   (1,2)   (2,0)   (2,1)   (2,2)
    (0,3)   (0,4)   (0,5)   (1,3)   (1,4)   (1,5)   (2,3)   (2,4)   (2,5)
    (0,6)   (0,7)   (0,8)    ...     ...     ...     ...     ...     ...
    (3,0)   (3,1)   (3,2)    ...     ...     ...     ...     ...     ...
    (3,3)   (3,4)   (3,5)    ...     ...     ...     ...     ...     ...
    (3,6)   (3,7)   (3,8)    ...     ...     ...     ...     ...     ...
    (6,0)   (6,1)   (6,2)   (7,0)   (7,1)   (7,2)   (8,0)   (8,1)   (8,2)
    (6,3)   (6,4)   (6,5)    ...     ...     ...     ...     ...     ...
    (6,6)   (6,7)   (6,8)    ...     ...     ...     ...     ...     ...




Hint: address lookup of (r,c)
    (0,0)   (0,1)   (0,2)   (0,3)   (0,4)   (0,5)   (0,6)   (0,7)   (0,8)
    (1,0)    ...     ...     ...     ...     ...     ...     ...     ...
    (2,0)    ...     ...     ...     ...     ...     ...     ...     ...
    (3,0)    ...     ...     ...     ...     ...     ...     ...     ...
    (4,0)    ...     ...     ...     ...     ...     ...     ...     ...
    (5,0)    ...     ...     ...     ...     ...     ...     ...     ...
    (6,0)    ...     ...     ...     ...     ...     ...     ...     ...
    (7,0)    ...     ...     ...     ...     ...     ...     ...     ...
    (8,0)    ...     ...     ...     ...     ...     ...     ...     ...
    
**************************************************************************/

function GetCellFromRowCol(r,c){
    var g;
    var p;
    
    //Calculate g
    g  = ((c - (c % 3)) / 3) + (((r - (r % 3)) / 3)*3);
    
    //Calculate p
    p  = (c % 3) + ((r % 3) * 3);
    
    return GetCell(g,p);
}

function DoWithVerticles(g,p,fPointer){
    var origCell;
    var compCell;
    var gLoop;
    var gLoopStart;
    var gLoopEnd;
    var pLoop;
    var pLoopStart;
    var pLoopEnd;
    
    //Get Cell contents
    origCell = GetCell(g,p);
    if(origCell.value=='')return; //don't check blank cells
    
    //////////////////////////////////////////////////////
    //Verticles
    //G loop vars
    gLoopStart = g % 3;
    gLoopEnd = gLoopStart+6;
    //p loop vars
    pLoopStart = p % 3;
    pLoopEnd = pLoopStart+6;
    for(gLoop=gLoopStart;gLoop<=gLoopEnd;gLoop+=3){
        for(pLoop=pLoopStart;pLoop<=pLoopEnd;pLoop+=3){
            //if vert violation
            //then color conflicting cell
            if((g==gLoop)&&(p==pLoop)){
                //do nothing, don't compare to self.    
            }else{
                compCell = GetCell(gLoop,pLoop);
                fPointer(origCell,compCell);
            }
        }
    }
}

function DoWithGridicles(g,p,fPointer){
    var origCell;
    var compCell;
    var gLoop;
    var pLoop;
    var pLoopStart;
    var pLoopEnd;
    
    //Get Cell contents
    origCell = GetCell(g,p);
    if(origCell.value=='')return; //don't check blank cells
    
    //////////////////////////////////////////////////////
    //Verticles
    //G loop vars
    gLoop=g;
    //p loop vars
    pLoopStart = 0;
    pLoopEnd = 8;
    for(pLoop=pLoopStart;pLoop<=pLoopEnd;pLoop++){
        //if vert violation
        //then color conflicting cell
        if((g==gLoop)&&(p==pLoop)){
            //do nothing, don't compare to self.    
        }else{
            compCell = GetCell(gLoop,pLoop);
            fPointer(origCell,compCell);
        }
    }
}

function DoWithHorizontals(g,p,fPointer){
    var origCell;
    var compCell;
    var gLoop;
    var gLoopStart;
    var gLoopEnd;
    var pLoop;
    var pLoopStart;
    var pLoopEnd;
    
    //Get Cell contents
    origCell = GetCell(g,p);
    if(origCell.value=='')return; //don't check blank cells
    
    //////////////////////////////////////////////////////
    //Horizontals
    //G loop vars
    gLoopStart = ((g - (g % 3)) / 3) * 3;
    gLoopEnd = gLoopStart+2;
    //p loop vars
    pLoopStart = ((p - (p % 3)) / 3) * 3;
    pLoopEnd = pLoopStart+2;
    for(gLoop=gLoopStart;gLoop<=gLoopEnd;gLoop++){
        for(pLoop=pLoopStart;pLoop<=pLoopEnd;pLoop++){
            //if vert violation
            //then color conflicting cell
            if((g==gLoop)&&(p==pLoop)){
                //do nothing, don't compare to self.    
            }else{
                compCell = GetCell(gLoop,pLoop);
                fPointer(origCell,compCell);
            }
        }
    }
}

function PaintErrorCell(orig,comp){
    if(comp.value==orig.value){
        comp.setAttribute('id','sudoku_error');
        orig.setAttribute('id','sudoku_error');
    }
}

function PaintOrClearErrorCell(orig,comp){
    if(comp.value==orig.value){
        comp.setAttribute('id','sudoku_error');
    }else{
        comp.setAttribute('id','sudoku_ok');                
    }
}


function FastCheck(){
    //true if done
    //any error Cells?
    cell = document.getElementById('sudoku_error');
    if(cell==null){
        //Any cells empty?    
        for(g=0;g<=8;g++){
            for(p=0;p<=8;p++){
                switch(GetCell(g,p).value){
                    case '':
                        return false;    
                    
                }
            }
        }
        return true;
    }
    return false;
}


function CheckBoard(){
    var g;
    var p;
    var count;
    var cell;
    count = 0;
    //check all cells
    for(g=0;g<=8;g++){
        for(p=0;p<=8;p++){
            //Set Cell Ok
            cell = GetCell(g,p);
            cell.setAttribute('id','sudoku_ok');
            
            //check to see if there is a value here
            if(cell.value != '')count++;
            
            //////////////////////////////////////////////////////
            //Horizontals
            DoWithHorizontals(g,p,PaintErrorCell);
            
            //////////////////////////////////////////////////////
            //Verticles
            DoWithVerticles(g,p,PaintErrorCell);
                            
            //////////////////////////////////////////////////////
            //Grid-icles
            DoWithGridicles(g,p,PaintErrorCell);
        }
    }
    
    if(count==81){
        //every cell has a value are any error cells?
        cell = document.getElementById('sudoku_error');
        if(cell==null){
            cell = document.getElementById('sudoku_board');
            if(cell!=null){
                cell.setAttribute('id','sudoku_board_solved');
                return true;
            }
        }
    }
    return false;
}


function CheckRules(g,p){
    //called when keyboard events
    var origCell;
    var compCell;
    var gLoop;
    var gLoopStart;
    var gLoopEnd;
    var pLoop;
    var pLoopStart;
    var pLoopEnd;
    
    //Get Cell contents
    origCell = GetCell(g,p);
    origCell.setAttribute('id','sudoku_ok');
    
    //if invalid characters
    if(IsInvalidCellContents(origCell)){
        //then clear cell
        origCell.value = "";
    }else{
        //else check the rules

        //////////////////////////////////////////////////////
        //Horizontals
        DoWithHorizontals(g,p,PaintOrClearErrorCell);
        
        //////////////////////////////////////////////////////
        //Verticles
        DoWithVerticles(g,p,PaintOrClearErrorCell);
                        
        //////////////////////////////////////////////////////
        //Grid-icles
        DoWithGridicles(g,p,PaintOrClearErrorCell);
    }
    if(sudoku_debug)console.log('<< CheckRules(grid='+g+', pos='+p+')');
}


function SaveBoard(){
    //Read dot notation
    var dots = document.getElementById('sudoku_dots');
    var cell;
    var r;
    var c;
    
    dots.value = '';
    for(c=0;c<=8;c++){
        for(r=0;r<=8;r++){
            cell = GetCellFromRowCol(r,c);     
            
            switch(cell.value){
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    dots.value += cell.value;
                    break;
                default:
                    dots.value += '.';
                    break;
            }
        }
    }
    ReloadBoard();
}


function ReloadBoard(){
    //Read dot notation
    var dots = new String(document.getElementById('sudoku_dots').value);
    var pos;
    var ch;
    var cell;
    var r;
    var c;
    
    pos = 0;
    for(c=0;c<=8;c++){
        for(r=0;r<=8;r++){
            cell = GetCellFromRowCol(r,c);     
            
            ch = dots.substr(pos,1);
            
            switch(ch){
                case '.':
                    cell.value = '';
                    break;
                default:
                    cell.value = ch;
                    break;
            }
            pos++;
        }
    }
    cell = document.getElementById('sudoku_board_solved');
    if(cell!=null){
        cell.setAttribute('id','sudoku_board');
    }
    CheckBoard();
}

function RowContainsDigit(liveBoard,r,digit){
    var c;
    for(c=0;c<9;c++){
        if(liveBoard.arr[r][c].value == digit)return true;    
    }
    
    return false;    
}


function ColContainsDigit(liveBoard,c,digit){
    var r;
    for(r=0;r<9;r++){
        if(liveBoard.arr[r][c].value == digit)return true;    
    }
    
    return false;    
}

function MarkPossible(digit,possible,liveBoard){
    var r;
    var c;
    //clear all data
    for(r=0;r<=8;r++){
        for(c=0;c<=8;c++){
            possible.arr[r][c] = 0;     
        }
    }
    //scan row for digit
    for(r=0;r<9;r++){
        if(!RowContainsDigit(liveBoard,r,digit)){
            //increment the empty spaces
            for(c=0;c<9;c++){
                if(!(liveBoard.arr[r][c].value > 0)){
                    possible.arr[r][c] += 1;
                }
            }
        }
    }
    //scan col for digit
    for(c=0;c<9;c++){
        if(!ColContainsDigit(liveBoard,c,digit)){
            //increment the empty spaces
            for(r=0;r<9;r++){
                if(!(liveBoard.arr[r][c].value > 0)){
                    possible.arr[r][c] += 1;
                }
            }
        }
    }
    
    //By now each possible location should have a 2 in it.
    //This indicates that the row and col are clear at this location
    //and thus is a possible location for this digit...

}        

function ClearGrid(possible, g){
    var r;
    var c;
    
    var x = (g%3)*3;
    var y = (g-(g%3))/3*3;
    
    for(r=0;r<3;r++){
        for(c=0;c<3;c++){
            possible.arr[r+y][c+x] = 0;
        }
    }
}

function CheckGrid(possible, digit, g){
    var p;
    //Check if there is a digit already in the zone.
    for(p=0;p<=8;p++){
        if(((GetCell(g,p).value)-digit)==0){
            ClearGrid(possible,g);
            break;
        }
    }
}

function CheckGridTriples(possible,digit,g){
    var x = (g%3)*3;
    var y = (g-(g%3))/3*3;
    var s = new Array(10);
    var t = new Array(10);;
    var pCount=0;
    var r;
    var c;
                
    for(r=y,i=0;i<3;r++,i++){
        for(c=x,j=0;j<3;c++,j++){
            if((possible.arr[r][c]-2) == 0){
                pCount++;    
                s[pCount] = r;
                t[pCount] = c;
            }
        }
    }

    if((pCount-3)==0){
        //Only three spots for this digit in this zone, so check it!
		if(s[1]==s[2]&&s[2]==s[3]){
			//In same Row - remove possibles from other zones in same Row
			for(c=0;c<9;c++){
				possible.arr[s[1]][c]=0;
			}
		}
		if(t[1]==t[2]&&t[2]==t[3]){
			//In same Col - remove possibles from other zones in same Col
			for(r=0;r<9;r++){
	            possible.arr[r][t[1]]=0;
			}
        }
		//Put Back the possibles cuz they were removed
		possible.arr[t[1]][s[1]]=2;
		possible.arr[t[2]][s[2]]=2;
		possible.arr[t[3]][s[3]]=2;
	}

}

function CheckGridDoubles(possible,digit,g){
    var x = (g%3)*3;
    var y = (g-(g%3))/3*3;
    var s = new Array(10);
    var t = new Array(10);;
    var pCount=0;
    var r;
    var c;
                
    for(r=y,i=0;i<3;r++,i++){
        for(c=x,j=0;j<3;c++,j++){
            if((possible.arr[r][c]-2) == 0){
                pCount++;    
                s[pCount] = r;
                t[pCount] = c;
            }
        }
    }

    if((pCount-2)==0){
        //Only two spots for this digit in this zone, so check it!
		if(s[1]==s[2]){
			//In same Row - remove possibles from other zones in same Row
			for(c=0;c<9;c++){
				possible.arr[s[1]][c]=0;
			}
		}
		if(t[1]==t[2]){
			//In same Col - remove possibles from other zones in same Col
			for(r=0;r<9;r++){
	            possible.arr[r][t[1]]=0;
			}
        }
		//Put Back the possibles cuz they were removed
		possible.arr[t[1]][s[1]]=2;
		possible.arr[t[2]][s[2]]=2;
	}

}

function TakeIt(cell,digit){
	//Returns true if no error
	rtn = false;
    cell.value = digit;
    if(CheckBoard()){
    	rtn = true; //Done
    }else{
        //Check For Errors
        err = document.getElementById('sudoku_error');
        if(err==null){
        	cell.setAttribute('id','sudoku_hint');   
        	rtn = true;
        }else{
        	cell.value = '';
        }        	
    }

    return rtn;
}

function CheckGridSingles(possible,digit,g){
    var x = (g%3)*3;
    var y = (g-(g%3))/3*3;
    var s;
    var t;
    var pCount;
    var r;
    var c;
    var rtn;
    
    rtn = false;
    pCount = 0;            
    for(r=y,i=0;i<3;r++,i++){
        for(c=x,j=0;j<3;c++,j++){
            if((possible.arr[r][c]-2) == 0){
                s = r;
                t = c;
                pCount++;    
            }
        }
    }
    
    if((pCount-1)==0){
        //found a single (only posible location, so take it)
        var cell = GetCellFromRowCol(s,t);
        rtn = TakeIt(cell,digit); //changed
    }
    
    return rtn;
}


function CheckRowSingles(possible, digit){
    //Check the rows for a single possible value    
    var s;
    var t;
    var pCount;
    var r;
    var c;
    var rtn;
    
    rtn = false;
    for(r=0;r<9;r++){
        pCount = 0;            
        for(c=0;c<9;c++){
            if((possible.arr[r][c]-2) == 0){
                s = r;
                t = c;
                pCount++;    
            }
        }
        if((pCount-1)==0){
            //found a single (only posible location, so take it)
            var cell = GetCellFromRowCol(s,t);
            rtn = TakeIt(cell,digit); //changed
            break; //stop after the first found.
        }
    }
    return rtn;
}


function CheckColSingles(possible, digit){
    //Check the rows for a single possible value    
    var s;
    var t;
    var pCount;
    var r;
    var c;
    var rtn;
    
    rtn = false;
    for(c=0;c<9;c++){
        pCount = 0;            
        for(r=0;r<9;r++){
            if((possible.arr[r][c]-2) == 0){
                s = r;
                t = c;
                pCount++;    
            }
        }
        if((pCount-1)==0){
            //found a single (only posible location, so take it)
            var cell = GetCellFromRowCol(s,t);
            rtn = TakeIt(cell,digit); //changed
            break; //stop after the first found.
        }
    }
    return rtn;
}

function CheckForSingletons(possible){
    //A singletone is only one possible digit for this cell.
    var digit;
    var r;
    var c;
    var s;
    var t;
    var count=0;
    var tempDigit;
                
    for(r=0;r<9;r++){
        for(c=0;c<9;c++){
            //Look in each position and count the number of 2's
            count = 0;
            for(digit=1;digit<10;digit++){
                if((possible[digit].arr[r][c]-2) == 0){
                    s = r;
                    t = c;
                    tempDigit = digit;
                    count++;    
                }
            }
            if((count-1)==0){
                //found a single (only posible location, so take it)
                var cell = GetCellFromRowCol(s,t);
                
                return TakeIt(cell,tempDigit); //changed
            }
        }
    }
    
    return false;
}

function Hint(hintLevel,verbose){
    //Only deterministic attempts, no Guessing.    
    var liveBoard;
    var possible;
    var digit;
    var g;
    var count=0;
    
    //if(sudoku_debug)console.log('>> Hint(): STARTED');
    
    liveBoard = new BoardData();
    possible = new Array(10);

    //Load the BoardData structure
    for(r=0;r<=8;r++){
        for(c=0;c<=8;c++){
            liveBoard.arr[r][c] = GetCellFromRowCol(r,c);     
        }
    }
        
    liveBoard.changed = false;
    for(digit=1;digit<10;digit++){
        possible[digit] = new BoardData();
        MarkPossible(digit,possible[digit],liveBoard);
		for(g=0;g<9;g++){
		    CheckGrid(possible[digit], digit, g);
            switch(hintLevel){
                case 5:
                    liveBoard.changed |= CheckColSingles(possible[digit], digit);
                    break;
                case 4:
                    liveBoard.changed |= CheckRowSingles(possible[digit], digit);
                    break;
                case 3:
                    CheckGridTriples(possible[digit], digit, g);
                case 2:
                    CheckGridDoubles(possible[digit], digit, g);
                case 1:
        		    liveBoard.changed |= CheckGridSingles(possible[digit], digit, g);
            }
            if(liveBoard.changed)break; //only make one change at a time
		}
        if(liveBoard.changed)break; //only make one change at a time
    }
    
    if(!liveBoard.changed){
        //Try a better hint level
        switch(hintLevel){
                case 5:
                    //Last check at top level  "Singletons"  Don't recurse, since the current "possible" matrix is populated already
                    liveBoard.changed = CheckForSingletons(possible);
                    break;
                case 4:
                    liveBoard.changed = Hint(5,0);
                    break;
                case 3:
                    liveBoard.changed = Hint(4,0);
                    break;
                case 2:
                    liveBoard.changed = Hint(3,0);
                    break;
                case 1:
                    liveBoard.changed = Hint(2,0);
                    break;
                default:
                    break;
        }
        
        if(verbose && !liveBoard.changed && window.confirm('This is a tough one, there are no obivous moves left.  Which often means a brute force approach of guess and test is required.  We will save this board position for you, so that you can make a guess and continue.  To reload this position, just click in the puzzle field and it will revert to this position.')){
            //Let's save the current board position
            SaveBoard();
        }

    }

    return liveBoard.changed;
}



var solvers = []; //stack of solver states...
var boardPosition;

function QuietSolve(){
    var currentBoard;
    var guessBoard;
    var done = false;
    var guess;
    var cell;
    var error;
    var nextSolver;
    var r;
    var c;
    var digit;

	while(!this.done){
        if(!Hint(1,0)){
            //hint did not find a move better save this position
            SaveBoard();
            //Keep this good position
            this.currentBoard = document.getElementById('sudoku_dots').value;
            
            //Time to start Guessing
            for(this.r=0;this.r<9;this.r++){
                for(this.c=0;this.c<9;this.c++){
                	this.cell = GetCell(this.r,this.c);
                    switch(this.cell.value){
                        case '':
                          	for(this.digit=1;this.digit<=9;this.digit++){
                                //Empty Cell, let us make a guess
                                this.cell.value = this.digit;
                                this.done = CheckBoard();
                                if(!this.done){
                                    //are any error cells?
                                    this.error = document.getElementById('sudoku_error');
                                    if(this.error==null){
                                        //No Errors = possibly a good guess... so start a new Solver
                                        this.nextSolver = new QuietSolve();
                                        this.done = this.nextSolver.done;
                                        if(!this.done){
                                            //bad guess, better back this out.
                                            this.cell.value = '';
                                        }
                                    }else{
                                        //bad guess, better back this out.
                                        this.cell.value = '';
                                    }
                                }else{
                                    //we're done!
                                    return;
                                }
                                if(!this.done&&this.digit>=9){
                                	//Bad Path, need to back out of this trace
                                	return false;
                                }
                                if(this.done)return; //get out of this loop
                          	}
                    }
                    if(this.done)return; //get out of this loop
                }
                if(this.done)return; //get out of this loop
            }
            //Done guessing...
            return;
        }else{
            //the hint found something, so keep spinning
            this.done = FastCheck();
        }
    }
}

function aSolve(){
    solved = document.getElementById('sudoku_board_solved');
    if(solved==null){
		window.setTimeout(solvers[0].doit,solvers[0].speed);
    }else{
    	PostSolve();
    }        
}

function Solve(){
    var currentBoard;
    var guessBoard;
    var done = false;
    var guess;
    var cell;
    var error;
    var nextSolver;
    var r;
    var c;
    var digit;
    var lastR=0;
    var lastC=0;
    var lastDigit=1;
    var speed = 1;
    
    function paintDepth(prefix){
    	rtn = "";
    	count = solvers.length;
    	while(count--){
    		rtn += prefix;
    	}
    	return rtn;
    }
    
    function LogGuess(){
    	if(sudoku_debug)console.log(paintDepth('>')+' Guessing: STARTED   ['+solvers[0].digit+']');
    }

    function LogQuiet(){
    	if(sudoku_debug)console.log(paintDepth('=')+' Guessing: QUIET     ['+solvers[0].digit+']');
    }

    
    function LogBadGuess(){
    	if(sudoku_debug)console.log(paintDepth('<')+' Guessing: BAD GUESS ['+solvers[0].digit+']');
    }
    
    Solve.prototype.doit = function (){
        //if(sudoku_debug)console.log('Solvers Depth = '+solvers.length);

    	if(!Hint(1,0)){
            //hint did not find a move better save this position
            SaveBoard();
            //Keep this good position
            solvers[0].currentBoard = document.getElementById('sudoku_dots').value;
            
            //Time to start Guessing
            for(solvers[0].r=solvers[0].lastR; solvers[0].r<9; solvers[0].r++){
                for(solvers[0].c=solvers[0].lastC; solvers[0].c<9; solvers[0].c++){
                	solvers[0].cell = GetCell(solvers[0].r,solvers[0].c);
                    solvers[0].lastR = solvers[0].r;
                    solvers[0].lastC = solvers[0].c;
                    switch(solvers[0].cell.value){
                        case '':
		                    for(solvers[0].digit=solvers[0].lastDigit; solvers[0].digit<=9; solvers[0].digit++){
		                        //Empty Cell, let us make a guess
		                        solvers[0].cell.value = solvers[0].digit;
		                        solvers[0].done = CheckBoard();
		                        if(!solvers[0].done){
		                            //are any error cells?
		                            solvers[0].error = document.getElementById('sudoku_error');
		                            if(solvers[0].error==null){
		                                //Save State
		                                solvers[0].lastDigit = solvers[0].digit;
		                                
		                                if(solvers.length < sudoku_animation_depth){
			                            	LogGuess();
		                                	//Start Another async search
		                                    solvers[0].nextSolver = new Solve(); //Async Solving (Animated)
		                                    return; //exit and let the timer continue.
		                                }else{
		                                	LogQuiet();
		                                	//Sync Searches are faster, less animations from here and deeper
		                                    //No Errors = possibly a good guess... so start a new Solver
		                                    solvers[0].nextSolver = new QuietSolve(); //Full Sync Solver
		                                    solvers[0].done = solvers[0].nextSolver.done;
		                                    
		                                    if(!solvers[0].done){
				                                //bad guess, better back this out.
		                                    	document.getElementById('sudoku_dots').value = solvers[0].currentBoard;
		    		                            ReloadBoard();
		                                    }else{
		                                    	PostSolve();
		                                    	return;
		                                    }
		                                }                                        
		                            }else{
		                            	//Error on first guess... 
                                    	document.getElementById('sudoku_dots').value = solvers[0].currentBoard;
    		                            ReloadBoard();
		                            }
		                        }else{
		                            //we're done!
		                        	PostSolve();
		                            return;
		                        }
		                        
		                        //All digits are guessed...
		                        if(!solvers[0].done&&solvers[0].digit>=9){
		                        	//this is a bad path, pop the solver...
		                    	    //restore the old board, this guess is bad.
		                        	if(solvers.length>1){
			                            temp = solvers.shift();
			                            LogBadGuess();	
		                        	}
		                            document.getElementById('sudoku_dots').value = solvers[0].currentBoard;
		                            ReloadBoard();
		                        }
		                        
		                        if(solvers[0].done)return; //get out of this loop		                    
		                    }
		                    solvers[0].lastDigit = 1;
		                    solvers[0].digit = 1;
                    }
                }
                solvers[0].lastC = 0;
            }
            //Done guessing...
            solvers[0].lastR = 0;
        }else{
            //the hint found something, so keep spinning
            solvers[0].done = FastCheck();
        }

        //recurse...
        if(!solvers[0].done){
        	aSolve();
        }else{
        	//DONE
        	PostSolve();
        }
    
    };
    
    //Push onto the stack
    solvers.unshift(this);
    aSolve();
}

function PostSolve(){
    //Put back the original board position... 
    document.getElementById('sudoku_dots').value = boardPosition;
}

function PreSolve(){
    boardPosition = document.getElementById('sudoku_dots').value;

    if(CheckBoard()){
    	return; //already done
    }else{
    	//Start solving it
        solvers = [];
        solver = new Solve();    	
    }
    
}


//Stole this from someonline tutorial...
function KeyPressed(e) { 
    if( !e ) { 
        if( window.event ) { 
            e = window.event; 
        } else { 
            return; 
        } 
    }
	if( typeof( e.which ) == 'number' ) { 
	    e = e.which; 
	} else { 
	    if( typeof( e.keyCode ) == 'number'  ) { 
	        e = e.keyCode; 
	    } else { 
	        if( typeof( e.charCode ) == 'number'  ) { 
	            e = e.charCode; 
	        } else { 
	            return; 
	        } 
	    } 
	}
		
	//Now check to see if we need to check the board or move the focus
	if(currentG!=null && currentP!=null){
    	//Calculate current Row
    	row = Math.floor(currentG/3)*3+Math.floor(currentP/3);
    	//Calculate current Col
    	col = ((currentG%3)*3)+(currentP%3);
    	//We only care about cursor movement... everything else should get a sanity check by CheckRules()
    	switch (e) {
                case 37:    //left
                    col = Math.max(col-1,0);
                    break;    
                case 38:    //up
                    row = Math.max(row-1,0);
                    break;    
                case 39:    //right
                    col = Math.min(col+1,8);
                    break;    
                case 40:    //down
                    row = Math.min(row+1,8);
                    break;
                default:
                    return CheckRules(currentG,currentP); 
        }
        //Still here? guess we got movement, so let's set a new focus
        GetCellFromRowCol(row,col).focus();
	}
}

function SudokuReady(){
    //Hook the keyboard event
    if( document.captureEvents && Event.KEYUP ) {
        document.captureEvents( Event.KEYUP ); 
    } 
    document.onkeyup = KeyPressed; 
    
    //Set the focus in the centre of the board
    //GetCell(4,4).focus();
    
    //Load the board
    ReloadBoard();
    
}

function SudokuInit(){
	if(GetCell(4,4)){
		SudokuReady();
	}else{
		//start polling for the board to load
		window.setTimeout(function(){SudokuInit();},100);
	}
	
}

