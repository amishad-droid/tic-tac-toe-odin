# Tic Tac Toe

This is my Tic Tac Toe project from The Odin Project's JavaScript course. It's built with plain HTML, CSS, and JavaScript, no frameworks or libraries.

## How to play

Open index.html in a browser. You can play against the computer or pass the device to a friend for two player mode. Click a square to mark it. First to get three in a row wins.

## What I focused on

The main goal of this project was practicing factory functions and the module pattern in JavaScript, so I split the code into three parts:

- Gameboard keeps track of the board state
- Player creates the player objects
- GameController runs the actual game, handling turns and checking for a winner

## The AI opponent

The computer player uses an algorithm called minimax. Basically, it looks ahead at every possible way the rest of the game could play out, and picks the move that gives it the best outcome assuming the other player also plays their best move. Because it checks every possibility, it never loses. The best you can do against it is tie.

## Things I might add later

- Difficulty levels for the AI, so it's not unbeatable every time
- Saving score across page reloads
