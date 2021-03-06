
function Timer(names, totals, perMove, colors) {
	var i;

	this.timeTable = $("table#times");
	this.players = [];
	this.gameTurn = 0;
	this.numPlayers = 0;
	this.isPaused = false;

	for (i = 0; i < names.length; i++) {
		if (names[i] !== "") {
			this.timeTable.append(timeRow(names[i], totals[i], colors[i].toLowerCase()));
			this.players.push(new Player(names[i], totals[i], perMove[i],
				this.timeTable.find("tr").eq(this.numPlayers).children("td").eq(1), colors[i], this));
			this.numPlayers++;
		}
	}

	$("table#settings").hide();
	this.timeTable.show();

	this.startGame = function () {
		var self;

		self = this;
		self.players[0].doTurn();
		$(".startbutton").click(function () {
			var oldPlayer, newPlayer;

			oldPlayer = self.players[self.gameTurn % self.numPlayers];
			oldPlayer.timeElem.parent().addClass("noturn").removeClass("turn");
			console.log(oldPlayer.name + "'s turn ended");
			oldPlayer.isTurn = false;

			self.gameTurn++;
			newPlayer = self.players[self.gameTurn % self.numPlayers];
			newPlayer.timeElem.parent().addClass("turn").removeClass("noturn");
			console.log(newPlayer.name + "'s turn started");
			newPlayer.doTurn();
		});
		$(".pausebutton").click(function () {
			var player;

			self.isPaused = !self.isPaused;
			$(this).val(self.isPaused ? "Play" : "Pause");
			$("input#start").prop("disabled", self.isPaused);

			player = self.players[self.gameTurn % self.numPlayers];
			if (self.isPaused) {
				player.isTurn = false;
			} else {
				player.doTurn();
			}
		});
	}

	this.nextTurn = function (self) {
		return function (event) {
			var oldPlayer, newPlayer;
			// 32 is spacebar
			if (event.which == 32) {
				oldPlayer = self.players[self.gameTurn % self.numPlayers];
				console.log(oldPlayer.name + "'s turn ended");
				oldPlayer.isTurn = false;

				self.gameTurn++;
				newPlayer = self.players[self.gameTurn % self.numPlayers];
				console.log(newPlayer.name + "'s turn started");
				newPlayer.doTurn();
			}
		}
	}
}

function Player(name, time, perMove, timeElem, color, timer) {
	this.name = name;
	this.time = time;
	this.perMove = perMove;
	this.timeElem = timeElem;
	this.color = color.toLowerCase();
	this.timer = timer;

	this.isTurn = false;
	this.timeInterval;

	this.doTurn = function () {
		var player;

		this.isTurn = true;
		player = this;

	  	this.timeinterval = setInterval(function(){
		    if(!player.isTurn || player.time <= 0){
		      	clearInterval(player.timeinterval);
		      	if (!this.timer.isPaused) {
			      	player.time = player.time + player.perMove;
		      	}
		    } else {
				player.time = player.time - 1;
		    }
		    $(player.timeElem).text(toMinutes(player.time));
		},1000);
	};
}

function toMinutes(time) 	{
	var res = time % 60;
	return Math.floor(time / 60) + (res < 10 ? ":0" : ":") + res;
}

function timeRow(player, time, color) {
	return "<tr class='" + color + " timerow'><td class='left'>" + player + "</td><td>" +
		toMinutes(time) + "</td></tr>";
}

function collectSettings() {
	var settings;

	settings = {
		names : [],
		totals : [],
		perMove : [],
		colors : []
	};

	$("table#settings").find("tr:not(:first)").not(".globalInput").each(function (i) {
		var name, totalTime, perMove, color, validName;

		name = $(this).find("input").eq(0).val();
		totalTime = $(this).find("input").eq(1).val();
		perMove = $(this).find("input").eq(2).val();
		color = $(this).find("input").eq(3).val();

		validName = name !== "";

		settings.names[i] = name;
		settings.totals[i] = validName ? parseInt(totalTime, 10) : 0;
		settings.perMove[i] = validName ? parseInt(perMove, 10) : 0;
		settings.colors[i] = validName ? color : "";
	});

	return settings;
}

$(document).ready(function () {
	var settings, names, totals, perMove, colors;

	names = [];
	totals = [];
	perMove = [];
	colors = [];

	$("table#settings").click(function () {
		settings = collectSettings();
		names = settings.names;
		totals = settings.totals;
		perMove = settings.perMove;
		colors = settings.colors;
	});

	$("input#globalTime").on("input", function () {
		var time = $(this).val();
		$("table#settings").find("tr").not(".globalInput").each(function () {
			$(this).find("input").eq(1).val(time);
		});
	});

	$("input#globalPerMove").on("input", function () {
		var perMove = $(this).val();
		$("table#settings").find("tr").not(".globalInput").each(function () {
			$(this).find("input").eq(2).val(perMove);
		});
	});

	$("input#start").one("click", function () {
		settings = collectSettings();
		names = settings.names;
		totals = settings.totals;
		perMove = settings.perMove;
		colors = settings.colors;

		timer = new Timer(names, totals, perMove, colors);
		$("#times").find("*").css("font-size", 100 / (timer.numPlayers + 3) + "vh");

		if ($(window).width() < 800) {
			$("#buttondiv").hide();
			$("input#start").val("Start").show();
			$("input#pause").show();
		} else {
			$("#timerdiv").width("50vw").height("100vh");
			$("#buttondiv").height("100vh").width("50vw").show();
			$("input#start, input#pause").hide();
		}

		$(".startbutton").one("click", function () {
			timer.startGame();
			$("input#start").val("Next");
			$("#buttontext").text("Next");
		});
	});

	$(window).resize(function () {
		if ($(this).width() < 800) {
			$("#buttondiv").hide();
			$("input#start, input#pause").show();
		} else {
			$("#timerdiv").width("50vw").height("100vh");
			$("#buttondiv").width("50vw").height("100vh").show();
			$("input#start, input#pause").hide();
		}
	});

	$("input#jaybutton").click(function () {
		$("input#globalTime").val(67).click();
		$("input#globalPerMove").val(1).click();
		$("input#pone").val("Jay").click();
		$("input#ptwo").val("Miré").click();
		$(this).hide();
	});
});
