import { useState } from 'react'
import { SearchField, Card, Flex, Text, Badge, View } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './App.css'
import articlesData from './data/articles.json'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [savedArticles, setSavedArticles] = useState([])

  // Filter articles based on search query
  const filteredArticles = articlesData.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSaveArticle = (articleId) => {
    setSavedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="articles-container">
            {filteredArticles.map(article => (
              <Card key={article.id} className="article-card">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="article-image"
                />
                <View padding="1rem">
                  <Flex direction="row" justifyContent="space-between" alignItems="start">
                    <Badge variation="info">{article.category}</Badge>
                    <Text fontSize="0.875rem" color="gray">{article.readTime}</Text>
                  </Flex>
                  <Text fontSize="1.25rem" fontWeight="bold" marginTop="0.5rem">
                    {article.title}
                  </Text>
                  <Text marginTop="0.5rem" color="gray">
                    {article.excerpt}
                  </Text>
                  <Flex direction="row" justifyContent="space-between" alignItems="center" marginTop="1rem">
                    <Text fontSize="0.875rem" color="gray">
                      By {article.author} • {article.date}
                    </Text>
                    <button 
                      className={`save-btn ${savedArticles.includes(article.id) ? 'saved' : ''}`}
                      onClick={() => toggleSaveArticle(article.id)}
                    >
                      {savedArticles.includes(article.id) ? '❤️' : '🤍'}
                    </button>
                  </Flex>
                </View>
              </Card>
            ))}
          </div>
        )
      case 'categories':
        return (
          <div className="categories-container">
            <Text fontSize="1.5rem" fontWeight="bold" marginBottom="1rem">Categories</Text>
            {['Technology', 'Design', 'Development', 'UX Research', 'Security'].map(category => (
              <Card key={category} className="category-card">
                <Text fontSize="1.125rem" fontWeight="600">{category}</Text>
                <Text fontSize="0.875rem" color="gray">
                  {articlesData.filter(a => a.category === category).length} articles
                </Text>
              </Card>
            ))}
          </div>
        )
      case 'saved': {
        const savedArticlesList = articlesData.filter(a => savedArticles.includes(a.id))
        return (
          <div className="saved-container">
            <Text fontSize="1.5rem" fontWeight="bold" marginBottom="1rem">Saved Articles</Text>
            {savedArticlesList.length === 0 ? (
              <Text color="gray">No saved articles yet</Text>
            ) : (
              savedArticlesList.map(article => (
                <Card key={article.id} className="article-card-compact">
                  <Flex direction="row" gap="1rem">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="article-image-small"
                    />
                    <View flex="1">
                      <Text fontSize="1rem" fontWeight="bold">{article.title}</Text>
                      <Text fontSize="0.75rem" color="gray">{article.author}</Text>
                    </View>
                  </Flex>
                </Card>
              ))
            )}
          </div>
        )
      }
      case 'magazine':
        return (
          <div className="magazine-container">
            <Text fontSize="1.5rem" fontWeight="bold" marginBottom="1rem">Magazine</Text>
            <Card>
              <Text fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">Latest Issue</Text>
              <Text color="gray">November 2025 Edition</Text>
              <Text marginTop="1rem">
                Discover the latest trends, insights, and stories from the world of technology and design.
              </Text>
            </Card>
          </div>
        )
      case 'account':
        return (
          <div className="account-container">
            <Text fontSize="1.5rem" fontWeight="bold" marginBottom="1rem">Account</Text>
            <Card>
              <Text fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">Profile Settings</Text>
              <Text color="gray">Manage your account preferences and settings.</Text>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      {/* Header with Search */}
      <header className="app-header">
        <Text fontSize="1.5rem" fontWeight="bold" marginBottom="1rem">Mobile Magazine</Text>
        <SearchField
          label="Search"
          labelHidden
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          hasSearchButton={false}
          hasSearchIcon={true}
        />
      </header>

      {/* Main Content */}
      <main className="app-content">
        {renderContent()}
      </main>

      {/* Sticky Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <span className="nav-icon">📑</span>
          <span className="nav-label">Categories</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <span className="nav-icon">❤️</span>
          <span className="nav-label">Saved</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'magazine' ? 'active' : ''}`}
          onClick={() => setActiveTab('magazine')}
        >
          <span className="nav-icon">📖</span>
          <span className="nav-label">Magazine</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Account</span>
        </button>
      </nav>
    </div>
  )
}

export default App
