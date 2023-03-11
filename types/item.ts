interface Clue {
  question: string;
  answer: string;
}

export interface Item {
  createdAt: Date;
  clues?: Clue[];
  description?: string;
  email: string;
  images?: string[];
  private: boolean;
  tag: string[];
  title?: string;
  updatedAt?: Date;
}

export interface ItemWithId extends Item {
  id: string;
}

export interface ItemToShow extends ItemWithId {
  id: string;
  count: number;
}
