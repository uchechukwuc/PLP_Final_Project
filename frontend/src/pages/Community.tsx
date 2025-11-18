import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../components/Layout.css';

const Community: React.FC = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'discussion',
    category: 'conservation',
    tags: ''
  });

  useEffect(() => {
    fetchPosts();
  }, [selectedType, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`http://localhost:5001/api/community?${params}`);
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to create a post');
        return;
      }

      const response = await fetch('http://localhost:5001/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Post created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          content: '',
          type: 'discussion',
          category: 'conservation',
          tags: ''
        });
        fetchPosts();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to like posts');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/community/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📰';
      case 'event': return '📅';
      case 'discussion': return '💬';
      case 'announcement': return '📢';
      case 'tip': return '💡';
      case 'success_story': return '🌟';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conservation': return '#27ae60';
      case 'pollution': return '#e74c3c';
      case 'seafood': return '#3498db';
      case 'climate': return '#f39c12';
      case 'education': return '#9b59b6';
      case 'community': return '#1abc9c';
      case 'research': return '#34495e';
      default: return '#95a5a6';
    }
  };

  const types = ['article', 'event', 'discussion', 'announcement', 'tip', 'success_story'];
  const categories = ['conservation', 'pollution', 'seafood', 'climate', 'education', 'community', 'research'];

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🌍 Community & Education Hub</h1>
          <p className="page-subtitle">
            Connect with ocean advocates, share knowledge, and organize conservation efforts
          </p>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '✍️ Create Post'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card mb-4">
            <h2 className="card-title">Create a Community Post</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Post Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Enter an engaging title..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Post Type</label>
                  <select 
                    name="type" 
                    className="form-select"
                    value={formData.type}
                    onChange={handleFormChange}
                  >
                    {types.map(type => (
                      <option key={type} value={type}>
                        {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category" 
                  className="form-select"
                  value={formData.category}
                  onChange={handleFormChange}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  name="content"
                  className="form-textarea"
                  value={formData.content}
                  onChange={handleFormChange}
                  placeholder="Share your thoughts, ideas, or information..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  className="form-input"
                  value={formData.tags}
                  onChange={handleFormChange}
                  placeholder="e.g., ocean, conservation, plastic, sustainability"
                />
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-success">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card mb-4">
          <h2 className="card-title">Filter Posts</h2>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Post Type</label>
              <select 
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedType('');
                setSelectedCategory('');
                fetchPosts();
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Community Posts</h2>
          
          {posts.length === 0 ? (
            <p className="text-center" style={{ color: '#7f8c8d' }}>
              No posts found. Be the first to share something with the community!
            </p>
          ) : (
            <div className="grid grid-2">
              {posts.map((post: any) => (
                <div key={post._id} className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>
                        {getTypeIcon(post.type)} {post.title}
                      </h3>
                      <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        {new Date(post.createdAt).toLocaleDateString()} • 
                        {post.author && ` by ${post.author.username}`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span 
                      style={{ 
                        background: getCategoryColor(post.category), 
                        color: 'white', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '10px', 
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {post.category.toUpperCase()}
                    </span>
                    <span 
                      style={{ 
                        background: '#ecf0f1', 
                        color: '#7f8c8d', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '10px', 
                        fontSize: '0.7rem'
                      }}
                    >
                      {post.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p style={{ color: '#2c3e50', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {post.content.length > 200 ? 
                      `${post.content.substring(0, 200)}...` : 
                      post.content
                    }
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                      {post.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span 
                          key={index}
                          style={{ 
                            background: '#ecf0f1', 
                            color: '#7f8c8d', 
                            padding: '0.2rem 0.4rem', 
                            borderRadius: '10px',
                            fontSize: '0.7rem'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => handleLike(post._id)}
                      >
                        👍 {post.likes ? post.likes.length : 0}
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        💬 {post.comments ? post.comments.length : 0}
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        👁️ {post.views || 0}
                      </button>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                      Read More →
                    </button>
                  </div>

                  {post.isPinned && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px',
                      background: '#e74c3c',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      📌 PINNED
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educational Resources Section */}
        <div className="card mt-4">
          <h2 className="card-title">📚 Educational Resources</h2>
          <div className="grid grid-3">
            <div className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <h4>🌊 Ocean Facts</h4>
              <p>Learn fascinating facts about marine life and ocean ecosystems.</p>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Explore Facts
              </button>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <h4>🎥 Video Library</h4>
              <p>Watch documentaries and educational videos about ocean conservation.</p>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Watch Videos
              </button>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <h4>📖 Research Papers</h4>
              <p>Access scientific research and studies on marine sustainability.</p>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Read Research
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card mt-4">
          <h2 className="card-title">📅 Upcoming Events</h2>
          <div className="grid grid-2">
            <div className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <h4>Beach Cleanup Day</h4>
              <p><strong>Date:</strong> Next Saturday, 9:00 AM</p>
              <p><strong>Location:</strong> Santa Monica Beach</p>
              <p><strong>Participants:</strong> 45/100</p>
              <button className="btn btn-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Join Event
              </button>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <h4>Ocean Conservation Workshop</h4>
              <p><strong>Date:</strong> Next Tuesday, 6:00 PM</p>
              <p><strong>Location:</strong> Online Event</p>
              <p><strong>Topic:</strong> Sustainable Seafood Choices</p>
              <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Community;