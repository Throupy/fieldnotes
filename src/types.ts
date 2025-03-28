export interface Page {
  _id: string;
  title: string;
  content: string;
  icon: string;
  parent: string | null;
  createdAt: number;
  updatedAt: number;
}