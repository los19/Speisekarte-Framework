import '../styles/CategoryNav.css';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
}

export const CategoryNav = ({ categories, activeCategory, onCategoryClick }: CategoryNavProps) => {
  return (
    <nav className="category-nav">
      <div className="category-nav-wrapper">
        <div className="category-nav-container">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-nav-item ${activeCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

