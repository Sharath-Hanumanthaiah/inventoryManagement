import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  MapPin, 
  Trash2, 
  Layers,
  Map
} from 'lucide-react';
import { inventoryApi } from '../services/api';
import type { Category } from '../services/api';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aisle, setAisle] = useState('Aisle 1');
  const [section, setSection] = useState('Section A');
  const [shelf, setShelf] = useState('Shelf 1');

  // Load categories
  const loadCategories = async () => {
    try {
      const cats = await inventoryApi.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a category name.');
      return;
    }

    try {
      await inventoryApi.addCategory({
        name: name.trim(),
        description: description.trim(),
        aisle,
        section,
        shelf
      });

      // Reset fields
      setName('');
      setDescription('');
      setAisle('Aisle 1');
      setSection('Section A');
      setShelf('Shelf 1');

      // Refresh categories
      loadCategories();
    } catch (err) {
      alert('Failed to create category. Please ensure the server is running.');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Check if category is used by items
    try {
      const [items] = await Promise.all([inventoryApi.getItems()]);
      const cat = categories.find(c => c.id === id);
      if (cat) {
        const itemsInCat = items.filter(item => item.category.toLowerCase() === cat.name.toLowerCase());
        if (itemsInCat.length > 0) {
          if (!confirm(`Warning: There are ${itemsInCat.length} item(s) currently in the "${cat.name}" category. If you delete it, these items will have an unmapped category. Do you want to proceed?`)) {
            return;
          }
        } else {
          if (!confirm(`Are you sure you want to delete the "${cat.name}" category?`)) {
            return;
          }
        }
        await inventoryApi.deleteCategory(id);
        loadCategories();
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Group categories by Aisle for the visual map
  const aisGroups: Record<string, Category[]> = {};
  categories.forEach(cat => {
    const key = cat.aisle || 'Unmapped';
    if (!aisGroups[key]) {
      aisGroups[key] = [];
    }
    aisGroups[key].push(cat);
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Categories & Layout</h1>
          <p>Define product categories and specify their physical coordinates in the store layout</p>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Category Creation Form */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <FolderPlus size={20} className="text-primary" />
              Create Category
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Category Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="cat-name">Category Name</label>
              <input 
                type="text" 
                id="cat-name"
                className="form-input" 
                placeholder="e.g. Fresh Produce, Canned, Snacks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="cat-desc">Description</label>
              <textarea 
                id="cat-desc"
                className="form-textarea" 
                placeholder="Brief description of item types in this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Store Placement Coordinates */}
            <div style={{ margin: '15px 0 10px 0', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <span className="form-label" style={{ fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} className="text-secondary" />
                Store Placement Coordinates
              </span>
            </div>

            <div className="form-row">
              {/* Aisle Selection */}
              <div className="form-group">
                <label className="form-label" htmlFor="aisle-select">Aisle</label>
                <select 
                  id="aisle-select"
                  className="form-select"
                  value={aisle}
                  onChange={(e) => setAisle(e.target.value)}
                >
                  <option value="Aisle 1">Aisle 1 (Dairy & Drinks)</option>
                  <option value="Aisle 2">Aisle 2 (Bakery & Snacks)</option>
                  <option value="Aisle 3">Aisle 3 (Pantry & Canned)</option>
                  <option value="Aisle 4">Aisle 4 (Frozen & Meat)</option>
                  <option value="Aisle 5">Aisle 5 (Household & Cleaning)</option>
                </select>
              </div>

              {/* Section Selection */}
              <div className="form-group">
                <label className="form-label" htmlFor="section-select">Section</label>
                <select 
                  id="section-select"
                  className="form-select"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                >
                  <option value="Section A">Section A (Front-end)</option>
                  <option value="Section B">Section B (Middle)</option>
                  <option value="Section C">Section C (Back-end)</option>
                  <option value="Section D">Section D (Promo Endcap)</option>
                </select>
              </div>
            </div>

            {/* Shelf Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="shelf-select">Shelf Level</label>
              <select 
                id="shelf-select"
                className="form-select"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
              >
                <option value="Shelf 1">Shelf 1 (Bottom Level)</option>
                <option value="Shelf 2">Shelf 2 (Middle-Bottom)</option>
                <option value="Shelf 3">Shelf 3 (Eye Level)</option>
                <option value="Shelf 4">Shelf 4 (Top Level)</option>
              </select>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create & Map Category
              </button>
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Layers size={20} className="text-secondary" />
              Configured Categories ({categories.length})
            </h2>
          </div>

          {categories.length === 0 ? (
            <div className="empty-state" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Layers className="empty-state-icon" size={36} />
              <p className="empty-state-title" style={{ fontSize: '1rem' }}>No categories registered</p>
              <p className="empty-state-desc">Create your first category in the form to begin mapping items in the store.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {categories.map(cat => (
                <div key={cat.id} className="quick-list-item" style={{ alignItems: 'flex-start', gap: '15px' }}>
                  <div className="item-main">
                    <span className="item-title">{cat.name}</span>
                    <span className="item-subtitle" style={{ marginTop: '3px' }}>
                      {cat.description || 'No description provided.'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-solid" style={{ fontSize: '0.7rem', textTransform: 'none', backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                        {cat.aisle}
                      </span>
                      <span className="badge badge-solid" style={{ fontSize: '0.7rem', textTransform: 'none', backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                        {cat.section}
                      </span>
                      <span className="badge badge-solid" style={{ fontSize: '0.7rem', textTransform: 'none', backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                        {cat.shelf}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-secondary"
                    style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.1)', padding: '6px', marginTop: '2px' }}
                    onClick={() => handleDeleteCategory(cat.id)}
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Store Map Section */}
      <div className="panel" style={{ marginTop: '12px' }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <Map size={20} className="text-secondary" />
            Visual Aisle Layout
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Physical distribution of categories in-store
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p className="empty-state-title" style={{ fontSize: '0.95rem' }}>No Aisle Maps Available</p>
            <p className="empty-state-desc">Aisles will populate once categories are created and mapped.</p>
          </div>
        ) : (
          <div className="placement-grid-map">
            {['Aisle 1', 'Aisle 2', 'Aisle 3', 'Aisle 4', 'Aisle 5'].map(aisleName => {
              const matchedCats = aisGroups[aisleName] || [];
              const isActive = matchedCats.length > 0;

              return (
                <div key={aisleName} className={`placement-cell ${isActive ? 'active' : ''}`}>
                  <span className="placement-label">{aisleName}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', alignItems: 'center' }}>
                    {isActive ? (
                      matchedCats.map(c => (
                        <span 
                          key={c.id} 
                          className="placement-value"
                          style={{ 
                            fontSize: '0.85rem', 
                            background: 'rgba(255,255,255,0.06)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            width: '90%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: 'center'
                          }}
                          title={`${c.name} (${c.section}, ${c.shelf})`}
                        >
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>Empty Aisle</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
