"use client"

import { useState } from "react"
import { useInventory } from "@/hooks/useInventory"
import InventoryTable from "./components/InventoryTable"
import CreateItemDialog from "./components/CreateItemDialog"
import LowStockAlert from "./components/LowStockAlert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Package, AlertCircle, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [condition, setCondition] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showLowStock, setShowLowStock] = useState(false)

  const { items, isLoading, pagination, deleteItem, isDeleting } = useInventory({
    search,
    conditionStatus: condition === "ALL" ? undefined : condition,
    sortBy,
    sortOrder,
    page,
    size: 10,
  })

  const lowStockItems = items.filter((i) => i.quantity < 5)
  const hasActiveFilters = condition !== "ALL" || search !== ""

  const clearFilters = () => {
    setCondition("ALL")
    setSearch("")
    setPage(0)
  }

  const toggleFilters = () => setShowFilters(!showFilters)

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setPage(0)
  }

  return (
    <div className="space-y-4" data-testid="inventory-page">
      {/* Compact Header with Inline Stats */}
      <Card className="bg-card border-blue-100/50 shadow-sm">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground tracking-tight">Inventory Management</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Track and manage your inventory</p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              data-testid="add-item-button"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Ultra-Compact Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{pagination.total}</p>
              <p className="text-xs text-muted-foreground -mt-1">Total Items</p>
              <div className="w-6 h-6 mx-auto bg-blue-50 rounded-full flex items-center justify-center mt-1">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
            </div>

            <div className="text-center">
              <p className={`text-xl font-bold ${lowStockItems.length > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                {lowStockItems.length}
              </p>
              <p className="text-xs text-muted-foreground -mt-1">Low Stock</p>
              <div className={`w-6 h-6 mx-auto mt-1 rounded-full flex items-center justify-center ${
                lowStockItems.length > 0 ? "bg-amber-50" : "bg-muted/10"
              }`}>
                <AlertCircle className={`w-3 h-3 ${lowStockItems.length > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{items.length}</p>
              <p className="text-xs text-muted-foreground -mt-1">Active Items</p>
              <div className="w-6 h-6 mx-auto mt-1 bg-blue-50 rounded-full flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters Section - Collapsible */}
      {showFilters && (
        <Card className="bg-card border-blue-100/50 shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground">Refine Results</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="clear-filters-button"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium h-6 px-2"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                  className="pl-8 bg-white border-blue-100/50 h-9 text-sm"
                  data-testid="search-input"
                />
              </div>

              <Select value={condition} onValueChange={(v) => { setCondition(v); setPage(0) }}>
                <SelectTrigger data-testid="condition-filter-select" className="bg-white border-blue-100/50 h-9 text-sm">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Conditions</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="NEEDS_REPAIR">Needs Repair</SelectItem>
                  <SelectItem value="REPLACED">Replaced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/20">
                {search && <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs h-5 px-2">{search}</Badge>}
                {condition !== "ALL" && <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs h-5 px-2">{condition.replace("_", " ")}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Stock Popup Dialog */}
      <Dialog open={showLowStock} onOpenChange={setShowLowStock}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              Low Stock Alert
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <LowStockAlert items={lowStockItems} className="text-sm text-amber-800" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Table Card */}
      <Card className="bg-card border-blue-100/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">Inventory Items</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                className={cn("h-8 px-3 text-sm", showFilters && "border-blue-500 text-blue-600 bg-blue-50")}
              >
                <Filter className="w-3 h-3 mr-1" />
                Filters
              </Button>
              {lowStockItems.length > 0 && (
                <Badge
                  variant="destructive"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 h-7 px-2 text-xs font-medium cursor-pointer"
                  onClick={() => setShowLowStock(true)}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {lowStockItems.length} Low
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <InventoryTable
            data={items}
            isLoading={isLoading}
            pagination={{
              pageIndex: page,
              pageSize: 10,
              total: pagination.total,
              pageCount: Math.ceil(pagination.total / 10),
            }}
            onPageChange={setPage}
            onSortChange={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onDelete={deleteItem}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>

      <CreateItemDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
