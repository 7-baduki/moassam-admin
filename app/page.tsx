import { redirect } from 'next/navigation';
import { DEFAULT_PATH } from '@/constants/routes';

export default function Home() {
  redirect(DEFAULT_PATH);
}
