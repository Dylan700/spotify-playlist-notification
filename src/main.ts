import Spotify from "spotify-web-api-node"
import { promises as fs } from "fs"
import { dirname } from "path"
import * as nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import Mustache from "mustache"
import EmailData from "./types/EmailData"

async function main(){
	if(process.env.SPOTIFY_CLIENT_SECRET == null){
		console.error("Spotify client secret is not set. Please set the environment variable SPOTIFY_CLIENT_SECRET.")
		return
	}

	if(process.env.SPOTIFY_CLIENT_ID == null){
		console.error("Spotify client ID is not set. Please set the environment variable SPOTIFY_CLIENT_ID.")
		return
	}

	if(process.env.SPOTIFY_USER_ID == null){
		console.error("Spotify user ID is not set. Please set the environment variable SPOTIFY_USER_ID.")
		return
	}

	if(process.env.EMAILS == null){
		console.error("Emails to notify is not set. Please set the environment variable EMAILS (comma separated).")
		return
	}

	if(process.env.SMTP_HOST == null){
		console.error("Please set the environment variable SMTP_HOST.")
		return
	}

	if(process.env.SMTP_PASSWORD == null){
		console.error("Please set the environment variable SMTP_PASSWORD.")
		return
	}

	if(process.env.SMTP_USERNAME == null){
		console.error("Please set the environment variable SMTP_USERNAME.")
		return
	}

	if(process.env.SMTP_PORT == null){
		console.warn("Please set the environment variable SMTP_PORT. Default port is being used instead now.")
	}


	const api = new Spotify({
		clientId: process.env.SPOTIFY_CLIENT_ID,
		clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	})
	const data = await api.clientCredentialsGrant()
	// console.log("The access token expires in " + data.body["expires_in"])
	api.setAccessToken(data.body["access_token"])
	const playlistResponse = await api.getUserPlaylists(process.env.SPOTIFY_USER_ID, {})

	// PLEASE NOTE: this foreach does not execute in order becauase the function is async.
	playlistResponse.body.items.forEach(async (playlist) => {
		console.log(`Playlist "${playlist.name}" has an ID of ${playlist.id} and contains ${playlist.tracks.total} songs.`)
		const currentData = ""+playlist.tracks.total
		// first check if the playlist has a cache file
		const cache = await readFile(`../playlist_cache/${playlist.id}`)
		if(cache != null){
			// check if it's changed
			if(cache != currentData){
				console.log("Playlist has changed!")
				await notify(getArrayOfStrings(process.env.EMAILS), [playlist])
			}else{
				console.log("Playlist has not changed.")
			}
		}else{
			console.log("Playlist cache data does not exist.")
		}
		// update the cache
		await createFile(`../playlist_cache/${playlist.id}`, currentData) // for now we are just seeing how many songs the playlist has, an improved approach would create a hash based on the names and artist of each song
	})
}

async function createFile(filePath: string, content: string): Promise<void> {
	try {
		const directory = dirname(filePath)
		await fs.mkdir(directory, { recursive: true })
		await fs.writeFile(filePath, content)
		console.log(`File ${filePath} created successfully.`)
	} catch (error) {
		console.error(`Error creating file ${filePath}: ${error}`)
	}
}

async function readFile(filePath: string): Promise<string | null> {
	try {
		const fileContent = await fs.readFile(filePath, "utf-8")
		return fileContent
	} catch (error) {
		return null
	}
}

// need to find a good way to notify, e.g. email/sms etc. (and by "good" I mean free)
async function notify(emails: string[], playlists: SpotifyApi.PlaylistBaseObject[]){
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		secure: true,
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD
		}
	} as SMTPTransport.Options)
	const data: EmailData = {
		heading: "Spotify Playlist Update Notification",
		from: getRandomFrom(),
		greeting: getRandomGreeting(),
		playlists: playlists,
		primary_message: "The following Spotify playlists have been updated:",
		secondary_message: getRandomSecondaryMessage()
	}
	// render html template
	const template = await readFile("./templates/email.mustache.html")
	if(template == null){
		console.error("Unable to read template file.")
		return
	}
	const html = Mustache.render(template, data)
	transporter.sendMail({
		from: getRandomFrom(),
		to: emails,
		subject: "Spotify Playlist Update Notification",
		html: html
	}, (e, info) => e ? console.error(e) : console.log(info))
	return
}

function getRandomGreeting(): string {
	const greetings = [
		"G'day mate!",
		"How ya going mate?",
		"Guten Tag.",
		"Hey there!",
		"Well well, look what we have here...",
		"Hmm, this is getting kinda sus now.",
		"Hey, is this playlist really still going strong?",
		"Hey, check this out!",
		"Wow, you're not going to believe this but...",
		"Is it weird that you're still getting these messages?",
		"Hey there Delilah, don't you worry about tommorrow :)",
		"Hey, I'm back in black!",
		"Hey, let's cut right to the chase...",
		"Welcome to the Hotel California (such a lovely place!)",
	]
	const randomIndex = Math.floor(Math.random() * greetings.length)
	return greetings[randomIndex]
}

function getRandomFrom(): string {
	const from = [
		"that guy you know",
		"the one",
		"your Mum, yeah you should really call her, I think she is worried about you",
		"yourself from the future.",
		"someone you know",
		"Australia mate",
	]
	const randomIndex = Math.floor(Math.random() * from.length)
	return from[randomIndex]
}

function getRandomSecondaryMessage(): string {
	const secondary = [
		"Enjoy!",
		"I  bet you can't wait to see what songs they are ;)",
		"Well, I wonder what songs they could be?",
		"Kinda sus tho right?",
		"Oh well, at least these new songs know how to wear socks properly...",
		"Looks like you're in for a real treat!",
		"I hope they're vegan-compatible.",
		"What can I say?",
		"If this email does not display properly, sorry about that, but I am pretty busy so can't do much right now, so just deal with it I guess :)",
		"Let's hope they're good songs this time! (none of that emo stuff)",
		"Well, I guess that's why they call it the blues :/",
		"At first I was afraid, I was petrified... meh I'll survive.",
		"There's an old voice in my head, that's holding me back. Well, tell her that I miss our little talks.",
		"Alright, hit the road jack and don't ya come back.",
		"We don't need no education, hey, teacher, leave them kids alone!",
		"Oh look, I can see a new horizon underneath the blazin' sky. I'll be where the eagle's flying higher and higher."
	]
	const randomIndex = Math.floor(Math.random() * secondary.length)
	return secondary[randomIndex]
}

function getArrayOfStrings(input: string | undefined): string[] {
	if(input == undefined){
		return []
	}
	return input.split(",")
}

export { main }
