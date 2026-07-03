import { mockMarketplaceProducts, mockMarketplaceWorkflows } from "@insuros/mocks";

export class MarketplaceService {
  async getProducts() {
    return mockMarketplaceProducts;
  }

  async getProduct(id: string) {
    return mockMarketplaceProducts.find((product) => product.id === id);
  }

  async getMarketplaceWorkflows() {
    return mockMarketplaceWorkflows;
  }

  async getMarketplaceWorkflow(productId: string) {
    return mockMarketplaceWorkflows.find((workflow) => workflow.productId === productId);
  }
}
