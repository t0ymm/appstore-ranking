// Apple RSS Feed API Response Types
export interface RssFeedResponse {
  feed: {
    title: string;
    id: string;
    author: {
      name: string;
      url: string;
    };
    links: Array<{
      self: string;
    }>;
    copyright: string;
    country: string;
    icon: string;
    updated: string;
    results: RssFeedApp[];
  };
}

export interface RssFeedApp {
  artistName: string;
  id: string;
  name: string;
  releaseDate: string;
  kind: string;
  artworkUrl100: string;
  genres: string[];
  url: string;
}

// iTunes Lookup API Response Types
export interface iTunesLookupResponse {
  resultCount: number;
  results: iTunesApp[];
}

export interface iTunesApp {
  trackId: number;
  trackName: string;
  bundleId: string;
  sellerName: string;
  artistName: string;
  price: number;
  currency: string;
  formattedPrice: string;
  averageUserRating?: number;
  userRatingCount?: number;
  primaryGenreName: string;
  primaryGenreId: number;
  genres: string[];
  genreIds: string[];
  artworkUrl60: string;
  artworkUrl100: string;
  artworkUrl512: string;
  trackViewUrl: string;
  contentAdvisoryRating: string;
  releaseDate: string;
  currentVersionReleaseDate: string;
  version: string;
  description: string;
}
