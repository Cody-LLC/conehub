import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './news.css';

const supabaseUrl = import.meta.env.VITE_URL;
const supabaseKey = import.meta.env.VITE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const News: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputForm, setInputForm] = useState(false);
  const [formSubmit, setFormSubmit] = useState<(text: string) => void>(() => {});
  const [oneForm, setOneForm] = useState('');
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsContent, setNewsContent] = useState('');
  const [newsTitle, setNewsTitle] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    setNews(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading news...</div>;
  }

  return (
    <div className="news-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1>📺 Cone News</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setInputForm(true);
            setFormSubmit(() => (text: string) => {
              // This runs when they submit
              if (text === 'Chapman') {
                alert('✅ Password correct!');
                setShowNewsForm(true)
              } else {
                alert('❌ Wrong password!');
              }
              setInputForm(false);
              setOneForm('');
            });
          }}>
          Add
        </button>
      </div>

      {news.length === 0 ? (
        <p>No news yet. Check back later!</p>
      ) : (
        <div className="news-list">
          {news.map((item) => (
            <div key={item.id} className="news-card">
              <h3>{item.title || 'Cone Update'}</h3>
              <p>{item.content}</p>
              <small>{new Date(item.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
      
      {inputForm && (
        <div className="form-main" style={{marginTop: '10px'}}>
          <input
            type="text"
            value={oneForm}
            onChange={(e) => setOneForm(e.target.value)}
            placeholder="Enter text"
            className="form-input"
          />
          <div className="form-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (oneForm.trim()) {
                  formSubmit(oneForm);
                  setOneForm('');
                  setInputForm(false);
                }
              }}
            >
              Submit
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setOneForm('');
                setInputForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showNewsForm && (
        <div className="form-main" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#1e293b',
          padding: '25px',
          borderRadius: '12px',
          zIndex: 1001,
          minWidth: '400px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Post News</h3>
          
          {/* ADD THIS TITLE INPUT */}
          <input
            type="text"
            value={newsTitle}
            onChange={(e) => setNewsTitle(e.target.value)}
            placeholder="Title"
            className="form-input"
            style={{ marginBottom: '15px' }}
          />
          
          <textarea
            value={newsContent}
            onChange={(e) => setNewsContent(e.target.value)}
            placeholder="News content..."
            className="form-input"
            style={{ minHeight: '150px', marginBottom: '15px' }}
          />
          
          <div className="form-buttons">
            <button 
              className="btn btn-primary"
              onClick={async () => {
                if (newsContent.trim()) {
                  await supabase.from('news').insert([{ 
                    title: newsTitle || null,  // Saves title if provided
                    content: newsContent 
                  }]);
                  loadNews();
                  setNewsTitle('');
                  setNewsContent('');
                  setShowNewsForm(false);
                }
              }}
            >
              Post
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowNewsForm(false);
                setNewsTitle('');
                setNewsContent('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;