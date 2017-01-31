
function Timer(names, totals, perMove, colors) {
	var i;

	this.timeTable = $("table#times");
	this.players = [];
	this.gameTurn = 0;
	this.numPlayers = 0;

	for (i = 0; i < names.length; i++) {
		if (names[i] !== "") {
			this.timeTable.append(timeRow(names[i], totals[i], colors[i].toLowerCase()));
			this.players.push(new Player(names[i], totals[i], perMove[i],
				this.timeTable.find("tr").eq(this.numPlayers + 1).children("td").eq(1), colors[i]));
			this.numPlayers++;
		}
	}

	$("table#settings").hide();
	this.timeTable.show();

	this.startGame = function () {
		var self;

		self = this;
		self.players[0].doTurn();
		$(document).keypress(this.nextTurn(self));
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

function Player(name, time, perMove, timeElem, color) {
	this.name = name;
	this.time = time;
	this.perMove = perMove;
	this.timeElem = timeElem;
	this.color = color.toLowerCase();

	this.isTurn = false;
	this.timeInterval;

	this.doTurn = function () {
		var player;

		this.isTurn = true;
		player = this;

	  	this.timeinterval = setInterval(function(){
		    if(!player.isTurn || player.time <= 0){
		      	clearInterval(player.timeinterval);
		      	player.time = player.time + player.perMove;
		    } else {
				player.time = player.time - 1;
		    }
		    $(player.timeElem).text(player.time);
		},1000);
	};
}

function timeRow(player, time, color) {
	return "<tr class='" + color + "'><td>" + player + "</td><td>" +
		time + "</td></tr>";
}

function collectSettings() {
	var settings;

	settings = {
		names : [],
		totals : [],
		perMove : [],
		colors : ["blue", "brown", "red", "orange", "gray", "green"]
	};

	$("table#settings").find("tr:not(:first)").not(".globalInput").each(function (i) {
		var name, totalTime, perMove, color, validName;

		name = $(this).find("input").eq(0).val();
		totalTime = $(this).find("input").eq(1).val();
		perMove = $(this).find("input").eq(2).val();

		validName = name !== "";

		settings.names[i] = name;
		settings.totals[i] = validName ? parseInt(totalTime, 10) : 0;
		settings.perMove[i] = validName ? parseInt(perMove, 10) : 0;
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

		$(this).val("Start").one("click", function () {
			timer.startGame();
			$(this).hide();
		});
	});
});
