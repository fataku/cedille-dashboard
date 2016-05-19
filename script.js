$(function($){
	'use strict';

	var arcDivisions = 30;
	//var arcColors = ['red', 'green', 'blue'];

	var Animator = function(canvas){
		this.drawables = [];
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.skipped = 0;
		this.onALeTemps = true;
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

		//this.timer = window.setTimeout(this.update.bind(this), 16);
	};
	Animator.prototype.start = function () {
		if(!this.timer)
			this.update.call(this);
	};

	var PiegressChart = function(){
		this.slices = [];
		this.innerRadius = 20;
		this.outerRadius = 80;
	};
	PiegressChart.prototype.addSlice = function (title, percentage, color) {
		this.slices.push({
			title: 		title||"[Untitled]",
			percentage: percentage,
			color: 		color|| "silver"
		});
	};
	PiegressChart.prototype.draw = function (c, elem) {
		var baseRadius = Math.min(window.innerWidth, window.innerHeight);
		var innerRadius = this.innerRadius/200 * baseRadius;
		var outerRadius = this.outerRadius/200 * baseRadius;

		var center = {
			x:elem.width/2,
			y:elem.height/2
		};

		c.lineTo(center.x, center.y);

		var slice = Math.PI * 2 / this.slices.length;
		var subslice = slice / arcDivisions;
		for(var i = 0, ii = this.slices.length; i<ii; i++){
			c.beginPath();
			var offset = {
				x: Math.cos(Math.PI*2/this.slices.length*(i+0.5)) * 2,
				y: Math.sin(Math.PI*2/this.slices.length*(i+0.5)) * 2
			}
			for(var j = 0, jj = arcDivisions; j<=jj; j++){
				c.lineTo(
					center.x + offset.x + Math.cos(slice * i + subslice * j) * innerRadius,
					center.y + offset.y + Math.sin(slice * i + subslice * j) * innerRadius
				)
			}
			for(var j = 0, jj = arcDivisions; j<=jj; j++){
				c.lineTo(
					center.x + offset.x + Math.cos(slice * i + subslice * (arcDivisions-j)) * outerRadius,
					center.y + offset.y + Math.sin(slice * i + subslice * (arcDivisions-j)) * outerRadius
				)
			}
			c.fillStyle = 'hsla('+ 360 / this.slices.length * i +', 75%, 50%, 0.5)';
			c.strokeStyle = 'hsla('+ 360 / this.slices.length * i +', 100%, 25%, 1)';
			c.closePath();
			c.fill();
			c.stroke();
		}//*/
	};
	PiegressChart.prototype.update = function (title, percentage, color) {

	};

	var a = new Animator(document.getElementById("piegress-chart"));
	var p = new PiegressChart();
	p.addSlice('lol', 0.33, '#ff0');
	p.addSlice('lol', 0.34, '#0ff');
	p.addSlice('lol', 0.33, '#f0f');//*/

	a.drawables.push(p);
	a.start();

	$(window).on('resize', a.update.bind(a));
});

angular.module('CedilleDashboard', []).controller('DashboardCtrl', function ($scope) {
	$scope.thing = "Testing";

}).directive('bar', function(){
	return {
		scope:{
			target: '=for'
		},
		restrict: 'E',
		template: function(elem, attr){
			return '<div class="progress-outer"><div class="progress-inner '
			+(attr.class||"" )
			+'" ng-style="{\'width\':('+attr.current+' / '
			+attr.max
			+' * 100 + \'%\')}"></div></div>'
		}
	}
});
