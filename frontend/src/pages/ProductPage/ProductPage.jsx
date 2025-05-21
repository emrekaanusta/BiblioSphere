// frontend/src/pages/ProductPage/ProductPage.jsx

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './productpage.css'

import { useCart } from '../../contexts/CartContext'
import { useFavorites } from '../../contexts/FavoritesContext'

import StarRating from '../../components/StarRating'
import axios from 'axios'

export default function ProductPage() {
  const [books, setBooks]             = useState([])
  const [displayList, setDisplayList] = useState([])
  const [categories, setCategories]   = useState([])

  const [searchTerm, setSearchTerm]   = useState('')
  const [category, setCategory]       = useState('all')
  const [sortOption, setSortOption]   = useState('none')

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // dropdown toggle for categories
  const [showCatDropdown, setShowCatDropdown] = useState(false)

  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isBookFavorite, addToFavorites, removeFromFavorites } = useFavorites()

  // fetch products
  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(res => {
        const prods = res.data.map(p => ({ ...p, id: p.isbn }))
        setBooks(prods)
        setDisplayList(prods)
      })
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }, [])

  // fetch categories
  useEffect(() => {
    axios.get('http://localhost:8080/api/categories')
      .then(res => setCategories(res.data.map(c => c.name)))
      .catch(() => console.error('Error loading categories'))
  }, [])

  // filter & sort
  useEffect(() => {
    let list = [...books]

    const term = searchTerm.trim().toLowerCase()
    if (term) {
      list = list.filter(b =>
        b.title?.toLowerCase().includes(term) ||
        b.author?.toLowerCase().includes(term) ||
        b.description?.toLowerCase().includes(term)
      )
    }

    if (category !== 'all') {
      list = list.filter(b => b.category === category)
    }

    if (sortOption === 'price-asc')  list.sort((a,b)=>a.price-b.price)
    if (sortOption === 'price-desc') list.sort((a,b)=>b.price-a.price)
    if (sortOption === 'points-desc') list.sort((a,b)=>(b.rating||0)-(a.rating||0))
    if (sortOption === 'points-asc')  list.sort((a,b)=>(a.rating||0)-(b.rating||0))

    setDisplayList(list)
  }, [books, searchTerm, category, sortOption])

  const handleAddToCart = book => {
    if (!addToCart(book)) {
      alert(book.stock===0
        ? 'This item is out of stock.'
        : `Cannot add more — only ${book.stock} left.`)
    }
  }

  const handleToggleFavorite = book => {
    if (isBookFavorite(book.id)) {
      removeFromFavorites(book.id)
    } else {
      addToFavorites(book)
    }
  }

  const dropdownCategories = [
    'all',
    ...Array.from(new Set(categories.filter(Boolean)))
  ]

  if (loading) return <div>Loading products…</div>
  if (error)   return <div>{error}</div>

  return (
    <div className="product-page">
      <h1>All Books</h1>

      <div className="controls">
        {/* search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title or author…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="search-btn">
            <i className="fas fa-search" />
          </button>
        </div>

        {/* categories dropdown */}
        <div className="categories-container">
          <button
            className="control-btn"
            onClick={() => setShowCatDropdown(!showCatDropdown)}
          >
            {category === 'all'
              ? 'All Categories'
              : category}
            <i className="fas fa-caret-down" style={{ marginLeft: 6 }}/>
          </button>
          {showCatDropdown && (
            <div className="categories-dropdown">
              {dropdownCategories.map(c => (
                <button
                  key={c}
                  className="category-item"
                  onClick={() => {
                    setCategory(c)
                    setShowCatDropdown(false)
                  }}
                >
                  {c === 'all' ? 'All Categories' : c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* sort select */}
        <select
          className="control-select"
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
        >
          <option value="none">Sort</option>
          <option value="price-asc">Price – low → high</option>
          <option value="price-desc">Price – high → low</option>
          <option value="points-desc">Rating – high → low</option>
          <option value="points-asc">Rating – low → high</option>
        </select>
      </div>

      <div className="book-list">
        {displayList.map(book => (
          <div className="book-card" key={book.id}>
            <div className="book-image-container">
              <Link to={`/books/${book.id}`}>
                <img src={book.image} alt={book.title} className="book-image"/>
              </Link>
              <button
                className={`favorite-btn ${isBookFavorite(book.id)?'active':''}`}
                onClick={()=>handleToggleFavorite(book)}
              >
                <i className="fas fa-heart"/>
              </button>
            </div>
            <div className="book-info">
              <Link to={`/books/${book.id}`} className="book-title">
                <h3>{book.title}</h3>
              </Link>
              <p className="author">By {book.author}</p>
              <p className="category">Category: {book.category}</p>
              <p className="price">${book.price?.toFixed(2)}</p>
              <p className="stock">Stock: {book.stock}</p>

              <div className="rating-wrapper">
                <StarRating rating={book.rating||0}/>
              </div>

              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(book)}
                disabled={book.stock === 0}
              >
                {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
