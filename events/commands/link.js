import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';

// Creates an Object in JSON with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('link')
		.setDescription('Link your PikaIcons license key to your Discord account')
		.addStringOption((option) =>
			option
				.setName('key')
				.setDescription('Your PikaIcons license key')
				.setRequired(true)
		);

	return command.toJSON();
};

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = async (interaction) => {
	const key = interaction.options.getString('key');

	const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
		method: 'POST',
		headers: {
			'Accept': 'application/json'
		},
		body: new URLSearchParams({
			'license_key': key,
		})
	});

	const body = await res.json();

	if(! body.valid || body.meta.store_id !== 10861) {
		return interaction.reply({
			content: 'The license key you provided is invalid. Please try again.',
			ephemeral: true,
		});
	}

	// Get the user who initiated the slash command
	const user = interaction.user;
	const userId = user.id;
	const packageName = body.meta.variant_name;

	// Assuming you pass the role ID as an option in your slash command
	const channel = await interaction.guild.channels.fetch('1187105167036907630');
	const guild = interaction.guild;

	const member = await guild.members.fetch(userId);
	const role = await guild.roles.fetch('1187104876908519484');

	try {
		await member.roles.add(role);
	} catch (error) {
		console.error(error);
		return interaction.reply({
			content: 'Something went wrong while adding the role. Please try again.',
			ephemeral: true,
		});
	}

	await channel.send(`<@${user.id}> has linked their ${packageName} license key to this Discord account.`);
	return interaction.reply({
		content: `Your ${packageName} license key has been linked to your Discord account. You now have access to the member-only channels.`,
		ephemeral: true,
	});
};

export { create, invoke };
