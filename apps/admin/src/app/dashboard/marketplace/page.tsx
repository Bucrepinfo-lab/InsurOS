import {
  Badge,
  Button,
  Card,
  CardContent,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from "@insuros/ui";
import { MarketplaceService } from "@insuros/services";

const marketplaceService = new MarketplaceService();

export default async function MarketplacePage() {
  const products = await marketplaceService.getProducts();
  const workflows = await marketplaceService.getMarketplaceWorkflows();

  type ProductRow = (typeof products)[number];

  const columns: DataTableColumn<ProductRow>[] = [
    { key: "name", header: "Product" },
    { key: "code", header: "Code" },
    { key: "category", header: "Category" },
    { key: "carrier", header: "Carrier" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={row.status === "Published" ? "success" : "warning"}>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title="Marketplace"
      description="Manage insurance products, pricing, publishing, carrier availability, and marketplace workflows."
      actions={<Button>Create Product</Button>}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KPICard title="Products" value={String(products.length)} change="Marketplace catalog" />
        <KPICard title="Workflows" value={String(workflows.length)} change="Tracked products" />
        <KPICard title="In Review" value={String(workflows.filter((item) => item.workflowStatus === "In Review").length)} change="Needs action" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.productId}>
            <CardContent>
              <p className="text-sm text-slate-500">Product</p>
              <p className="mt-2 font-medium">{workflow.productId}</p>

              <p className="mt-4 text-sm text-slate-500">Stage</p>
              <p className="mt-2 font-medium">{workflow.stage}</p>

              <div className="mt-4">
                <Badge tone={workflow.workflowStatus === "Approved" ? "success" : "warning"}>
                  {workflow.workflowStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DomainEntityList
        title="Marketplace Products"
        description="Product catalog and marketplace publishing status."
        searchPlaceholder="Search products..."
        columns={columns}
        data={products}
        emptyTitle="No products"
        emptyDescription="Create the first marketplace product."
        emptyAction={<Button>Create Product</Button>}
        actions={<Button variant="secondary">Export</Button>}
      />
    </DomainModulePage>
  );
}
