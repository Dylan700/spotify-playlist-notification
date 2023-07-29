type EmailData = {
	heading: string;
	from: string;
	greeting: string;
	primary_message: string;
	secondary_message: string;
	playlists: SpotifyApi.PlaylistBaseObject[]
}

export default EmailData