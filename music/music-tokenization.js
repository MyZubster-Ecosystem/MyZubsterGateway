class MusicTokenization {
  constructor() {
    this.artists = []; this.albums = []; this.songs = []; this.instruments = [];
    ['Mozart','Beethoven','Bach','Vivaldi','Chopin','Tchaikovsky','Wagner','Verdi'].forEach(a =>
      this.artists.push({ name: a, genre: 'Classica', tokenId: `NFT-MUSIC-ARTIST-${String(this.artists.length+1).padStart(3,'0')}` })
    );
    ['Requiem','Nona Sinfonia','Concerto Brandeburghese','Le Quattro Stagioni'].forEach(a =>
      this.albums.push({ name: a, tokenId: `NFT-MUSIC-ALBUM-${String(this.albums.length+1).padStart(3,'0')}` })
    );
    ['Ave Maria','Inno alla Gioia','Toccata e Fuga','Primavera'].forEach(s =>
      this.songs.push({ name: s, tokenId: `NFT-MUSIC-SONG-${String(this.songs.length+1).padStart(3,'0')}` })
    );
    ['Violino Stradivari','Pianoforte Steinway','Organo','Liuto'].forEach(i =>
      this.instruments.push({ name: i, tokenId: `NFT-MUSIC-INSTRUMENT-${String(this.instruments.length+1).padStart(3,'0')}` })
    );
  }
  getStats() { return { artists: this.artists.length, albums: this.albums.length, songs: this.songs.length, instruments: this.instruments.length, total: this.artists.length+this.albums.length+this.songs.length+this.instruments.length }; }
}
module.exports = new MusicTokenization();
