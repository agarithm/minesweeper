# The JavaScript Minesweeper Story

It's pretty straight forward: I needed a vehicle to get my hands dirty playing with gfx rendering with HTML5. 
Minesweeper was a very familiar game that has simple rules, and I figured I could build it relatively easily.
I was right.

The lessons around HTML5 canvas come from prohibiting PNG or GIF or JPG grahics. Also no special CSS or HTML for the game 
board layout and no using table elements either. (see JavaScript Sudoku for that lesson)

But as a side interest I wanted to explore how this would work on touch enabled mobile devices.  So we tried 
to make this as touch friendly as possible. And as mobile device friendly as possible.  
This meant changing the game slightly and removing the flags and 
question mark tools that help you sweep the mine field.  And also sizing the board to fit your screen.  With the 
varying size this caused some angst if figuring out how to make the game enjoyable:  For that we tuned the number
of mines on the board to be a ratio of mines to empyt space, and then added a timer countdown to make the game 
challenging but not too difficult.  If you know your minesweeper, you should have no trouble winning often enough
to make it fun.

TL;DR - In the end we made a retro styled simplified casual game from the traditional Minesweeper rules.

I hope you enjoy it. 
