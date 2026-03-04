import BookCard from '@/components/BookCard'
import HeroSection from '@/components/HeroSection'
import { getAllBooks } from '@/lib/actions/book.actions'
import { sampleBooks } from '@/lib/constants'

const page = async () => {
  const booksResults = await getAllBooks()
  const books = booksResults.success ? booksResults.data ?? [] : [];

  return (
    <main className='wrapper container'>
      <HeroSection />

      <div className="library-books-grid">
        {
          books.map((book) => (
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