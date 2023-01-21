export interface Item {
  createdAt: Date,
  description?: string;
  email: string;
  images?: string[];
  private: boolean;
  tag: string;
  title?: string;
}

export interface ItemWithId extends Item {
  id: string;
}

export interface ItemToShow extends ItemWithId {
  id: string;
  count: number;
}
