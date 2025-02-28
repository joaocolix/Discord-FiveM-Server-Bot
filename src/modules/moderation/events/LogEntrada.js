const Discord = require('discord.js')
const client = require('../../../index')
const fs = require('fs')

client.on('guildMemberAdd', (member) => {
	if (member.guild.id === '1140469447866470530') {
		member.send("**E aí cidadão!** Finalmente você entrou, hein? Esperamos que você tenha boas aventuras por aqui! Conte conosco sempre!")
	}
});
