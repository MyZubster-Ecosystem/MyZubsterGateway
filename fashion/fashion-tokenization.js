class FashionTokenization {
  constructor() {
    this.brands = []; this.designers = []; this.collections = []; this.accessories = [];
    ['Gucci','Prada','Versace','Armani','Dolce & Gabbana','Valentino'].forEach(b =>
      this.brands.push({ name: b, country: 'Italia', tokenId: `NFT-FASHION-BRAND-${String(this.brands.length+1).padStart(3,'0')}` })
    );
    ['Miuccia Prada','Giorgio Armani','Donatella Versace','Alessandro Michele'].forEach(d =>
      this.designers.push({ name: d, tokenId: `NFT-FASHION-DESIGNER-${String(this.designers.length+1).padStart(3,'0')}` })
    );
    ['Primavera/Estate 2024','Autunno/Inverno 2024','Alta Moda 2024'].forEach(c =>
      this.collections.push({ name: c, tokenId: `NFT-FASHION-COLLECTION-${String(this.collections.length+1).padStart(3,'0')}` })
    );
    ['Borsa Gucci','Scarpe Prada','Occhiali Versace','Orologio Armani'].forEach(a =>
      this.accessories.push({ name: a, tokenId: `NFT-FASHION-ACCESSORY-${String(this.accessories.length+1).padStart(3,'0')}` })
    );
  }
  getStats() { return { brands: this.brands.length, designers: this.designers.length, collections: this.collections.length, accessories: this.accessories.length, total: this.brands.length+this.designers.length+this.collections.length+this.accessories.length }; }
}
module.exports = new FashionTokenization();
