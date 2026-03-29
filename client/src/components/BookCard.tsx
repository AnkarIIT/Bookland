import React from 'react';

interface BookCardProps {
  book: {
    isbn_13: string;
    title: string;
    authors?: string[];
    cover_url?: string;
    published_year?: number;
  };
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  const displayAuthors = book.authors && book.authors.length > 0 
    ? (book.authors.length > 2 
        ? `${book.authors[0]}, ${book.authors[1]} + ${book.authors.length - 2} more`
        : book.authors.join(', '))
    : 'Unknown Author';

  return (
    <div className="group border border-gray-200 rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-xl hover:border-accent hover:-translate-y-1 bg-white h-full cursor-pointer duration-300">
      <div className="aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
        {book.cover_url && !imageFailed ? (
          <img 
            src={book.cover_url} 
            alt={`Cover of ${book.title}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center p-4 text-center">
            <span className="text-5xl mb-3 opacity-50">📖</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">No Cover Available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>
      <div className="p-5 flex-1 flex flex-col bg-white z-10">
        <h3 className="font-extrabold text-gray-900 text-base leading-tight mb-1.5 line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        <p className="text-sm font-medium text-accent mb-3 line-clamp-1" title={book.authors?.join(', ')}>
          {displayAuthors}
        </p>
        <div className="mt-auto pt-3 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100/80">
          <span className="font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{book.published_year || 'Year ?'}</span>
          <span className="font-mono truncate max-w-[100px] text-gray-400 hover:text-gray-600 transition-colors" title={book.isbn_13}>
            {book.isbn_13}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
