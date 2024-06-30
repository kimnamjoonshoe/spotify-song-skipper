const clientId = '77a0d5c3e2424ff9a3e07edf33458a04';
const redirectUri = "https://suminie097.repl.co/callback";
const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
];

document.getElementById('login-button').addEventListener('click', () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
    window.location = url;
});

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = getTokenFromUrl();
    if (!token) return;

    const player = new Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('player_state_changed', state => {
        if (!state) return;
        const track = state.track_window.current_track;
        const duration = track.duration_ms / 1000; // Convert to seconds
        const skipTime = (duration / 2) + 5;

        // Display the current song name
        document.getElementById('player').innerText = `Now playing: ${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;

        setTimeout(() => {
            player.nextTrack().then(() => {
                console.log('Skipped track:', track.name);
            });
        }, skipTime * 1000);
    });

    player.connect();
};

function getTokenFromUrl() {
    const hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce((initial, item) => {
            if (item) {
                let parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
            }
            return initial;
        }, {});
    return hash.access_token;
}