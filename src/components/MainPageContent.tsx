import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/contexts/ExpensesContext';
import { AccountSettings } from './AccountSettings';
import { MonthlyOverview } from './MonthlyOverview';
import { MainNavigation, type MainPath } from './MainNavigation';

// Adjacent pages share authorized snapshots; mounting performs no reads or writes.
export function MainPageContent({ page }: { page: MainPath }) {
  const { state, finance } = useExpenses();
  const { auth, state: authentication } = useAuth();
  const router = useRouter();
  if (page === '/auth/account') {
    const email = authentication.session?.user.email;
    return <AccountSettings email={email} busy={authentication.busy} pending={authentication.pending}
      message={authentication.message} messageKind={authentication.messageKind}
      onGoogle={() => void auth.google(true)} onPassword={() => { if (email) void auth.emailLink('recovery', email); }}
      onLogout={() => void auth.logout()} onCancelAttempt={() => void auth.cancelAttempt()} />;
  }
  return <MonthlyOverview page={page === '/' ? 'overview' : 'transactions'} state={state}
    onLoad={query => { void finance.load(query); }} onViewTransactions={() => router.replace('/transactions')}
    onAccount={() => router.replace('/auth/account')} onNew={() => router.push('/expenses/new')}
    onEdit={transaction => router.push({ pathname: '/expenses/[id]', params: { id: transaction.id } })} />;
}

export function MainPage({ current }: { current: MainPath }) {
  return <MainNavigation current={current} renderPage={page => <MainPageContent page={page} />} />;
}
