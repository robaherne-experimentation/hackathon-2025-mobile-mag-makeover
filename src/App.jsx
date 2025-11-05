import { useState } from 'react';
// We've removed Amplify UI to fix errors and simplify.
// We will use standard HTML tags (div, p, etc.) and style them in App.css
import './App.css';
import articlesData from './data/articles.json';

// Import icons from lucide-react
// Don't forget to run: npm install lucide-react
import { Home, LayoutGrid, Heart, BookOpen, User, Search } from 'lucide-react';

// --- Mock Data for Home Screen ---
const popularCategories = [
  { name: 'TVs', image: 'https://placehold.co/100x100/e0e0e0/333?text=TV' },
  { name: 'Washing machines', image: 'https://placehold.co/100x100/e0e0e0/333?text=Washer' },
  { name: 'Laptops', image: 'https://placehold.co/100x100/e0e0e0/333?text=Laptop' },
  { name: 'Mattresses', image: 'https://placehold.co/100x100/e0e0e0/333?text=Mattress' },
  { name: 'Headphones', image: 'https://placehold.co/100x100/e0e0e0/333?text=Audio' },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [savedArticles, setSavedArticles] = useState([]);

  // Filter articles (retained for other tabs)
  const filteredArticles = (articlesData || []).filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSaveArticle = (articleId) => {
    setSavedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        // --- NEW Home Content (matches screenshot) ---
        return (
          <div className="home-container">
            {/* Popular Categories Section */}
            <section className="home-section">
              <div className="home-section-header">
                <h2>Popular categories</h2>
                <a href="#">See all</a>
              </div>
              <div className="categories-scroll-container">
                {popularCategories.map(category => (
                  <div key={category.name} className="category-item">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="category-item-image"
                      onError={(e) => e.target.src = 'https://placehold.co/100x100/f0f0f0/999?text=Image'}
                    />
                    <p>{category.name}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Promo Card Section */}
            <section className="home-section">
              <div className="promo-card">
                <img 
                  src="https://placehold.co/600x400/ccc/666?text=Promo+Image" 
                  alt="We put people over profit" 
                  className="promo-card-image"
                  onError={(e) => e.target.src = 'https://placehold.co/600x400/f0f0f0/999?text=Image'}
                />
                <div className="promo-card-content">
                  <h3 className="promo-card-title">
                    We put people over profit, making sure you always have a choice
                  </h3>
                  <button className="promo-button">
                    See it in action
                  </button>
                </div>
              </div>
            </section>

            {/* Placeholder for the second image card */}
            <section className="home-section">
               <div className="article-card">
                 <img 
                    src="https://placehold.co/600x400/bbb/666?text=Lifestyle+Image" 
                    alt="Article"
                    className="article-image"
                    onError={(e) => e.target.src = 'https://placehold.co/600x400/f0f0f0/999?text=Image'}
                  />
               </div>
            </section>
          </div>
        );
      case 'categories':
        const allCategories = [...new Set(articlesData.map(a => a.category))];
        return (
          <div className="categories-container">
            <h2 className="page-title">Categories</h2>
            {allCategories.map(category => (
              <div key={category} className="category-card">
                <p className="category-card-title">{category}</p>
                <p className="category-card-count">
                  {articlesData.filter(a => a.category === category).length} articles
                </p>
              </div>
            ))}
          </div>
        );
      case 'saved': {
        const savedArticlesList = articlesData.filter(a => savedArticles.includes(a.id));
        return (
          <div className="saved-container">
            <h2 className="page-title">Saved Articles</h2>
            {savedArticlesList.length === 0 ? (
              <p className="empty-state-text">No saved articles yet</p>
            ) : (
              savedArticlesList.map(article => (
                <div key={article.id} className="article-card-compact">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="article-image-small"
                      onError={(e) => e.target.src = 'https://placehold.co/80x80/f0f0f0/999?text=Image'}
                    />
                    <div className="article-card-compact-content">
                      <p className="article-card-compact-title">{article.title}</p>
                      <p className="article-card-compact-author">{article.author}</p>
                    </div>
                </div>
              ))
            )}
          </div>
        );
      }
      case 'magazine':
        return (
          <div className="magazine-container">
            <h2 className="page-title">Magazine</h2>
            <div className="content-card">
              <p className="content-card-title">Latest Issue</p>
              <p className="content-card-subtitle">November 2025 Edition</p>
              <p className="content-card-body">
                Discover the latest trends, insights, and stories from the world of technology and design.
              </p>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="account-container">
            <h2 className="page-title">Account</h2>
            <div className="content-card">
              <p className="content-card-title">Profile Settings</p>
              <p className="content-card-subtitle">Manage your account preferences and settings.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* --- NEW Header (matches screenshot) --- */}
      <header className="app-header">
        <div className="app-logo">
          <img src="/Which logo.png" alt="Which Logo" className="which-logo" />
        </div>
        <div className="search-bar-container">
          <Search className="search-icon" size={20} color="#555" />
          <input
            type="text"
            placeholder="Search for reviews or advice"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {renderContent()}
      </main>

      {/* --- NEW Sticky Bottom Navigation (matches screenshot) --- */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home className="nav-icon" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="nav-label">Home</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <LayoutGrid className="nav-icon" strokeWidth={activeTab === 'categories' ? 2.5 : 2} />
          <span className="nav-label">Categories</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Heart className="nav-icon" strokeWidth={activeTab === 'saved' ? 2.5 : 2} />
          <span className="nav-label">Saved</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'magazine' ? 'active' : ''}`}
          onClick={() => setActiveTab('magazine')}
        >
          <BookOpen className="nav-icon" strokeWidth={activeTab === 'magazine' ? 2.5 : 2} />
          <span className="nav-label">Magazine</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <User className="nav-icon" strokeWidth={activeTab === 'account' ? 2.5 : 2} />
          <span className="nav-label">Account</span>
        </button>
      </nav>
      {/* Home indicator bar for modern phones */}
      <div className="home-indicator-bar"></div>
    </div>
  );
}

export default App;