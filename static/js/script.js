$(function($){
	'use strict';

	var a = new Animator(document.getElementById("piegress-chart"));
	var p = new PiegressChart();

	$(window).on('resize', a.update.bind(a));

	// Normally, we'd GET the config file. for dev purposes, it's included in the HTML <head> because of cross-domain shenanigans.
	//$.get('config.json', function(config){
		if(config && config.org_url && config.user && config.token) $.ajax({
			type: "GET",
			url: "https://api.github.com/" + config.org_url + '/repos',
			dataType: "JSON",
			headers:{
				"Authorization": "Basic " + btoa(config.user + ":" + config.token)
			}
		}).success(function(data){
			for(var i in data){
				var d = data[i];
				if(!d.has_issues) continue;
				$.ajax({
					type: "GET",
					url: "https://api.github.com/repos/"+d.full_name+"/issues?state=all",
					dataType: "JSON",
					headers:{
						"Authorization": "Basic " + btoa(config.user + ":" + config.token)
					}
				}).success(function(data){
					var closed = 0;
					var assigned = 0;
					for(var j in data){
						switch(data[j].state){
							case "closed" : closed++; break;
							case "assigned" : assigned++; break;
						}
					}
					p.addSlice(this.name, !data.length?0:closed/data.length, !data.length?0:assigned/data.length, Math.log2(this.size+2));
				}.bind(d));
			}
			a.drawables.push(p);
			a.start();
		});
		else console.error("please make sure config file has an org_url, a user and a token/password");
	//});
});
