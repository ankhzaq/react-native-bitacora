interface Clue {
  question: string;
  answer: string;
}

export interface Item {
  count: number;
  createdAt: Date;
  clues?: Clue[];
  description?: string;
  email: string;
  images?: string[];
  private: boolean;
  tags: string[];
  title?: string;
  updatedAt?: Date;
  value?: number,
}

export interface ItemWithId extends Item {
  id: string;
}

export interface ItemToShow extends ItemWithId {
  id: string;
  count: number;
}
