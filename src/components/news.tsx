import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './news.css';

const supabaseUrl = import.meta.env.VITE_URL;
const supabaseKey = import.meta.env.VITE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const News: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <h1>📺 Cone News</h1>
      
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
    </div>
    
  );
};

export default News;