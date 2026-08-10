class GamingTokenization {
  constructor() {
    this.games = []; this.characters = []; this.consoles = []; this.esports = [];
    ['Super Mario','The Legend of Zelda','Pokémon','Minecraft','Fortnite','GTA V'].forEach(g =>
      this.games.push({ name: g, genre: 'Azione', tokenId: `NFT-GAMING-GAME-${String(this.games.length+1).padStart(3,'0')}` })
    );
    ['Mario','Link','Pikachu','Steve','Lara Croft','Sonic'].forEach(c =>
      this.characters.push({ name: c, tokenId: `NFT-GAMING-CHARACTER-${String(this.characters.length+1).padStart(3,'0')}` })
    );
    ['Nintendo Switch','PlayStation 5','Xbox Series X','Game Boy','Sega Mega Drive'].forEach(c =>
      this.consoles.push({ name: c, tokenId: `NFT-GAMING-CONSOLE-${String(this.consoles.length+1).padStart(3,'0')}` })
    );
    ['League of Legends Worlds','The International','Valorant Champions','CS:GO Major'].forEach(e =>
      this.esports.push({ name: e, tokenId: `NFT-GAMING-ESPORTS-${String(this.esports.length+1).padStart(3,'0')}` })
    );
  }
  getStats() { return { games: this.games.length, characters: this.characters.length, consoles: this.consoles.length, esports: this.esports.length, total: this.games.length+this.characters.length+this.consoles.length+this.esports.length }; }
}
module.exports = new GamingTokenization();
