var rollenabled = false;

Hooks.on("init", () => {
	game.settings.register("hp-roller", "rolltochat", {
		name: "Display roll to chat",
		hint: "Displays the rolls in chat as a GM roll",
		scope: "client",
		config: true,
		type: Boolean,
		default: false
	});
});

Hooks.on("getSceneControlButtons", (controls) => {
	const hproll = {
      icon: "fas fa-heart-circle-bolt",
      name: "hproll",
      title: "Toggle HP Rolling",
      toggle: true,
      visible: true,
      onClick: toggled => rollenabled = toggled
    };
    controls.find((control) => control.name === "token").tools.push(hproll);
});

Hooks.on("preCreateToken", (token, data, options, userId) => {
	const actor = game.actors.get(data.actorId);
	if (rollenabled == true && data.actorLink == false && actor.type == "npc") {
		const formula = getProperty(actor, "system.attributes.hp.formula");
		if (formula) {
			const roll = new Roll(formula.replace(" ", ""));
			roll.roll({async: false});
			const finalhp = Math.max(roll.total, 1);
			if (game.settings.get("hp-roller", "rolltochat") == true) {
				roll.toMessage({rollMode: "gmroll", flavor: data.name + " rolls for hp!"});
			}
			token.delta.updateSource({"system.attributes.hp.value" : finalhp, "system.attributes.hp.max": finalhp});
		} else {
			ui.notifications.warn("No HP formula set.");
		}
	}
});