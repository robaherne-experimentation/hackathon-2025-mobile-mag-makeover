import { useState } from 'react';
// We've removed Amplify UI to fix errors and simplify.
// We will use standard HTML tags (div, p, etc.) and style them in App.css
import './App.css';
import articlesData from './data/articles.json';
import magazinesData from './data/magazines.json';
import magazineIssuesData from './data/magazine-issues.json';

// Import icons from lucide-react
// Don't forget to run: npm install lucide-react
import { Home, LayoutGrid, Heart, BookOpen, User, Search } from 'lucide-react';

// --- Mock Data for Home Screen ---
const popularCategories = [
  { name: 'TVs', image: '/tv.webp' },
  { name: 'Washing machines', image: '/wasingmachines.webp' },
  { name: 'Laptops', image: '/laptops.webp' },
  { name: 'Mattresses', image: '/mattress.webp' },
  { name: 'Headphones', image: '/headphones.webp' },
  { name: 'Lifestyle', image: '/lifestyle.webp' },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [savedArticles, setSavedArticles] = useState([]);
  const [showMagazineDetails, setShowMagazineDetails] = useState(false);

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

  // Generate year pills for the past 10 years
  const generateYearPills = () => {
    const currentYear = 2025;
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
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
                  src="/brandimage.jpg" 
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
                    src="/lifestyle.webp" 
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
        if (showMagazineDetails) {
          return (
            <div className="magazine-details-container">
              <div className="magazine-details-header">
                <button 
                  className="back-button"
                  onClick={() => setShowMagazineDetails(false)}
                >
                  ← Back
                </button>
                <h2 className="page-title">Which? Magazine</h2>
              </div>
              
              {/* Year Pills */}
              <div className="year-pills-container">
                <div className="year-pills-scroll">
                  {generateYearPills().map(year => (
                    <button key={year} className="year-pill">
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Magazine Issues Grid */}
              <div className="magazine-issues-grid">
                {magazineIssuesData.map(issue => (
                  <div key={issue.id} className="magazine-issue-card">
                    <img 
                      src={issue.image} 
                      alt={issue.date}
                      className="magazine-issue-image"
                      onError={(e) => e.target.src = 'https://placehold.co/150x200/f0f0f0/999?text=Issue'}
                    />
                    <div className="magazine-issue-date">{issue.date}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          return (
            <div className="magazine-container">
              <h2 className="page-title">Which? Magazines</h2>
              <div className="magazines-grid">
                {magazinesData.map(magazine => (
                  <div 
                    key={magazine.id} 
                    className="magazine-card"
                    onClick={() => {
                      if (magazine.edition === 'Which? Magazine') {
                        setShowMagazineDetails(true);
                      }
                    }}
                    style={{ cursor: magazine.edition === 'Which? Magazine' ? 'pointer' : 'default' }}
                  >
                    <div className="magazine-header">
                      <h3 className="magazine-edition">{magazine.edition}</h3>
                    </div>
                    <img 
                      src={magazine.image} 
                      alt={magazine.edition}
                      className="magazine-image"
                      onError={(e) => e.target.src = 'https://placehold.co/200x300/f0f0f0/999?text=Magazine'}
                    />
                    <div className="magazine-date">{magazine.date}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
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