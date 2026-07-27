import { Container } from './Container';
import { APP_NAME } from '@/constants';

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {APP_NAME}. Built for focused learning.
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Terms</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
