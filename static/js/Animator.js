/** Basic Animator class, takes drawables and gives them a canvas to draw on
  *can be made to Update at 60fps by uncommenting "this.timer = setTimeout"
  *modified for Cedille use because we don't need constant drawing.
  */

var Animator = function(canvas){
	this.drawables = [];
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.skipped = 0;
	this.onALeTemps = true;
	this.fps = 1;
};
Animator.prototype.draw = function(){

	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;

	for(var i of this.drawables){
		i.draw.call(i, this.context, this.canvas);
	}
};
Animator.prototype.update = function(){
	for(var i of this.drawables){
		i.update.call(i, this.drawables);
	}

	if(this.onALeTemps || this.skipped > 50){
		this.draw();
		this.skipped = 0;
	}else this.skipped++;

	this.timer = window.setTimeout(this.update.bind(this), 1000/this.fps);
};
Animator.prototype.start = function () {
	if(!this.timer)
		this.update.call(this);
};
