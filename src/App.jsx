import { useState } from 'react';
// We've removed Amplify UI to fix errors and simplify.
// We will use standard HTML tags (div, p, etc.) and style them in App.css
import './App.css';
import articlesData from './data/articles.json';
import magazinesData from './data/magazines.json';
import magazineIssuesData from './data/magazine-issues.json';
import magazineContentsData from './data/magazine-contents.json';
import foodPricesArticleData from './data/article-how-to-beat-rising-food-prices.json';

// Import icons from lucide-react
// Don't forget to run: npm install lucide-react
import { Home, LayoutGrid, Heart, BookOpen, User, Search, Lock } from 'lucide-react';

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
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

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
        // Show article page if an article is selected
        if (selectedArticleId) {
          const article = foodPricesArticleData.articles[0]; // Use the food prices article
          
          return (
            <div className="article-page-container">
              <div className="article-header">
                <button 
                  className="back-button"
                  onClick={() => setSelectedArticleId(null)}
                >
                  ← Back
                </button>
              </div>
              
              <article className="article-content">
                {article.sections.map((section, index) => {
                  switch (section.section_type) {
                    case 'main_article':
                      return (
                        <div key={index} className="article-section">
                          <h1 className="article-headline">{section.headline}</h1>
                          {section.subheadline && (
                            <p className="article-subheadline">{section.subheadline}</p>
                          )}
                          {section.image && (
                            <img 
                              src={section.image} 
                              alt={section.headline}
                              className="article-main-image"
                              onError={(e) => e.target.src = 'https://placehold.co/800x400/f0f0f0/999?text=Article+Image'}
                            />
                          )}
                          {section.author && (
                            <p className="article-author">By {section.author}</p>
                          )}
                          {section.content && (
                            <div className="article-text">
                              {section.content.split('\n\n').map((paragraph, pIndex) => (
                                <p key={pIndex}>{paragraph}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    
                    case 'callout_box':
                      return (
                        <div key={index} className="callout-box">
                          <h3 className="callout-title">{section.title}</h3>
                          {section.content && (
                            <div className="callout-content">
                              {section.content.split('\n\n').map((paragraph, pIndex) => (
                                <p key={pIndex}>{paragraph}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    
                    case 'feature_callout':
                      return (
                        <div key={index} className="feature-callout">
                          <h4 className="feature-title">{section.title}</h4>
                          {section.content && (
                            <p className="feature-content">{section.content}</p>
                          )}
                        </div>
                      );
                    
                    case 'data_table':
                      return (
                        <div key={index} className="data-table-section">
                          <h3 className="table-title">{section.title}</h3>
                          {section.subheadline && (
                            <p className="table-subheadline">{section.subheadline}</p>
                          )}
                          <div className="table-container">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  {section.columns.map((column, cIndex) => (
                                    <th key={cIndex}>{column}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {section.table_data.map((row, rIndex) => (
                                  <tr key={rIndex}>
                                    <td className="retailer-name">{row.Retailer}</td>
                                    <td className="price">{row['Average price']}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {section.note && (
                            <p className="table-note">{section.note}</p>
                          )}
                        </div>
                      );
                    
                    default:
                      return null;
                  }
                })}
              </article>
            </div>
          );
        }
        // Show contents page if an issue is selected
        else if (selectedIssueId) {
          const issueContent = magazineContentsData.find(content => content.issueId === selectedIssueId);
          if (!issueContent) return null;
          
          return (
            <div className="magazine-contents-container">
              <div className="magazine-contents-header">
                <button 
                  className="back-button"
                  onClick={() => setSelectedIssueId(null)}
                >
                  ← Back
                </button>
                <div className="contents-title-section">
                  <h1 className="contents-label">
                    Contents<span className="red-period">.</span>
                  </h1>
                  <h2 className="edition-title">Which? Magazine</h2>
                  <p className="edition-subtitle">{issueContent.issueDate}</p>
                  <hr className="contents-divider" />
                </div>
              </div>

              {/* Featured Article */}
              {issueContent.articles.filter(article => article.isFeatured).map(article => (
                <div 
                  key={article.id} 
                  className={`featured-article ${article.title === 'How to beat rising food prices' ? 'clickable' : ''}`}
                  onClick={() => {
                    if (article.title === 'How to beat rising food prices') {
                      setSelectedArticleId(article.id);
                    }
                  }}
                  style={{ cursor: article.title === 'How to beat rising food prices' ? 'pointer' : 'default' }}
                >
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="featured-article-image"
                    onError={(e) => e.target.src = 'https://placehold.co/400x250/f0f0f0/999?text=Article'}
                  />
                  <div className="featured-article-content">
                    <h3 className="featured-article-title">{article.title}</h3>
                    <p className="featured-article-intro">{article.intro}</p>
                  </div>
                </div>
              ))}

              {/* Regular Articles Grid */}
              <div className="articles-content-grid">
                {issueContent.articles.filter(article => !article.isFeatured).map(article => (
                  <div key={article.id} className="article-content-card">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="article-content-image"
                      onError={(e) => e.target.src = 'https://placehold.co/200x150/f0f0f0/999?text=Article'}
                    />
                    <div className="article-content-info">
                      <h4 className="article-content-title">{article.title}</h4>
                      <p className="article-content-intro">{article.intro}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        // Show magazine issues if details view is active
        else if (showMagazineDetails) {
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

              {/* Magazine Issues Grid - Now clickable */}
              <div className="magazine-issues-grid">
                {magazineIssuesData.map(issue => (
                  <div 
                    key={issue.id} 
                    className="magazine-issue-card clickable"
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
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
        } 
        // Show magazines list (default view)
        else {
          return (
            <div className="magazine-container">
              <h2 className="page-title">Which? Magazines</h2>
              <div className="magazines-grid">
                {magazinesData.map(magazine => {
                  const isUnlocked = magazine.edition === 'Which? Magazine';
                  return (
                    <div 
                      key={magazine.id} 
                      className={`magazine-card ${!isUnlocked ? 'locked' : ''}`}
                      onClick={() => {
                        if (isUnlocked) {
                          setShowMagazineDetails(true);
                        }
                      }}
                      style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
                    >
                      <div className="magazine-header">
                        <h3 className="magazine-edition">{magazine.edition}</h3>
                      </div>
                      <div className="magazine-image-container">
                        <img 
                          src={magazine.image} 
                          alt={magazine.edition}
                          className="magazine-image"
                          onError={(e) => e.target.src = 'https://placehold.co/200x300/f0f0f0/999?text=Magazine'}
                        />
                        {!isUnlocked && (
                          <div className="magazine-lock-overlay">
                            <Lock className="magazine-lock-icon" size={32} />
                          </div>
                        )}
                      </div>
                      {!isUnlocked ? (
                        <div className="magazine-locked-info">
                          <button className="subscribe-button">Subscribe</button>
                          <div className="magazine-price">£4.99 a month</div>
                        </div>
                      ) : (
                        <div className="magazine-actions">
                          <button 
                            className="read-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssueId(1); // November 2025 issue (issueId: 1)
                            }}
                          >
                            Read latest
                          </button>
                          <button 
                            className="archive-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMagazineDetails(true);
                            }}
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
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
      {/* --- NEW Header (matches screenshot) --- Hide on magazine pages */}
      {activeTab !== 'magazine' && (
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
      )}

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
          onClick={() => {
            setActiveTab('magazine');
            setShowMagazineDetails(false);
            setSelectedIssueId(null);
          }}
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