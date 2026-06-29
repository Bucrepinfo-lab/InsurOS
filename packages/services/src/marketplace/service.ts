import { mockProducts } from "@insuros/mocks";

export class MarketplaceService {
  async getProducts() {
    return mockProducts;
  }

  async getProduct(id: string) {
    return mockProducts.find((p) => p.id === id);
  }
}