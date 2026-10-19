import type { InputHTMLAttributes } from 'react';
import { Input } from '../components/Input';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function SearchInput(props: SearchInputProps) {
  return <Input type='search' placeholder='Search...' {...props} />;
}
