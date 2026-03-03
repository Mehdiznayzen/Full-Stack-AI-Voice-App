import BookCard from '@/components/BookCard'
import HeroSection from '@/components/HeroSection'
import { sampleBooks } from '@/lib/constants'
import React from 'react'

const page = () => {
  return (
    <main className='wrapper container'>
      <HeroSection />

      <div className="library-books-grid">
        {
          sampleBooks.map((book) => (
            <BookCard 
              key={book._id}
              title={book.title}
              author={book.author}
              slug={book.slug}
              coverURL={book.coverURL}
            />
          ))
        }
      </div>
    </main>
  )
}

export default page 