(function(){var slivid = {
/*
Copyright (C) 2012 kyle.shay

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the \"Software\"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
	input: null,
	buffer: null,
	output: null,
	windiv: null,
	hiddenTile: -1,
	won: false,
	slices: 3,
	total_clicks: 0,
	win_count: 1,
	wins: [],
	TILE_WIDTH: -1,
	TILE_CENTER_WIDTH: -1,
	TILE_HEIGHT: -1,
	TILE_CENTER_HEIGHT: -1,
	splitAmount: 3,
	SOURCERECT: {x:0, y:0, width:0, height:0},
	PAINTRECT: {x:0, y:0, width:400, height:450},

	Tile: function Tile() {
		this.row = 0;
		this.col = 0;
		this.order = 0;
		this.originX = 0;
		this.originY = 0;
		this.currentX = 0;
		this.currentY = 0;
		this.z = 0;
		
		this.videoX = 0;
		this.videoY = 0;
	},

	setVideo: function(s, d) {
		var vids = document.getElementsByTagName('video');

		for (var i = vids.length;i--; ) {
			if(vids[i].id == "") vids[i].id = 'video'+i;
			slivid.init(vids[i].id);
		}
		
		this.windiv = document.getElementById(d);
		this.slices = s;
	},

	init: function(video_in) {
		slivid.input = document.getElementById(video_in);
		slivid.input.style.display = 'none';
		slivid.input.onclick = null;
		
		var buffer_canvas = document.createElement('canvas');
		buffer_canvas.id = vids[i].id + '_buffer';		
		buffer_canvas.style.display = 'none';
		slivid.buffer = buffer_canvas.getContext('2d');
		
		var output_canvas = document.createElement('canvas');
		output_canvas.id = vids[i].id + '_out';
		output_canvas.style.border = 'solid 1px #999';
		slivid.output = output_canvas.getContext('2d');
		
		slivid.PAINTRECT.height=output_canvas.height=buffer_canvas.height=slivid.input.videoHeight;
		slivid.PAINTRECT.width=output_canvas.width=buffer_canvas.width=slivid.input.videoWidth;
		
		slivid.input.parentNode.insertBefore(buffer_canvas, slivid.input);
		slivid.input.parentNode.insertBefore(output_canvas, slivid.input);
		
		output_canvas.onmousedown = slivid.slideTile;
		
		slivid.timerCallback();
	},
	timerCallback: function() {
		this.processFrame();
		var self = this;
		this.timeout = setTimeout(function () {
			self.timerCallback();
		}, 33);
	},

	changeSlices: function(slices) {
		if(slices < 2 || slices > 5 || isNaN(slices)) slices = splitAmount;
		this.slices = slices;
		this.total_clicks = 0;
		this.processFrame();
	},
	createTiles: function() {
		var offsetX = slivid.TILE_CENTER_WIDTH+(slivid.PAINTRECT.width-slivid.SOURCERECT.width)/2;
		var offsetY = slivid.TILE_CENTER_HEIGHT+(slivid.PAINTRECT.height-slivid.SOURCERECT.height)/2;
		var o=0,y=0;
		while(y < slivid.SOURCERECT.height){
			var x=0;
			while(x < slivid.SOURCERECT.width){
				var tile = new slivid.Tile();
				tile.order = o++;
				tile.col = x/slivid.TILE_WIDTH;
				tile.row = y/slivid.TILE_HEIGHT;
				tile.videoX = x;
				tile.videoY = y;
				tile.originX = offsetX+x;
				tile.originY = offsetY+y;
				tile.currentX = tile.originX;
				tile.currentY = tile.originY;
				slivid.tiles.push(tile);
				x+=slivid.TILE_WIDTH;
			}
			y+=slivid.TILE_HEIGHT;
		}
		slivid.hiddenTile = slivid.tiles.length-1;
		slivid.shuffleTiles();
	},
	shuffleTiles: function() {
		var i = 0;
		while(i < slivid.splitAmount*100) {
			var clickedTile = Math.floor(Math.random()*(slivid.tiles.length));
			if(clickedTile > -1 && clickedTile < slivid.tiles.length && clickedTile != slivid.hiddenTile) {
				if(  (slivid.tiles[clickedTile].row == slivid.tiles[slivid.hiddenTile].row && 
					 (slivid.tiles[clickedTile].col == slivid.tiles[slivid.hiddenTile].col - 1 || 
					  slivid.tiles[clickedTile].col == slivid.tiles[slivid.hiddenTile].col + 1)
				) || (slivid.tiles[clickedTile].col == slivid.tiles[slivid.hiddenTile].col &&
					 (slivid.tiles[clickedTile].row == slivid.tiles[slivid.hiddenTile].row - 1 ||
					  slivid.tiles[clickedTile].row == slivid.tiles[slivid.hiddenTile].row + 1)
				)) {
					slivid.swapTile(clickedTile);
					i++
				}
			}
		}
	},
	swapTile: function(tileNum) {
		if(slivid.won) return;
		var showTile = slivid.tiles[slivid.hiddenTile];
		var hideTile = slivid.tiles[tileNum];
		
		slivid.tiles[tileNum] = showTile;
		slivid.tiles[tileNum].videoX = hideTile.videoX;
		slivid.tiles[tileNum].videoY = hideTile.videoY;

		slivid.tiles[slivid.hiddenTile] = hideTile;
		slivid.tiles[slivid.hiddenTile].videoX = showTile.videoX;
		slivid.tiles[slivid.hiddenTile].videoY = showTile.videoY;
	},
	playerWon: function() {
		if(slivid.won) return true;
		
		slivid.won = true;
		for(var w=1; w<slivid.tiles.length-1;w++) {
			if(w != slivid.tiles[w].order) {
				slivid.won = false;
			}
		}
		if(slivid.won && slivid.total_clicks == 0) {
			slivid.won = false;
			slivid.shuffleTiles();
		}
		return slivid.won;
	},
	updateWins: function() {
		var winlist = slivid.windiv;
		winlist.innerHTML = '';
		for(var w in slivid.wins) {
			winlist.innerHTML += slivid.wins[w];
		}
	},


	findTile: function(x, y){
		var clickedTile;
		for(var t in slivid.tiles){
			var tx = slivid.tiles[t].currentX-slivid.TILE_CENTER_WIDTH
			var ty = slivid.tiles[t].currentY-slivid.TILE_CENTER_HEIGHT
			if(x > tx && x < tx+slivid.TILE_WIDTH &&
				y < ty+slivid.TILE_HEIGHT && y > ty) {
					clickedTile = t;
					break;
			}
		}
		
		if(clickedTile > -1 && clickedTile < slivid.tiles.length) {
			if(  (slivid.tiles[clickedTile].row == slivid.tiles[slivid.hiddenTile].row && 
				 (slivid.tiles[clickedTile].col == slivid.tiles[slivid.hiddenTile].col - 1 || 
				  slivid.tiles[clickedTile].col == slivid.tiles[slivid.hiddenTile].col + 1)
			) || (slivid.tiles[clickedTile].col == slivid.tiles[slivid.hiddenTile].col &&
				 (slivid.tiles[clickedTile].row == slivid.tiles[slivid.hiddenTile].row - 1 ||
				  slivid.tiles[clickedTile].row == slivid.tiles[slivid.hiddenTile].row + 1)
			)) {
				slivid.total_clicks++;
				slivid.swapTile(clickedTile);
			}
			slivid.processFrame();
		}
	},
	slideTile: function(evt, o) {
		if(slivid.playerWon()) {
			slivid.wins.push(
				'<li style=\'background-color:'
					+ (slivid.win_count%2==0?'lightgrey':'darkgrey')
					+ ';padding-left: 15px'
					+ ';border-bottom:1px solid grey'
					+ '\'>'
					+ (slivid.win_count++) + ') ' + slivid.slices
					+ ' slice puzzle solved in '
					+ slivid.total_clicks + ' clicks</li>');
			slivid.total_clicks = 0;
			slivid.won = false;
			slivid.updateWins();
			slivid.shuffleTiles();
		}

		var posx = 0;
		var posy = 0;
		var e = evt || window.event;
		if (e.offsetX || e.offsetY) {
			posx = e.offsetX;
			posy = e.offsetY;
		} else if (e.layerX || e.layerY) {
			posx = e.layerX;
			posy = e.layerY;
		}
		slivid.findTile(posx, posy);
	}, 

	tiles: [],
	oldShape1: null,
	oldShape2: null,
	f: 0,
	processFrame: function() {
		if(slivid.SOURCERECT.width == 0 || slivid.slices != slivid.splitAmount) {
			slivid.tiles = [];
			slivid.splitAmount = slivid.slices;
			slivid.SOURCERECT = {x:0,y:0,width:slivid.input.videoWidth,height:slivid.input.videoHeight};
			slivid.TILE_WIDTH = Math.round(slivid.input.videoWidth / slivid.splitAmount);
			slivid.TILE_HEIGHT =  Math.round(slivid.input.videoHeight / slivid.splitAmount);
			slivid.TILE_CENTER_WIDTH = slivid.TILE_WIDTH/2;
			slivid.TILE_CENTER_HEIGHT = slivid.TILE_HEIGHT/2;
			slivid.output.canvas.width = slivid.output.canvas.width;
			slivid.createTiles();
		}
		
		//copy tiles
		slivid.buffer.clearRect(0, 0, slivid.PAINTRECT.width, slivid.PAINTRECT.height);
		slivid.output.clearRect(0, 0, slivid.PAINTRECT.width, slivid.PAINTRECT.height);
		slivid.buffer.drawImage(slivid.input, 0, 0, slivid.PAINTRECT.width, slivid.PAINTRECT.height);
		
		if(slivid.playerWon()) {
			var frame = slivid.buffer.getImageData(0, 0, slivid.PAINTRECT.width, slivid.PAINTRECT.height);
			
			var cx = null;
			var cy = null;
			var shape1 = null;
			var shape2 = null;
			var currentPoint = null;
			var r, g, b, x, y;
			var weight = 0;
			var D = 25;
			var l = frame.data.length / 4;

			// We dont' need to compute each pixels
			var step = 4;
			for (var i = 0; i < l; i += step) {
				r = frame.data[i * 4 + 0];
				g = frame.data[i * 4 + 1];
				b = frame.data[i * 4 + 2];

				x = i % slivid.PAINTRECT.width;
				y = Math.round(i / slivid.PAINTRECT.width);

				// Is it a white pixel ?
				if (r > 200 && b > 200 && g > 200) {
					if (!shape1) {
						// no shape yet, create the first one
						shape1 = {};
						shape1.x = x;
						shape1.y = y;
						shape1.weight = 1;
					} else {
						// This pixel is in the first or in the second shape ?
						var d = slivid.dist(x, y, shape1.x, shape1.y);
						if (d < D) {
						shape1.x += 1/(shape1.weight + 1) * (x - shape1.x);
						shape1.y += 1/(shape1.weight + 1) * (y - shape1.y);
						shape1.weight++;
						} else {
							if (!shape2) {
								shape2 = {};
								shape2.x = x;
								shape2.y = y;
								shape2.weight = 1;
							} else {
								var d = slivid.dist(x, y, shape2.x, shape2.y);
								if (d < D) {
									shape2.x += 1/(shape2.weight + 1) * (x - shape2.x);
									shape2.y += 1/(shape2.weight + 1) * (y - shape2.y);
									shape2.weight++;
								}
							}
						}
					}
				}
			}
			if (!shape1 || !shape2) return;
			
			if (slivid.oldShape1) {
				var dist1 = slivid.dist(shape1.x, shape1.y, slivid.oldShape1.x, slivid.oldShape1.y);
				var dist2 = slivid.dist(shape1.x, shape1.y, slivid.oldShape2.x, slivid.oldShape2.y);

				if (dist2 < dist1) {
					var tmp = shape2;
					shape2 = shape1;
					shape1 = tmp;
				}
			}

			// Save the shape positions
			slivid.oldShape1 = shape1;
			slivid.oldShape2 = shape2;
			
			// A set of transformations
			slivid.buffer.save();
			
			var d = slivid.dist(shape1.x, shape1.y, shape2.x, shape2.y);
			var a = Math.acos((shape2.x - shape1.x) / d);
			var delta = d / 141;
			slivid.buffer.translate(shape1.x, shape1.y);
			if (shape1.y > shape2.y)
				slivid.buffer.rotate(-a - 0.785398);
			else
				slivid.buffer.rotate(a - 0.785398);
			slivid.buffer.scale(delta, delta);
					
			slivid.buffer.drawImage(slivid.input, 0, 0, 100, 100);
			
			slivid.buffer.translate(90, 25);
			slivid.buffer.rotate(0.785398);
			slivid.buffer.translate(-90, -25);
			
			slivid.buffer.textAlign = 'center';
			slivid.buffer.textBaseline = 'middle';
				slivid.buffer.style = 'bold';
			if(slivid.f > 0 && slivid.f < 100) {	
				slivid.buffer.fillStyle = '#ff0000';
				slivid.buffer.font = '40px impact';		
				slivid.buffer.fillText('YOU', 75, 55, 150);
				slivid.buffer.fillText('WIN', 75, 95, 150);
				
			} else if(slivid.f > 120 && slivid.f < 220) {
				slivid.buffer.fillStyle = '#552255';
				slivid.buffer.fillRect(17, 60, 120, 30);
				slivid.buffer.fillStyle = '#22cc44';
				slivid.buffer.font = '30px century gothic';
				slivid.buffer.fillText('' + slivid.total_clicks + ' clicks', 75, 75, 150);
			} else if(slivid.f > 240) { 
				slivid.f = -50;
			}

			slivid.buffer.restore();
			slivid.f+=5;
		}		
		
		for(t in slivid.tiles) {
			var tile = slivid.tiles[t]
			
			if(slivid.playerWon()) {
				slivid.output.drawImage(slivid.buffer.canvas, 0, 0, slivid.PAINTRECT.width, slivid.PAINTRECT.height);
			} else if(slivid.tiles[slivid.hiddenTile] != tile) {
				slivid.output.save();
				slivid.output.translate(tile.currentX, tile.currentY);
				slivid.output.drawImage(slivid.buffer.canvas, tile.videoX, tile.videoY, slivid.TILE_WIDTH, slivid.TILE_HEIGHT, -slivid.TILE_CENTER_WIDTH, -slivid.TILE_CENTER_HEIGHT, slivid.TILE_WIDTH, slivid.TILE_HEIGHT);	
				slivid.output.restore();
			}
		}
	},
	dist: function(x1, y1, x2, y2) {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	}	

};slivid.setVideo(3, 'wins');})();