import { mockMarketplaceWorkflows, mockProducts } from "@insuros/mocks";

export class MarketplaceService {
  async getProducts() {
    return mockProducts;
  }

  async getProduct(id: string) {
    return mockProducts.find((product) => product.id === id);
  }

  async getMarketplaceWorkflows() {
    return mockMarketplaceWorkflows;
  }

  async getMarketplaceWorkflow(productId: string) {
    return mockMarketplaceWorkflows.find((workflow) => workflow.productId === productId);
  }
}
