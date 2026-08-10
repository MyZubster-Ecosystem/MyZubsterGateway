class FoodTokenization {
  constructor() {
    this.recipes = []; this.restaurants = []; this.chefs = []; this.wines = [];
    ['Pizza Margherita','Spaghetti Carbonara','Lasagne','Risotto','Tiramisù','Gelato'].forEach(r =>
      this.recipes.push({ name: r, region: 'Italia', tokenId: `NFT-FOOD-RECIPE-${String(this.recipes.length+1).padStart(3,'0')}` })
    );
    ['Osteria Francescana','Piazza Duomo','Le Calandre','Da Vittorio'].forEach(r =>
      this.restaurants.push({ name: r, stars: Math.floor(Math.random()*3+1), tokenId: `NFT-FOOD-RESTAURANT-${String(this.restaurants.length+1).padStart(3,'0')}` })
    );
    ['Massimo Bottura','Carlo Cracco','Gualtiero Marchesi','Niko Romito'].forEach(c =>
      this.chefs.push({ name: c, tokenId: `NFT-FOOD-CHEF-${String(this.chefs.length+1).padStart(3,'0')}` })
    );
    ['Chianti','Barolo','Brunello','Amarone','Prosecco'].forEach(w =>
      this.wines.push({ name: w, region: 'Italia', tokenId: `NFT-FOOD-WINE-${String(this.wines.length+1).padStart(3,'0')}` })
    );
  }
  getStats() { return { recipes: this.recipes.length, restaurants: this.restaurants.length, chefs: this.chefs.length, wines: this.wines.length, total: this.recipes.length+this.restaurants.length+this.chefs.length+this.wines.length }; }
}
module.exports = new FoodTokenization();
