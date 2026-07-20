// Shared content model for every English article site in the network.
export interface Section {
  h: string; // heading ("" for the intro/lead block)
  p: string[]; // paragraphs
}

export interface Article {
  slug: string;
  category: string; // category slug
  title: string;
  excerpt: string;
  date: string; // ISO
  minutes: number;
  author: string;
  sections: Section[];
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
}
