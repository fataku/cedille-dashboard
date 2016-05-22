var arcDivisions = 30;
var pivot = 3;

var PiegressChart = function(){
	this.logo = new Image();
	this.logo.src = 'images/Cedille.png';
	this.slices = [];
	this.innerRadius = 20;
	this.outerRadius = 80;
	this.totalPortions = 0;
};

PiegressChart.prototype.addSlice = function (title, completion, assigned, portion) {
	this.slices.push({
		title: 		(title||"[Untitled]") + " (" + (completion*100).toPrecision(3) + "% )",
		portion: 	portion,
		assigned:	assigned,
		percentage: completion
	});
	this.totalPortions += portion;
};

PiegressChart.prototype.draw = function (c, elem) {

	var baseRadius = Math.min(window.innerWidth, window.innerHeight) - 30;
	var innerRadius = (this.innerRadius/200 * baseRadius) * 0.8;
	var outerRadius = (this.outerRadius/200 * baseRadius) * 0.8;

	var slice = Math.PI * 2 / this.totalPortions;
	var subslice = slice / arcDivisions;
	var portionsToDate = 0;

	var center = {
		x:elem.width/2,
		y:elem.height/2
	};

	c.moveTo(center.x, center.y);

	// draw a background dropshadow for aesthetics
	c.shadowOffsetY = 6;
	c.shadowBlur = outerRadius * 0.05;
	c.shadowColor = "rgba(0, 0, 0, 0.65)";
	c.moveTo(window.innerWidth, center.y);
	c.lineTo(window.innerWidth, 0)
	c.lineTo(0, 0)
	c.lineTo(0, window.innerHeight)
	c.lineTo(window.innerWidth, window.innerHeight)
	c.lineTo(window.innerWidth, center.y);
	c.arc(center.x, center.y, outerRadius + pivot + 6, 0, Math.PI*2);

	c.moveTo(center.x + innerRadius, center.y);
	c.arc(center.x, center.y, innerRadius + pivot - 6, 0, Math.PI*2);
	c.fillStyle = $('body').css('background-color');
	c.fill();

	c.moveTo(center.x + innerRadius, center.y);
	c.arc(center.x, center.y, innerRadius + pivot - 6, 0, Math.PI*2);
	c.shadowBlur = c.shadowOffsetX = c.shadowOffsetY = 0;

	c.beginPath();
	c.arc(center.x, center.y, outerRadius + pivot + 7.5, 0, Math.PI*2);
	c.strokeStyle = "white";
	c.stroke();

	var oldMode = c.globalCompositeOperation;
	var ratio = (this.logo.height / this.logo.width);
	var scaledLogo = {
		x: center.x - innerRadius * 0.6,
		y: center.y - innerRadius * 0.6 * ratio,
		w: 2 * innerRadius * 0.6,
		h: 2 * innerRadius * 0.6 * ratio,
	};

	c.globalCompositeOperation = "multiply";
	c.drawImage(this.logo, scaledLogo.x, scaledLogo.y, scaledLogo.w, scaledLogo.h);
	c.globalCompositeOperation = oldMode;
	/**
	* For each slice of data, draw a wedge. Its radial width represents the percentage of commits associated with it,
	* its inner (more colored) wedge represents the progress done on it (issues completed vs issues total)
	**/
	for(var i = 0, ii = this.slices.length; i<ii; i++){
		var sliceData = this.slices[i];
		var color = 360 / this.slices.length * i;
		var offset = {
			x: Math.cos((portionsToDate + sliceData.portion*0.5)/this.totalPortions * Math.PI*2) * pivot,
			y: Math.sin((portionsToDate + sliceData.portion*0.5)/this.totalPortions * Math.PI*2) * pivot,
		}

		c.beginPath();
		for(var j = 0, jj = arcDivisions; j<=jj; j++){ // draw the small inner arc
			c.lineTo(
				center.x + offset.x + Math.cos(subslice * j * sliceData.portion + slice * portionsToDate) * innerRadius,
				center.y + offset.y + Math.sin(subslice * j * sliceData.portion + slice * portionsToDate) * innerRadius
			)
		}
		for(var j = 0, jj = arcDivisions; j<=jj; j++){ // draw the big inner arc
			c.lineTo(
				center.x + offset.x + Math.cos(subslice * (arcDivisions-j) * sliceData.portion + slice * portionsToDate) * outerRadius,
				center.y + offset.y + Math.sin(subslice * (arcDivisions-j) * sliceData.portion + slice * portionsToDate) * outerRadius
			)
		}
		c.fillStyle = 'hsla('+ color +', 100%, 75%, 0.3)';
		c.strokeStyle = 'hsla('+ color +', 10%, 25%, 0.3)';

		c.closePath();
		c.fill();
		c.stroke();

		c.shadowColor = "transparent";
		c.shadowOffsetX = c.shadowOffsetY = c.shadowBlur = 0;



		c.beginPath();
		for(var j = 0, jj = arcDivisions; j<=jj; j++){ // draw the inner arc of the filling slice, the one that represents completion
			c.lineTo(
				center.x + offset.x + Math.cos(subslice * j * sliceData.portion + slice * portionsToDate) * innerRadius,
				center.y + offset.y + Math.sin(subslice * j * sliceData.portion + slice * portionsToDate) * innerRadius
			)
		}
		for(var j = 0, jj = arcDivisions; j<=jj; j++){ // outer arc, with some math gymnastics to make it stay inside its borders
			c.lineTo(
				center.x + offset.x + Math.cos(subslice * (arcDivisions-j) * sliceData.portion + slice * portionsToDate) * ((outerRadius - innerRadius) * sliceData.percentage + innerRadius),
				center.y + offset.y + Math.sin(subslice * (arcDivisions-j) * sliceData.portion + slice * portionsToDate) * ((outerRadius - innerRadius) * sliceData.percentage + innerRadius)
			)
		}
		c.fillStyle = 'hsla('+ color +', 80%, 50%, 0.5)';
		c.shadowColor = 'hsla('+color+', 100%, 50%, 0.99)';
		c.strokeStyle = 'hsla('+ color +', 50%, 50%, 0.5)';

		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;
		c.shadowBlur = outerRadius * 0.05;

		c.closePath();
		c.fill();
		c.stroke();


		if(sliceData.assigned > 0){
			c.beginPath();
			for(var j = 0, jj = arcDivisions; j<=jj; j++){ // draw the inner arc of the filling slice, the one that represents completion
				c.lineTo(
					center.x + offset.x + Math.cos(subslice * (j) * sliceData.portion + slice * portionsToDate) * ((outerRadius - innerRadius) * sliceData.percentage + innerRadius),
					center.y + offset.y + Math.sin(subslice * (j) * sliceData.portion + slice * portionsToDate) * ((outerRadius - innerRadius) * sliceData.percentage + innerRadius)
				)
			}
			for(var j = 0, jj = arcDivisions; j<=jj; j++){ // outer arc, with some math gymnastics to make it stay inside its borders
				c.lineTo(
					center.x + offset.x + Math.cos(subslice * (arcDivisions-j) * sliceData.portion + slice * portionsToDate) * ((outerRadius - innerRadius) * (sliceData.percentage + sliceData.assigned) + innerRadius),
					center.y + offset.y + Math.sin(subslice * (arcDivisions-j) * sliceData.portion + slice * portionsToDate) * ((outerRadius - innerRadius) * (sliceData.percentage + sliceData.assigned) + innerRadius)
				)
			}
			c.fillStyle = 'hsla('+ color +', 80%, 100%, 0.5)';
			c.shadowColor = 'hsla('+color+', 100%, 50%, 0.99)';
			c.strokeStyle = 'hsla('+ color +', 50%, 50%, 0.5)';

			c.shadowOffsetX = 0;
			c.shadowOffsetY = 0;
			c.shadowBlur = outerRadius * 0.05;

			c.closePath();
			c.fill();
			c.stroke();
		}




		c.shadowOffsetX = c.shadowOffsetY = c.shadowBlur = 0;

		c.beginPath();
		var d = 1 / pivot * outerRadius / 1.1;
		var d2 = d + 1;
		c.arc(center.x + offset.x * d,
			  center.y + offset.y * d,
			  3, -Math.PI, Math.PI);

			c.moveTo(center.x + offset.x * d2,
  				 center.y + offset.y * d2)
		c.lineTo(center.x + offset.x * d * 1.3,
			     center.y + offset.y * d * 1.3);

		c.closePath();
		c.strokeStyle = c.fillStyle = "#248";
		c.stroke();
		c.font = '20pt sans-serif';
		c.shadowColor = '#666';
		c.shadowBlur = 3;
		c.shadowOffsetX = 1;
		c.shadowOffsetY = 2;
		c.textAlign = (offset.x > 0)?'left':'right';
		c.fillText(sliceData.title, center.x + offset.x * d * 1.3 + offset.x / pivot * 12, center.y + offset.y * d * 1.3 + offset.y / pivot * 12);

		c.shadowBlur =
		c.shadowOffsetX =
		c.shadowOffsetY = 0;

		portionsToDate += sliceData.portion;
	}
};

PiegressChart.prototype.update = function () {

};