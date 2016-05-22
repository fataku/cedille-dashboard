$(function($){
	'use strict';

	var a = new Animator(document.getElementById("piegress-chart"));
	var p = new PiegressChart();

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
			if(data.length || !config.skip_empty_issues)
				pie.addSlice(repo.id, repo.name, !data.length?0:closed/data.length, !data.length?0:assigned/data.length, Math.log10(repo.size+10));
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
