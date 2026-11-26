import { after } from 'next/server';
import { isAutoTranslateEnabled } from './auto-translate-config';

export function scheduleAutoTranslate(task: () => Promise<void>): void {
  if (isAutoTranslateEnabled()) after(task);
}
