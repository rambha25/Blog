export interface SeoData {
  keywords: string[];
  metaDescription: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  mainImage: string;
  seo: SeoData;
  categoryId: string;
}