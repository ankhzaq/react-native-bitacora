interface Clue {
  question: string;
  answer: string;
}

export interface Item {
  createdAt: string;
  clues?: Clue[];
  description?: string;
  email: string;
  isQuickCard: boolean;
  images?: string[];
  tags: string[];
  updatedAt?: string;
  value?: number,
}

export interface ItemWithId extends Item {
  id: string;
}

export interface ItemToShow extends ItemWithId {
  id: string;
  count: number;
}
