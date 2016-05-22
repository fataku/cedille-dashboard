
var PiegressChart = function(){
	this.logo = new Image();
	this.logo.src = 'images/Cedille.png';
	this.slices = [];
	this.innerRadius = 20;
	this.outerRadius = 80;
	this.totalPortions = 0;
	this.pivot = 3;
	this.rotationAdjustment = -2/16 * Math.PI * 2;
	this.font = 'normal 16pt open sans';
	this.innerFont = '14pt open sans';
	window.slices = this.slices;
};

PiegressChart.prototype.addSlice = function (id, title, completion, assigned, portion) {
	this.slices.push({
		id:			id,
		title: 		(title||"[Untitled]"),
		portion: 	portion,
		assigned:	assigned,
		percentage: completion
	});
	this.recalculatePortions();
};
PiegressChart.prototype.recalculatePortions = function () {
	this.totalPortions = 0;
	for(var i = 0, ii = this.slices.length; i<ii; i++){
		this.totalPortions += this.slices[i].portion;
	}
};
PiegressChart.prototype.draw = function (c, elem) {
	this.recalculatePortions();
	var pivot = this.pivot;
	var adj = this.rotationAdjustment;
	var baseRadius = Math.min(window.innerWidth, window.innerHeight) - 30;
	var innerRadius = (this.innerRadius/200 * baseRadius) * 0.8;
	var outerRadius = (this.outerRadius/200 * baseRadius) * 0.8;

	var slice = Math.PI * 2 / this.totalPortions;
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

	c.beginPath();
	c.moveTo(center.x + innerRadius + pivot - 6, center.y);
	c.arc(center.x, center.y, innerRadius + pivot - 6, 0, Math.PI*2);
	c.strokeStyle = "white";
	c.stroke();
	c.shadowBlur = outerRadius * 0.15;
	c.stroke();

	c.moveTo(center.x + innerRadius, center.y);
	c.arc(center.x, center.y, innerRadius + pivot - 6, 0, Math.PI*2);

	c.beginPath();
	c.arc(center.x, center.y, outerRadius + pivot + 7.5, 0, Math.PI*2);
	c.strokeStyle = "white";
	c.stroke();
	c.stroke();
	c.shadowBlur = c.shadowOffsetX = c.shadowOffsetY = 0;

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
		var offsetAngle = adj + (portionsToDate + sliceData.portion*0.5)/this.totalPortions * Math.PI*2;
		var offset = {
			x: Math.cos(offsetAngle) * pivot,
			y: Math.sin(offsetAngle) * pivot,
		}

		oldMode = c.globalCompositeOperation;
		c.globalCompositeOperation = "multiply";

		var fromAngle = adj + slice * portionsToDate;
		var toAngle = adj + slice * sliceData.portion + slice * portionsToDate;

		c.beginPath();
		c.arc(center.x + offset.x, center.y + offset.y, innerRadius, fromAngle, toAngle);
		c.arc(center.x + offset.x, center.y + offset.y, outerRadius, toAngle, fromAngle, true);

		c.fillStyle = 'hsla('+ color +', 100%, 75%, 0.3)';
		c.strokeStyle = 'hsla('+ color +', 10%, 25%, 0.3)';

		c.closePath();
		c.fill();
		c.stroke();

		c.shadowColor = "transparent";
		c.shadowOffsetX = c.shadowOffsetY = c.shadowBlur = 0;



		c.beginPath();
		c.arc(center.x + offset.x, center.y + offset.y, innerRadius, fromAngle, toAngle);
		c.arc(center.x + offset.x, center.y + offset.y, (outerRadius - innerRadius) * sliceData.percentage + innerRadius, toAngle, fromAngle, true);

		c.fillStyle = 'hsla('+ color +', 80%, 50%, 0.5)';
		c.shadowColor = 'hsla('+color+', 100%, 50%, 0.99)';
		c.strokeStyle = 'hsla('+ color +', 50%, 50%, 0.5)';

		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;
		c.shadowBlur = outerRadius * 0.05;

		c.closePath();
		c.fill();
		c.stroke();

		sliceData.assigned = Math.max(sliceData.assigned, Math.min(0.03, 1.03 - sliceData.percentage));
		if(sliceData.assigned > 0){
			c.beginPath();
			c.arc(center.x + offset.x, center.y + offset.y, innerRadius, fromAngle, toAngle);
			c.arc(center.x + offset.x, center.y + offset.y, (outerRadius - innerRadius) * (sliceData.percentage + sliceData.assigned) + innerRadius, toAngle, fromAngle, true);
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

		c.globalCompositeOperation = oldMode

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

		c.shadowBlur =
		c.shadowOffsetX =
		c.shadowOffsetY = 0;

		c.closePath();
		c.strokeStyle = c.fillStyle = "#248";
		c.stroke();
		c.font = this.font;
		c.shadowColor = '#666';
		c.shadowBlur = 3;
		c.shadowOffsetX = 1;
		c.shadowOffsetY = 2;
		c.textAlign = (offset.x > 0)?'left':'right';
		c.fillText(sliceData.title, center.x + offset.x * d * 1.3 + offset.x / pivot * 12, center.y + offset.y * d * 1.3 + offset.y / pivot * 12);


		if(true){
		// if(sliceData.percentage){
			c.font = this.innerFont;
			c.shadowColor = '#fff';
			c.fillStyle = 'white';
			c.textAlign = 'center';
			c.shadowOffsetX = 0;
			c.shadowOffsetY = -1;
			c.fillText(Math.floor(sliceData.percentage*100) + '%',
						center.x + offset.x / pivot * (innerRadius + (outerRadius - innerRadius) * 0.37),
						center.y + offset.y / pivot * (innerRadius + (outerRadius - innerRadius) * 0.37));
		}
		c.shadowBlur =
		c.shadowOffsetX =
		c.shadowOffsetY = 0;

		portionsToDate += sliceData.portion;
	}
};

PiegressChart.prototype.update = function () {

};

PiegressChart.prototype.sort = function (attr, desc) {
	var dir = desc?1:-1;
	this.slices.sort(function(a, b){
		if(a[attr] == b[attr]) return a.id>b.id?1:-1;
		return a[attr] > b[attr] ? dir : -dir;
	});
	console.log(this.slices);
};
