'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sort from './Sort';
import Filter from './Filter';

/**
 * Component that fetches and displays a paginated list of products. Allows users to cycle through
 * product images and navigate between pages of products.
 *
 * @component
 */
export default function Products() {
  const router = useRouter();
  const { query } = router;

  const initialPage = query?.page ? Number(query.page) : 1;
  const initialSortBy = query?.sortBy || 'id';
  const initialOrder = query?.order || 'asc';
  const initialCategory = query?.category || null;

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [order, setOrder] = useState(initialOrder);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const limit = 20;

  /**
   * Fetches the products from the API when the component mounts or when the page, sort, or category changes.
   * Handles loading and error states as well.
   *
   * @async
   * @function fetchProducts
   */
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const sortQuery = sortBy === 'id' ? 'id' : 'price';
        const orderQuery = order === 'asc' || sortBy === 'id' ? 'asc' : order;

        const categoryQuery = selectedCategory ? `&category=${selectedCategory}` : '';

        const skip = (page - 1) * limit;

        let res = await fetch(`https://next-ecommerce-api.vercel.app/products?limit=${limit}&skip=${skip}&sortBy=${sortQuery}&order=${orderQuery}${categoryQuery}`);
        if (!res.ok) throw new Error('Network response was not ok');
        let data = await res.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [page, sortBy, order, selectedCategory]);

  /**
   * Updates the URL with the current search, filter, and sort options.
   */
  const updateUrl = () => {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('order', order);
    url.searchParams.set('category', selectedCategory || '');
    router.push(url.toString());
  };

  useEffect(() => {
    updateUrl();
  }, [page, sortBy, order, selectedCategory]);

  const handlePrev = (index) => {
    setProducts((prevProducts) =>
      prevProducts.map((product, i) => {
        if (i === index) {
          const images = [...product.images];
          const lastImage = images.pop();
          images.unshift(lastImage);
          return { ...product, images };
        }
        return product;
      })
    );
  };

  const handleNext = (index) => {
    setProducts((prevProducts) =>
      prevProducts.map((product, i) => {
        if (i === index) {
          const images = [...product.images];
          const firstImage = images.shift();
          images.push(firstImage);
          return { ...product, images };
        }
        return product;
      })
    );
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;

  if (error) return <div className="text-center text-lg font-semibold text-red-500">Error: {error}</div>;

  return (
    <div>
      <Filter onCategoryChange={setSelectedCategory} />
      <Sort onSortChange={(name, value) => {
        if (name === 'sortBy') {
          if (value === 'id') {
            setSortBy('id');
            setOrder('asc');
          } else {
            setSortBy('price');
            setOrder(value.includes('asc') ? 'asc' : 'desc');
          }
        }
      }} />
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {products.map((product, index) => (
          <li key={product.id} className="bg-white border p-2 shadow-lg rounded-lg transition-transform transform hover:scale-105">
            <Link href={`/product/${product.id}`}>
              <div className="relative">
                {product.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-0 bg-gray-800 text-white p-2 rounded-full top-1/2 transform -translate-y-1/2 font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePrev(index);
                      }}
                    >
                      &lt;
                    </button>
                    <button
                      className="absolute right-0 bg-gray-800 text-white p-2 rounded-full top-1/2 transform -translate-y-1/2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNext(index);
                      }}
                    >
                      &gt;
                    </button>
                  </>
                )}
                <div className="w-full h-64 overflow-hidden rounded-t-lg">
                  <img
                    src={product.images[0]}
                    alt={`${product.title} image`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-2">
                  <h2 className="mt-2 font-bold text-lg">{product.title}</h2>
                  <p className="text-sm text-gray-600">Category: {product.category}</p>
                  <p className="text-lg font-semibold mt-1">${product.price}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex justify-between mt-4 px-4">
        <button
          className="bg-gray-800 text-white p-2 rounded"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          className="bg-gray-800 text-white p-2 rounded"
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
