$(function($){
	'use strict';

	var a = new Animator(document.getElementById("piegress-chart"));
	var p = new PiegressChart();
	var t = {
		x: 0,
		y: 0,
		font: "",
		color: "",
		format: "",
		hands: null,
		ready: false,
		update: function(){
			//
			if(!this.hands){
				this.hands = new Image();
				this.hands.onload = function(){
					this.ready = true;
				}.bind(this);
				this.hands.src="images/hands.png";
			}
		},draw: function(c){
			//
			// draw on cavas: current time.
			//
			var d = new Date();
			var h = Math.floor(window.innerHeight/20);

			c.shadowColor = 'silver';
			c.shadowOffsetX = 0;
			c.shadowOffsetY = h*0.05;
			c.shadowBlur = 3;

			c.font = h + 'px Open Sans';
			c.fillStyle = '#333';
			c.textAlign = 'center';
			c.fillText(d.toLocaleTimeString(), window.innerWidth/2, h + 8);

			var seconds = d.getSeconds() + d.getMilliseconds() / 1000;
			var minutes = d.getMinutes();
			var hours = d.getHours();

			if(this.ready){
				c.save();
				c.globalCompositeOperation = "multiply";
				c.translate(window.innerWidth/2, window.innerHeight/2);
				c.rotate(minutes/30*Math.PI);
				c.drawImage(this.hands, 0, 188, 80, 459-188, -40, -459+188+19, 80,459-188);
				c.rotate(-minutes/30*Math.PI + hours/6*Math.PI);
				c.drawImage(this.hands, 0, 0, 80,188, -40, -188+19, 80, 188);
				c.rotate(-hours/6*Math.PI + seconds/30*Math.PI);
				c.moveTo(0, 0);
				c.lineTo(0, -200);
				c.strokeStyle = 'silver';
				c.stroke();
				c.restore();
			}
			/*c.beginPath();
			c.moveTo(window.innerWidth / 2, window.innerHeight / 2);
			c.lineTo(window.innerWidth / 2 + Math.cos(-Math.PI/2 + seconds/30*Math.PI) * 300,
					window.innerHeight / 2 + Math.sin(-Math.PI/2 + seconds/30*Math.PI) * 300);
			c.strokeStyle = 'blue';
			c.stroke();

			c.beginPath();
			c.moveTo(window.innerWidth / 2, window.innerHeight / 2);
			c.lineTo(window.innerWidth / 2 + Math.cos(-Math.PI/2 + minutes/30*Math.PI + seconds/60/30*Math.PI) * 300,
					window.innerHeight / 2 + Math.sin(-Math.PI/2 + minutes/30*Math.PI + seconds/60/30*Math.PI) * 300);
			c.strokeStyle = 'blue';
			c.stroke();

			c.beginPath();
			c.moveTo(window.innerWidth / 2, window.innerHeight / 2);
			c.lineTo(window.innerWidth / 2 + Math.cos(-Math.PI/2 + hours/6*Math.PI) * 300,
					window.innerHeight / 2 + Math.sin(-Math.PI/2 + hours/6*Math.PI) * 300);
			c.strokeStyle = 'red';
			c.stroke();*/

		}
	};

	a.fps = 1;

	$(window).on('resize', a.update.bind(a));

	// Normally, we'd GET the config file. for dev purposes, it's included in the HTML <head> because of cross-domain shenanigans.
	//$.get('config.json', function(config){
		if(config && config.org_url && config.user && config.token)
			$.ajax(
				getQueryObject(config.org_url, '/repos')
			).done(function(data){
				var asyncLoad = [];
				for(var i in data){ // add all repos to an aync queue and load them in parallel
					if(data[i].size > 0 || !config.skip_empty_repos) asyncLoad.push(async.apply(getRepoData, data[i], config, p));
					console.log(data[i].size, data[i]);
				}
				async.parallel(asyncLoad, function(err, res){
					if(err)
						return console.error(err);
					p.sort('portion', -1);
					a.drawables.push(p);
					a.drawables.push(t);
					a.start();
				});
				// async documentation : https://github.com/caolan/async
			});
		else console.error("please make sure config file has an org_url, a user and a token/password");
	//});

	function getRepoData(repo, config, pie, next){
		$.ajax(
			getQueryObject('repos/'+repo.full_name, "/issues?state=all")
		).done(function(data, status){
			var closed = 0;
			var assigned = 0;
			for(var j in data){
				switch(data[j].state){
					case "closed" : closed++; break;
					case "assigned" : assigned++; break;
				}
			}
			if((data.length || !config.skip_empty_issues) && (!config.skip_complete || closed != data.length))
				pie.addSlice(repo.id, repo.name, !data.length?0:closed/data.length, !data.length?0:assigned/data.length, Math.log(repo.size + Math.E));
			next(null, repo.id);
		}).fail(function(jqXHR, status, err){
			next(err, repo.id);
		});
	}

	function getQueryObject(url, query){
		return {
			type: "GET",
			dataType: "JSON",
			url: "https://api.github.com/"+url+query,
			headers:{
				"Authorization": "Basic " + btoa(config.user + ":" + config.token)
			}
		};
	}
});
