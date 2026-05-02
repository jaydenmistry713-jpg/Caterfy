'use client'

import { useState } from 'react'
import { MenuItem, Package } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface Props {
  caterererId: string
  initialItems: MenuItem[]
  initialPackages: Package[]
}

export default function MenuEditor({ caterererId, initialItems, initialPackages }: Props) {
  const [items, setItems] = useState<any[]>(initialItems)
  const [packages, setPackages] = useState<any[]>(initialPackages)
  const [itemDialog, setItemDialog] = useState(false)
  const [packageDialog, setPackageDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [saving, setSaving] = useState(false)

  const [itemForm, setItemForm] = useState<{
    name: string; category: string; description: string; price: string;
    price_unit: 'per person' | 'per item' | 'flat'; is_available: boolean;
  }>({
    name: '', category: '', description: '', price: '', price_unit: 'per person', is_available: true,
  })
  const [pkgForm, setPkgForm] = useState({
    name: '', description: '', price: '', min_guests: '', max_guests: '', is_available: true,
  })

  function openEditItem(item: MenuItem) {
    setEditingItem(item)
    setItemForm({
      name: item.name, category: item.category || '', description: item.description || '',
      price: String(item.price), price_unit: item.price_unit as 'per person' | 'per item' | 'flat', is_available: item.is_available,
    })
    setItemDialog(true)
  }

  function openNewItem() {
    setEditingItem(null)
    setItemForm({ name: '', category: '', description: '', price: '', price_unit: 'per person', is_available: true })
    setItemDialog(true)
  }

  async function saveItem() {
    if (!itemForm.name || !itemForm.price) return
    setSaving(true)
    const supabase = createClient()
    const data = {
      caterer_id: caterererId,
      name: itemForm.name,
      category: itemForm.category || null,
      description: itemForm.description || null,
      price: parseFloat(itemForm.price),
      price_unit: itemForm.price_unit,
      is_available: itemForm.is_available,
    }

    if (editingItem) {
      const { error } = await supabase.from('menu_items').update(data).eq('id', editingItem.id)
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return }
      setItems((prev) => prev.map((i) => i.id === editingItem.id ? { ...i, ...data } : i))
    } else {
      const { data: newItem, error } = await supabase.from('menu_items').insert(data).select().single()
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return }
      setItems((prev) => [...prev, newItem])
    }

    toast({ title: 'Saved', variant: 'success' })
    setItemDialog(false)
    setSaving(false)
  }

  async function deleteItem(id: string) {
    const supabase = createClient()
    await supabase.from('menu_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast({ title: 'Item deleted' })
  }

  async function toggleItemAvailability(item: MenuItem) {
    const supabase = createClient()
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  async function savePackage() {
    if (!pkgForm.name || !pkgForm.price) return
    setSaving(true)
    const supabase = createClient()
    const data = {
      caterer_id: caterererId,
      name: pkgForm.name,
      description: pkgForm.description || null,
      price: parseFloat(pkgForm.price),
      min_guests: pkgForm.min_guests ? parseInt(pkgForm.min_guests) : null,
      max_guests: pkgForm.max_guests ? parseInt(pkgForm.max_guests) : null,
      is_available: pkgForm.is_available,
    }

    if (editingPackage) {
      const { error } = await supabase.from('packages').update(data).eq('id', editingPackage.id)
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return }
      setPackages((prev) => prev.map((p) => p.id === editingPackage.id ? { ...p, ...data } : p))
    } else {
      const { data: newPkg, error } = await supabase.from('packages').insert(data).select().single()
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return }
      setPackages((prev) => [...prev, newPkg])
    }

    toast({ title: 'Saved', variant: 'success' })
    setPackageDialog(false)
    setSaving(false)
  }

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.category || 'Uncategorised')))

  return (
    <>
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Menu Items ({items.length})</TabsTrigger>
          <TabsTrigger value="packages">Packages ({packages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewItem}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              No menu items yet. Add your first item to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.filter((i) => (i.category || 'Uncategorised') === category).map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${!item.is_available ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {item.name}
                              </p>
                            </div>
                            {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                            <p className="text-sm font-medium text-gray-700">
                              £{Number(item.price).toFixed(2)} {item.price_unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleItemAvailability(item)} className="text-gray-400 hover:text-gray-700">
                              {item.is_available
                                ? <ToggleRight className="h-5 w-5 text-green-500" />
                                : <ToggleLeft className="h-5 w-5" />}
                            </button>
                            <button onClick={() => openEditItem(item)} className="text-gray-400 hover:text-gray-700">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingPackage(null); setPkgForm({ name: '', description: '', price: '', min_guests: '', max_guests: '', is_available: true }); setPackageDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />Add Package
            </Button>
          </div>
          {packages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              No packages yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingPackage(pkg); setPkgForm({ name: pkg.name, description: pkg.description || '', price: String(pkg.price), min_guests: pkg.min_guests ? String(pkg.min_guests) : '', max_guests: pkg.max_guests ? String(pkg.max_guests) : '', is_available: pkg.is_available }); setPackageDialog(true) }}>
                          <Pencil className="h-4 w-4 text-gray-400 hover:text-gray-700" />
                        </button>
                      </div>
                    </div>
                    {pkg.description && <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>}
                    <p className="text-lg font-bold text-gray-900">£{Number(pkg.price).toFixed(2)}</p>
                    {(pkg.min_guests || pkg.max_guests) && (
                      <p className="text-xs text-gray-500">
                        {pkg.min_guests && `Min ${pkg.min_guests}`}{pkg.min_guests && pkg.max_guests && ' – '}{pkg.max_guests && `Max ${pkg.max_guests}`} guests
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Item dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item name *</Label>
              <Input className="mt-1" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g. Jerk Chicken" />
            </div>
            <div>
              <Label>Category</Label>
              <Input className="mt-1" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} placeholder="e.g. Main Dishes" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price *</Label>
                <Input className="mt-1" type="number" step="0.01" min="0" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <Label>Price unit</Label>
                <Select value={itemForm.price_unit} onValueChange={(v: any) => setItemForm({ ...itemForm, price_unit: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per person">per person</SelectItem>
                    <SelectItem value="per item">per item</SelectItem>
                    <SelectItem value="flat">flat rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setItemDialog(false)}>Cancel</Button>
              <Button onClick={saveItem} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package dialog */}
      <Dialog open={packageDialog} onOpenChange={setPackageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Edit Package' : 'Add Package'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Package name *</Label>
              <Input className="mt-1" value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="e.g. Wedding Package" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Price *</Label>
              <Input className="mt-1" type="number" step="0.01" min="0" value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })} placeholder="0.00" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min guests</Label>
                <Input className="mt-1" type="number" min="1" value={pkgForm.min_guests} onChange={(e) => setPkgForm({ ...pkgForm, min_guests: e.target.value })} />
              </div>
              <div>
                <Label>Max guests</Label>
                <Input className="mt-1" type="number" min="1" value={pkgForm.max_guests} onChange={(e) => setPkgForm({ ...pkgForm, max_guests: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPackageDialog(false)}>Cancel</Button>
              <Button onClick={savePackage} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
