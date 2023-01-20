export interface Item {
  createdAt: Date,
  description?: string;
  email: string;
  images?: string[];
  private: boolean;
  tag: string;
  title?: string;
}

export interface ItemToShow extends Item {
  count: number;
}
