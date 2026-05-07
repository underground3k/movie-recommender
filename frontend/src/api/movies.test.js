import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMovieById, getMovies } from './movies';

describe('movies API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches paged movies from the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ id: 1, title: 'Toy Story' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const data = await getMovies(2);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/movies?page=2&size=20');
    expect(data.content[0].title).toBe('Toy Story');
  });

  it('fetches movie details by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 42, title: 'The Matrix' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovieById(42)).resolves.toEqual({ id: 42, title: 'The Matrix' });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/movies/42');
  });

  it('throws on failed API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    }));

    await expect(getMovies()).rejects.toThrow('API request failed: 500 Server Error');
  });
});
